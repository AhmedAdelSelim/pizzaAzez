import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, StatusBar,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../theme/theme';
import { useMenu } from '../../context/MenuContext';
import { useCart } from '../../context/CartContext';
import CategoryCard from '../../components/CategoryCard';
import FoodCard from '../../components/FoodCard';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';

export default function MenuScreen({ navigation, route }) {
    const { categories, menuItems, searchItems } = useMenu();
    const { addItem } = useCart();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || '');

    const filteredItems = useMemo(() => {
        let items = searchQuery ? searchItems(searchQuery) : menuItems;
        if (selectedCategory) {
            items = items.filter(item => item.category_id === selectedCategory);
        }
        return items;
    }, [menuItems, selectedCategory, searchQuery]);

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

    const renderHeader = () => (
        <View>
            <View style={styles.header}>
                <Text style={styles.title}>القائمة</Text>
                <Text style={styles.subtitle}>{filteredItems.length} صنف متوفر</Text>
            </View>

            <View style={styles.searchContainer}>
                <SearchBar placeholder="ابحث عن أكلة..." value={searchQuery} onChangeText={setSearchQuery} />
            </View>

            <FlatList
                data={[{ id: 'all', name: 'الكل', icon: '🍽️' }, ...categories]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <CategoryCard
                        category={item}
                        isSelected={item.id === 'all' ? !selectedCategory : selectedCategory === item.id}
                        onPress={() => setSelectedCategory(item.id === 'all' ? null : item.id)}
                    />
                )}
                contentContainerStyle={styles.categoryList}
            />
        </View>
    );

    const renderItem = ({ item, index }) => {
        if (index % 2 !== 0) return null;
        const nextItem = filteredItems[index + 1];
        return (
            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <FoodCard
                        item={item}
                        onPress={() => navigation.navigate('FoodDetail', { item })}
                        onAddToCart={handleAddToCart}
                    />
                </View>
                {nextItem ? (
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <FoodCard
                            item={nextItem}
                            onPress={() => navigation.navigate('FoodDetail', { item: nextItem })}
                            onAddToCart={handleAddToCart}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyCard} />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <EmptyState
                        icon="search-outline"
                        title="لا توجد نتائج"
                        message="حاول تعديل البحث أو اختيار قسم آخر."
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
    listContent: {
        paddingBottom: 100,
    },
    header: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_sm,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxxl,
        ...FONTS.extraBold,
        textAlign: 'right',
    },
    subtitle: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
        marginTop: 4,
        textAlign: 'right',
    },
    searchContainer: {
        paddingHorizontal: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_lg,
        marginTop: SIZES.spacing_sm,
    },
    categoryList: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingBottom: SIZES.spacing_lg,
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
