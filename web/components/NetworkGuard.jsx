'use client';

import { useSyncExternalStore } from 'react';
import Icon from './Icon';

function subscribe(callback) {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
    };
}

/**
 * Blocks the UI while the browser reports no connectivity — the web analogue of
 * the NetInfo modal in the RN app.
 */
export default function NetworkGuard() {
    const isOnline = useSyncExternalStore(
        subscribe,
        () => navigator.onLine,
        () => true
    );

    if (isOnline) return null;

    return (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/85 p-6">
            <div className="w-full max-w-md rounded-3xl bg-surface p-8 text-center shadow-lg-soft">
                <div className="relative mx-auto mb-5 w-fit">
                    <Icon name="wifi-outline" size={50} className="text-error" />
                    <span className="absolute left-[-5px] top-6 h-1 w-15 rotate-45 bg-error" />
                </div>
                <h2 className="mb-3 text-xl font-bold text-text">لا يوجد اتصال بالإنترنت</h2>
                <p className="mb-7 text-sm leading-6 text-text-secondary">
                    عذراً، بيتزا عزيز يتطلب اتصالاً نشطاً بالإنترنت للعمل بشكل صحيح.
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="w-full rounded-xl bg-error py-3.5 text-base font-bold text-white"
                >
                    محاولة ثانية
                </button>
            </div>
        </div>
    );
}
