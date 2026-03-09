import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';
import React from 'react';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function FoodCard({ item, onPress, onAddToCart }) {
    const handleAdd = (e) => {
        e.stopPropagation?.();
        onAddToCart?.(item);
    };

    return (
        <View style={styles.cardContainer}>
            <TouchableOpacity
                onPress={() => onPress(item)}
                activeOpacity={0.9}
                style={styles.container}
            >
                <View style={styles.imageContainer}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.emoji}>
                                {item.categoryIcon || ({ '1': '🧀', '2': '🍗', '3': '🥩', '4': '🌯', '5': '🔥', '6': '🍕', '7': '🥧', '8': '🍫', '9': '🥟', '10': '🍟' })[item.categoryId] || '🍕'}
                            </Text>
                        </View>
                    )}
                    {item.isSpecial && (
                        <View style={styles.specialBadge}>
                            <Text style={styles.specialText}>🔥 عرض</Text>
                        </View>
                    )}
                </View>

                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color={COLORS.star} />
                        <Text style={styles.rating}>{item.rating}</Text>
                        <Text style={styles.reviews}>
                            ({Array.isArray(item.reviews) ? item.reviews.length : (item.reviews || 0)})
                        </Text>
                    </View>

                    <View style={styles.bottomRow}>
                        <Text style={styles.price}>{item.sizes ? `من ${item.price}` : item.price} ج.م</Text>
                        <TouchableOpacity
                            onPress={handleAdd}
                            style={styles.addButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        marginBottom: SIZES.spacing_base,
        ...SHADOWS.medium,
    },
    imageContainer: {
        height: 120,
        borderTopLeftRadius: SIZES.radius_lg,
        borderTopRightRadius: SIZES.radius_lg,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    emoji: {
        fontSize: 48,
    },
    specialBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius_sm,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    specialText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    info: {
        padding: SIZES.spacing_md,
    },
    name: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.bold,
        marginBottom: 2,
    },
    description: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
        marginBottom: 6,
        lineHeight: 16,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 3,
    },
    rating: {
        color: COLORS.star,
        fontSize: SIZES.xs,
        ...FONTS.semiBold,
    },
    reviews: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        color: COLORS.primary,
        fontSize: SIZES.lg,
        ...FONTS.extraBold,
    },
    addButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
});
