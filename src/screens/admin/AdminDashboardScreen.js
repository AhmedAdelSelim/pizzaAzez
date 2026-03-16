import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminDashboardScreen({ navigation }) {
    const { logout, token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminStats(token);
            setStats(data);
        } catch (error) {
            console.error('Stats Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadStats();
        });
        return unsubscribe;
    }, [navigation]);

    const handleLogout = () => {
        Alert.alert(
            'تسجيل الخروج',
            'هل أنت متأكد أنك تريد تسجيل الخروج؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'خروج', style: 'destructive', onPress: logout },
            ]
        );
    };

    const StatCard = ({ title, value, icon, color }) => (
        <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${color}10` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </View>
    );

    const MenuCard = ({ title, subtitle, icon, screen }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(screen)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={32} color={COLORS.primary} />
            </View>
            <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <Text style={styles.title}>لوحة الإدارة</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButtonTop}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} tintColor={COLORS.primary} />}
            >
                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <StatCard 
                            title="إجمالي المبيعات" 
                            value={`${stats?.totalRevenue || 0} ج.م`} 
                            icon="cash-outline" 
                            color="#4CAF50" 
                        />
                        <StatCard 
                            title="إجمالي الطلبات" 
                            value={stats?.totalOrders || 0} 
                            icon="cart-outline" 
                            color="#2196F3" 
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard 
                            title="طلبات قيد التنفيذ" 
                            value={stats?.pendingOrders || 0} 
                            icon="time-outline" 
                            color="#FF9800" 
                        />
                        <StatCard 
                            title="إجمالي العملاء" 
                            value={stats?.totalUsers || 0} 
                            icon="people-outline" 
                            color="#9C27B0" 
                        />
                    </View>
                </View>

                {/* Management Section */}
                <Text style={styles.sectionTitle}>إدارة العمليات</Text>
                <MenuCard 
                    title="إدارة الطلبات" 
                    subtitle="متابعة وتحديث حالة طلبات العملاء" 
                    icon="list" 
                    screen="AdminOrders" 
                />
                <MenuCard 
                    title="إدارة العملاء" 
                    subtitle="إيقاف وتفعيل حسابات المستخدمين" 
                    icon="people-outline" 
                    screen="AdminUsers" 
                />

                <Text style={styles.sectionTitle}>إدارة المحتوى</Text>
                <MenuCard 
                    title="إدارة القائمة" 
                    subtitle="إضافة، تعديل وحذف عناصر القائمة" 
                    icon="restaurant" 
                    screen="AdminMenu" 
                />
                <MenuCard 
                    title="إدارة الأقسام" 
                    subtitle="إدارة أقسام الأطعمة والمشروبات" 
                    icon="folder-open-outline" 
                    screen="AdminCategories" 
                />
                <MenuCard 
                    title="إدارة القصص" 
                    subtitle="إضافة وحذف وتعديل القصص" 
                    icon="images-outline" 
                    screen="AdminStories" 
                />

                <Text style={styles.sectionTitle}>الإعدادات والخصومات</Text>
                <MenuCard 
                    title="إدارة الكوبونات" 
                    subtitle="إدارة أكواد الخصم والعروض" 
                    icon="ticket-outline" 
                    screen="AdminCoupons" 
                />
                <MenuCard 
                    title="مناطق التوصيل" 
                    subtitle="إدارة مناطق التوصيل وأسعار الشحن" 
                    icon="map-outline" 
                    screen="AdminDeliveryZones" 
                />
                
                <View style={{ height: 100 }} />
            </ScrollView>
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
    title: { color: COLORS.text, fontSize: SIZES.xl, ...FONTS.bold },
    logoutButtonTop: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,107,107,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    content: { padding: SIZES.spacing_xl },
    statsContainer: { marginBottom: SIZES.spacing_xl },
    statsRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 12 },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_md,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        ...SHADOWS.small
    },
    statIconContainer: {
        width: 45, height: 45,
        borderRadius: 22.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12
    },
    statContent: { flex: 1, alignItems: 'flex-end' },
    statValue: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold },
    statTitle: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular },
    sectionTitle: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold, textAlign: 'right', marginTop: 12, marginBottom: 16 },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        padding: SIZES.spacing_lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.spacing_md,
        ...SHADOWS.medium
    },
    iconContainer: {
        width: 50, height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(232,93,44,0.1)',
        alignItems: 'center', justifyContent: 'center'
    },
    cardTextContainer: { flex: 1, marginHorizontal: 16 },
    cardTitle: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold, textAlign: 'right', marginBottom: 4 },
    cardSubtitle: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular, textAlign: 'right' }
});
