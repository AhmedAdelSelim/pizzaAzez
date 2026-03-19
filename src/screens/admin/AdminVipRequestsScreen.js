import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, StatusBar, RefreshControl, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminVipRequestsScreen({ navigation }) {
    const { token } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminVipRequests(token);
            setRequests(data || []);
        } catch (error) {
            console.error('Fetch VIP Requests Error:', error);
            Alert.alert('خطأ', 'فشل تحميل طلبات الـ VIP');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAction = async (userId, status) => {
        try {
            await api.handleVipRequest(userId, status, token);
            Alert.alert('تم بنجاح', status === 'vip' ? 'تم قبول العضوية' : 'تم رفض الطلب');
            loadRequests();
        } catch (error) {
            Alert.alert('خطأ', error.message);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadRequests();
    };

    const RequestItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userPhone}>{item.phone}</Text>
                <Text style={styles.userAddress}>{item.address}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleAction(item.id, 'vip')}
                >
                    <Ionicons name="checkmark" size={20} color={COLORS.white} />
                    <Text style={styles.btnText}>قبول</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.declineBtn]}
                    onPress={() => handleAction(item.id, 'none')}
                >
                    <Ionicons name="close" size={20} color={COLORS.white} />
                    <Text style={styles.btnText}>رفض</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>طلبات الـ VIP</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <RequestItem item={item} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="star-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد طلبات معلقة</Text>
                        </View>
                    }
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
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
        fontSize: SIZES.xl,
        ...FONTS.bold,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: SIZES.spacing_xl,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_lg,
        marginBottom: SIZES.spacing_md,
        ...SHADOWS.small,
    },
    userInfo: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    userName: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.bold,
    },
    userPhone: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.regular,
        marginTop: 2,
    },
    userAddress: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
        marginTop: 4,
        textAlign: 'right',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 6,
        minWidth: 120,
    },
    approveBtn: {
        backgroundColor: COLORS.success || '#4CAF50',
    },
    declineBtn: {
        backgroundColor: COLORS.error || '#F44336',
    },
    btnText: {
        color: COLORS.white,
        fontSize: SIZES.sm,
        ...FONTS.bold,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
        marginTop: 16,
    },
});
