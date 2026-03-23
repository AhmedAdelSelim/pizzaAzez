import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, StatusBar, Alert, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import api from '../../services/api';

const PAYMENT_METHODS = [
    { id: 'cod', label: 'الدفع عند الاستلام', sub: 'ادفع نقداً عند استلام طلبك', icon: 'cash-outline', iconColor: COLORS.accent },
    { id: 'vodafone_cash', label: 'فودافون كاش', sub: '010XXXXXXXX', icon: 'phone-portrait-outline', iconColor: '#E60026' },
    { id: 'fawry', label: 'فوري', sub: 'ادفع في أقرب منفذ فوري', icon: 'storefront-outline', iconColor: '#FF6A00' },
];

export default function CheckoutScreen({ navigation }) {
    const { items, getSubtotal, getDeliveryFee, getTotal, getDiscount, appliedCoupon, clearCart, selectedZone, setDeliveryZone } = useCart();
    const { user, token, ensureAuthenticated } = useAuth();

    React.useEffect(() => {
        ensureAuthenticated();
    }, [token]);

    const [address, setAddress] = useState(user?.address || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [deliveryZones, setDeliveryZones] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cod');

    // Loyalty
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    const [redeemingPoints, setRedeemingPoints] = useState(false);
    const [pointsDiscount, setPointsDiscount] = useState(0);

    useEffect(() => {
        fetchZones();
        fetchLoyalty();
    }, []);

    const fetchZones = async () => {
        try {
            const zones = await api.getDeliveryZones();
            setDeliveryZones(zones);
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const fetchLoyalty = async () => {
        if (!token) return;
        try {
            const data = await api.getLoyaltyPoints(token);
            setLoyaltyPoints(data.points || 0);
        } catch {}
    };

    const handleRedeemPoints = async () => {
        if (pointsToRedeem <= 0 || pointsToRedeem > loyaltyPoints) return;
        setRedeemingPoints(true);
        try {
            const result = await api.redeemLoyaltyPoints(pointsToRedeem, token);
            setPointsDiscount(result.discount || Math.floor(pointsToRedeem / 10));
            Alert.alert('تم ✅', `تم خصم ${result.discount || Math.floor(pointsToRedeem / 10)} ج.م من نقاطك`);
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setRedeemingPoints(false);
        }
    };

    const finalTotal = Math.max(0, getTotal() - pointsDiscount);

    const handlePlaceOrder = async () => {
        if (!selectedZone) {
            Alert.alert('المنطقة مطلوبة', 'يرجى اختيار منطقة التوصيل.');
            return;
        }
        if (!address.trim()) {
            Alert.alert('العنوان مطلوب', 'يرجى إدخال عنوان التوصيل.');
            return;
        }
        if (!phone.trim()) {
            Alert.alert('الهاتف مطلوب', 'يرجى إدخال رقم الهاتف.');
            return;
        }

        setLoading(true);
        try {
            const result = await api.placeOrder({
                items,
                address: address.trim(),
                phone: phone.trim(),
                notes: notes.trim(),
                deliveryZone: selectedZone.name,
                deliveryFee: getDeliveryFee(),
                discount: getDiscount() + pointsDiscount,
                total: finalTotal,
                couponCode: appliedCoupon?.code || null,
                paymentMethod,
            }, token);
            clearCart();
            navigation.replace('OrderConfirmation', { order: result });
        } catch (error) {
            Alert.alert('خطأ', 'فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Ionicons
                    name="arrow-forward"
                    size={24}
                    color={COLORS.text}
                    onPress={() => navigation.goBack()}
                    style={styles.backIcon}
                />
                <Text style={styles.title}>إتمام الطلب</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Delivery Zone */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="map-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>منطقة التوصيل</Text>
                    </View>
                    <View style={styles.zonesContainer}>
                        {deliveryZones.map((zone) => (
                            <TouchableOpacity
                                key={zone.id}
                                style={[styles.zoneChip, selectedZone?.id === zone.id && styles.zoneChipSelected]}
                                onPress={() => setDeliveryZone(zone)}
                            >
                                <Text style={[styles.zoneText, selectedZone?.id === zone.id && styles.zoneTextSelected]}>
                                    {zone.name} ({zone.price} ج.م)
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Delivery Details */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>تفاصيل التوصيل</Text>
                    </View>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.input}
                            placeholder="عنوان التوصيل"
                            placeholderTextColor={COLORS.textMuted}
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            textAlign="right"
                        />
                    </View>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.input}
                            placeholder="رقم الهاتف"
                            placeholderTextColor={COLORS.textMuted}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            textAlign="right"
                        />
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>ملاحظات الطلب</Text>
                    </View>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            placeholder="أي تعليمات خاصة؟ (اختياري)"
                            placeholderTextColor={COLORS.textMuted}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            textAlign="right"
                        />
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="card-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>طريقة الدفع</Text>
                    </View>
                    <View style={styles.paymentList}>
                        {PAYMENT_METHODS.map((method) => {
                            const isSelected = paymentMethod === method.id;
                            return (
                                <TouchableOpacity
                                    key={method.id}
                                    style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
                                    onPress={() => setPaymentMethod(method.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.paymentIcon, { backgroundColor: method.iconColor + '20' }]}>
                                        <Ionicons name={method.icon} size={24} color={method.iconColor} />
                                    </View>
                                    <View style={styles.paymentInfo}>
                                        <Text style={[styles.paymentTitle, isSelected && { color: COLORS.primary }]}>
                                            {method.label}
                                        </Text>
                                        <Text style={styles.paymentSub}>{method.sub}</Text>
                                    </View>
                                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Loyalty Points Redemption */}
                {loyaltyPoints >= 100 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="gift-outline" size={20} color="#FFD700" />
                            <Text style={styles.sectionTitle}>نقاط الولاء</Text>
                        </View>
                        <View style={styles.loyaltyCard}>
                            <View style={styles.loyaltyTop}>
                                <Text style={styles.loyaltyBalance}>
                                    رصيدك: <Text style={styles.loyaltyPts}>{loyaltyPoints} نقطة</Text>
                                </Text>
                                <Text style={styles.loyaltyHint}>100 نقطة = 10 ج.م خصم</Text>
                            </View>
                            {pointsDiscount > 0 ? (
                                <View style={styles.redeemedRow}>
                                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                    <Text style={styles.redeemedText}>تم خصم {pointsDiscount} ج.م من نقاطك</Text>
                                    <TouchableOpacity onPress={() => { setPointsDiscount(0); setPointsToRedeem(0); }}>
                                        <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.redeemRow}>
                                    <TextInput
                                        style={styles.pointsInput}
                                        placeholder="عدد النقاط"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="number-pad"
                                        value={pointsToRedeem > 0 ? String(pointsToRedeem) : ''}
                                        onChangeText={(v) => setPointsToRedeem(Math.min(parseInt(v) || 0, loyaltyPoints))}
                                        textAlign="center"
                                    />
                                    <TouchableOpacity
                                        style={[styles.redeemBtn, (pointsToRedeem < 100 || redeemingPoints) && { opacity: 0.5 }]}
                                        onPress={handleRedeemPoints}
                                        disabled={pointsToRedeem < 100 || redeemingPoints}
                                    >
                                        {redeemingPoints
                                            ? <ActivityIndicator size="small" color={COLORS.white} />
                                            : <Text style={styles.redeemBtnText}>استرداد</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Order Summary */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>ملخص الطلب</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        {items.map((item, index) => (
                            <View key={`${item.id}-${index}`} style={styles.orderItem}>
                                <View style={styles.orderItemInfo}>
                                    <Text style={styles.orderItemQty}>{item.quantity}x</Text>
                                    <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                                </View>
                                <Text style={styles.orderItemPrice}>{item.price * item.quantity} ج.م</Text>
                            </View>
                        ))}
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
                            <Text style={styles.summaryValue}>{getSubtotal()} ج.م</Text>
                        </View>
                        {appliedCoupon && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>خصم الكوبون ({appliedCoupon.code})</Text>
                                <Text style={[styles.summaryValue, styles.discountText]}>- {getDiscount()} ج.م</Text>
                            </View>
                        )}
                        {pointsDiscount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>خصم النقاط ⭐</Text>
                                <Text style={[styles.summaryValue, styles.discountText]}>- {pointsDiscount} ج.م</Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>التوصيل</Text>
                            <Text style={[styles.summaryValue, getDeliveryFee() === 0 && styles.free]}>
                                {getDeliveryFee() === 0 ? 'مجاناً' : `${getDeliveryFee()} ج.م`}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>المجموع الكلي</Text>
                            <Text style={styles.totalValue}>{finalTotal} ج.م</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
                <Button
                    title={`تأكيد الطلب  •  ${finalTotal} ج.م`}
                    onPress={handlePlaceOrder}
                    loading={loading}
                    size="large"
                    style={styles.orderButton}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl, paddingTop: 60, paddingBottom: SIZES.spacing_base, gap: 16,
    },
    backIcon: { padding: 4 },
    title: { color: COLORS.text, fontSize: SIZES.xxl, ...FONTS.bold },
    scrollContent: { paddingHorizontal: SIZES.spacing_xl, paddingBottom: 120 },
    section: { marginBottom: SIZES.spacing_xl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionTitle: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold },
    zonesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    zoneChip: {
        backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
        borderRadius: SIZES.radius_md, paddingHorizontal: 12, paddingVertical: 10,
    },
    zoneChipSelected: { borderColor: COLORS.primary, backgroundColor: 'rgba(232,93,44,0.1)' },
    zoneText: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.medium },
    zoneTextSelected: { color: COLORS.primary, ...FONTS.bold },
    inputBox: {
        backgroundColor: COLORS.surface, borderRadius: SIZES.radius_md,
        paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10,
        borderWidth: 1, borderColor: COLORS.border,
    },
    input: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.regular },
    notesInput: { minHeight: 80 },

    paymentList: { gap: 10 },
    paymentCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl, padding: SIZES.spacing_base, gap: 14,
        borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.small,
    },
    paymentCardSelected: { borderColor: COLORS.primary, backgroundColor: 'rgba(232,93,44,0.06)' },
    paymentIcon: {
        width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    },
    paymentInfo: { flex: 1 },
    paymentTitle: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold, textAlign: 'right' },
    paymentSub: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular, marginTop: 2, textAlign: 'right' },
    radioOuter: {
        width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center',
    },
    radioOuterSelected: { borderColor: COLORS.primary },
    radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: COLORS.primary },

    loyaltyCard: {
        backgroundColor: COLORS.surface, borderRadius: SIZES.radius_xl, padding: SIZES.spacing_base,
        borderWidth: 1, borderColor: '#FFD700' + '40', ...SHADOWS.small,
    },
    loyaltyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    loyaltyBalance: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.medium },
    loyaltyPts: { color: '#FFD700', ...FONTS.extraBold },
    loyaltyHint: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular },
    redeemRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    pointsInput: {
        flex: 1, backgroundColor: COLORS.background, borderRadius: SIZES.radius_md,
        paddingVertical: 10, paddingHorizontal: 14, color: COLORS.text, fontSize: SIZES.md,
        ...FONTS.medium, borderWidth: 1, borderColor: COLORS.border,
    },
    redeemBtn: {
        backgroundColor: '#FFD700', paddingHorizontal: 18, paddingVertical: 11,
        borderRadius: SIZES.radius_md,
    },
    redeemBtnText: { color: COLORS.black, fontSize: SIZES.sm, ...FONTS.bold },
    redeemedRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(76,175,80,0.1)', padding: 10, borderRadius: SIZES.radius_md,
    },
    redeemedText: { flex: 1, color: '#2E7D32', fontSize: SIZES.sm, ...FONTS.semiBold, textAlign: 'right' },

    summaryCard: {
        backgroundColor: COLORS.surface, borderRadius: SIZES.radius_xl, padding: SIZES.spacing_base, ...SHADOWS.small,
    },
    orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    orderItemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 12, gap: 8 },
    orderItemQty: { color: COLORS.primary, fontSize: SIZES.sm, ...FONTS.bold, minWidth: 24 },
    orderItemName: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.medium, flex: 1, textAlign: 'right' },
    orderItemPrice: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.semiBold },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    summaryLabel: { color: COLORS.textMuted, fontSize: SIZES.md, ...FONTS.regular },
    summaryValue: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.semiBold },
    free: { color: COLORS.accent, ...FONTS.bold },
    totalLabel: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold },
    totalValue: { color: COLORS.primary, fontSize: SIZES.xl, ...FONTS.extraBold },
    discountText: { color: '#2E7D32', ...FONTS.bold },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.surface, paddingHorizontal: SIZES.spacing_xl,
        paddingVertical: SIZES.spacing_base, paddingBottom: 34,
        borderTopLeftRadius: SIZES.radius_xxl, borderTopRightRadius: SIZES.radius_xxl, ...SHADOWS.large,
    },
    orderButton: { width: '100%' },
});
