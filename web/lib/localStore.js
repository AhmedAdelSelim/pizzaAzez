'use client';

import { useSyncExternalStore } from 'react';
import { storage } from './storage';

const noopSubscribe = () => () => { };

/**
 * Reads a value that only exists on the client (time of day, `navigator`, …)
 * without tripping hydration. `getSnapshot` must return a stable reference —
 * a primitive, or a value from a fixed set.
 */
export function useClientSnapshot(getSnapshot, serverSnapshot) {
    return useSyncExternalStore(noopSubscribe, getSnapshot, () => serverSnapshot);
}

/**
 * A JSON value in localStorage, exposed as an external store so components can
 * subscribe with `useSyncExternalStore`. Snapshots are cached against the raw
 * string so repeated reads keep referential identity.
 */
export function createLocalStore(key, serverSnapshot) {
    const listeners = new Set();
    let cachedRaw;
    let cachedValue = serverSnapshot;
    let primed = false;

    const emit = () => listeners.forEach((listener) => listener());

    const getSnapshot = () => {
        const raw = storage.getItem(key);
        if (!primed || raw !== cachedRaw) {
            primed = true;
            cachedRaw = raw;
            try {
                cachedValue = raw ? JSON.parse(raw) : serverSnapshot;
            } catch {
                cachedValue = serverSnapshot;
            }
        }
        return cachedValue;
    };

    const subscribe = (listener) => {
        listeners.add(listener);
        window.addEventListener(key, listener);
        window.addEventListener('storage', listener);
        return () => {
            listeners.delete(listener);
            window.removeEventListener(key, listener);
            window.removeEventListener('storage', listener);
        };
    };

    return {
        getSnapshot,
        read: getSnapshot,
        write(value) {
            storage.setJSON(key, value);
            window.dispatchEvent(new Event(key));
            emit();
        },
        use() {
            return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
        },
    };
}
