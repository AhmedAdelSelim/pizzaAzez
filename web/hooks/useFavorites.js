'use client';

import { useCallback } from 'react';
import { createLocalStore } from '@/lib/localStore';
import { FAVORITES_KEY, RECENTLY_VIEWED_KEY } from '@/lib/storage';

const EMPTY = [];

/** Favorites live in localStorage, as they did in AsyncStorage. */
export const favoritesStore = createLocalStore(FAVORITES_KEY, EMPTY);

/** The last few items a customer opened, shown on the home page. */
export const recentlyViewedStore = createLocalStore(RECENTLY_VIEWED_KEY, EMPTY);

export function useFavorites() {
    const favorites = favoritesStore.use();

    const isFavorite = useCallback(
        (id) => favorites.some((f) => f.id === id),
        [favorites]
    );

    const toggleFavorite = useCallback((item) => {
        const current = favoritesStore.read();
        favoritesStore.write(
            current.some((f) => f.id === item.id)
                ? current.filter((f) => f.id !== item.id)
                : [...current, item]
        );
    }, []);

    return { favorites, isFavorite, toggleFavorite };
}

export function useRecentlyViewed() {
    return recentlyViewedStore.use();
}

/** Records a viewed item, keeping the eight most recent. */
export function pushRecentlyViewed(item) {
    const list = recentlyViewedStore.read();
    recentlyViewedStore.write([item, ...list.filter((i) => i.id !== item.id)].slice(0, 8));
}
