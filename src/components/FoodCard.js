import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';
import React, { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@pizzaAzez_favorites';

export default function FoodCard({ item, onPress, onAddToCart }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(FAVORITES_KEY).then(raw => {
            const favs = raw ? JSON.parse(raw) : [];
            setIsFavorite(favs.some(f => f.id === item.id));
        }).catch(() => {});
    }, [item.id]);

    const toggleFavorite = async (e) => {
        e.stopPropagation?.();
        try {
            const raw = await AsyncStorage.getItem(FAVORITES_KEY);
            let favs = raw ? JSON.parse(raw) : [];
            if (isFavorite) {
                favs = favs.filter(f => f.id !== item.id);
            } else {
                favs.push(item);
            }
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
            setIsFavorite(!isFavorite);
        } catch {}
    };

    const handleAdd = (e) => {
        e.stopPropagation?.();
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.72, duration: 80, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }),
        ]).start();
        onAddToCart?.(item);
    };

    const emoji = item.categoryIcon || ({ '1': '🧀', '2': '🍗', '3': '🥩', '4': '🌯', '5': '🔥', '6': '🍕', '7': '🥧', '8': '🍫', '9': '🥟', '10': '🍟' })[item.categoryId] || '🍕';

    return (
        <TouchableOpacity
            onPress={() => onPress(item)}
            activeOpacity={0.92}
            style={styles.container}
        >
            <View style={styles.imageContainer}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.emoji}>{emoji}</Text>
                    </View>
                )}
                <LinearGradient
                    colors={['transparent', 'rgba(26,26,46,0.65)']}
                    style={styles.imageGradient}
                />
                {item.isSpecial && (
                    <View style={styles.specialBadge}>
                        <Text style={styles.specialText}>🔥 عرض</Text>
                    </View>
                )}
                <TouchableOpacity onPress={toggleFavorite} style={styles.favButton} activeOpacity={0.8}>
                    <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={isFavorite ? '#FF4757' : COLORS.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={11} color={COLORS.star} />
                    <Text style={styles.rating}>{item.rating}</Text>
                    <Text style={styles.reviews}>
                        ({Array.isArray(item.reviews) ? item.reviews.length : (item.reviews || 0)})
                    </Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={styles.price}>{item.sizes ? `من ${item.price}` : item.price} ج.م</Text>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            onPress={handleAdd}
                            style={styles.addButton}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="add" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        marginBottom: SIZES.spacing_base,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    imageContainer: {
        height: 145,
        position: 'relative',
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 55,
    },
    emoji: {
        fontSize: 52,
    },
    specialBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius_sm,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    favButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    specialText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        ...FONTS.bold,
    },
    info: {
        padding: SIZES.spacing_md,
    },
    name: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.bold,
        marginBottom: 5,
        textAlign: 'right',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 3,
    },
    rating: {
        color: COLORS.star,
        fontSize: SIZES.xs,
        ...FONTS.semiBold,
    },
    reviews: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        color: COLORS.primary,
        fontSize: SIZES.base,
        ...FONTS.extraBold,
    },
    addButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.glow(COLORS.primary),
    },
});
