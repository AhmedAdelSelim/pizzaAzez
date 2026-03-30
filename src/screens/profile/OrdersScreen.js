import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSSE } from '../../context/SSEContext';
import api from '../../services/api';
import OrderJourneyTracker from '../../components/OrderJourneyTracker';

export default function OrdersScreen({ navigation }) {
    const { token, ensureAuthenticated } = useAuth();
    const { addItem, clearCart } = useCart();
    const sse = useSSE();

    useEffect(() => {
        ensureAuthenticated();
    }, [token]);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            const data = await api.getOrders(token);
            setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Auto-refresh every 30s as a fallback
    useEffect(() => {
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // Real-time order status updates via SSE
    useEffect(() => {
        if (!sse) return;
        const unsubscribe = sse.on('order_status', ({ orderId, status }) => {
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status } : o)
            );
        });
        return unsubscribe;
    }, [sse]);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { color: '#9E9E9E', label: 'تم الاستلام', icon: 'receipt-outline' };
            case 'preparing': return { color: '#FFA000', label: 'جاري التحضير', icon: 'time-outline' };
            case 'baking': return { color: '#E85D2C', label: 'في الفرن', icon: 'flame-outline' };
            case 'shipping': return { color: '#2196F3', label: 'جاري التوصيل', icon: 'bicycle-outline' };
            case 'delivered': return { color: '#4CAF50', label: 'تم التوصيل', icon: 'checkmark-circle-outline' };
            case 'cancelled': return { color: COLORS.error, label: 'ملغي', icon: 'close-circle-outline' };
            default: return { color: COLORS.textMuted, label: 'غير معروف', icon: 'help-outline' };
        }
    };

    const isActiveStatus = (status) => ['pending', 'preparing', 'baking', 'shipping'].includes(status);

    const handleCancelOrder = (order) => {
        Alert.alert(
            'إلغاء الطلب',
            'هل أنت متأكد أنك تريد إلغاء هذا الطلب؟',
            [
                { text: 'تراجع', style: 'cancel' },
                {
                    text: 'نعم، إلغاء الطلب',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.cancelOrder(order.id, token);
                            fetchOrders();
                        } catch (error) {
                            Alert.alert('خطأ', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleReorder = (order) => {
        if (!order.items || order.items.length === 0) return;
        Alert.alert(
            'إعادة الطلب',
            'هل تريد إضافة نفس المنتجات إلى سلة التسوق؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'نعم، أضف إلى السلة',
                    onPress: () => {
                        clearCart();
                        order.items.forEach((item) => {
                            addItem({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                quantity: item.quantity,
                                selectedSize: item.selectedSize || item.size || null,
                                image: item.image || null,
                            });
                        });
                        navigation.navigate('CartTab');
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>سجل الطلبات</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>سجل الطلبات</Text>
                {orders.length > 0 && (
                    <View style={styles.orderCountBadge}>
                        <Text style={styles.orderCountText}>{orders.length}</Text>
                    </View>
                )}
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={72} color={COLORS.border} />
                    <Text style={styles.emptyText}>لا يوجد طلبات سابقة</Text>
                    <Text style={styles.emptySubtext}>اطلب الآن واستمتع بأشهى المأكولات!</Text>
                    <TouchableOpacity
                        style={styles.orderNowBtn}
                        onPress={() => navigation.navigate('MenuTab')}
                    >
                        <Text style={styles.orderNowText}>اطلب الآن</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => {
                        const statusConfig = getStatusConfig(item.status);
                        const active = isActiveStatus(item.status);
                        return (
                            <View style={[styles.orderCard, active && styles.orderCardActive]}>
                                {active && (
                                    <LinearGradient
                                        colors={[statusConfig.color + '18', 'transparent']}
                                        style={styles.activeGlow}
                                    />
                                )}
                                <View style={styles.orderHeader}>
                                    <View style={styles.orderIdSection}>
                                        <Text style={styles.orderId}>
                                            #{item.id.toString().slice(-6).toUpperCase()}
                                        </Text>
                                        <Text style={styles.orderDate}>{item.date}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20', borderColor: statusConfig.color + '40' }]}>
                                        <Ionicons name={statusConfig.icon} size={13} color={statusConfig.color} />
                                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                            {statusConfig.label}
                                        </Text>
                                    </View>
                                </View>

                                {active && (
                                    <View style={styles.trackerWrapper}>
                                        <OrderJourneyTracker currentStatus={item.status} />
                                    </View>
                                )}

                                <View style={styles.divider} />

                                <View style={styles.itemsList}>
                                    {(item.items || []).map((orderItem, idx) => (
                                        <View key={idx} style={styles.itemRow}>
                                            <Text style={styles.itemQty}>{orderItem.quantity}x</Text>
                                            <Text style={styles.itemName} numberOfLines={1}>
                                                {orderItem.name} {orderItem.size ? `(${orderItem.size})` : ''}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.footer}>
                                    <Text style={styles.totalLabel}>
                                        الإجمالي: <Text style={styles.totalValue}>{item.total} ج.م</Text>
                                    </Text>
                                    <View style={styles.footerActions}>
                                        {['pending', 'preparing'].includes(item.status) && (
                                            <TouchableOpacity
                                                style={styles.cancelButton}
                                                onPress={() => handleCancelOrder(item)}
                                            >
                                                <Ionicons name="close-circle-outline" size={14} color={COLORS.error} />
                                                <Text style={styles.cancelText}>إلغاء</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            style={styles.reorderButton}
                                            onPress={() => handleReorder(item)}
                                        >
                                            <Ionicons name="refresh-outline" size={14} color={COLORS.primary} />
                                            <Text style={styles.reorderText}>إعادة طلب</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
        flex: 1,
        textAlign: 'right',
    },
    orderCountBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius_full,
        minWidth: 26,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    orderCountText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    listContent: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        padding: SIZES.spacing_lg,
        marginBottom: SIZES.spacing_lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        ...SHADOWS.small,
    },
    orderCardActive: {
        borderColor: COLORS.primary + '40',
    },
    activeGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    orderHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderIdSection: {
        alignItems: 'flex-end',
    },
    orderId: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.bold,
    },
    orderDate: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: SIZES.radius_full,
        borderWidth: 1,
        gap: 5,
    },
    statusText: {
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    trackerWrapper: {
        marginTop: 12,
        marginBottom: 4,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 12,
    },
    itemsList: {
        gap: 6,
        marginBottom: 4,
    },
    itemRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
    },
    itemQty: {
        color: COLORS.primary,
        fontSize: SIZES.sm,
        ...FONTS.bold,
        minWidth: 24,
        textAlign: 'right',
    },
    itemName: {
        flex: 1,
        color: COLORS.textSecondary,
        fontSize: SIZES.sm,
        ...FONTS.regular,
        textAlign: 'right',
    },
    footer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
    },
    footerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error + '15',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: SIZES.radius_md,
        borderWidth: 1,
        borderColor: COLORS.error + '30',
        gap: 4,
    },
    cancelText: {
        color: COLORS.error,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    totalLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.sm,
        ...FONTS.medium,
    },
    totalValue: {
        color: COLORS.primary,
        fontSize: SIZES.md,
        ...FONTS.bold,
    },
    reorderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: SIZES.radius_md,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
        gap: 5,
    },
    reorderText: {
        color: COLORS.primary,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: SIZES.xl,
        ...FONTS.bold,
        marginTop: 20,
    },
    emptySubtext: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    orderNowBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: SIZES.radius_full,
        ...SHADOWS.glow(COLORS.primary),
    },
    orderNowText: {
        color: COLORS.white,
        fontSize: SIZES.base,
        ...FONTS.bold,
    },
});
