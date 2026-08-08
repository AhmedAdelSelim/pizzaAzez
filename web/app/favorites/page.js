'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import FoodCard from '@/components/FoodCard';
import PageHeader from '@/components/PageHeader';
import { useFavorites } from '@/hooks/useFavorites';
import { useAddToCart } from '@/hooks/useAddToCart';

export default function FavoritesPage() {
    const router = useRouter();
    const { favorites } = useFavorites();
    const addToCart = useAddToCart();

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="المفضلة"
                action={
                    favorites.length > 0 && (
                        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                            {favorites.length}
                        </span>
                    )
                }
            />

            {favorites.length === 0 ? (
                <EmptyState
                    icon="heart-outline"
                    title="لا يوجد مفضلات بعد"
                    message="اضغط على قلب أي صنف لإضافته للمفضلة"
                    action={
                        <Button title="تصفح القائمة" size="large" onClick={() => router.push('/menu')} />
                    }
                />
            ) : (
                <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
                    {favorites.map((item) => (
                        <FoodCard key={item.id} item={item} onAddToCart={addToCart} />
                    ))}
                </div>
            )}
        </main>
    );
}
