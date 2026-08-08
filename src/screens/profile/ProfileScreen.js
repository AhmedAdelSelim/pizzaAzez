import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Image, ActivityIndicator, Modal, Animated, Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

/**
 * An entry either navigates (`route`) or explains itself (`note`).
 *
 * Three rows used to do nothing at all when tapped. The address one now has a
 * real destination — EditProfile grew a delivery-address field — and payment
 * says what it can, since cash on delivery is the only method the app supports.
 */
const MENU_ITEMS_LIST = [
    { icon: 'person-outline', label: 'تعديل الملف الشخصي', route: 'EditProfile' },
    { icon: 'time-outline', label: 'سجل الطلبات', route: 'Orders' },
    { icon: 'heart-outline', label: 'المفضلة', route: 'Favorites' },
    { icon: 'location-outline', label: 'عناوين التوصيل', route: 'EditProfile' },
    {
        icon: 'card-outline',
        label: 'طريقة الدفع',
        note: {
            title: 'طريقة الدفع',
            message: 'الدفع عند الاستلام نقداً هو الطريقة الوحيدة المتاحة حالياً.',
        },
    },
    { icon: 'help-circle-outline', label: 'المساعدة والدعم', route: 'About' },
    { icon: 'bulb-outline', label: 'الاقتراحات والشكاوي', route: 'Suggestions' },
    { icon: 'information-circle-outline', label: 'عن التطبيق', route: 'About' },
];

function VipBadge({ status }) {
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (status === 'vip') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 1100, useNativeDriver: false }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 1100, useNativeDriver: false }),
                ])
            ).start();
        }
    }, [status]);

    if (status === 'vip') {
        const shadowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });
        const shadowRadius = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 16] });
        return (
            <Animated.View style={[styles.vipBadge, { shadowColor: '#FFD700', shadowOpacity, shadowRadius, elevation: 8 }]}>
                <Text style={styles.badgeText}>👑 عضو VIP</Text>
            </Animated.View>
        );
    }
    if (status === 'pending') {
        return (
            <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={12} color={COLORS.white} />
                <Text style={styles.badgeText}>الطلب قيد المراجعة</Text>
            </View>
        );
    }
    return null;
}

