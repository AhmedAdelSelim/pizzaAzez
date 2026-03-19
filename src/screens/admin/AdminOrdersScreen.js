import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import { searchFilter } from '../../utils/searchUtils';

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
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = React.useMemo(() => {
        return searchFilter(orders, searchQuery, ['id', 'phone']);
    }, [orders, searchQuery]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminOrders(token);
            // Sort by date descending (assuming string ISO)
            setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.updateOrderStatus(orderId, newStatus, token);
            Alert.alert('نجاح', 'تم تحديث حالة الطلب');
            loadOrders();
        } catch (error) {
            Alert.alert('خطأ', error.message);
        }
    };

    const StatusActionSheet = (order) => {
        Alert.alert(
            'تحديث حالة الطلب',
            `اختر الحالة الجديدة للطلب #${order.id.substring(0, 8)}`,
            [
                ...STATUS_OPTIONS.map(status => ({
                    text: status.label,
                    onPress: () => handleUpdateStatus(order.id, status.value)
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
                    <Text style={styles.detailText}>العميل: {item.phone}</Text>
                    <Text style={styles.detailText}>المبلغ: {item.total} ج.م</Text>
                    <Text style={[styles.detailText, { marginTop: 8 }]}>
                        {item.items?.map(i => `${i.quantity}x ${i.name}`).join('، ')}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => StatusActionSheet(item)}
                >
                    <Text style={styles.updateButtonText}>تحديث الحالة</Text>
                </TouchableOpacity>
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
    detailText: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.regular, textAlign: 'right', marginBottom: 4 },
    updateButton: {
        backgroundColor: COLORS.primary + '15',
        paddingVertical: 10,
        borderRadius: SIZES.radius_md,
        alignItems: 'center'
    },
    updateButtonText: { color: COLORS.primary, fontSize: SIZES.md, ...FONTS.bold },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyText: { color: COLORS.textMuted, fontSize: SIZES.lg, ...FONTS.medium, marginTop: 16 }
});
