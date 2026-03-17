import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';

const MENU_ITEMS_LIST = [
    { icon: 'person-outline', label: 'تعديل الملف الشخصي', route: 'EditProfile' },
    { icon: 'time-outline', label: 'سجل الطلبات', route: 'Orders' },
    { icon: 'location-outline', label: 'عناوين التوصيل' },
    { icon: 'card-outline', label: 'طريقة الدفع' },
    { icon: 'help-circle-outline', label: 'المساعدة والدعم' },
    { icon: 'bulb-outline', label: 'الاقتراحات والشكاوي', route: 'Suggestions' },
    { icon: 'information-circle-outline', label: 'عن التطبيق', route: 'About' },
];

export default function ProfileScreen({ navigation }) {
    const { user, logout, ensureAuthenticated, token } = useAuth();

    React.useEffect(() => {
        ensureAuthenticated();
    }, [token]);

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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.title}>حسابي</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* User Card */}
                <View style={styles.userCard}>
                    {user?.image ? (
                        <Image source={{ uri: user.image }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0)?.toUpperCase() || '؟'}
                            </Text>
                        </View>
                    )}
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name || 'المستخدم'}</Text>
                        <Text style={styles.userPhone}>{user?.phone || 'بدون رقم هاتف'}</Text>
                    </View>
                    <View style={[styles.badge, { ...SHADOWS.glow(COLORS.primary) }]}>
                        <Text style={styles.badgeText}>VIP</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuCard}>
                    {user?.role === 'admin' && (
                        <TouchableOpacity
                            style={[styles.menuItem, styles.menuItemBorder]}
                            activeOpacity={0.6}
                            onPress={() => navigation.navigate('AdminDashboard')}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.menuLabel}>لوحة الإدارة (Admin Dashboard)</Text>
                            <Ionicons name="chevron-back" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}
                    {MENU_ITEMS_LIST.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.menuItem,
                                index < MENU_ITEMS_LIST.length - 1 && styles.menuItemBorder,
                            ]}
                            activeOpacity={0.6}
                            onPress={() => item.route && navigation.navigate(item.route)}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-back" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.6}
                >
                    <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                    <Text style={styles.logoutText}>تسجيل الخروج</Text>
                </TouchableOpacity>

                <Text style={styles.version}>بيتزا عزيز  •  الإصدار ١.٠.٠</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxxl,
        ...FONTS.extraBold,
        textAlign: 'right',
    },
    scrollContent: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingBottom: 120,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xxl,
        padding: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_xl,
        ...SHADOWS.medium,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: COLORS.white,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    userInfo: {
        flex: 1,
        marginHorizontal: 14,
    },
    userName: {
        color: COLORS.text,
        fontSize: SIZES.lg,
        ...FONTS.bold,
        textAlign: 'right',
    },
    userPhone: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.regular,
        marginTop: 2,
        textAlign: 'right',
    },
    badge: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius_full,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    menuCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xxl,
        padding: SIZES.spacing_base,
        marginBottom: SIZES.spacing_xl,
        ...SHADOWS.small,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        gap: 14,
    },
    menuItemBorder: {
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.border,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(232,93,44,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        flex: 1,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.medium,
        textAlign: 'right',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,107,107,0.1)',
        borderRadius: SIZES.radius_xl,
        paddingVertical: 16,
        gap: 8,
    },
    logoutText: {
        color: COLORS.error,
        fontSize: SIZES.base,
        ...FONTS.bold,
    },
    version: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
        textAlign: 'center',
        marginTop: 20,
    },
});
