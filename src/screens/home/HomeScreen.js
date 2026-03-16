import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, FlatList,
    TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useMenu } from '../../context/MenuContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CategoryCard from '../../components/CategoryCard';
import FoodCard from '../../components/FoodCard';
import SearchBar from '../../components/SearchBar';
import StoryBar from '../../components/StoryBar';
import CraveRecommendations from '../../components/CraveRecommendations';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const { categories, getPopularItems, getSpecialOffers } = useMenu();
    const { addItem } = useCart();
    const { user } = useAuth();
    const popularItems = getPopularItems();
    const specialOffers = getSpecialOffers();

    const handleAddToCart = (item) => {
        if (item.sizes && item.sizes.length > 0) {
            navigation.navigate('FoodDetail', { item });
            return;
        }
        addItem({
            ...item,
            quantity: 1,
            selectedSize: null,
        });
    };

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
                        <Text style={styles.greeting}>أهلاً، {user?.name || 'ضيفنا'} 👋</Text>
                        <Text style={styles.subtitle}>شو تشتهي اليوم؟</Text>
                    </View>

                </View>

                {/* Stories */}
                <StoryBar onStoryPress={(story) => navigation.navigate('StoryView', { storyId: story.id })} />

                {/* AI Recommendations */}
                <CraveRecommendations onPress={() => navigation.navigate('MenuTab')} />

                {/* Hero Banner (Offers) */}
                <View style={styles.heroBanner}>
                    <View style={styles.heroOverlay}>
                        <Text style={styles.heroTitle}>
                            {'بيتزا و فطير'}
                        </Text>
                        <TouchableOpacity
                            style={styles.heroButton}
                            onPress={() => navigation.navigate('Offers')}
                        >
                            <Text style={styles.heroButtonText}>اطلب الآن</Text>
                            <Ionicons name="arrow-back" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.heroBg}>🍕</Text>
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
                        renderItem={({ item, index }) => (
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
                        {popularItems.slice(0, 6).map((item, index) => (
                            <View key={item.id} style={{ width: '48%', marginBottom: SIZES.spacing_lg }}>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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

    searchContainer: {
        paddingHorizontal: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_lg,
    },
    heroBanner: {
        marginHorizontal: SIZES.spacing_xl,
        borderRadius: SIZES.radius_xxl,
        backgroundColor: COLORS.primary,
        overflow: 'hidden',
        marginBottom: SIZES.spacing_xl,
        height: 160,
        position: 'relative',
    },
    heroOverlay: {
        flex: 1,
        padding: SIZES.spacing_xl,
        justifyContent: 'center',
        zIndex: 2,
    },
    heroSubtitle: {
        color: COLORS.secondary,
        fontSize: SIZES.sm,
        ...FONTS.bold,
        marginBottom: 4,
        textAlign: 'right',
    },
    heroTitle: {
        color: COLORS.white,
        fontSize: SIZES.xxl,
        ...FONTS.extraBold,
        marginBottom: 12,
        lineHeight: 30,
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
    horizontalList: {
        paddingHorizontal: SIZES.spacing_xl,
    },
    horizontalCard: {
        marginLeft: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SIZES.spacing_xl,
        justifyContent: 'space-between',
    },
});
