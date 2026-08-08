'use client';

import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { CART_STORAGE_KEY, storage } from '@/lib/storage';

const CartContext = createContext(null);

const initialState = {
    items: [],
    selectedZone: null,
    appliedCoupon: null,
    isLoading: true,
};

function cartReducer(state, action) {
    switch (action.type) {
        case 'HYDRATE':
            return { ...state, ...action.payload, isLoading: false };
        case 'SET_ZONE':
            return { ...state, selectedZone: action.payload };
        case 'APPLY_COUPON':
            return { ...state, appliedCoupon: action.payload };
        case 'REMOVE_COUPON':
            return { ...state, appliedCoupon: null };
        case 'ADD_ITEM': {
            const existingIndex = state.items.findIndex(
                i => i.id === action.payload.id && i.selectedSize === action.payload.selectedSize
            );
            const newItems =
                existingIndex >= 0
                    ? state.items.map((item, index) =>
                        index === existingIndex
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    )
                    : [...state.items, action.payload];
            return { ...state, items: newItems };
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(
                    (item, index) => !(item.id === action.payload.id && index === action.payload.index)
                ),
            };
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map((item, index) =>
                    index === action.payload.index
                        ? { ...item, quantity: Math.max(1, action.payload.quantity) }
                        : item
                ),
            };
        case 'CLEAR_CART':
            return { ...state, items: [] };
        default:
            return state;
    }
}

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const hydrated = useRef(false);

    useEffect(() => {
        const stored = storage.getJSON(CART_STORAGE_KEY);
        dispatch({
            type: 'HYDRATE',
            payload: {
                items: stored?.items || [],
                selectedZone: stored?.selectedZone || null,
                appliedCoupon: stored?.appliedCoupon || null,
            },
        });
        hydrated.current = true;
    }, []);

    useEffect(() => {
        if (!hydrated.current || state.isLoading) return;
        storage.setJSON(CART_STORAGE_KEY, {
            items: state.items,
            selectedZone: state.selectedZone,
            appliedCoupon: state.appliedCoupon,
        });
    }, [state.items, state.selectedZone, state.appliedCoupon, state.isLoading]);

    const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
    const removeItem = (id, index) => dispatch({ type: 'REMOVE_ITEM', payload: { id, index } });
    const updateQuantity = (index, quantity) =>
        dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
    const clearCart = () => dispatch({ type: 'CLEAR_CART' });
    const setDeliveryZone = (zone) => dispatch({ type: 'SET_ZONE', payload: zone });
    const applyCoupon = (coupon) => dispatch({ type: 'APPLY_COUPON', payload: coupon });
    const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' });

    const getSubtotal = () =>
        state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const getDeliveryFee = () => {
        if (!state.selectedZone) return 0;
        // Keep the "free over 1000" rule, applied to the zone price
        return getSubtotal() > 1000 ? 0 : state.selectedZone.price;
    };

    const getDiscount = () => {
        if (!state.appliedCoupon) return 0;
        const subtotal = getSubtotal();
        return state.appliedCoupon.type === 'percentage'
            ? (subtotal * state.appliedCoupon.value) / 100
            : state.appliedCoupon.value;
    };

    const getTotal = () => getSubtotal() - getDiscount() + getDeliveryFee();

    const getItemCount = () => state.items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                ...state,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                setDeliveryZone,
                applyCoupon,
                removeCoupon,
                getSubtotal,
                getDeliveryFee,
                getDiscount,
                getTotal,
                getItemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
