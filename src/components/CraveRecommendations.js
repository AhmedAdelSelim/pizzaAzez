import React, { useMemo } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, Dimensions
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';

const { width } = Dimensions.get('window');

export default function CraveRecommendations({ onPress }) {
    const recommendation = useMemo(() => {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            return {
                title: 'صباح الخير! ☀️',
                subtitle: 'ابدأ يومك فطائر مشلتت ساخنة وعروض مميزة',
                image: require('../../assets/images/lunch_deals.png'),
                color: '#FF9800',
                suggestion: 'فطير مشلتت بالسمن البلدي'
            };
        } else if (hour >= 12 && hour < 17) {
            return {
                title: 'ساعة الغداء! 🍕',
                subtitle: 'وفر أكتر مع عروض الوجبات الفردية والكومبو',
                image: require('../../assets/images/lunch_deals.png'),
                color: '#E85D2C',
                suggestion: 'عرض الكومبو الفردي'
            };
        } else if (hour >= 17 && hour < 23) {
            return {
                title: 'جمعة العيلة! 👨‍👩‍👧‍👦',
                subtitle: 'بيتزا الحجم العائلي هي اللي تجمعكم الليلة',
                image: require('../../assets/images/family_feast.png'),
                color: '#4CAF50',
                suggestion: 'بيتزا سوبر سوبريم عائلي'
            };
        } else {
            return {
                title: 'جوع نص الليل؟ 🌙',
                subtitle: 'اطلب دلوقتي وعلينا التوصيل السريع لأي مكان',
                image: require('../../assets/images/late_night.png'),
                color: '#673AB7',
                suggestion: 'بيتزا رانش بالكريمة'
            };
        }
    }, []);

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.9}
            onPress={onPress}
        >
            <Image
                source={recommendation.image}
                style={styles.banner}
                resizeMode="cover"
            />
            <View style={styles.overlay}>
                <View style={[styles.tag, { backgroundColor: recommendation.color }]}>
                    <Text style={styles.tagText}>عروض مخصصة لك</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{recommendation.title}</Text>
                    <Text style={styles.subtitle}>{recommendation.subtitle}</Text>
                    {recommendation.suggestion && (
                        <View style={styles.suggestionBadge}>
                            <Text style={styles.suggestionText}>جرب: {recommendation.suggestion}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SIZES.spacing_xl,
        borderRadius: SIZES.radius_xxl,
        height: 180,
        backgroundColor: COLORS.surface,
        overflow: 'hidden',
        marginBottom: SIZES.spacing_xl,
        ...SHADOWS.medium,
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)', // Subtle dark overlay for text readability
        padding: SIZES.spacing_lg,
        justifyContent: 'space-between',
    },
    tag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: SIZES.radius_md,
    },
    tagText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    textContainer: {
        alignItems: 'flex-start',
    },
    title: {
        color: COLORS.white,
        fontSize: SIZES.xl,
        ...FONTS.extraBold,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        textAlign: 'right',
    },
    subtitle: {
        color: COLORS.white,
        fontSize: SIZES.sm,
        ...FONTS.medium,
        marginTop: 4,
        textAlign: 'right',
    },
    suggestionBadge: {
        marginTop: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: SIZES.radius_sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    suggestionText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    }
});
