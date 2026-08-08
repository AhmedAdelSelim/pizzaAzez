'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';

/**
 * Items with size options can't be added in one tap — they open the detail
 * page so a size can be picked, exactly as the RN screens did.
 */
export function useAddToCart() {
    const router = useRouter();
    const { addItem } = useCart();
    const { toast } = useUI();

    return useCallback(
        (item) => {
            if (item.sizes && item.sizes.length > 0) {
                router.push(`/item/${item.id}`);
                return;
            }
            addItem({ ...item, quantity: 1, selectedSize: null });
            toast(`تمت إضافة ${item.name} للسلة`, 'success');
        },
        [router, addItem, toast]
    );
}
