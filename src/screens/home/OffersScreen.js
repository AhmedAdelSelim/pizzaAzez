import React from 'react';
import {
    View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useMenu } from '../../context/MenuContext';
import { useCart } from '../../context/CartContext';
import FoodCard from '../../components/FoodCard';

export default function OffersScreen({ navigation }) {
    const { getSpecialOffers } = useMenu();
    const { addItem } = useCart();
    const offers = getSpecialOffers();

    const handleAddToCart = (item) => {
        if (item.sizes && item.sizes.length > 0) {
            navigation.navigate('FoodDetail', { item });
            return;
        }
        addItem({
            ...item,
            quantity: 1,
            selectedSize: null,
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>🔥 العروض الخاصة</Text>
            </View>

            {offers.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="gift-outline" size={80} color={COLORS.border} />
                    <Text style={styles.emptyText}>لا يوجد عروض حالياً</Text>
                    <Text style={styles.emptySubtext}>تابعنا باستمرار لتكتشف عروضنا الجديدة!</Text>
                </View>
            ) : (
                <FlatList
                    data={offers}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.cardWrapper}>
                            <FoodCard
                                item={item}
                                onPress={() => navigation.navigate('FoodDetail', { item })}
                                onAddToCart={handleAddToCart}
                            />
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
        gap: 16,
    },
    backButton: {
        padding: 4,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
        flex: 1,
        textAlign: 'right',
    },
    listContent: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingBottom: 40,
    },
    cardWrapper: {
        width: '48%',
        marginRight: '4%',
        marginBottom: SIZES.spacing_lg,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: SIZES.xl,
        ...FONTS.bold,
        marginTop: 20,
    },
    emptySubtext: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
        textAlign: 'center',
        marginTop: 8,
    },
});
