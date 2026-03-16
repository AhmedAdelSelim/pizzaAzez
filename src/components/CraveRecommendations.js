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
                subtitle: 'ابدأ يومك بعروض الغداء المبكرة',
                image: require('../../assets/images/lunch_deals.png'),
                color: '#FF9800'
            };
        } else if (hour >= 12 && hour < 18) {
            return {
                title: 'وقت الغداء! 🍕',
                subtitle: 'وفر أكتر مع عروض الوجبات الفردية',
                image: require('../../assets/images/lunch_deals.png'),
                color: '#E85D2C'
            };
        } else if (hour >= 18 && hour < 24) {
            return {
                title: 'جمعة العيلة! 👨‍👩‍👧‍👦',
                subtitle: 'بيتزا الحجم العائلي هي اللي تجمعكم',
                image: require('../../assets/images/family_feast.png'),
                color: '#4CAF50'
            };
        } else {
            return {
                title: 'جوع نص الليل؟ 🌙',
                subtitle: 'اطلب دلوقتي وعلينا التوصيل',
                image: require('../../assets/images/late_night.png'),
                color: '#673AB7'
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
    }
});
