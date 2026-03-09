import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';

export default function CategoryCard({ category, onPress, isSelected }) {
    return (
        <TouchableOpacity
            onPress={() => onPress?.(category)}
            activeOpacity={0.8}
            style={[styles.container, isSelected && styles.selected]}
        >
            <View style={[styles.iconContainer, isSelected && styles.iconSelected]}>
                <Text style={styles.emoji}>{category.icon}</Text>
            </View>
            <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
                {category.name}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: SIZES.spacing_base,
        width: 80,
    },
    selected: {},
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
});
