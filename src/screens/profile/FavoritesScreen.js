import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import FoodCard from '../../components/FoodCard';

const FAVORITES_KEY = '@pizzaAzez_favorites';

export default function FavoritesScreen({ navigation }) {
    const [favorites, setFavorites] = useState([]);

    useFocusEffect(
        useCallback(() => {
            async function loadFavorites() {
                try {
                    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
                    setFavorites(raw ? JSON.parse(raw) : []);
                } catch {}
            }
            loadFavorites();
        }, [])
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>المفضلة</Text>
                {favorites.length > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{favorites.length}</Text>
                    </View>
                )}
            </View>

            {favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-outline" size={72} color={COLORS.border} />
                    <Text style={styles.emptyText}>لا يوجد مفضلات بعد</Text>
                    <Text style={styles.emptySubtext}>اضغط على قلب أي صنف لإضافته للمفضلة</Text>
                    <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('MenuTab')}>
                        <Text style={styles.browseBtnText}>تصفح القائمة</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.grid}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.cardWrapper}>
                            <FoodCard
                                item={item}
                                onPress={() => navigation.navigate('FoodDetail', { item })}
                                onAddToCart={() => navigation.navigate('FoodDetail', { item })}
                            />
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
        gap: 12,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center', justifyContent: 'center',
        ...SHADOWS.small,
    },
    title: { color: COLORS.text, fontSize: SIZES.xxl, ...FONTS.bold, flex: 1, textAlign: 'right' },
    badge: {
        backgroundColor: '#FF4757', borderRadius: SIZES.radius_full,
        minWidth: 26, height: 26, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
    },
    badgeText: { color: COLORS.white, fontSize: SIZES.xs, ...FONTS.bold },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyText: { color: COLORS.text, fontSize: SIZES.xl, ...FONTS.bold, marginTop: 20 },
    emptySubtext: { color: COLORS.textMuted, fontSize: SIZES.md, ...FONTS.regular, textAlign: 'center', marginTop: 8, marginBottom: 24 },
    browseBtn: {
        backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14,
        borderRadius: SIZES.radius_full, ...SHADOWS.glow(COLORS.primary),
    },
    browseBtnText: { color: COLORS.white, fontSize: SIZES.base, ...FONTS.bold },
    grid: { paddingHorizontal: SIZES.spacing_xl, paddingBottom: 40, paddingTop: 8 },
    row: { justifyContent: 'space-between' },
    cardWrapper: { width: '48%' },
});
