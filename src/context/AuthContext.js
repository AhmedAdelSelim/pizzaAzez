import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { navigate } from '../utils/navigationUtils';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = '@pizzaAzez_auth';

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
            return {
                ...state,
                isInitialLoading: false,
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
                
                // If admin, register for push notifications
                if (user.role === 'admin') {
                    handlePushRegistration(user, token);
                }
            } else {
                dispatch({ type: 'FINISH_RESTORE' });
            }
        } catch {
            dispatch({ type: 'FINISH_RESTORE' });
        }
    };

    const handlePushRegistration = async (user, token) => {
        try {
            const pushToken = await registerForPushNotificationsAsync();
            if (pushToken && pushToken !== user.push_token) {
                await updateProfile({ push_token: pushToken }, token);
            }
        } catch (error) {
            console.log('Error registering for push notifications:', error);
        }
    };

    const login = async (phone, password) => {
        console.log('AuthContext: Starting login for:', phone);
        dispatch({ type: 'SET_LOADING' });
        try {
            const result = await api.login(phone, password);
            console.log('AuthContext: API result received:', !!result.user, !!result.token);
            
            if (!result || !result.user || !result.token) {
                console.error('AuthContext: Invalid login data:', result);
                throw new Error('بيانات الدخول غير مكتملة من الخادم');
            }

            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
            console.log('AuthContext: Storage updated, dispatching success');
            dispatch({ type: 'LOGIN_SUCCESS', payload: result });
            
            // If admin, register for push notifications and redirect will happen via AppNavigator stack switch
            if (result.user.role === 'admin') {
                handlePushRegistration(result.user, result.token);
            } else {
                console.log('AuthContext: Regular user logged in');
            }
            
            return result;
        } catch (error) {
            console.error('AuthContext: Login error caught:', error.message);
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    const register = async (userData) => {
        dispatch({ type: 'SET_LOADING' });
        try {
            const result = await api.register(userData);
            
            if (!result || !result.user || !result.token) {
                throw new Error('فشل إنشاء الحساب، يرجى المحاولة مرة أخرى');
            }

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

    const updateProfile = async (updates, customToken = null) => {
        try {
            const activeToken = customToken || state.token;
            const updatedUser = await api.updateProfile(updates, activeToken);
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

    const ensureAuthenticated = () => {
        if (!state.token) {
            navigate('Login');
            return false;
        }
        return true;
    };

    const refreshProfile = async () => {
        if (!state.token) return;
        try {
            const updatedUser = await api.getProfile(state.token);
            await AsyncStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify({ user: updatedUser, token: state.token })
            );
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
                ensureAuthenticated,
                refreshProfile,
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
