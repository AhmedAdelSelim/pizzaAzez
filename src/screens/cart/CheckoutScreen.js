import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, StatusBar, Alert, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import api from '../../services/api';

export default function CheckoutScreen({ navigation }) {
    const { items, getSubtotal, getDeliveryFee, getTotal, getDiscount, appliedCoupon, clearCart, selectedZone, setDeliveryZone } = useCart();
    const { user } = useAuth();
    const [address, setAddress] = useState(user?.address || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [deliveryZones, setDeliveryZones] = useState([]);

    React.useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const zones = await api.getDeliveryZones();
            setDeliveryZones(zones);
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

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
                discount: getDiscount(),
                couponCode: appliedCoupon?.code || null,
            });
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
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="map-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>منطقة التوصيل</Text>
                    </View>
                    <View style={styles.zonesContainer}>
                        {deliveryZones.map((zone) => (
                            <TouchableOpacity
                                key={zone.id}
                                style={[
                                    styles.zoneChip,
                                    selectedZone?.id === zone.id && styles.zoneChipSelected
                                ]}
                                onPress={() => setDeliveryZone(zone)}
                            >
                                <Text style={[
                                    styles.zoneText,
                                    selectedZone?.id === zone.id && styles.zoneTextSelected
                                ]}>
                                    {zone.name} ({zone.price} ج.م)
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

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
                                <Text style={styles.orderItemPrice}>
                                    {item.price * item.quantity} ج.م
                                </Text>
                            </View>
                        ))}

                        <View style={styles.divider} />

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
                            <Text style={styles.summaryValue}>{getSubtotal()} ج.م</Text>
                        </View>
                        {appliedCoupon && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>الخصم ({appliedCoupon.code})</Text>
                                <Text style={[styles.summaryValue, styles.discountText]}>
                                    - {getDiscount()} ج.م
                                </Text>
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
                            <Text style={styles.totalValue}>{getTotal()} ج.م</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>طريقة الدفع</Text>
                    </View>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentIcon}>
                            <Ionicons name="cash" size={28} color={COLORS.accent} />
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentTitle}>الدفع عند الاستلام</Text>
                            <Text style={styles.paymentSub}>ادفع عند وصول طلبك</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} />
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
                <Button
                    title={`تأكيد الطلب  •  ${getTotal()} ج.م`}
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
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
        gap: 16,
    },
    backIcon: {
        padding: 4,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
    },
    scrollContent: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingBottom: 120,
    },
    section: {
        marginBottom: SIZES.spacing_xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: SIZES.lg,
        ...FONTS.bold,
    },
    zonesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    zoneChip: {
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius_md,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    zoneChipSelected: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(232,93,44,0.1)',
    },
    zoneText: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.medium,
    },
    zoneTextSelected: {
        color: COLORS.primary,
        ...FONTS.bold,
    },
    inputBox: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_md,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.regular,
    },
    notesInput: {
        minHeight: 80,
    },
    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        padding: SIZES.spacing_base,
        ...SHADOWS.small,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    orderItemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 12,
        gap: 8,
    },
    orderItemQty: {
        color: COLORS.primary,
        fontSize: SIZES.sm,
        ...FONTS.bold,
        minWidth: 24,
    },
    orderItemName: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.medium,
        flex: 1,
        textAlign: 'right',
    },
    orderItemPrice: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.semiBold,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
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
    free: {
        color: COLORS.accent,
        ...FONTS.bold,
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
    discountText: {
        color: '#2E7D32',
        ...FONTS.bold,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        padding: SIZES.spacing_base,
        gap: 14,
        borderWidth: 1.5,
        borderColor: COLORS.accent,
        ...SHADOWS.small,
    },
    paymentIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,201,167,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentInfo: {
        flex: 1,
    },
    paymentTitle: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.bold,
        textAlign: 'right',
    },
    paymentSub: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
        marginTop: 2,
        textAlign: 'right',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
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
    orderButton: {
        width: '100%',
    },
});
