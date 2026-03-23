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
                    <Text style={styles.size}>
                        الحجم: {typeof item.selectedSize === 'object' ? item.selectedSize.name : item.selectedSize}
                    </Text>
                )}
                {item.selectedExtras?.length > 0 && (
                    <Text style={styles.extras} numberOfLines={1}>
                        + {item.selectedExtras.join('، ')}
                    </Text>
                )}
                <Text style={styles.price}>{item.price * item.quantity} ج.م</Text>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={() => {
                        if (item.quantity <= 1) {
                            onRemove?.(item.id, index);
                        } else {
                            onUpdateQuantity?.(index, item.quantity - 1);
                        }
                    }}
                    style={[styles.qtyButton, item.quantity <= 1 && styles.qtyButtonDelete]}
                >
                    <Ionicons
                        name={item.quantity <= 1 ? 'trash-outline' : 'remove'}
                        size={15}
                        color={item.quantity <= 1 ? COLORS.error : COLORS.text}
                    />
                </TouchableOpacity>

                <Text style={styles.quantity}>{item.quantity}</Text>

                <TouchableOpacity
                    onPress={() => onUpdateQuantity?.(index, item.quantity + 1)}
                    style={[styles.qtyButton, styles.qtyButtonAdd]}
                >
                    <Ionicons name="add" size={15} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        padding: SIZES.spacing_md,
        marginBottom: SIZES.spacing_md,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imageBox: {
        width: 72,
        height: 72,
        borderRadius: SIZES.radius_lg,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SIZES.spacing_md,
        overflow: 'hidden',
    },
    emoji: {
        fontSize: 34,
    },
    itemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    info: {
        flex: 1,
        marginRight: SIZES.spacing_sm,
    },
    name: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.bold,
        marginBottom: 3,
        textAlign: 'right',
    },
    size: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
        marginBottom: 2,
        textAlign: 'right',
    },
    extras: {
        color: COLORS.accent,
        fontSize: SIZES.xs,
        ...FONTS.regular,
        marginBottom: 4,
        textAlign: 'right',
    },
    price: {
        color: COLORS.primary,
        fontSize: SIZES.md,
        ...FONTS.extraBold,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    qtyButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
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
    qtyButtonDelete: {
        borderColor: COLORS.error + '50',
        backgroundColor: COLORS.error + '15',
    },
    quantity: {
        color: COLORS.text,
        fontSize: SIZES.base,
        ...FONTS.bold,
        minWidth: 20,
        textAlign: 'center',
    },
});
