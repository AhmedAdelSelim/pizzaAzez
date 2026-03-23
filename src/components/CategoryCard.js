import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';

export default function CategoryCard({ category, onPress, isSelected }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
        ]).start();
        onPress?.(category);
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.85}
                style={styles.container}
            >
                <View style={[styles.iconContainer, isSelected && styles.iconSelected]}>
                    <Text style={styles.emoji}>{category.icon}</Text>
                </View>
                <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
                    {category.name}
                </Text>
                {isSelected && <View style={styles.activeDot} />}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: SIZES.spacing_base,
        width: 80,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        ...SHADOWS.small,
    },
    iconSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surfaceLight,
        ...SHADOWS.glow(COLORS.primary),
    },
    emoji: {
        fontSize: 28,
    },
    name: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.medium,
        textAlign: 'center',
    },
    nameSelected: {
        color: COLORS.primary,
        ...FONTS.bold,
    },
    activeDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginTop: 4,
    },
});
