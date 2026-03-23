import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import Button from '../../components/Button';

export default function OrderConfirmationScreen({ navigation, route }) {
    const { order } = route.params;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pointsAnim = useRef(new Animated.Value(0)).current;
    const pointsBounce = useRef(new Animated.Value(0.5)).current;

    const pointsEarned = order?.points_earned || 0;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start(() => {
            if (pointsEarned > 0) {
                Animated.parallel([
                    Animated.timing(pointsAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                    Animated.spring(pointsBounce, { toValue: 1, tension: 70, friction: 4, useNativeDriver: true }),
                ]).start();
            }
        });
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.content}>
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="checkmark" size={60} color={COLORS.white} />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.info, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>تم تأكيد طلبك!</Text>
                    <Text style={styles.subtitle}>طلبك في الطريق إليك 🚀</Text>

                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>رقم الطلب</Text>
                            <Text style={styles.detailValue}>{order.order.id.substring(0, 8)}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>الوقت المتوقع</Text>
                            <Text style={styles.detailValue}>{order.estimatedTime}</Text>
                        </View>
                        <View style={styles.divider} />
                        {order.order.discount > 0 && (
                            <>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>الخصم</Text>
                                    <Text style={[styles.detailValue, styles.discountText]}>
                                        - {order.order.discount} ج.م
                                    </Text>
                                </View>
                                <View style={styles.divider} />
                            </>
                        )}
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>المجموع</Text>
                            <Text style={[styles.detailValue, styles.totalValue]}>
                                {order.order.total} ج.م
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>الدفع</Text>
                            <Text style={styles.detailValue}>
                                {order.order.payment_method === 'vodafone_cash' ? '📱 فودافون كاش'
                                    : order.order.payment_method === 'fawry' ? '🏪 فوري'
                                    : '💵 عند الاستلام'}
                            </Text>
                        </View>
                    </View>

                    {/* Points Earned Banner */}
                    {pointsEarned > 0 && (
                        <Animated.View
                            style={[
                                styles.pointsBanner,
                                { opacity: pointsAnim, transform: [{ scale: pointsBounce }] }
                            ]}
                        >
                            <LinearGradient
                                colors={['#3D2800', '#5C3D00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.pointsGradient}
                            >
                                <Text style={styles.pointsEmoji}>⭐</Text>
                                <View style={styles.pointsTextBlock}>
                                    <Text style={styles.pointsTitle}>ربحت {pointsEarned} نقطة!</Text>
                                    <Text style={styles.pointsSub}>استخدمها في طلبك القادم</Text>
                                </View>
                                <View style={styles.pointsBadge}>
                                    <Text style={styles.pointsBadgeText}>+{pointsEarned}</Text>
                                </View>
                            </LinearGradient>
                        </Animated.View>
                    )}

                    <View style={styles.trackingNote}>
                        <Ionicons name="information-circle-outline" size={18} color={COLORS.textMuted} />
                        <Text style={styles.trackingText}>سنتصل بك عند وصول طلبك</Text>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.buttonArea, { opacity: fadeAnim }]}>
                    <Button
                        title="العودة للرئيسية"
                        onPress={() =>
                            navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] })
                        }
                        size="large"
                        style={styles.homeButton}
                    />
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SIZES.spacing_xl },
    iconContainer: { marginBottom: 30 },
    iconCircle: {
        width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.accent,
        alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow(COLORS.accent),
    },
    info: { alignItems: 'center', width: '100%' },
    title: { color: COLORS.text, fontSize: SIZES.xxxl, ...FONTS.extraBold, marginBottom: 8, textAlign: 'center' },
    subtitle: { color: COLORS.textMuted, fontSize: SIZES.md, ...FONTS.regular, marginBottom: 30, textAlign: 'center' },
    detailsCard: {
        width: '100%', backgroundColor: COLORS.surface, borderRadius: SIZES.radius_xxl,
        padding: SIZES.spacing_xl, ...SHADOWS.medium, gap: 16,
    },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailLabel: { color: COLORS.textMuted, fontSize: SIZES.md, ...FONTS.regular },
    detailValue: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold },
    totalValue: { color: COLORS.primary, fontSize: SIZES.lg, ...FONTS.extraBold },
    discountText: { color: '#2E7D32', ...FONTS.bold },
    divider: { height: 1, backgroundColor: COLORS.border },

    pointsBanner: { width: '100%', borderRadius: SIZES.radius_xl, overflow: 'hidden', marginTop: 16 },
    pointsGradient: {
        flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
    },
    pointsEmoji: { fontSize: 28 },
    pointsTextBlock: { flex: 1 },
    pointsTitle: { color: '#FFD700', fontSize: SIZES.md, ...FONTS.bold, textAlign: 'right' },
    pointsSub: { color: 'rgba(255,215,0,0.65)', fontSize: SIZES.xs, ...FONTS.regular, marginTop: 2, textAlign: 'right' },
    pointsBadge: {
        backgroundColor: '#FFD700', borderRadius: SIZES.radius_full,
        paddingHorizontal: 12, paddingVertical: 6,
    },
    pointsBadgeText: { color: COLORS.black, fontSize: SIZES.sm, ...FONTS.extraBold },

    trackingNote: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16,
        backgroundColor: COLORS.surface, borderRadius: SIZES.radius_md, padding: 14, width: '100%',
    },
    trackingText: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.regular, flex: 1, textAlign: 'right' },
    buttonArea: { width: '100%', position: 'absolute', bottom: 50, paddingHorizontal: SIZES.spacing_xl },
    homeButton: { width: '100%' },
});
