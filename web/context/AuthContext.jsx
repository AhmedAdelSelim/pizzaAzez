'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import api, { setUnauthorizedHandler } from '@/lib/api';
import { setSseUnauthorizedHandler } from '@/lib/sseClient';
import { AUTH_STORAGE_KEY, storage } from '@/lib/storage';

const AuthContext = createContext(null);

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    isInitialLoading: true,
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
            return { ...initialState, isInitialLoading: false };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false, isInitialLoading: false };
        case 'RESTORE_TOKEN':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isInitialLoading: false,
            };
        case 'FINISH_RESTORE':
            return { ...state, isInitialLoading: false };
        case 'UPDATE_PROFILE':
            return {
                ...state,
                user: state.user ? { ...state.user, ...action.payload } : action.payload,
            };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const router = useRouter();

    useEffect(() => {
        const stored = storage.getJSON(AUTH_STORAGE_KEY);
        if (!stored?.token) {
            dispatch({ type: 'FINISH_RESTORE' });
            return;
        }

        // Trust the stored session for the first paint so the app doesn't stall
        // behind a network call, then confirm it against the server. A rejected
        // token trips the 401 handler above, which signs the user out — better
        // than letting them browse a shell where every action fails.
        dispatch({ type: 'RESTORE_TOKEN', payload: { user: stored.user, token: stored.token } });

        api.getProfile(stored.token)
            .then((user) => {
                storage.setJSON(AUTH_STORAGE_KEY, { user, token: stored.token });
                dispatch({ type: 'RESTORE_TOKEN', payload: { user, token: stored.token } });
            })
            .catch(() => {
                // 401 is already handled globally; anything else (offline, server
                // down) should leave the cached session alone.
            });
    }, []);

    const login = async (phone, password) => {
        dispatch({ type: 'SET_LOADING' });
        try {
            const result = await api.login(phone, password);
            if (!result?.user || !result?.token) {
                throw new Error('بيانات الدخول غير مكتملة من الخادم');
            }
            storage.setJSON(AUTH_STORAGE_KEY, result);
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
            if (!result?.user || !result?.token) {
                throw new Error('فشل إنشاء الحساب، يرجى المحاولة مرة أخرى');
            }
            storage.setJSON(AUTH_STORAGE_KEY, result);
            dispatch({ type: 'LOGIN_SUCCESS', payload: result });
            return result;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    const logout = () => {
        storage.removeItem(AUTH_STORAGE_KEY);
        dispatch({ type: 'LOGOUT' });
        router.replace('/login');
    };

    // The API layer can't reach React state, so it calls back here when the
    // server rejects a token. There is no refresh token to trade in, so the
    // only recovery is a fresh sign-in.
    useEffect(() => {
        const forceReauth = () => {
            storage.removeItem(AUTH_STORAGE_KEY);
            dispatch({ type: 'LOGOUT' });
            if (window.location.pathname !== '/login') {
                router.replace(`/login?expired=1`);
            }
        };
        setUnauthorizedHandler(forceReauth);
        setSseUnauthorizedHandler(forceReauth);
        return () => {
            setUnauthorizedHandler(null);
            setSseUnauthorizedHandler(null);
        };
    }, [router]);

    const updateProfile = async (updates, customToken = null) => {
        try {
            const activeToken = customToken || state.token;
            const updatedUser = await api.updateProfile(updates, activeToken);
            storage.setJSON(AUTH_STORAGE_KEY, { user: updatedUser, token: state.token });
            dispatch({ type: 'UPDATE_PROFILE', payload: updates });
            return updatedUser;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    const refreshProfile = async () => {
        if (!state.token) return;
        try {
            const updatedUser = await api.getProfile(state.token);
            storage.setJSON(AUTH_STORAGE_KEY, { user: updatedUser, token: state.token });
            dispatch({ type: 'RESTORE_TOKEN', payload: { user: updatedUser, token: state.token } });
            return updatedUser;
        } catch (error) {
            console.error('Refresh Profile Error:', error);
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
                refreshProfile,
                isAdmin: state.user?.role === 'admin',
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
