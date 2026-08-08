'use client';

import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 sm:items-center sm:p-6 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-surface p-6 animate-slide-up sm:rounded-3xl"
                onClick={(e) => e.stopPropagation()}
            >
                {title && <h2 className="mb-5 text-lg font-bold text-text">{title}</h2>}
                {children}
            </div>
        </div>
    );
}