export default function ProfileScreen({ navigation }) {
    const { user, logout, ensureAuthenticated, token, refreshProfile } = useAuth();
    const [isRequesting, setIsRequesting] = React.useState(false);
    const [showVipModal, setShowVipModal] = React.useState(false);
    const [loyaltyPoints, setLoyaltyPoints] = React.useState(null);

    React.useEffect(() => {
        ensureAuthenticated();
        if (token) {
            api.getLoyaltyPoints(token).then(d => setLoyaltyPoints(d.points || 0)).catch(() => {});
        }
    }, []);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (token) refreshProfile();
        });
        return unsubscribe;
    }, [navigation, token]);

    const [referralStats, setReferralStats] = React.useState(null);

    React.useEffect(() => {
        if (token) {
            api.getReferralStats(token).then(d => setReferralStats(d)).catch(() => {});
        }
    }, [token]);

    const getLoyaltyTier = (points) => {
        if (points >= 1000) return { label: 'ذهبي', icon: '🥇', color: '#FFD700', next: null };
        if (points >= 500)  return { label: 'فضي',  icon: '🥈', color: '#C0C0C0', next: 1000, needed: 1000 - points };
        return                     { label: 'برونزي', icon: '🥉', color: '#CD7F32', next: 500,  needed: 500 - points };
    };

    const referralCode = user?.phone ? `AZEZ${user.phone.slice(-4)}` : null;

    const handleShareReferral = () => {
        if (!referralCode) return;
        Share.share({
            message: `استخدم كود الإحالة الخاص بي ${referralCode} في تطبيق بيتزا عزيز واحصل على 50 نقطة مجاناً! 🍕`,
        });
    };

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

    const isVip = user?.vip_status === 'vip';
    const loyaltyTier = loyaltyPoints !== null ? getLoyaltyTier(loyaltyPoints) : null;

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
                <LinearGradient
                    colors={isVip ? ['#2D2000', '#1A1A2E'] : [COLORS.surface, COLORS.surface]}
                    style={styles.userCard}
                >
                    {isVip && (
                        <View style={styles.vipGlowBorder} />
                    )}
                    <View style={[styles.avatarWrapper, isVip && styles.avatarVipRing]}>
                        {user?.image ? (
                            <Image source={{ uri: user.image }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0)?.toUpperCase() || '؟'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name || 'المستخدم'}</Text>
                        <Text style={styles.userPhone}>{user?.phone || 'بدون رقم هاتف'}</Text>

                        <View style={styles.vipContainer}>
                            {user?.vip_status === 'vip' || user?.vip_status === 'pending' ? (
                                <VipBadge status={user.vip_status} />
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
                                            <Ionicons name="star" size={13} color="#FFD700" />
                                            <Text style={styles.vipRequestText}>انضم للـ VIP</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </LinearGradient>

                {/* Loyalty Points Card */}
                {loyaltyTier !== null && (
                    <LinearGradient
                        colors={['#3D2800', '#1A1A2E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.loyaltyCard}
                    >
                        <View style={styles.loyaltyLeft}>
                            <View style={styles.tierRow}>
                                <Text style={styles.tierEmoji}>{loyaltyTier.icon}</Text>
                                <Text style={[styles.tierLabel, { color: loyaltyTier.color }]}>{loyaltyTier.label}</Text>
                            </View>
                            <Text style={styles.loyaltyPts}>{loyaltyPoints} نقطة</Text>
                            {loyaltyTier.next && (
                                <Text style={styles.loyaltySub}>{loyaltyTier.needed} نقطة للمستوى التالي</Text>
                            )}
                            <Text style={styles.loyaltySub}>100 نقطة = خصم 10 ج.م</Text>
                        </View>
                        <View style={styles.loyaltyRight}>
                            <Text style={{ fontSize: 48 }}>{loyaltyTier.icon}</Text>
                        </View>
                    </LinearGradient>
                )}

                {/* Referral Card */}
                {referralCode && (
                    <View style={styles.referralCard}>
                        <View style={styles.referralTop}>
                            <Ionicons name="people-outline" size={20} color={COLORS.accent} />
                            <Text style={styles.referralTitle}>كود الإحالة</Text>
                        </View>
                        <Text style={styles.referralSub}>شارك كودك واحصل على 50 نقطة لكل صديق</Text>
                        {referralStats && referralStats.referral_count > 0 && (
                            <View style={styles.referralStatsRow}>
                                <View style={styles.referralStat}>
                                    <Text style={styles.referralStatNum}>{referralStats.referral_count}</Text>
                                    <Text style={styles.referralStatLabel}>صديق</Text>
                                </View>
                                <View style={styles.referralStatDivider} />
                                <View style={styles.referralStat}>
                                    <Text style={styles.referralStatNum}>{referralStats.points_from_referrals}</Text>
                                    <Text style={styles.referralStatLabel}>نقطة مكتسبة</Text>
                                </View>
                            </View>
                        )}
                        <View style={styles.referralRow}>
                            <Text style={styles.referralCode}>{referralCode}</Text>
                            <TouchableOpacity style={styles.shareBtn} onPress={handleShareReferral}>
                                <Ionicons name="share-social-outline" size={18} color={COLORS.white} />
                                <Text style={styles.shareBtnText}>شارك</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Menu Items */}
                <View style={styles.menuCard}>
                    {user?.role === 'admin' && (
                        <TouchableOpacity
                            style={[styles.menuItem, styles.menuItemBorder]}
                            activeOpacity={0.6}
                            onPress={() => navigation.navigate('AdminDashboard')}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(232,93,44,0.15)' }]}>
                                <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.menuLabel}>لوحة الإدارة</Text>
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
                            onPress={() => {
                                if (item.route) navigation.navigate(item.route);
                                else if (item.note) Alert.alert(item.note.title, item.note.message);
                            }}
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
                animationType="slide"
                onRequestClose={() => setShowVipModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['#3D2800', '#232946']}
                            style={styles.modalHeader}
                        >
                            <Text style={styles.crownEmoji}>👑</Text>
                            <Text style={styles.modalTitle}>مميزات عضوية VIP</Text>
                            <Text style={styles.modalSubtitle}>انضم للنخبة واستمتع بمزايا حصرية</Text>
                        </LinearGradient>

                        <View style={styles.benefitsList}>
                            <BenefitItem icon="gift-outline" text="خصومات حصرية تصل إلى ٢٥٪ على جميع الطلبات" color="#FFD700" />
                            <BenefitItem icon="restaurant-outline" text="تجربة أصناف جديدة قبل الجميع" color={COLORS.primary} />
                            <BenefitItem icon="headset-outline" text="خدمة عملاء مخصصة وذات أولوية" color={COLORS.accent} />
                            <BenefitItem icon="car-outline" text="توصيل مجاني للطلبات فوق ١٠٠ ج.م" color="#2196F3" />
                        </View>

                        <TouchableOpacity
                            style={[styles.confirmVipButton, isRequesting && { opacity: 0.7 }]}
                            disabled={isRequesting}
                            onPress={async () => {
                                try {
                                    setIsRequesting(true);
                                    await api.requestVip(token);
                                    setShowVipModal(false);
                                    Alert.alert('تم الإرسال ✅', 'تم إرسال طلب الانضمام للـ VIP بنجاح');
                                    await refreshProfile();
                                } catch (error) {
                                    Alert.alert('خطأ', error.message);
                                } finally {
                                    setIsRequesting(false);
                                }
                            }}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.primaryDark]}
                                style={styles.confirmVipGradient}
                            >
                                {isRequesting ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <>
                                        <Ionicons name="star" size={18} color="#FFD700" />
                                        <Text style={styles.confirmVipText}>تأكيد طلب الانضمام</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setShowVipModal(false)}
                        >
                            <Text style={styles.closeModalText}>ليس الآن</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function BenefitItem({ icon, text, color }) {
    return (
        <View style={styles.benefitItem}>
            <View style={[styles.benefitIconBox, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
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
        borderRadius: SIZES.radius_xxl,
        padding: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_xl,
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
        overflow: 'hidden',
    },
    vipGlowBorder: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: SIZES.radius_xxl,
        borderWidth: 1.5,
        borderColor: '#FFD700',
    },
    avatarWrapper: {
        borderRadius: 36,
    },
    avatarVipRing: {
        borderWidth: 2.5,
        borderColor: '#FFD700',
        padding: 2,
        borderRadius: 36,
    },
    avatar: {
        width: 62,
        height: 62,
        borderRadius: 31,
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
        width: 62,
        height: 62,
        borderRadius: 31,
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
    vipContainer: {
        marginTop: 8,
        alignItems: 'flex-end',
    },
    vipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        borderRadius: SIZES.radius_full,
        paddingHorizontal: 12,
        paddingVertical: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: COLORS.textMuted,
        borderRadius: SIZES.radius_full,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    badgeText: {
        color: COLORS.black,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    vipRequestButton: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,215,0,0.15)',
        borderWidth: 1,
        borderColor: '#FFD700',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignItems: 'center',
        gap: 6,
    },
    vipRequestText: {
        color: '#FFD700',
        fontSize: 12,
        ...FONTS.bold,
    },
    menuCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xxl,
        padding: SIZES.spacing_base,
        marginBottom: SIZES.spacing_xl,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
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
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(232,93,44,0.10)',
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
        backgroundColor: 'rgba(255,107,107,0.08)',
        borderRadius: SIZES.radius_xl,
        paddingVertical: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.error + '30',
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
    loyaltyCard: {
        flexDirection: 'row', borderRadius: SIZES.radius_xxl, padding: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_base, overflow: 'hidden', ...SHADOWS.medium,
        borderWidth: 1, borderColor: '#FFD700' + '30',
    },
    loyaltyLeft: { flex: 1 },
    tierRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: 4 },
    tierEmoji: { fontSize: 18 },
    tierLabel: { fontSize: SIZES.sm, ...FONTS.bold },
    loyaltyPts: { color: '#FFD700', fontSize: SIZES.xxxl, ...FONTS.extraBold, textAlign: 'right' },
    loyaltySub: { color: 'rgba(255,255,255,0.45)', fontSize: SIZES.xs, ...FONTS.regular, textAlign: 'right', marginTop: 4 },
    loyaltyRight: { justifyContent: 'center' },
    referralStatsRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.accent + '10',
        borderRadius: SIZES.radius_md,
        padding: 10,
        marginBottom: 12,
        alignItems: 'center',
    },
    referralStat: { flex: 1, alignItems: 'center' },
    referralStatNum: { color: COLORS.accent, fontSize: SIZES.xl, ...FONTS.extraBold },
    referralStatLabel: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular },
    referralStatDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
    referralCard: {
        backgroundColor: COLORS.surface, borderRadius: SIZES.radius_xxl, padding: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_xl, borderWidth: 1, borderColor: COLORS.accent + '30', ...SHADOWS.small,
    },
    referralTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 6 },
    referralTitle: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold },
    referralSub: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.regular, textAlign: 'right', marginBottom: 14 },
    referralRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    referralCode: {
        color: COLORS.accent, fontSize: SIZES.xl, ...FONTS.extraBold,
        letterSpacing: 3, textAlign: 'right',
    },
    shareBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: COLORS.accent, borderRadius: SIZES.radius_md,
        paddingHorizontal: 16, paddingVertical: 10,
    },
    shareBtnText: { color: COLORS.white, fontSize: SIZES.sm, ...FONTS.bold },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: SIZES.radius_xxl,
        borderTopRightRadius: SIZES.radius_xxl,
        overflow: 'hidden',
        ...SHADOWS.large,
    },
    modalHeader: {
        alignItems: 'center',
        paddingVertical: SIZES.spacing_xxl,
        paddingHorizontal: SIZES.spacing_xl,
        gap: 6,
    },
    crownEmoji: {
        fontSize: 44,
        marginBottom: 4,
    },
    modalTitle: {
        color: COLORS.white,
        fontSize: SIZES.xl,
        ...FONTS.extraBold,
    },
    modalSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: SIZES.sm,
        ...FONTS.regular,
    },
    benefitsList: {
        padding: SIZES.spacing_xl,
        gap: 16,
    },
    benefitItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 14,
    },
    benefitIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitText: {
        flex: 1,
        color: COLORS.text,
        fontSize: SIZES.base,
        ...FONTS.medium,
        textAlign: 'right',
    },
    confirmVipButton: {
        marginHorizontal: SIZES.spacing_xl,
        marginBottom: 12,
        borderRadius: SIZES.radius_xl,
        overflow: 'hidden',
    },
    confirmVipGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    confirmVipText: {
        color: COLORS.white,
        fontSize: SIZES.base,
        ...FONTS.bold,
    },
    closeModalButton: {
        paddingVertical: 14,
        paddingBottom: 34,
        alignItems: 'center',
    },
    closeModalText: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.medium,
    },
});
