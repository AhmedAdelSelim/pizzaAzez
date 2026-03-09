import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';

export default function SearchBar({ placeholder = 'Search for food...', onSearch, value, onChangeText }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, isFocused && styles.focused]}>
            <Ionicons name="search-outline" size={20} color={isFocused ? COLORS.primary : COLORS.textMuted} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textMuted}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onSubmitEditing={() => onSearch?.(value)}
                returnKeyType="search"
            />
            {value ? (
                <TouchableOpacity onPress={() => onChangeText?.('')}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        paddingHorizontal: SIZES.spacing_base,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
        gap: 10,
    },
    focused: {
        borderColor: COLORS.primary,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.regular,
        padding: 0,
    },
});
