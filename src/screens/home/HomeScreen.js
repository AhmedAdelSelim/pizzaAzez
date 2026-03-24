import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, FlatList,
    TouchableOpacity, StatusBar, Dimensions, Animated, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useMenu } from '../../context/MenuContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CategoryCard from '../../components/CategoryCard';
import FoodCard from '../../components/FoodCard';
import StoryBar from '../../components/StoryBar';
import CraveRecommendations from '../../components/CraveRecommendations';
import api from '../../services/api';

function useCountdown(expiresAt) {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        if (!expiresAt) return;
        const update = () => {
            const diff = new Date(expiresAt) - new Date();
            if (diff <= 0) { setTimeLeft('انتهى العرض'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [expiresAt]);
    return timeLeft;
}

const { width } = Dimensions.get('window');

const BANNERS = [
    {
        id: '1',
        title: 'بيتزا طازجة',
        subtitle: 'يومياً من الفرن 🍕',
        buttonText: 'اطلب الآن',
        emoji: '🍕',
        gradient: [COLORS.primary, COLORS.primaryDark],
    },
    {
        id: '2',
        title: 'عروض حصرية',
        subtitle: 'خصومات تصل ٣٠٪ 🔥',
        buttonText: 'شاهد العروض',
        emoji: '🔥',
        gradient: ['#7B2FBE', '#5A1F9B'],
    },
    {
        id: '3',
        title: 'توصيل سريع',
        subtitle: '٣٠-٤٥ دقيقة فقط 🛵',
        buttonText: 'اعرف أكثر',
        emoji: '🛵',
        gradient: ['#1565C0', '#0D47A1'],
    },
];

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء النور';
    return 'مساء الخير';
}

export default function HomeScreen({ navigation }) {
    const { categories, getPopularItems } = useMenu();
    const { addItem } = useCart();
    const { user } = useAuth();
    const popularItems = getPopularItems();

    const [searchQuery, setSearchQuery] = useState('');
    const [currentBanner, setCurrentBanner] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const [flashDeal, setFlashDeal] = useState(null);
    const flashCountdown = useCountdown(flashDeal?.expires_at);

    useEffect(() => {
        api.getFlashDeals().then(deals => {
            if (Array.isArray(deals) && deals.length > 0) setFlashDeal(deals[0]);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: -20, duration: 250, useNativeDriver: true }),
            ]).start(() => {
                setCurrentBanner(prev => (prev + 1) % BANNERS.length);
                slideAnim.setValue(20);
                Animated.parallel([
                    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.spring(slideAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
                ]).start();
            });
        }, 3500);
        return () => clearInterval(timer);
    }, []);

    const handleAddToCart = (item) => {
        if (item.sizes && item.sizes.length > 0) {
            navigation.navigate('FoodDetail', { item });
            return;
        }
        addItem({ ...item, quantity: 1, selectedSize: null });
    };

    const banner = BANNERS[currentBanner];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}، {user?.name?.split(' ')[0] || 'ضيفنا'} 👋</Text>
                        <Text style={styles.subtitle}>شو تشتهي اليوم؟</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchWrapper}>
                    <TouchableOpacity
                        style={styles.searchBar}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('MenuTab')}
                    >
                        <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="ابحث عن أكلة..."
                            placeholderTextColor={COLORS.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={() => {
                                if (searchQuery.trim()) navigation.navigate('MenuTab', { search: searchQuery.trim() });
                            }}
                            returnKeyType="search"
                            textAlign="right"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Stories */}
                <StoryBar
                    onStoryPress={(story) => navigation.navigate('StoryView', { storyId: story.id })}
                    onAddStory={() => navigation.navigate('CreateStory')}
                />

                {/* AI Recommendations */}
                <CraveRecommendations onPress={() => navigation.navigate('MenuTab')} />

                {/* Flash Deal Banner */}
                {flashDeal && flashCountdown !== 'انتهى العرض' && (
                    <TouchableOpacity
                        style={styles.flashBannerWrapper}
                        onPress={() => navigation.navigate('MenuTab')}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#7B1FA2', '#4A148C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.flashBanner}
                        >
                            <View style={styles.flashLeft}>
                                <Text style={styles.flashLabel}>⚡ عرض خاص</Text>
                                <Text style={styles.flashTitle} numberOfLines={1}>{flashDeal.title}</Text>
                                {flashDeal.discount_percent > 0 && (
                                    <Text style={styles.flashDiscount}>خصم {flashDeal.discount_percent}٪</Text>
                                )}
                            </View>
                            <View style={styles.flashRight}>
                                <Text style={styles.flashCountdownLabel}>ينتهي خلال</Text>
                                <Text style={styles.flashCountdown}>{flashCountdown}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Hero Banner (Auto-scrolling) */}
                <View style={styles.heroBannerWrapper}>
                    <LinearGradient
                        colors={banner.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroBanner}
                    >
                        <Animated.View
                            style={[
                                styles.heroContent,
                                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
                            ]}
                        >
                            <Text style={styles.heroSubtitle}>{banner.subtitle}</Text>
                            <Text style={styles.heroTitle}>{banner.title}</Text>
                            <TouchableOpacity
                                style={styles.heroButton}
                                onPress={() => navigation.navigate('Offers')}
                            >
                                <Text style={styles.heroButtonText}>{banner.buttonText}</Text>
                                <Ionicons name="arrow-back" size={15} color={COLORS.white} />
                            </TouchableOpacity>
                        </Animated.View>
                        <Animated.Text style={[styles.heroBg, { opacity: fadeAnim }]}>
                            {banner.emoji}
                        </Animated.Text>
                    </LinearGradient>

                    {/* Pagination Dots */}
                    <View style={styles.dotsRow}>
                        {BANNERS.map((_, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => {
                                    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
                                        setCurrentBanner(i);
                                        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
                                    });
                                }}
                                style={[styles.dot, i === currentBanner && styles.dotActive]}
                            />
                        ))}
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>الأقسام</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('MenuTab')}>
                            <Text style={styles.seeAll}>عرض الكل</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={categories}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <CategoryCard
                                category={item}
                                onPress={() => navigation.navigate('Category', { category: item })}
                            />
                        )}
                        contentContainerStyle={styles.categoryList}
                    />
                </View>

                {/* Popular Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🌟 الأكثر طلباً</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('MenuTab')}>
                            <Text style={styles.seeAll}>عرض الكل</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.grid}>
                        {popularItems.slice(0, 6).map((item) => (
                            <View key={item.id} style={styles.gridItem}>
                                <FoodCard
                                    item={item}
                                    onPress={() => navigation.navigate('FoodDetail', { item })}
                                    onAddToCart={handleAddToCart}
                                />
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
    },
    greeting: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
        textAlign: 'right',
    },
    subtitle: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
        marginTop: 2,
        textAlign: 'right',
    },
    searchWrapper: {
        paddingHorizontal: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_base,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        paddingHorizontal: SIZES.spacing_base,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.regular,
        padding: 0,
    },
    heroBannerWrapper: {
        marginHorizontal: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_xl,
    },
    heroBanner: {
        borderRadius: SIZES.radius_xxl,
        overflow: 'hidden',
        height: 160,
        position: 'relative',
    },
    heroContent: {
        flex: 1,
        padding: SIZES.spacing_xl,
        justifyContent: 'center',
        zIndex: 2,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: SIZES.sm,
        ...FONTS.medium,
        marginBottom: 4,
        textAlign: 'right',
    },
    heroTitle: {
        color: COLORS.white,
        fontSize: SIZES.xxl,
        ...FONTS.extraBold,
        marginBottom: 14,
        textAlign: 'right',
    },
    heroButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: SIZES.radius_full,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignSelf: 'flex-start',
        gap: 6,
    },
    heroButtonText: {
        color: COLORS.white,
        fontSize: SIZES.sm,
        ...FONTS.bold,
    },
    heroBg: {
        position: 'absolute',
        left: -10,
        bottom: -10,
        fontSize: 120,
        opacity: 0.2,
        zIndex: 1,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.border,
    },
    dotActive: {
        width: 18,
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    section: {
        marginBottom: SIZES.spacing_xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_base,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: SIZES.lg,
        ...FONTS.bold,
    },
    seeAll: {
        color: COLORS.primary,
        fontSize: SIZES.sm,
        ...FONTS.semiBold,
    },
    categoryList: {
        paddingHorizontal: SIZES.spacing_xl,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SIZES.spacing_xl,
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        marginBottom: SIZES.spacing_lg,
    },
    flashBannerWrapper: {
        marginHorizontal: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_base,
        borderRadius: SIZES.radius_xl,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    flashBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: SIZES.spacing_xl,
        gap: 12,
    },
    flashLeft: { flex: 1 },
    flashLabel: { color: 'rgba(255,255,255,0.7)', fontSize: SIZES.xs, ...FONTS.semiBold, textAlign: 'right', marginBottom: 2 },
    flashTitle: { color: COLORS.white, fontSize: SIZES.md, ...FONTS.extraBold, textAlign: 'right', marginBottom: 4 },
    flashDiscount: {
        color: '#FFD700', fontSize: SIZES.sm, ...FONTS.bold, textAlign: 'right',
    },
    flashRight: { alignItems: 'center' },
    flashCountdownLabel: { color: 'rgba(255,255,255,0.6)', fontSize: SIZES.xxs || 10, ...FONTS.regular, marginBottom: 2 },
    flashCountdown: {
        color: '#FFD700', fontSize: SIZES.xl, ...FONTS.extraBold, letterSpacing: 2,
    },
});
