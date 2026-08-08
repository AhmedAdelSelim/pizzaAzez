'use client';

import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import api from '@/lib/api';
import { searchFilter } from '@/lib/utils';

const MenuContext = createContext(null);

const initialState = {
    categories: [],
    menuItems: [],
    isLoading: true,
    error: null,
};

function menuReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: true, error: null };
        case 'SET_MENU':
            return {
                ...state,
                categories: action.payload.categories,
                menuItems: action.payload.menuItems,
                isLoading: false,
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        default:
            return state;
    }
}

export function MenuProvider({ children }) {
    const [state, dispatch] = useReducer(menuReducer, initialState);

    const fetchMenu = useCallback(async () => {
        dispatch({ type: 'SET_LOADING' });
        try {
            const [categories, menuItems] = await Promise.all([
                api.getCategories(),
                api.getMenuItems(),
            ]);

            // Enrich menu items with category icons for easier rendering fallback
            const enrichedItems = menuItems.map(item => {
                const category = categories.find(c => c.id === item.category_id);
                return { ...item, categoryIcon: category?.icon || '🍕' };
            });

            dispatch({ type: 'SET_MENU', payload: { categories, menuItems: enrichedItems } });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    }, []);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const getByCategory = (categoryId) =>
        state.menuItems.filter(item => item.category_id === categoryId);

    const getPopularItems = () => state.menuItems.filter(item => item.is_popular);

    const getSpecialOffers = () => state.menuItems.filter(item => item.is_special);

    const getItemById = (id) => state.menuItems.find(item => String(item.id) === String(id));

    const searchItems = (query) => searchFilter(state.menuItems, query, ['name', 'description']);

    return (
        <MenuContext.Provider
            value={{
                ...state,
                fetchMenu,
                getByCategory,
                getPopularItems,
                getSpecialOffers,
                getItemById,
                searchItems,
            }}
        >
            {children}
        </MenuContext.Provider>
    );
}

export const useMenu = () => {
    const context = useContext(MenuContext);
    if (!context) throw new Error('useMenu must be used within MenuProvider');
    return context;
};
