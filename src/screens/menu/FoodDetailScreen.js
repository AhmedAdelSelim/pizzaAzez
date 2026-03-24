import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image, Animated, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import ReviewItem from '../../components/ReviewItem';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMBO_OPTIONS = [
    { id: 'drink', label: 'مشروب غازي', price: 15, emoji: '🥤' },
    { id: 'fries', label: 'بطاطس مقلية', price: 20, emoji: '🍟' },
    { id: 'coleslaw', label: 'كولسلو', price: 12, emoji: '🥗' },
    { id: 'dessert', label: 'كيكة الشوكولاتة', price: 25, emoji: '🍰' },
];

export default function FoodDetailScreen({ navigation, route }) {
    const { item } = route.params;
    const { addItem } = useCart();
    const { token } = useAuth();
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [selectedCombos, setSelectedCombos] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    useEffect(() => {
        api.getItemReviews(item.id).then(data => {
            if (Array.isArray(data)) setReviews(data);
        }).catch(() => {});
        // Track recently viewed
        AsyncStorage.getItem('@pizzaAzez_recently_viewed').then(raw => {
            let list = raw ? JSON.parse(raw) : [];
            list = [item, ...list.filter(i => i.id !== item.id)].slice(0, 8);
            AsyncStorage.setItem('@pizzaAzez_recently_viewed', JSON.stringify(list));
        }).catch(() => {});
    }, [item.id]);

    const handleSubmitReview = async () => {
        if (!token) { Alert.alert('تنبيه', 'يجب تسجيل الدخول أولاً'); return; }
        setSubmittingReview(true);
        try {
            const newReview = await api.addItemReview(item.id, reviewRating, reviewComment, token);
            setReviews(prev => [newReview, ...prev]);
            setReviewComment('');
            setReviewRating(5);
            setShowReviewForm(false);
            Alert.alert('شكراً ✅', 'تم إرسال تقييمك بنجاح');
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const qtyScaleAnim = useRef(new Animated.Value(1)).current;
    const addBtnScaleAnim = useRef(new Animated.Value(1)).current;

    const emoji = item.categoryIcon || ({ '1': '🧀', '2': '🍗', '3': '🥩', '4': '🌯', '5': '🔥', '6': '🍕', '7': '🥧', '8': '🍫', '9': '🥟', '10': '🍟' })[item.categoryId] || '🍕';
    const currentPrice = selectedSize?.price || (item.sizes && item.sizes.length > 0 ? null : item.price);
    const comboTotal = selectedCombos.reduce((sum, id) => {
        const c = COMBO_OPTIONS.find(o => o.id === id);
        return sum + (c?.price || 0);
    }, 0);

    const toggleCombo = (id) => {
        setSelectedCombos(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };

    const toggleExtra = (extra) => {
        setSelectedExtras(prev =>
            prev.includes(extra) ? prev.filter(e => e !== extra) : [...prev, extra]
        );
    };

    const animateQty = () => {
        Animated.sequence([
            Animated.timing(qtyScaleAnim, { toValue: 1.3, duration: 80, useNativeDriver: true }),
            Animated.spring(qtyScaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
    };

    const handleQuantityChange = (delta) => {
        setQuantity(q => Math.max(1, q + delta));
        animateQty();
    };

    const handleAddToCart = () => {
        if (item.sizes && item.sizes.length > 0 && !selectedSize) return;
        Animated.sequence([
            Animated.timing(addBtnScaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
            Animated.spring(addBtnScaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
        addItem({ ...item, price: currentPrice, quantity, selectedSize: selectedSize?.name || null, selectedExtras });
        // Add combo items separately
        selectedCombos.forEach(id => {
            const combo = COMBO_OPTIONS.find(o => o.id === id);
            if (combo) addItem({ id: `combo-${id}`, name: combo.label, price: combo.price, quantity: 1, selectedSize: null, selectedExtras: [] });
        });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.imageArea}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                ) : (
                    <View style={styles.emojiContainer}>
                        <Text style={styles.emoji}>{emoji}</Text>
                    </View>
                )}
                <LinearGradient
                    colors={['transparent', COLORS.background]}
                    style={styles.imageGradient}
                />
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-forward" size={22} color={COLORS.text} />
                </TouchableOpacity>
                {item.isSpecial && (
                    <View style={styles.specialBadge}>
                        <Text style={styles.specialText}>🔥 عرض خاص</Text>
                    </View>
                )}
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Title & Price */}
                <View style={styles.titleRow}>
                    <View style={styles.titleInfo}>
                        <Text style={styles.name}>{item.name}</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color={COLORS.star} />
                            <Text style={styles.rating}>{item.rating}</Text>
                            <Text style={styles.reviews}>
                                ({Array.isArray(item.reviews) ? item.reviews.length : (item.reviews || 0)} تقييم)
                            </Text>
                        </View>
                    </View>
                    <View style={styles.priceBox}>
                        <Text style={styles.price}>
                            {currentPrice ? `${currentPrice} ج.م` : 'اختر'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.description}>{item.description}</Text>

                {/* Size Selector */}
                {item.sizes?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>اختر الحجم</Text>
                        <View style={styles.sizeGrid}>
                            {item.sizes.map((sizeObj) => {
                                const isSelected = selectedSize?.name === sizeObj.name;
                                return (
                                    <TouchableOpacity
                                        key={sizeObj.name}
                                        onPress={() => setSelectedSize(sizeObj)}
                                        style={[styles.sizeCard, isSelected && styles.sizeCardSelected]}
                                    >
                                        <Text style={[styles.sizeName, isSelected && styles.sizeNameSelected]}>
                                            {sizeObj.name}
                                        </Text>
                                        <Text style={[styles.sizePrice, isSelected && styles.sizePriceSelected]}>
                                            {sizeObj.price} ج.م
                                        </Text>
                                        {isSelected && (
                                            <View style={styles.sizeCheck}>
                                                <Ionicons name="checkmark" size={12} color={COLORS.white} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Extras */}
                {item.extras?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>إضافات</Text>
                        <View style={styles.extrasGrid}>
                            {item.extras.map((extra) => {
                                const isSelected = selectedExtras.includes(extra);
                                return (
                                    <TouchableOpacity
                                        key={extra}
                                        onPress={() => toggleExtra(extra)}
                                        style={[styles.extraChip, isSelected && styles.extraChipSelected]}
                                    >
                                        <Ionicons
                                            name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                                            size={16}
                                            color={isSelected ? COLORS.accent : COLORS.textMuted}
                                        />
                                        <Text style={[styles.extraText, isSelected && styles.extraTextSelected]}>
                                            {extra}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Meal Combo Upsell */}
                <View style={styles.section}>
                    <View style={styles.comboHeader}>
                        <Text style={styles.sectionTitle}>أكمل وجبتك 🎯</Text>
                        {selectedCombos.length > 0 && (
                            <Text style={styles.comboSavings}>+{comboTotal} ج.م</Text>
                        )}
                    </View>
                    <View style={styles.comboGrid}>
                        {COMBO_OPTIONS.map((combo) => {
                            const isSelected = selectedCombos.includes(combo.id);
                            return (
                                <TouchableOpacity
                                    key={combo.id}
                                    onPress={() => toggleCombo(combo.id)}
                                    style={[styles.comboCard, isSelected && styles.comboCardSelected]}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.comboEmoji}>{combo.emoji}</Text>
                                    <Text style={[styles.comboName, isSelected && styles.comboNameSelected]} numberOfLines={1}>
                                        {combo.label}
                                    </Text>
                                    <Text style={[styles.comboPrice, isSelected && styles.comboPriceSelected]}>
                                        +{combo.price} ج.م
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.comboCheck}>
                                            <Ionicons name="checkmark" size={10} color={COLORS.white} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Quantity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>الكمية</Text>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            onPress={() => handleQuantityChange(-1)}
                            style={styles.qtyButton}
                        >
                            <Ionicons name="remove" size={20} color={COLORS.text} />
                        </TouchableOpacity>
                        <Animated.Text style={[styles.qtyText, { transform: [{ scale: qtyScaleAnim }] }]}>
                            {quantity}
                        </Animated.Text>
                        <TouchableOpacity
                            onPress={() => handleQuantityChange(1)}
                            style={[styles.qtyButton, styles.qtyButtonAdd]}
                        >
                            <Ionicons name="add" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Reviews */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>آراء العملاء</Text>
                        <TouchableOpacity
                            style={styles.addReviewBtn}
                            onPress={() => setShowReviewForm(v => !v)}
                        >
                            <Ionicons name="star-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.addReviewBtnText}>أضف تقييم</Text>
                        </TouchableOpacity>
                    </View>

                    {showReviewForm && (
                        <View style={styles.reviewForm}>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                                        <Ionicons name={star <= reviewRating ? 'star' : 'star-outline'} size={28} color={COLORS.star} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={styles.reviewInput}
                                placeholder="اكتب رأيك هنا..."
                                placeholderTextColor={COLORS.textMuted}
                                value={reviewComment}
                                onChangeText={setReviewComment}
                                multiline
                                textAlign="right"
                            />
                            <TouchableOpacity
                                style={[styles.submitReviewBtn, submittingReview && { opacity: 0.6 }]}
                                onPress={handleSubmitReview}
                                disabled={submittingReview}
                            >
                                <Text style={styles.submitReviewText}>{submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <ReviewItem key={review.id} review={review} />
                        ))
                    ) : (
                        <Text style={styles.noReviewsText}>لا يوجد تقييمات بعد. كن أول من يقيّم!</Text>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.totalArea}>
                    <Text style={styles.totalLabel}>المجموع</Text>
                    <Text style={styles.totalPrice}>
                        {currentPrice ? `${currentPrice * quantity + comboTotal} ج.م` : '---'}
                    </Text>
                </View>
                <Animated.View style={[styles.addButton, { transform: [{ scale: addBtnScaleAnim }] }]}>
                    <Button
                        title={isAdded ? 'تمت الإضافة ✅' : 'أضف للسلة'}
                        onPress={handleAddToCart}
                        variant={isAdded ? 'secondary' : 'primary'}
                        size="large"
                        disabled={item.sizes && item.sizes.length > 0 && !selectedSize}
                        icon={<Ionicons name={isAdded ? 'checkmark-circle' : 'cart-outline'} size={20} color={isAdded ? COLORS.primary : COLORS.white} />}
                        style={[{ opacity: item.sizes && item.sizes.length > 0 && !selectedSize ? 0.5 : 1 }]}
                    />
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    imageArea: {
        height: 280,
        position: 'relative',
    },
    emojiContainer: {
        flex: 1,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 110,
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    backButton: {
        position: 'absolute',
        top: 52,
        right: 20,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    specialBadge: {
        position: 'absolute',
        top: 57,
        left: 20,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius_full,
        paddingHorizontal: 14,
        paddingVertical: 6,
        ...SHADOWS.small,
    },
    specialText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    content: {
        flex: 1,
        marginTop: -24,
        borderTopLeftRadius: SIZES.radius_xxl,
        borderTopRightRadius: SIZES.radius_xxl,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SIZES.spacing_xl,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleInfo: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.extraBold,
        marginBottom: 6,
        textAlign: 'right',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        color: COLORS.star,
        fontSize: SIZES.sm,
        ...FONTS.semiBold,
    },
    reviews: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
    },
    priceBox: {
        backgroundColor: COLORS.primary + '20',
        borderRadius: SIZES.radius_lg,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
    },
    price: {
        color: COLORS.primary,
        fontSize: SIZES.xl,
        ...FONTS.extraBold,
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: SIZES.md,
        ...FONTS.regular,
        lineHeight: 24,
        marginBottom: 24,
        textAlign: 'right',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: SIZES.lg,
        ...FONTS.bold,
        marginBottom: 14,
        textAlign: 'right',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,193,7,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingAvg: {
        color: COLORS.star,
        fontSize: 12,
        ...FONTS.bold,
    },
    sizeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sizeCard: {
        flex: 1,
        minWidth: 90,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: SIZES.radius_lg,
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: 'center',
        position: 'relative',
    },
    sizeCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(232,93,44,0.12)',
    },
    sizeName: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.medium,
        marginBottom: 4,
    },
    sizeNameSelected: {
        color: COLORS.primary,
        ...FONTS.bold,
    },
    sizePrice: {
        color: COLORS.textMuted,
        fontSize: SIZES.lg,
        ...FONTS.extraBold,
    },
    sizePriceSelected: {
        color: COLORS.primary,
    },
    sizeCheck: {
        position: 'absolute',
        top: 6,
        left: 6,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    extrasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    extraChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: SIZES.radius_full,
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        gap: 6,
    },
    extraChipSelected: {
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(0,201,167,0.12)',
    },
    extraText: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.medium,
    },
    extraTextSelected: {
        color: COLORS.accent,
        ...FONTS.bold,
    },
    comboHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    comboSavings: { color: COLORS.primary, fontSize: SIZES.md, ...FONTS.bold },
    comboGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    comboCard: {
        width: '47%', backgroundColor: COLORS.surface, borderRadius: SIZES.radius_lg,
        padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
        position: 'relative',
    },
    comboCardSelected: {
        borderColor: COLORS.primary, backgroundColor: 'rgba(232,93,44,0.08)',
    },
    comboEmoji: { fontSize: 28, marginBottom: 6 },
    comboName: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.medium, textAlign: 'center', marginBottom: 4 },
    comboNameSelected: { color: COLORS.primary, ...FONTS.bold },
    comboPrice: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.semiBold },
    comboPriceSelected: { color: COLORS.primary },
    comboCheck: {
        position: 'absolute', top: 6, left: 6,
        width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    qtyButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    qtyButtonAdd: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        ...SHADOWS.glow(COLORS.primary),
    },
    qtyText: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
        minWidth: 36,
        textAlign: 'center',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: SIZES.spacing_xl,
        paddingVertical: SIZES.spacing_base,
        paddingBottom: 34,
        borderTopLeftRadius: SIZES.radius_xxl,
        borderTopRightRadius: SIZES.radius_xxl,
        ...SHADOWS.large,
    },
    totalArea: {
        marginLeft: 20,
    },
    totalLabel: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.regular,
    },
    totalPrice: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.extraBold,
    },
    addButton: {
        flex: 1,
    },
    addReviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: SIZES.radius_full,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    addReviewBtnText: { color: COLORS.primary, fontSize: SIZES.xs, ...FONTS.bold },
    reviewForm: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_base,
        marginBottom: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    starsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
    reviewInput: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius_md,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.regular,
        minHeight: 70,
        textAlignVertical: 'top',
    },
    submitReviewBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius_lg,
        paddingVertical: 12,
        alignItems: 'center',
    },
    submitReviewText: { color: COLORS.white, fontSize: SIZES.base, ...FONTS.bold },
    noReviewsText: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.regular, textAlign: 'center', paddingVertical: 12 },
});
