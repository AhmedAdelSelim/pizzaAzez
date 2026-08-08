'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { cx } from '@/lib/utils';

/**
 * Web replacement for React Native's `Alert.alert` and action sheets.
 *
 *   alert(title, message)                  -> Promise<void>
 *   confirm(title, message, opts)          -> Promise<boolean>
 *   choose(title, message, options)        -> Promise<value|null>
 *   toast(message, type)                   -> void
 */
const UIContext = createContext(null);

let toastId = 0;

export function UIProvider({ children }) {
    const [dialog, setDialog] = useState(null);
    const [toasts, setToasts] = useState([]);
    const resolver = useRef(null);

    const open = useCallback((config) => {
        return new Promise((resolve) => {
            resolver.current = resolve;
            setDialog(config);
        });
    }, []);

    const settle = useCallback((value) => {
        setDialog(null);
        resolver.current?.(value);
        resolver.current = null;
    }, []);

    const alert = useCallback(
        (title, message) => open({ kind: 'alert', title, message }),
        [open]
    );

    const confirm = useCallback(
        (title, message, opts = {}) =>
            open({
                kind: 'confirm',
                title,
                message,
                confirmText: opts.confirmText || 'تأكيد',
                cancelText: opts.cancelText || 'إلغاء',
                destructive: opts.destructive ?? false,
            }),
        [open]
    );

    const choose = useCallback(
        (title, message, options) => open({ kind: 'choose', title, message, options }),
        [open]
    );

    const toast = useCallback((message, type = 'info') => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3600);
    }, []);

    return (
        <UIContext.Provider value={{ alert, confirm, choose, toast }}>
            {children}

            {dialog && (
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6 animate-fade-in"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => settle(dialog.kind === 'confirm' ? false : dialog.kind === 'choose' ? null : undefined)}
                >
                    <div
                        className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-6 shadow-lg-soft animate-slide-up sm:rounded-3xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-bold text-text">{dialog.title}</h2>
                        {dialog.message && (
                            <p className="mt-2 text-sm leading-6 text-muted">{dialog.message}</p>
                        )}

                        {dialog.kind === 'choose' ? (
                            <div className="mt-5 flex flex-col gap-2">
                                {dialog.options.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => settle(option.value)}
                                        className="flex items-center justify-between rounded-xl border border-border bg-background-light px-4 py-3 text-sm font-semibold text-text transition hover:border-primary"
                                    >
                                        <span>{option.label}</span>
                                        {option.color && (
                                            <span
                                                className="size-2.5 rounded-full"
                                                style={{ background: option.color }}
                                            />
                                        )}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => settle(null)}
                                    className="mt-1 rounded-xl px-4 py-3 text-sm font-semibold text-muted transition hover:text-text"
                                >
                                    إلغاء
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6 flex gap-3">
                                {dialog.kind === 'confirm' && (
                                    <button
                                        type="button"
                                        onClick={() => settle(false)}
                                        className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-text transition hover:bg-surface-light"
                                    >
                                        {dialog.cancelText}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    autoFocus
                                    onClick={() => settle(dialog.kind === 'confirm' ? true : undefined)}
                                    className={cx(
                                        'flex-1 rounded-xl py-3 text-sm font-bold text-white transition',
                                        dialog.destructive
                                            ? 'bg-error hover:brightness-110'
                                            : 'bg-primary hover:bg-primary-dark'
                                    )}
                                >
                                    {dialog.kind === 'confirm' ? dialog.confirmText : 'حسناً'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="pointer-events-none fixed inset-x-0 top-4 z-[110] flex flex-col items-center gap-2 px-4">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cx(
                            'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-md-soft animate-rise',
                            t.type === 'error'
                                ? 'border-error/40 bg-[#3a1f28] text-error'
                                : t.type === 'success'
                                    ? 'border-accent/40 bg-[#123833] text-accent'
                                    : 'border-border bg-surface text-text'
                        )}
                        role="status"
                    >
                        <Icon
                            name={
                                t.type === 'error'
                                    ? 'alert-circle'
                                    : t.type === 'success'
                                        ? 'checkmark-circle'
                                        : 'information-circle-outline'
                            }
                            size={18}
                        />
                        <span className="flex-1 text-sm font-semibold">{t.message}</span>
                    </div>
                ))}
            </div>
        </UIContext.Provider>
    );
}

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within UIProvider');
    return context;
};
