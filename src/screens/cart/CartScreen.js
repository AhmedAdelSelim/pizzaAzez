import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, StatusBar, TextInput, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/CartItem';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CartScreen({ navigation }) {
    const {
        items, removeItem, updateQuantity, clearCart,
        getSubtotal, getDeliveryFee, getTotal, getItemCount,
        selectedZone, appliedCoupon, applyCoupon, removeCoupon, getDiscount
    } = useCart();
    const { token } = useAuth();

    const [couponCode, setCouponCode] = useState('');
    const [validating, setValidating] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setValidating(true);
        try {
            const coupon = await api.validateCoupon(couponCode.trim(), token);
            applyCoupon(coupon);
            setCouponCode('');
        } catch (error) {
            Alert.alert('خطأ', error.message || 'كود الخصم غير صحيح');
        } finally {
            setValidating(false);
        }
    };

    if (items.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
                <View style={styles.header}>
                    <Text style={styles.title}>سلتي</Text>
                </View>
                <EmptyState
                    icon="cart-outline"
                    title="سلتك فارغة"
                    message="أضف بعض الأطباق اللذيذة من قائمتنا للبدء!"
                />
                <View style={styles.emptyAction}>
                    <Button
                        title="تصفح القائمة"
                        onPress={() => navigation.navigate('MenuTab')}
                        variant="outline"
                        size="large"
                    />
                </View>
            </View>
        );
    }

    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const total = getTotal();
    const discount = getDiscount();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.title}>سلتي</Text>
                <Text style={styles.itemCount}>{getItemCount()} عنصر</Text>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item, index }) => (
                    <CartItem
                        item={item}
                        index={index}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    <View>
                        <View style={styles.couponSection}>
                            <View style={styles.couponInputContainer}>
                                <Ionicons name="pricetag-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.couponInput}
                                    placeholder="كود الخصم"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={couponCode}
                                    onChangeText={setCouponCode}
                                    autoCapitalize="characters"
                                    textAlign="right"
                                />
                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={handleApplyCoupon}
                                >
                                    <Text style={styles.applyButtonText}>تطبيق</Text>
                                </TouchableOpacity>
                            </View>

                            {appliedCoupon && (
                                <View style={styles.appliedCouponTag}>
                                    <View style={styles.couponTagInfo}>
                                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                        <Text style={styles.appliedCouponText}>تم تطبيق: {appliedCoupon.code}</Text>
                                    </View>
                                    <TouchableOpacity onPress={removeCoupon}>
                                        <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={styles.summary}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
                                <Text style={styles.summaryValue}>{subtotal} ج.م</Text>
                            </View>

                            {appliedCoupon && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>الخصم ({appliedCoupon.code})</Text>
                                    <Text style={[styles.summaryValue, styles.discountText]}>
                                        - {discount} ج.م
                                    </Text>
                                </View>
                            )}

                            <View style={[styles.summaryRow, { marginTop: 10 }]}>
                                <Text style={styles.totalLabel}>إجمالي الطلب</Text>
                                <Text style={styles.totalValue}>{subtotal - discount} ج.م</Text>
                            </View>
                            <Text style={styles.checkoutNote}>* يضاف التوصيل في الخطوة التالية</Text>
                        </View>
                    </View>
                }
            />

            <View style={styles.bottomBar}>
                <Button
                    title={`إتمام الطلب  •  ${subtotal - discount} ج.م`}
                    onPress={() => navigation.navigate('Checkout')}
                    size="large"
                    style={styles.checkoutButton}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxxl,
        ...FONTS.extraBold,
    },
    itemCount: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.medium,
    },
    listContent: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingBottom: 150,
    },
    couponSection: {
        marginTop: SIZES.spacing_base,
    },
    couponInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        paddingHorizontal: 16,
        height: 55,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    couponInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.medium,
        marginHorizontal: 10,
    },
    applyButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: SIZES.radius_md,
    },
    applyButtonText: {
        color: COLORS.white,
        fontSize: SIZES.sm,
        ...FONTS.bold,
    },
    appliedCouponTag: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        padding: 12,
        borderRadius: SIZES.radius_md,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    couponTagInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    appliedCouponText: {
        color: '#2E7D32',
        fontSize: SIZES.sm,
        ...FONTS.semiBold,
    },
    summary: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        padding: SIZES.spacing_xl,
        marginTop: 12,
        ...SHADOWS.small,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
    },
    summaryValue: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.semiBold,
    },
    discountText: {
        color: '#2E7D32',
        ...FONTS.bold,
    },
    freeDelivery: {
        color: COLORS.accent,
        ...FONTS.bold,
    },
    checkoutNote: {
        color: '#2E7D32',
        fontSize: SIZES.xs,
        ...FONTS.regular,
        textAlign: 'right',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: 12,
    },
    totalLabel: {
        color: COLORS.text,
        fontSize: SIZES.lg,
        ...FONTS.bold,
    },
    totalValue: {
        color: COLORS.primary,
        fontSize: SIZES.xl,
        ...FONTS.extraBold,
    },
    emptyAction: {
        paddingHorizontal: SIZES.spacing_xl,
        marginTop: 20,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 45,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        paddingHorizontal: SIZES.spacing_xl,
        paddingVertical: SIZES.spacing_base,
        paddingBottom: 34,
        borderTopLeftRadius: SIZES.radius_xxl,
        borderTopRightRadius: SIZES.radius_xxl,
        ...SHADOWS.large,
    },
    checkoutButton: {
        width: '100%',
    },
});
