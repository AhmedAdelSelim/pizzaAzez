import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import OrderJourneyTracker from '../../components/OrderJourneyTracker';

export default function OrdersScreen({ navigation }) {
    const { token, ensureAuthenticated } = useAuth();

    useEffect(() => {
        ensureAuthenticated();
    }, [token]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            const data = await api.getOrders(token);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleReorder = (order) => {
        alert('تمت إضافة المنتج للسلة مرة أخرى');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#9E9E9E';
            case 'preparing': return '#FFA000';
            case 'baking': return '#E85D2C';
            case 'shipping': return '#2196F3';
            case 'delivered': return '#2E7D32';
            case 'cancelled': return COLORS.error;
            default: return COLORS.textMuted;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'تم الاستلام';
            case 'preparing': return 'جاري التحضير';
            case 'baking': return 'في الفرن';
            case 'shipping': return 'جاري التوصيل';
            case 'delivered': return 'تم التوصيل';
            case 'cancelled': return 'ملغي';
            default: return 'غير معروف';
        }
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

    const isActiveStatus = (status) => {
        return ['pending', 'preparing', 'baking', 'shipping'].includes(status);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>سجل الطلبات</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={80} color={COLORS.border} />
                    <Text style={styles.emptyText}>لا يوجد طلبات سابقة</Text>
                    <Text style={styles.emptySubtext}>اطلب الآن واستمتع بأشهى المأكولات!</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <View>
                                    <Text style={styles.orderId}>طلب #{item.id.toString().slice(-6).toUpperCase()}</Text>
                                    <Text style={styles.orderDate}>{item.date}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                        {getStatusText(item.status)}
                                    </Text>
                                </View>
                            </View>

                            {/* Journey Tracker for Active Orders */}
                            {isActiveStatus(item.status) && (
                                <View style={styles.trackerWrapper}>
                                    <OrderJourneyTracker currentStatus={item.status} />
                                </View>
                            )}

                            <View style={styles.divider} />

                            <View style={styles.itemsList}>
                                {(item.items || []).map((orderItem, idx) => (
                                    <Text key={idx} style={styles.itemRow}>
                                        {orderItem.quantity}x {orderItem.name} {orderItem.size ? `(${orderItem.size})` : ''}
                                    </Text>
                                ))}
                            </View>


                            <View style={styles.footer}>
                                <Text style={styles.totalLabel}>الإجمالي: <Text style={styles.totalValue}>{item.total} ج.م</Text></Text>
                                <TouchableOpacity
                                    style={styles.reorderButton}
                                    onPress={() => handleReorder(item)}
                                >
                                    <Text style={styles.reorderText}>إعادة طلب</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
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
        gap: 16,
    },
    backButton: {
        padding: 4,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
        flex: 1,
        textAlign: 'right',
    },
    listContent: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_lg,
        marginBottom: SIZES.spacing_lg,
        ...SHADOWS.small,
    },
    orderHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.bold,
        textAlign: 'right',
    },
    orderDate: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
        textAlign: 'right',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: SIZES.radius_full,
    },
    statusText: {
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 12,
    },
    itemsList: {
        gap: 4,
    },
    itemRow: {
        color: COLORS.textSecondary,
        fontSize: SIZES.sm,
        ...FONTS.regular,
        textAlign: 'right',
    },
    footer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
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
        backgroundColor: COLORS.backgroundLight,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: SIZES.radius_md,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    reorderText: {
        color: COLORS.primary,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    trackerWrapper: {
        marginTop: 16,
        marginBottom: 8,
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
    },
});
