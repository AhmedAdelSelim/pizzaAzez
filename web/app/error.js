'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';

/** Web equivalent of the RN ErrorBoundary screen. */
export default function Error({ error, unstable_retry }) {
    useEffect(() => {
        console.error('ErrorBoundary caught an error:', error);
    }, [error]);

    return (
        <div className="grid min-h-dvh place-items-center bg-background p-6">
            <div className="w-full max-w-md rounded-3xl bg-surface p-8 text-center shadow-lg-soft">
                <Icon name="alert-circle" size={80} className="mx-auto mb-5 text-error" />
                <h1 className="mb-3 text-xl font-bold text-text">عذراً، حدث خطأ ما</h1>
                <p className="mb-7 text-sm leading-6 text-text-secondary">
                    لقد واجه التطبيق مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو العودة لاحقاً.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => unstable_retry?.()}
                        className="rounded-xl bg-primary py-3.5 text-base font-bold text-white transition hover:bg-primary-dark"
                    >
                        محاولة مرة أخرى
                    </button>
                    <Link
                        href="/"
                        className="rounded-xl border border-border py-3.5 text-base font-medium text-text transition hover:bg-surface-light"
                    >
                        العودة للرئيسية
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-5 rounded-lg bg-black/20 p-2.5 text-start">
                        <p className="mb-1 text-[10px] font-bold text-muted">Debug Info:</p>
                        <p className="font-mono text-[10px] break-words text-muted">
                            {error?.toString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
