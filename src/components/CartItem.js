import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';

export default function CartItem({ item, index, onUpdateQuantity, onRemove }) {
    const emoji = item.categoryIcon || ({ '1': '🧀', '2': '🍗', '3': '🥩', '4': '🌯', '5': '🔥', '6': '🍕', '7': '🥧', '8': '🍫', '9': '🥟', '10': '🍟' })[item.categoryId] || '🍕';

    return (
        <View style={styles.container}>
            <View style={styles.imageBox}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                    <Text style={styles.emoji}>{emoji}</Text>
                )}
            </View>

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                {item.selectedSize && (
                    <Text style={styles.size}>الحجم: {typeof item.selectedSize === 'object' ? item.selectedSize.name : item.selectedSize}</Text>
                )}
                <Text style={styles.price}>{item.price * item.quantity} ج.م</Text>
            </View>

            <View style={styles.controls}>
                <View style={styles.quantityRow}>
                    <TouchableOpacity
                        onPress={() => {
                            if (item.quantity <= 1) {
                                onRemove?.(item.id, index);
                            } else {
                                onUpdateQuantity?.(index, item.quantity - 1);
                            }
                        }}
                        style={styles.qtyButton}
                    >
                        <Ionicons
                            name={item.quantity <= 1 ? 'trash-outline' : 'remove'}
                            size={16}
                            color={item.quantity <= 1 ? COLORS.error : COLORS.white}
                        />
                    </TouchableOpacity>

                    <Text style={styles.quantity}>{item.quantity}</Text>

                    <TouchableOpacity
                        onPress={() => onUpdateQuantity?.(index, item.quantity + 1)}
                        style={[styles.qtyButton, styles.qtyButtonAdd]}
                    >
                        <Ionicons name="add" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_md,
        marginBottom: SIZES.spacing_md,
        ...SHADOWS.small,
    },
    imageBox: {
        width: 60,
        height: 60,
        borderRadius: SIZES.radius_md,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SIZES.spacing_md,
    },
    emoji: {
        fontSize: 30,
    },
    itemImage: {
        width: '100%',
        height: '100%',
        borderRadius: SIZES.radius_md,
        resizeMode: 'cover',
    },
    info: {
        flex: 1,
        marginRight: SIZES.spacing_sm,
    },
    name: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.semiBold,
        marginBottom: 2,
    },
    size: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
        marginBottom: 4,
    },
    price: {
        color: COLORS.primary,
        fontSize: SIZES.base,
        ...FONTS.bold,
    },
    controls: {
        alignItems: 'center',
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    qtyButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    qtyButtonAdd: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    quantity: {
        color: COLORS.text,
        fontSize: SIZES.base,
        ...FONTS.bold,
        minWidth: 20,
        textAlign: 'center',
    },
});
