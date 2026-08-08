import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { useSSE } from '../../context/SSEContext';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import { searchFilter } from '../../utils/searchUtils';
import { printOrderReceipt } from '../../utils/printReceipt';

const STATUS_OPTIONS = [
    { label: 'تم الاستلام', value: 'pending', color: COLORS.textMuted },
    { label: 'جاري التحضير', value: 'preparing', color: COLORS.warning },
    { label: 'في الفرن', value: 'baking', color: '#E85D2C' },
    { label: 'جاري التوصيل', value: 'shipping', color: COLORS.primary },
    { label: 'تم التوصيل', value: 'delivered', color: COLORS.success },
    { label: 'ملغي', value: 'cancelled', color: COLORS.error },
];

export default function AdminOrdersScreen({ navigation }) {
    const { token } = useAuth();
    const sse = useSSE();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = React.useMemo(() => {
        return searchFilter(orders, searchQuery, ['id', 'phone', 'customer_name']);
    }, [orders, searchQuery]);

    const sortOrders = (list) =>
        [...list].sort((a, b) => {
            const da = new Date(b.date), db = new Date(a.date);
            if (da - db !== 0) return da - db;
            return b.id.localeCompare(a.id);
        });

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminOrders(token);
            setOrders(sortOrders(data));
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    // Live updates: prepend new order, refresh on status change
    useEffect(() => {
        if (!sse) return;
        const unsubNewOrder = sse.on('new_order', (order) => {
            if (order?.id) {
                setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
            } else {
                loadOrders();
            }
        });
        const unsubUpdated = sse.on('order_updated', () => loadOrders());
        return () => {
            unsubNewOrder();
            unsubUpdated();
        };
    }, [sse]);

    /**
     * Printing is fire-and-forget, always. An unreachable printer, or an admin
     * dismissing the OS print sheet, must never read as a failed status update,
     * so this swallows everything and only points back at the print button.
     */
    const printOrder = (order) => {
        try {
            printOrderReceipt(order).catch((error) => {
                console.error('Receipt print failed:', error);
            });
        } catch (error) {
            console.error('Receipt print failed:', error);
        }
    };

    const handleUpdateStatus = async (order, newStatus) => {
        try {
            await api.updateOrderStatus(order.id, newStatus, token);
            Alert.alert('نجاح', 'تم تحديث حالة الطلب');
            loadOrders();
        } catch (error) {
            Alert.alert('خطأ', error.message);
            return;
        }

        // Confirming a new order prints its kitchen ticket. Kept outside the try
        // above on purpose — by this point the status change is already committed
        // server-side, and nothing the printer does may undo it. A rejection is
        // not a confirmation, so it does not print.
        if (order.status === 'pending' && newStatus !== 'cancelled') {
            printOrder({ ...order, status: newStatus });
        }
    };

    const StatusActionSheet = (order) => {
        Alert.alert(
            'تحديث حالة الطلب',
            `اختر الحالة الجديدة للطلب #${order.id.substring(0, 8)}`,
            [
                ...STATUS_OPTIONS.map(status => ({
                    text: status.label,
                    onPress: () => handleUpdateStatus(order, status.value)
                })),
                { text: 'إلغاء', style: 'cancel' }
            ]
        );
    };

    const renderOrder = ({ item }) => {
        const currentStatus = STATUS_OPTIONS.find(s => s.value === item.status) || STATUS_OPTIONS[0];

        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>#{item.id.substring(0, 8)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: currentStatus.color + '20' }]}>
                        <Text style={[styles.statusText, { color: currentStatus.color }]}>
                            {currentStatus.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.orderDetails}>
                    <Text style={styles.customerName}>{item.customer_name || 'عميل'}</Text>
                    <Text style={styles.detailText}>الهاتف: {item.phone}</Text>
                    <Text style={styles.detailText}>المبلغ: {item.total} ج.م</Text>
                    {!!item.address && <Text style={styles.detailText}>العنوان: {item.address}</Text>}

                    {/* The items are what the kitchen actually reads off this card,
                        so they get their own block at a legible size instead of a
                        comma-run in the muted metadata. */}
                    <View style={styles.itemList}>
                        {item.items?.map((line, index) => (
                            <Text key={index} style={styles.itemLine}>
                                <Text style={styles.itemQty}>{line.quantity}× </Text>
                                {line.name}
                                {!!(line.selectedSize || line.size) && (
                                    <Text style={styles.itemSize}>
                                        {' '}({line.selectedSize || line.size})
                                    </Text>
                                )}
                            </Text>
                        ))}
                    </View>

                    {!!item.notes && <Text style={styles.notesText}>ملاحظات: {item.notes}</Text>}
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.updateButton, styles.updateButtonFlex]}
                        onPress={() => StatusActionSheet(item)}
                    >
                        <Text style={styles.updateButtonText}>تحديث الحالة</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.printButton} onPress={() => printOrder(item)}>
                        <Ionicons name="print-outline" size={18} color={COLORS.text} />
                        <Text style={styles.printButtonText}>طباعة</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>إدارة الطلبات</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchSection}>
                <SearchBar 
                    placeholder="ابحث برقم الهاتف أو رقم الطلب..." 
                    value={searchQuery} 
                    onChangeText={setSearchQuery} 
                />
            </View>

            <FlatList
                data={filteredOrders}
                renderItem={renderOrder}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadOrders} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد طلبات</Text>
                        </View>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
        justifyContent: 'space-between'
    },
    backButton: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center', justifyContent: 'center',
        ...SHADOWS.small
    },
    title: { color: COLORS.text, fontSize: SIZES.xl, ...FONTS.bold },
    searchSection: {
        paddingHorizontal: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_md,
    },
    listContainer: { paddingHorizontal: SIZES.spacing_xl, paddingBottom: 100, gap: SIZES.spacing_md },
    orderCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_lg,
        ...SHADOWS.small
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    orderId: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: SIZES.radius_full },
    statusText: { fontSize: SIZES.sm, ...FONTS.bold },
    orderDetails: { marginBottom: 16 },
    customerName: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold, textAlign: 'right', marginBottom: 4 },
    detailText: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.regular, textAlign: 'right', marginBottom: 4 },
    itemList: { marginTop: 8, gap: 4 },
    itemLine: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold, textAlign: 'right' },
    itemQty: { color: COLORS.primary },
    itemSize: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.regular },
    notesText: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.regular,
        textAlign: 'right',
        marginTop: 8,
        fontStyle: 'italic',
    },
    cardActions: { flexDirection: 'row', gap: SIZES.spacing_sm },
    updateButton: {
        backgroundColor: COLORS.primary + '15',
        paddingVertical: 10,
        borderRadius: SIZES.radius_md,
        alignItems: 'center'
    },
    updateButtonFlex: { flex: 1 },
    updateButtonText: { color: COLORS.primary, fontSize: SIZES.md, ...FONTS.bold },
    printButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: SIZES.radius_md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    printButtonText: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyText: { color: COLORS.textMuted, fontSize: SIZES.lg, ...FONTS.medium, marginTop: 16 }
});
