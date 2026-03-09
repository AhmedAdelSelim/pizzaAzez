import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme/theme';

export default function ReviewItem({ review }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{review.userName.charAt(0)}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{review.userName}</Text>
                        <Text style={styles.date}>{review.date}</Text>
                    </View>
                </View>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={COLORS.star} />
                    <Text style={styles.ratingText}>{review.rating}</Text>
                </View>
            </View>
            <Text style={styles.comment}>{review.comment}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_md,
        padding: SIZES.spacing_md,
        marginBottom: SIZES.spacing_md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SIZES.spacing_sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: COLORS.primary,
        fontSize: 16,
        ...FONTS.bold,
    },
    userName: {
        color: COLORS.text,
        fontSize: SIZES.sm,
        ...FONTS.semiBold,
        textAlign: 'right',
    },
    date: {
        color: COLORS.textMuted,
        fontSize: 10,
        ...FONTS.regular,
        textAlign: 'right',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: COLORS.star,
        fontSize: 12,
        ...FONTS.bold,
    },
    comment: {
        color: COLORS.text,
        fontSize: SIZES.sm,
        ...FONTS.regular,
        lineHeight: 20,
        textAlign: 'right',
    },
});
