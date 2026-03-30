import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import sseClient from '../services/sseClient';

const SSEContext = createContext(sseClient);

export function SSEProvider({ children }) {
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            sseClient.connect(token);
        } else {
            sseClient.disconnect();
        }
        return () => {
            sseClient.disconnect();
        };
    }, [token]);

    return (
        <SSEContext.Provider value={sseClient}>
            {children}
        </SSEContext.Provider>
    );
}

/** Returns the singleton SSEClient so components can call .on()/.off(). */
export const useSSE = () => useContext(SSEContext);
