import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = '@pizzaAzez_auth';

const initialState = {
    user: null,
    token: null,
    isLoading: true,
    error: null,
};

function authReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: true, error: null };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isLoading: false,
                error: null,
            };
        case 'LOGOUT':
            return { ...initialState, isLoading: false };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        case 'RESTORE_TOKEN':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isLoading: false,
            };
        case 'UPDATE_PROFILE':
            return { ...state, user: state.user ? { ...state.user, ...action.payload } : action.payload };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        restoreToken();
    }, []);

    const restoreToken = async () => {
        try {
            const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
                const { user, token } = JSON.parse(stored);
                dispatch({ type: 'RESTORE_TOKEN', payload: { user, token } });
            } else {
                dispatch({ type: 'LOGOUT' });
            }
        } catch {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const login = async (phone, password) => {
        dispatch({ type: 'SET_LOADING' });
        try {
            const result = await api.login(phone, password);
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
            dispatch({ type: 'LOGIN_SUCCESS', payload: result });
            return result;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    const register = async (userData) => {
        dispatch({ type: 'SET_LOADING' });
        try {
            const result = await api.register(userData);
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
            dispatch({ type: 'LOGIN_SUCCESS', payload: result });
            return result;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        dispatch({ type: 'LOGOUT' });
    };

    const updateProfile = async (updates) => {
        try {
            const updatedUser = await api.updateProfile(updates, state.token);
            await AsyncStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify({ user: updatedUser, token: state.token })
            );
            dispatch({ type: 'UPDATE_PROFILE', payload: updates });
            return updatedUser;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
