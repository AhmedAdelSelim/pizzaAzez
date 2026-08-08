import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import partyKitClient from '../services/partyKitClient';

const SSEContext = createContext(partyKitClient);

export function SSEProvider({ children }) {
    const { token, user } = useAuth();

    useEffect(() => {
        if (token && user?.id) {
            const isAdmin = user.role === 'admin';
            partyKitClient.connect(user.id, isAdmin);
            return () => partyKitClient.disconnect();
        } else {
            partyKitClient.disconnect();
        }
    }, [token, user?.id]);

    return (
        <SSEContext.Provider value={partyKitClient}>
            {children}
        </SSEContext.Provider>
    );
}

export const useSSE = () => useContext(SSEContext);
