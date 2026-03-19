import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, StatusBar, RefreshControl, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminActiveUsersScreen({ navigation }) {
    const { token } = useAuth();
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadActiveUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminStats(token);
            setActiveUsers(data.activeUsers || []);
        } catch (error) {
            console.error('Fetch Active Users Error:', error);
            Alert.alert('خطأ', 'فشل تحميل بيانات العملاء');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadActiveUsers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadActiveUsers();
    };

    const UserItem = ({ item, index }) => (
        <View style={styles.userCard}>
            <View style={styles.badgeContainer}>
                <View style={[styles.rankBadge, index < 3 && styles.topRank]}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                </View>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userPhone}>{item.phone}</Text>
            </View>
            <View style={styles.statsInfo}>
                <Text style={styles.orderCount}>{item.orderCount}</Text>
                <Text style={styles.orderLabel}>طلب</Text>
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
                <Text style={styles.title}>العملاء الأكثر نشاطاً</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={activeUsers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => <UserItem item={item} index={index} />}
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
                            <Ionicons name="people-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد بيانات حالياً</Text>
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
    userCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_lg,
        marginBottom: SIZES.spacing_md,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    badgeContainer: {
        marginLeft: 16,
    },
    rankBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topRank: {
        backgroundColor: COLORS.primary,
    },
    rankText: {
        color: COLORS.white,
        fontSize: SIZES.sm,
        ...FONTS.bold,
    },
    userInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    userName: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.bold,
        marginBottom: 2,
    },
    userPhone: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
    },
    statsInfo: {
        alignItems: 'center',
        paddingRight: 12,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        minWidth: 60,
    },
    orderCount: {
        color: COLORS.primary,
        fontSize: SIZES.lg,
        ...FONTS.bold,
    },
    orderLabel: {
        color: COLORS.textMuted,
        fontSize: 10,
        ...FONTS.regular,
        marginTop: -4,
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
