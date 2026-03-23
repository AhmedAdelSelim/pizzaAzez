import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme/theme';

export default function EmptyState({
    icon = 'cart-outline',
    title = 'Nothing here',
    message = 'Items will appear here.',
}) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const ringOpacity = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(pulseAnim, { toValue: 1.08, duration: 1400, useNativeDriver: true }),
                    Animated.timing(ringOpacity, { toValue: 0.15, duration: 1400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
                    Animated.timing(ringOpacity, { toValue: 0.4, duration: 1400, useNativeDriver: true }),
                ]),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <Animated.View
                    style={[
                        styles.ring,
                        {
                            opacity: ringOpacity,
                            transform: [{ scale: pulseAnim }],
                        },
                    ]}
                />
                <Animated.View
                    style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}
                >
                    <Ionicons name={icon} size={46} color={COLORS.primary} />
                </Animated.View>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    iconWrapper: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    ring: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.primary + '30',
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xl,
        ...FONTS.bold,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
        textAlign: 'center',
        lineHeight: 22,
    },
});
