import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';

export default function Button({
    title,
    onPress,
    variant = 'primary', // primary | secondary | outline | ghost
    size = 'medium', // small | medium | large
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
}) {
    const isDisabled = disabled || loading;

    if (variant === 'primary') {
        return (
            <Pressable
                onPress={onPress}
                disabled={isDisabled}
                style={[
                    styles.container,
                    sizeStyles[size],
                    isDisabled && styles.disabled,
                    style,
                ]}
            >
                <LinearGradient
                    colors={isDisabled ? ['#555', '#444'] : [COLORS.primary, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradient, sizeStyles[size]]}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            {icon}
                            <Text style={[styles.text, sizeTextStyles[size], textStyle]}>{title}</Text>
                        </>
                    )}
                </LinearGradient>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={[
                styles.container,
                sizeStyles[size],
                variantStyles[variant],
                isDisabled && styles.disabled,
                style,
            ]}
        >
            <View
                style={[
                    styles.innerContainer,
                    { flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 }
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
                ) : (
                    <>
                        {icon}
                        <Text
                            style={[
                                styles.text,
                                sizeTextStyles[size],
                                variantTextStyles[variant],
                                textStyle,
                            ]}
                        >
                            {title}
                        </Text>
                    </>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: SIZES.radius_md,
        overflow: 'hidden',
        ...SHADOWS.small,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    text: {
        color: COLORS.white,
        ...FONTS.semiBold,
        textAlign: 'center',
    },
    disabled: {
        opacity: 0.6,
    },
});

const sizeStyles = {
    small: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radius_sm },
    medium: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: SIZES.radius_md },
    large: { paddingHorizontal: 32, paddingVertical: 18, borderRadius: SIZES.radius_lg },
};

const sizeTextStyles = {
    small: { fontSize: SIZES.sm },
    medium: { fontSize: SIZES.base },
    large: { fontSize: SIZES.lg },
};

const variantStyles = {
    secondary: { backgroundColor: COLORS.surface },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
    ghost: { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
};

const variantTextStyles = {
    secondary: { color: COLORS.text },
    outline: { color: COLORS.primary },
    ghost: { color: COLORS.primary },
};
