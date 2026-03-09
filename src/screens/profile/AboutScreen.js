import React from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { OWNER_INFO } from '../../services/mockData';

export default function AboutScreen({ navigation }) {
    const handleCall = () => {
        Linking.openURL(`tel:${OWNER_INFO.phone}`);
    };

    const handleSocial = (platform) => {
        // Mock links
        Alert.alert('قريباً', `سيتم فتح صفحة ${platform} قريباً!`);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Ionicons
                    name="arrow-forward"
                    size={24}
                    color={COLORS.text}
                    onPress={() => navigation.goBack()}
                    style={styles.backIcon}
                />
                <Text style={styles.title}>عن المطعم</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.ownerCard}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../../../assets/images/azez.jpg')}
                            style={styles.ownerImage}
                        />
                        <View style={styles.badge}>
                            <Ionicons name="pizza" size={16} color={COLORS.white} />
                        </View>
                    </View>

                    <Text style={styles.ownerName}>{OWNER_INFO.name}</Text>
                    <Text style={styles.ownerRole}>{OWNER_INFO.role}</Text>

                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialIcon} onPress={() => handleSocial('Facebook')}>
                            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialIcon} onPress={() => handleSocial('Instagram')}>
                            <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialIcon} onPress={handleCall}>
                            <Ionicons name="call" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="heart" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>قصتنا</Text>
                    </View>
                    <Text style={styles.bio}>{OWNER_INFO.bio}</Text>
                </View>

                <View style={styles.contactSection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>موقعنا</Text>
                    </View>
                    <View style={styles.contactCard}>
                        <Ionicons name="map-outline" size={24} color={COLORS.textMuted} />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>العنوان</Text>
                            <Text style={styles.contactValue}>الزرقا - خلف مركز الشرطة - امتداد شارع البحر</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
                        <Ionicons name="call-outline" size={24} color={COLORS.textMuted} />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>التواصل المباشر</Text>
                            <Text style={styles.contactValue}>{OWNER_INFO.phone}</Text>
                        </View>
                        <Ionicons name="chevron-back" size={20} color={COLORS.border} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>بيتزا عزيز © ٢٠٢٦</Text>
                    <Text style={styles.footerSub}>بكل الحب من الزرقا ❤️</Text>
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
        gap: 16,
    },
    backIcon: {
        padding: 4,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
    },
    scrollContent: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingBottom: 40,
    },
    ownerCard: {
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xxl,
        padding: 30,
        marginTop: 20,
        ...SHADOWS.medium,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    ownerImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: COLORS.primary,
    },
    badge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    ownerName: {
        color: COLORS.text,
        fontSize: SIZES.xl,
        ...FONTS.extraBold,
        marginBottom: 4,
    },
    ownerRole: {
        color: COLORS.primary,
        fontSize: SIZES.md,
        ...FONTS.medium,
        marginBottom: 20,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 20,
    },
    socialIcon: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    infoSection: {
        marginTop: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: SIZES.lg,
        ...FONTS.bold,
    },
    bio: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        lineHeight: 26,
        ...FONTS.regular,
        textAlign: 'right',
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: SIZES.radius_xl,
        ...SHADOWS.small,
    },
    contactSection: {
        marginTop: 30,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        padding: 16,
        marginBottom: 12,
        gap: 16,
        ...SHADOWS.small,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.medium,
    },
    contactValue: {
        color: COLORS.text,
        fontSize: SIZES.sm,
        ...FONTS.semiBold,
        marginTop: 2,
        textAlign: 'right',
    },
    footer: {
        marginTop: 50,
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.textMuted,
        fontSize: SIZES.sm,
        ...FONTS.semiBold,
    },
    footerSub: {
        color: COLORS.primary,
        fontSize: SIZES.xs,
        ...FONTS.medium,
        marginTop: 4,
    },
});
