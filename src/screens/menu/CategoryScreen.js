import React from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../theme/theme';
import { useMenu } from '../../context/MenuContext';
import { useCart } from '../../context/CartContext';
import FoodCard from '../../components/FoodCard';
import EmptyState from '../../components/EmptyState';

export default function CategoryScreen({ navigation, route }) {
    const { category } = route.params;
    const { getByCategory } = useMenu();
    const { addItem } = useCart();
    const items = getByCategory(category.id);

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

    const renderItem = ({ item, index }) => {
        if (index % 2 !== 0) return null;
        const nextItem = items[index + 1];
        return (
            <View style={styles.row}>
                <FoodCard
                    item={item}
                    onPress={() => navigation.navigate('FoodDetail', { item })}
                    onAddToCart={handleAddToCart}
                />
                {nextItem ? (
                    <FoodCard
                        item={nextItem}
                        onPress={() => navigation.navigate('FoodDetail', { item: nextItem })}
                        onAddToCart={handleAddToCart}
                    />
                ) : (
                    <View style={styles.emptyCard} />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerEmoji}>{category.icon}</Text>
                    <Text style={styles.headerTitle}>{category.name}</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.itemCount}>{items.length} صنف</Text>
                </View>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <EmptyState
                        icon="restaurant-outline"
                        title="قريباً"
                        message="يتم تحضير أصناف هذا القسم."
                    />
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    headerEmoji: {
        fontSize: 24,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: SIZES.xl,
        ...FONTS.bold,
    },
    headerRight: {
        width: 40,
    },
    itemCount: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.medium,
        textAlign: 'left',
    },
    listContent: {
        paddingBottom: 100,
        paddingTop: SIZES.spacing_base,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.spacing_xl,
    },
    emptyCard: {
        flex: 1,
        marginLeft: 8,
    },
});
