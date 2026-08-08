'use client';

import EmptyState from '@/components/EmptyState';
import FoodCard from '@/components/FoodCard';
import PageHeader from '@/components/PageHeader';
import { useMenu } from '@/context/MenuContext';
import { useAddToCart } from '@/hooks/useAddToCart';

export default function OffersPage() {
    const { getSpecialOffers } = useMenu();
    const addToCart = useAddToCart();
    const offers = getSpecialOffers();

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader title="🔥 العروض الخاصة" />

            {offers.length === 0 ? (
                <EmptyState
                    icon="gift-outline"
                    title="لا يوجد عروض حالياً"
                    message="تابعنا باستمرار لتكتشف عروضنا الجديدة!"
                />
            ) : (
                <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
                    {offers.map((item) => (
                        <FoodCard key={item.id} item={item} onAddToCart={addToCart} />
                    ))}
                </div>
            )}
        </main>
    );
}
