'use client';

import { useCallback } from 'react';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AdminSuggestionsPage() {
    const { token } = useAuth();
    const { alert } = useUI();
    const fetchSuggestions = useCallback(() => api.getAdminSuggestions(token), [token]);
    const {
        data: suggestions,
        loading,
        reload: loadSuggestions,
    } = useApiResource(fetchSuggestions, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => {
            console.error('Fetch Suggestions Error:', error);
            alert('خطأ', 'فشل تحميل الاقتراحات');
        },
    });

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="اقتراحات العملاء"
                backHref="/admin"
                action={
                    <button
                        type="button"
                        onClick={loadSuggestions}
                        aria-label="تحديث"
                        className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-text"
                    >
                        <Icon name="refresh-outline" size={20} />
                    </button>
                }
            />

            {loading ? (
                <div className="grid flex-1 place-items-center text-primary">
                    <Spinner size={36} />
                </div>
            ) : suggestions.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="chatbubbles-outline" size={64} />
                    <p className="text-sm">لا توجد اقتراحات حالياً</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5">
                    {suggestions.map((suggestion) => (
                        <article
                            key={suggestion.id}
                            className="rounded-2xl border border-border bg-surface p-4"
                        >
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-text">
                                        {suggestion.user?.name || 'مستخدم غير معروف'}
                                    </p>
                                    <p className="text-xs text-muted" dir="ltr">
                                        {suggestion.user?.phone || '-'}
                                    </p>
                                </div>
                                <p className="shrink-0 text-[10px] text-muted">
                                    {formatDate(suggestion.created_at)}
                                </p>
                            </div>
                            <p className="text-sm leading-6 text-text">{suggestion.content}</p>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
