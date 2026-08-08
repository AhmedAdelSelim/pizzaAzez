'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CategoryCard from '@/components/CategoryCard';
import EmptyState from '@/components/EmptyState';
import FoodCard from '@/components/FoodCard';
import SearchBar from '@/components/SearchBar';
import Spinner from '@/components/Spinner';
import { useMenu } from '@/context/MenuContext';
import { useAddToCart } from '@/hooks/useAddToCart';

function MenuContent() {
    const searchParams = useSearchParams();
    const { categories, menuItems, searchItems, isLoading } = useMenu();
    const addToCart = useAddToCart();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    const filteredItems = useMemo(() => {
        let items = searchQuery ? searchItems(searchQuery) : menuItems;
        if (selectedCategory && !searchQuery) {
            items = items.filter((item) => item.category_id === selectedCategory);
        }
        return items;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuItems, selectedCategory, searchQuery]);

    return (
        <main className="flex flex-1 flex-col">
            <header className="px-6 pb-4 pt-8">
                <h1 className="text-2xl font-bold text-text">القائمة</h1>
                <p className="mt-0.5 text-sm text-muted">{filteredItems.length} صنف متوفر</p>
            </header>

            <div className="mb-4 px-6">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="no-scrollbar edge-fade-x mb-4 flex gap-4 overflow-x-auto px-6 pb-1">
                {[{ id: 'all', name: 'الكل', icon: '🍽️' }, ...categories].map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        isSelected={
                            category.id === 'all' ? !selectedCategory : selectedCategory === category.id
                        }
                        onClick={() =>
                            setSelectedCategory(category.id === 'all' ? null : category.id)
                        }
                    />
                ))}
            </div>

            {isLoading ? (
                <div className="grid flex-1 place-items-center py-20 text-primary">
                    <Spinner size={36} />
                </div>
            ) : filteredItems.length === 0 ? (
                <EmptyState
                    icon="search-outline"
                    title="لا توجد نتائج"
                    message="حاول تعديل البحث أو اختيار قسم آخر."
                />
            ) : (
                <div className="grid grid-cols-2 gap-4 px-6 pb-10 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredItems.map((item) => (
                        <FoodCard key={item.id} item={item} onAddToCart={addToCart} />
                    ))}
                </div>
            )}
        </main>
    );
}

export default function MenuPage() {
    return (
        <Suspense
            fallback={
                <div className="grid flex-1 place-items-center text-primary">
                    <Spinner size={36} />
                </div>
            }
        >
            <MenuContent />
        </Suspense>
    );
}
