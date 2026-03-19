import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';
import { searchFilter } from '../utils/searchUtils';

const MenuContext = createContext();

const initialState = {
    categories: [],
    menuItems: [],
    isLoading: false,
    error: null,
};

function menuReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: true, error: null };
        case 'SET_CATEGORIES':
            return { ...state, categories: action.payload };
        case 'SET_MENU_ITEMS':
            return { ...state, menuItems: action.payload, isLoading: false };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        default:
            return state;
    }
}

export function MenuProvider({ children }) {
    const [state, dispatch] = useReducer(menuReducer, initialState);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        dispatch({ type: 'SET_LOADING' });
        try {
            const [categories, menuItems] = await Promise.all([
                api.getCategories(),
                api.getMenuItems(),
            ]);

            // Enrich menu items with category icons for easier rendering fallback
            const enrichedItems = menuItems.map(item => {
                const category = categories.find(c => c.id === item.category_id);
                return {
                    ...item,
                    categoryIcon: category?.icon || '🍕'
                };
            });

            dispatch({ type: 'SET_CATEGORIES', payload: categories });
            dispatch({ type: 'SET_MENU_ITEMS', payload: enrichedItems });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };

    const getByCategory = (categoryId) => {
        return state.menuItems.filter(item => item.category_id === categoryId);
    };

    const getPopularItems = () => {
        return state.menuItems.filter(item => item.is_popular);
    };

    const getSpecialOffers = () => {
        return state.menuItems.filter(item => item.is_special);
    };

    const searchItems = (query) => {
        return searchFilter(state.menuItems, query, ['name', 'description']);
    };

    return (
        <MenuContext.Provider
            value={{
                ...state,
                fetchMenu,
                getByCategory,
                getPopularItems,
                getSpecialOffers,
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
