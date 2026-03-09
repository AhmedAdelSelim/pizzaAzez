import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useCart } from '../../context/CartContext';
import Button from '../../components/Button';
import ReviewItem from '../../components/ReviewItem';

export default function FoodDetailScreen({ navigation, route }) {
    const { item } = route.params;
    const { addItem } = useCart();
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const emoji = item.categoryIcon || ({ '1': '🧀', '2': '🍗', '3': '🥩', '4': '🌯', '5': '🔥', '6': '🍕', '7': '🥧', '8': '🍫', '9': '🥟', '10': '🍟' })[item.categoryId] || '🍕';

    const currentPrice = selectedSize?.price || (item.sizes && item.sizes.length > 0 ? null : item.price);

    const toggleExtra = (extra) => {
        setSelectedExtras(prev =>
            prev.includes(extra)
                ? prev.filter(e => e !== extra)
                : [...prev, extra]
        );
    };

    const handleAddToCart = () => {
        if (item.sizes && item.sizes.length > 0 && !selectedSize) {
            return;
        }
        addItem({
            ...item,
            price: currentPrice,
            quantity,
            selectedSize: selectedSize?.name || null,
            selectedExtras,
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
                    <View>
                        <Text style={styles.emoji}>{emoji}</Text>
                    </View>
                )}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
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
                <View style={styles.titleRow}>
                    <View style={styles.titleInfo}>
                        <Text style={styles.name}>
                            {item.name}
                        </Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={16} color={COLORS.star} />
                            <Text style={styles.rating}>{item.rating}</Text>
                            <Text style={styles.reviews}>
                                ({Array.isArray(item.reviews) ? item.reviews.length : (item.reviews || 0)} تقييم)
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.price}>{currentPrice ? `${currentPrice} ج.م` : 'اختر الحجم'}</Text>
                </View>

                <View>
                    <Text style={styles.description}>{item.description}</Text>
                </View>

                {item.sizes?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>الحجم</Text>
                        <View style={styles.optionsRow}>
                            {item.sizes.map((sizeObj) => (
                                <TouchableOpacity
                                    key={sizeObj.name}
                                    onPress={() => setSelectedSize(sizeObj)}
                                    style={[
                                        styles.optionChip,
                                        selectedSize?.name === sizeObj.name && styles.optionChipSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selectedSize?.name === sizeObj.name && styles.optionTextSelected,
                                        ]}
                                    >
                                        {sizeObj.name} - {sizeObj.price} ج.م
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {item.extras?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>إضافات</Text>
                        <View style={styles.optionsRow}>
                            {item.extras.map((extra) => (
                                <TouchableOpacity
                                    key={extra}
                                    onPress={() => toggleExtra(extra)}
                                    style={[
                                        styles.optionChip,
                                        selectedExtras.includes(extra) && styles.extraChipSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selectedExtras.includes(extra) && styles.extraTextSelected,
                                        ]}
                                    >
                                        {selectedExtras.includes(extra) ? '✓ ' : '+ '}{extra}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>الكمية</Text>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            onPress={() => setQuantity(q => Math.max(1, q - 1))}
                            style={styles.qtyButton}
                        >
                            <Ionicons name="remove" size={20} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{quantity}</Text>
                        <TouchableOpacity
                            onPress={() => setQuantity(q => q + 1)}
                            style={[styles.qtyButton, styles.qtyButtonAdd]}
                        >
                            <Ionicons name="add" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {Array.isArray(item.reviews) && item.reviews.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>آراء العملاء</Text>
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={12} color={COLORS.star} />
                                <Text style={styles.ratingAvg}>{item.rating}</Text>
                            </View>
                        </View>
                        {item.reviews.map(review => (
                            <ReviewItem key={review.id} review={review} />
                        ))}
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
                <View style={styles.totalArea}>
                    <Text style={styles.totalLabel}>المجموع</Text>
                    <Text style={styles.totalPrice}>
                        {currentPrice ? `${currentPrice * quantity} ج.م` : '---'}
                    </Text>
                </View>
                <Button
                    title={isAdded ? "تمت الإضافة ✅" : "أضف للسلة"}
                    onPress={handleAddToCart}
                    variant={isAdded ? "secondary" : "primary"}
                    size="large"
                    disabled={item.sizes && item.sizes.length > 0 && !selectedSize}
                    icon={<Ionicons name={isAdded ? "checkmark-circle" : "cart-outline"} size={20} color={isAdded ? (item.sizes && item.sizes.length > 0 && !selectedSize ? COLORS.textMuted : COLORS.primary) : COLORS.white} />}
                    style={[styles.addButton, item.sizes && item.sizes.length > 0 && !selectedSize && { opacity: 0.5 }]}
                />
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
        height: 260,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    emoji: {
        fontSize: 100,
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    specialBadge: {
        position: 'absolute',
        top: 55,
        left: 20,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius_full,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    specialText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    content: {
        flex: 1,
        marginTop: -20,
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
        fontSize: SIZES.md,
        ...FONTS.semiBold,
    },
    reviews: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
    },
    price: {
        color: COLORS.primary,
        fontSize: SIZES.xxl,
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
        marginBottom: 12,
        textAlign: 'right',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.spacing_md,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
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
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: SIZES.radius_full,
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    optionChipSelected: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(232,93,44,0.15)',
    },
    optionText: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.medium,
    },
    optionTextSelected: {
        color: COLORS.primary,
        ...FONTS.bold,
    },
    extraChipSelected: {
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(0,201,167,0.15)',
    },
    extraTextSelected: {
        color: COLORS.accent,
        ...FONTS.bold,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    qtyButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    qtyButtonAdd: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    qtyText: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
        minWidth: 30,
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
});
