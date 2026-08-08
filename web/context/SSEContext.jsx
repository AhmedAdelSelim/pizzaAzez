'use client';

import { createContext, useContext, useEffect } from 'react';
import sseClient from '@/lib/sseClient';
import { useAuth } from './AuthContext';

const SSEContext = createContext(sseClient);

export function SSEProvider({ children }) {
    const { token } = useAuth();

    // The stream authenticates with the JWT and the server decides which
    // events this connection receives (own orders, plus admin events when the
    // token belongs to an admin) — the client doesn't pick rooms.
    useEffect(() => {
        if (!token) {
            sseClient.disconnect();
            return;
        }
        sseClient.connect(token);
        return () => sseClient.disconnect();
    }, [token]);

    return <SSEContext.Provider value={sseClient}>{children}</SSEContext.Provider>;
}

export const useSSE = () => useContext(SSEContext);

/** Subscribe to a realtime event for the lifetime of the calling component. */
export function useRealtimeEvent(event, handler, deps = []) {
    const sse = useSSE();
    useEffect(() => {
        if (!sse) return;
        return sse.on(event, handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sse, event, ...deps]);
}
