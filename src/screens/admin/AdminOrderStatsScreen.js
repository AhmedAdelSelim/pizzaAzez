import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminOrderStatsScreen({ navigation }) {
    const { token } = useAuth();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminDailyStats(token);
            setStats(data);
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const renderStatCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.dateText}>{item.date}</Text>
            </View>
            
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.total}</Text>
                    <Text style={styles.statLabel}>إجمالي الطلبات</Text>
                </View>
                
                <View style={[styles.statItem, styles.borderLeft]}>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>{item.completed}</Text>
                    <Text style={styles.statLabel}>تم التوصيل</Text>
                </View>
                
                <View style={[styles.statItem, styles.borderLeft]}>
                    <Text style={[styles.statValue, { color: COLORS.error }]}>{item.cancelled}</Text>
                    <Text style={styles.statLabel}>ملغي</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>إحصائيات الأيام</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={stats}
                renderItem={renderStatCard}
                keyExtractor={item => item.date}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl 
                        refreshing={loading} 
                        onRefresh={loadStats} 
                        tintColor={COLORS.primary} 
                    />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="bar-chart-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد بيانات متاحة</Text>
                        </View>
                    )
                }
            />
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
        justifyContent: 'space-between',
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
    listContainer: {
        padding: SIZES.spacing_xl,
        gap: SIZES.spacing_md,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_lg,
        ...SHADOWS.small,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    dateText: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.bold,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderLeftColor: COLORS.border,
    },
    statValue: {
        color: COLORS.text,
        fontSize: SIZES.lg,
        ...FONTS.bold,
        marginBottom: 4,
    },
    statLabel: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 100,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: SIZES.lg,
        ...FONTS.medium,
        marginTop: 16,
    },
});
