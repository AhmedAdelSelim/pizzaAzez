/**
 * localStorage wrapper mirroring the AsyncStorage surface used by the RN app,
 * so the storage keys and call sites stay identical.
 */
export const storage = {
    getItem(key) {
        if (typeof window === 'undefined') return null;
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem(key, value) {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(key, value);
        } catch { }
    },
    removeItem(key) {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.removeItem(key);
        } catch { }
    },
    getJSON(key, fallback = null) {
        const raw = storage.getItem(key);
        if (!raw) return fallback;
        try {
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    },
    setJSON(key, value) {
        storage.setItem(key, JSON.stringify(value));
    },
};

export const AUTH_STORAGE_KEY = '@pizzaAzez_auth';
export const CART_STORAGE_KEY = '@pizzaAzez_cart';
export const FAVORITES_KEY = '@pizzaAzez_favorites';
export const RECENTLY_VIEWED_KEY = '@pizzaAzez_recently_viewed';
/** sessionStorage — carries the placed order to the confirmation page. */
export const LAST_ORDER_KEY = '@pizzaAzez_last_order';
