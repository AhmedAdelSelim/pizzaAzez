import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, StatusBar, TextInput, TouchableOpacity, Alert, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/CartItem';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const FREE_DELIVERY_THRESHOLD = 1000;

export default function CartScreen({ navigation }) {
    const {
        items, removeItem, updateQuantity,
        getSubtotal, getTotal, getItemCount,
        appliedCoupon, applyCoupon, removeCoupon, getDiscount
    } = useCart();
    const { token } = useAuth();

    const [couponCode, setCouponCode] = useState('');
    const [validating, setValidating] = useState(false);
    const totalAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const prevTotal = useRef(0);

    const subtotal = items.length > 0 ? getSubtotal() : 0;
    const discount = items.length > 0 ? getDiscount() : 0;
    const total = subtotal - discount;
    const progressPct = Math.min(subtotal / FREE_DELIVERY_THRESHOLD, 1);
    const remaining = Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0);

    useEffect(() => {
        if (prevTotal.current !== total) {
            Animated.sequence([
                Animated.timing(totalAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
                Animated.spring(totalAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
            ]).start();
            prevTotal.current = total;
        }
    }, [total]);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progressPct,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [progressPct]);

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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.title}>سلتي</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{getItemCount()} عنصر</Text>
                </View>
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
                        {/* Free Delivery Progress */}
                        <View style={styles.progressCard}>
                            {remaining > 0 ? (
                                <>
                                    <View style={styles.progressHeader}>
                                        <Ionicons name="bicycle-outline" size={18} color={COLORS.accent} />
                                        <Text style={styles.progressText}>
                                            أضف <Text style={styles.progressAmount}>{remaining} ج.م</Text> للحصول على توصيل مجاني 🎁
                                        </Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <Animated.View
                                            style={[
                                                styles.progressBarFill,
                                                {
                                                    width: progressAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ['0%', '100%'],
                                                    }),
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.progressHint}>{subtotal} / {FREE_DELIVERY_THRESHOLD} ج.م</Text>
                                </>
                            ) : (
                                <View style={styles.freeDeliveryAchieved}>
                                    <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                                    <Text style={styles.freeDeliveryText}>مبروك! حصلت على توصيل مجاني 🎉</Text>
                                </View>
                            )}
                        </View>

                        {/* Coupon Section */}
                        <View style={styles.couponSection}>
                            <View style={styles.couponInputContainer}>
                                <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
                                <TextInput
                                    style={styles.couponInput}
                                    placeholder="أدخل كود الخصم"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={couponCode}
                                    onChangeText={setCouponCode}
                                    autoCapitalize="characters"
                                    textAlign="right"
                                />
                                <TouchableOpacity
                                    style={[styles.applyButton, validating && { opacity: 0.6 }]}
                                    onPress={handleApplyCoupon}
                                    disabled={validating}
                                >
                                    <Text style={styles.applyButtonText}>{validating ? '...' : 'تطبيق'}</Text>
                                </TouchableOpacity>
                            </View>
                            {appliedCoupon && (
                                <View style={styles.appliedCouponTag}>
                                    <View style={styles.couponTagInfo}>
                                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                                        <Text style={styles.appliedCouponText}>تم تطبيق: {appliedCoupon.code}</Text>
                                    </View>
                                    <TouchableOpacity onPress={removeCoupon} style={styles.removeCouponBtn}>
                                        <Ionicons name="close" size={16} color={COLORS.textMuted} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Summary */}
                        <View style={styles.summary}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
                                <Text style={styles.summaryValue}>{subtotal} ج.م</Text>
                            </View>
                            {appliedCoupon && (
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>
                                        الخصم ({appliedCoupon.code})
                                    </Text>
                                    <Text style={styles.discountText}>- {discount} ج.م</Text>
                                </View>
                            )}
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>إجمالي الطلب</Text>
                                <Animated.Text style={[styles.totalValue, { transform: [{ scale: totalAnim }] }]}>
                                    {total} ج.م
                                </Animated.Text>
                            </View>
                            <Text style={styles.checkoutNote}>* يضاف التوصيل في الخطوة التالية</Text>
                        </View>
                    </View>
                }
            />

            <View style={styles.bottomBar}>
                <Button
                    title={`إتمام الطلب  •  ${total} ج.م`}
                    onPress={() => navigation.navigate('Checkout')}
                    size="large"
                    style={styles.checkoutButton}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl, paddingTop: 60, paddingBottom: SIZES.spacing_base,
    },
    title: { color: COLORS.text, fontSize: SIZES.xxxl, ...FONTS.extraBold },
    countBadge: {
        backgroundColor: COLORS.primary + '20', borderRadius: SIZES.radius_full,
        paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.primary + '40',
    },
    countText: { color: COLORS.primary, fontSize: SIZES.sm, ...FONTS.bold },
    listContent: { paddingHorizontal: SIZES.spacing_xl, paddingBottom: 160 },

    progressCard: {
        backgroundColor: COLORS.surface, borderRadius: SIZES.radius_xl, padding: SIZES.spacing_base,
        borderWidth: 1, borderColor: COLORS.accent + '30', marginBottom: SIZES.spacing_base,
    },
    progressHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 10 },
    progressText: { flex: 1, color: COLORS.textSecondary, fontSize: SIZES.sm, ...FONTS.medium, textAlign: 'right' },
    progressAmount: { color: COLORS.accent, ...FONTS.extraBold },
    progressBarBg: {
        height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6,
    },
    progressBarFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
    progressHint: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular, textAlign: 'right' },
    freeDeliveryAchieved: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
    freeDeliveryText: { color: COLORS.accent, fontSize: SIZES.sm, ...FONTS.bold },

    couponSection: { marginBottom: 4 },
    couponInputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl, paddingHorizontal: 16, height: 56,
        borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
    },
    couponInput: { flex: 1, color: COLORS.text, fontSize: SIZES.md, ...FONTS.medium, marginHorizontal: 10 },
    applyButton: { backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: SIZES.radius_md },
    applyButtonText: { color: COLORS.white, fontSize: SIZES.sm, ...FONTS.bold },
    appliedCouponTag: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'rgba(76,175,80,0.1)', padding: 12, borderRadius: SIZES.radius_lg,
        marginTop: 10, borderWidth: 1, borderColor: 'rgba(76,175,80,0.25)',
    },
    couponTagInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    appliedCouponText: { color: '#2E7D32', fontSize: SIZES.sm, ...FONTS.semiBold },
    removeCouponBtn: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    },

    summary: {
        backgroundColor: COLORS.surface, borderRadius: SIZES.radius_xl, padding: SIZES.spacing_xl,
        marginTop: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { color: COLORS.textMuted, fontSize: SIZES.md, ...FONTS.regular },
    summaryValue: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.semiBold },
    discountText: { color: '#2E7D32', fontSize: SIZES.md, ...FONTS.bold },
    divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
    totalLabel: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold },
    totalValue: { color: COLORS.primary, fontSize: SIZES.xl, ...FONTS.extraBold },
    checkoutNote: { color: '#2E7D32', fontSize: SIZES.xs, ...FONTS.regular, textAlign: 'right', marginTop: 4 },

    emptyAction: { paddingHorizontal: SIZES.spacing_xl, marginTop: 20 },
    bottomBar: {
        position: 'absolute', bottom: 45, left: 0, right: 0, backgroundColor: COLORS.surface,
        paddingHorizontal: SIZES.spacing_xl, paddingVertical: SIZES.spacing_base, paddingBottom: 34,
        borderTopLeftRadius: SIZES.radius_xxl, borderTopRightRadius: SIZES.radius_xxl,
        borderTopWidth: 1, borderColor: COLORS.border, ...SHADOWS.large,
    },
    checkoutButton: { width: '100%' },
});
