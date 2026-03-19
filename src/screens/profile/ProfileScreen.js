import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Image, ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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
    const { user, logout, ensureAuthenticated, token, refreshProfile } = useAuth();
    const [isRequesting, setIsRequesting] = React.useState(false);
    const [showVipModal, setShowVipModal] = React.useState(false);

    React.useEffect(() => {
        ensureAuthenticated();
    }, []);

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

                        {/* VIP Status/Request Button */}
                        <View style={styles.vipContainer}>
                            {user?.vip_status === 'vip' ? (
                                <View style={[styles.badge, styles.vipBadge]}>
                                    <Text style={styles.badgeText}>عضو VIP 👑</Text>
                                </View>
                            ) : user?.vip_status === 'pending' ? (
                                <View style={[styles.badge, styles.pendingBadge]}>
                                    <Text style={styles.badgeText}>الطلب قيد المراجعة</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.vipRequestButton, isRequesting && { opacity: 0.7 }]}
                                    disabled={isRequesting}
                                    onPress={() => setShowVipModal(true)}
                                >
                                    {isRequesting ? (
                                        <ActivityIndicator size="small" color={COLORS.white} />
                                    ) : (
                                        <>
                                            <Ionicons name="star" size={14} color={COLORS.white} />
                                            <Text style={styles.vipRequestText}>انضم للـ VIP</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
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

            {/* VIP Benefits Modal */}
            <Modal
                visible={showVipModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowVipModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="star" size={30} color="#FFD700" />
                            <Text style={styles.modalTitle}>مميزات عضوية VIP</Text>
                        </View>

                        <View style={styles.benefitsList}>
                            <BenefitItem icon="gift-outline" text="خصومات حصرية تصل إلى ٢٥٪ على جميع الطلبات" />
                            <BenefitItem icon="restaurant-outline" text="تجربة أصناف جديدة قبل الجميع" />
                            <BenefitItem icon="headset-outline" text="خدمة عملاء مخصصة وذات أولوية" />
                        </View>

                        <TouchableOpacity
                            style={[styles.confirmVipButton, isRequesting && { opacity: 0.7 }]}
                            disabled={isRequesting}
                            onPress={async () => {
                                try {
                                    setIsRequesting(true);
                                    await api.requestVip(token);
                                    setShowVipModal(false);
                                    Alert.alert('تم الإرسال', 'تم إرسال طلب الانضمام للـ VIP بنجاح');
                                    await refreshProfile();
                                } catch (error) {
                                    Alert.alert('خطأ', error.message);
                                } finally {
                                    setIsRequesting(false);
                                }
                            }}
                        >
                            {isRequesting ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.confirmVipText}>تأكيد طلب الانضمام</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setShowVipModal(false)}
                        >
                            <Text style={styles.closeModalText}>إلغاء</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function BenefitItem({ icon, text }) {
    return (
        <View style={styles.benefitItem}>
            <Ionicons name={icon} size={22} color={COLORS.primary} />
            <Text style={styles.benefitText}>{text}</Text>
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
    vipContainer: {
        marginTop: 8,
        alignItems: 'flex-end',
    },
    vipBadge: {
        backgroundColor: '#FFD700', // Gold
        ...SHADOWS.glow('#FFD700'),
    },
    pendingBadge: {
        backgroundColor: COLORS.textMuted,
    },
    vipRequestButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignItems: 'center',
        gap: 6,
    },
    vipRequestText: {
        color: COLORS.white,
        fontSize: 12,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.spacing_xl,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xxl,
        padding: SIZES.spacing_xxl,
        width: '100%',
        ...SHADOWS.medium,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: SIZES.spacing_xl,
        gap: 8,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: SIZES.xl,
        ...FONTS.bold,
    },
    benefitsList: {
        marginBottom: SIZES.spacing_xxl,
        gap: 16,
    },
    benefitItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 12,
    },
    benefitText: {
        flex: 1,
        color: COLORS.text,
        fontSize: SIZES.base,
        ...FONTS.medium,
        textAlign: 'right',
    },
    confirmVipButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius_xl,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    confirmVipText: {
        color: COLORS.white,
        fontSize: SIZES.base,
        ...FONTS.bold,
    },
    closeModalButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    closeModalText: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.medium,
    },
});
