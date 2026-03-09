import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

const CART_STORAGE_KEY = '@pizzaAzez_cart';

const initialState = {
    items: [],
    selectedZone: null,
    appliedCoupon: null,
    isLoading: false,
};

function cartReducer(state, action) {
    switch (action.type) {
        case 'SET_ITEMS':
            return { ...state, items: action.payload, isLoading: false };
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
            let newItems;
            if (existingIndex >= 0) {
                newItems = state.items.map((item, index) =>
                    index === existingIndex
                        ? { ...item, quantity: item.quantity + action.payload.quantity }
                        : item
                );
            } else {
                newItems = [...state.items, action.payload];
            }
            return { ...state, items: newItems };
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(
                    (item, index) => !(item.id === action.payload.id && index === action.payload.index)
                ),
            };
        case 'UPDATE_QUANTITY': {
            const newItems = state.items.map((item, index) => {
                if (index === action.payload.index) {
                    const newQty = Math.max(1, action.payload.quantity);
                    return { ...item, quantity: newQty };
                }
                return item;
            });
            return { ...state, items: newItems };
        }
        case 'CLEAR_CART':
            return { ...state, items: [] };
        default:
            return state;
    }
}

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    useEffect(() => {
        loadCart();
    }, []);

    useEffect(() => {
        if (!state.isLoading) {
            saveCart(state.items, state.selectedZone, state.appliedCoupon);
        }
    }, [state.items, state.selectedZone, state.appliedCoupon]);

    const loadCart = async () => {
        try {
            const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                dispatch({ type: 'SET_ITEMS', payload: parsed.items || [] });
                dispatch({ type: 'SET_ZONE', payload: parsed.selectedZone || null });
                dispatch({ type: 'APPLY_COUPON', payload: parsed.appliedCoupon || null });
            } else {
                dispatch({ type: 'SET_ITEMS', payload: [] });
            }
        } catch {
            dispatch({ type: 'SET_ITEMS', payload: [] });
        }
    };

    const saveCart = async (items, selectedZone, appliedCoupon) => {
        try {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, selectedZone, appliedCoupon }));
        } catch { }
    };

    const addItem = (item) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    };

    const removeItem = (id, index) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id, index } });
    };

    const updateQuantity = (index, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const setDeliveryZone = (zone) => {
        dispatch({ type: 'SET_ZONE', payload: zone });
    };

    const applyCoupon = (coupon) => {
        dispatch({ type: 'APPLY_COUPON', payload: coupon });
    };

    const removeCoupon = () => {
        dispatch({ type: 'REMOVE_COUPON' });
    };

    const getSubtotal = () => {
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const getDeliveryFee = () => {
        if (!state.selectedZone) return 0;
        const subtotal = getSubtotal();
        // Keep "Free over 200" rule but apply it to the zone price
        return subtotal > 200 ? 0 : state.selectedZone.price;
    };

    const getDiscount = () => {
        if (!state.appliedCoupon) return 0;
        const subtotal = getSubtotal();
        if (state.appliedCoupon.type === 'percentage') {
            return (subtotal * state.appliedCoupon.value) / 100;
        } else {
            return state.appliedCoupon.value;
        }
    };

    const getTotal = () => {
        return getSubtotal() - getDiscount() + getDeliveryFee();
    };

    const getItemCount = () => {
        return state.items.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                ...state,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                getSubtotal,
                getDeliveryFee,
                getTotal,
                getItemCount,
                setDeliveryZone,
                applyCoupon,
                removeCoupon,
                getDiscount,
                appliedCoupon: state.appliedCoupon,
                selectedZone: state.selectedZone,
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
