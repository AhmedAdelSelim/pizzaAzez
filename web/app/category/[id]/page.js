'use client';

import { useParams } from 'next/navigation';
import EmptyState from '@/components/EmptyState';
import FoodCard from '@/components/FoodCard';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useMenu } from '@/context/MenuContext';
import { useAddToCart } from '@/hooks/useAddToCart';

export default function CategoryPage() {
    const { id } = useParams();
    const { categories, getByCategory, isLoading } = useMenu();
    const addToCart = useAddToCart();

    const category = categories.find((c) => String(c.id) === String(id));
    const items = getByCategory(category?.id);

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <span>{category?.icon}</span>
                        <span>{category?.name || 'القسم'}</span>
                    </span>
                }
                action={<span className="text-xs text-muted">{items.length} صنف</span>}
            />

            {isLoading ? (
                <div className="grid flex-1 place-items-center py-20 text-primary">
                    <Spinner size={36} />
                </div>
            ) : items.length === 0 ? (
                <EmptyState
                    icon="restaurant-outline"
                    title="قريباً"
                    message="يتم تحضير أصناف هذا القسم."
                />
            ) : (
                <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
                    {items.map((item) => (
                        <FoodCard key={item.id} item={item} onAddToCart={addToCart} />
                    ))}
                </div>
            )}
        </main>
    );
}
