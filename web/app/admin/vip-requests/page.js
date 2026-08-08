'use client';

import { useCallback } from 'react';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';

export default function AdminVipRequestsPage() {
    const { token } = useAuth();
    const { alert, toast } = useUI();

    const fetchRequests = useCallback(
        async () => (await api.getAdminVipRequests(token)) || [],
        [token]
    );
    const {
        data: requests,
        loading,
        reload: loadRequests,
    } = useApiResource(fetchRequests, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => {
            console.error('Fetch VIP Requests Error:', error);
            alert('خطأ', 'فشل تحميل طلبات الـ VIP');
        },
    });

    const handleAction = async (userId, status) => {
        try {
            await api.handleVipRequest(userId, status, token);
            toast(status === 'vip' ? 'تم قبول العضوية' : 'تم رفض الطلب', 'success');
            loadRequests();
        } catch (error) {
            alert('خطأ', error.message);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="طلبات الـ VIP"
                backHref="/admin"
                action={
                    <button
                        type="button"
                        onClick={loadRequests}
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
            ) : requests.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="star-outline" size={64} />
                    <p className="text-sm">لا توجد طلبات معلقة</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5">
                    {requests.map((request) => (
                        <article
                            key={request.id}
                            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-text">{request.name}</p>
                                <p className="text-xs text-muted" dir="ltr">
                                    {request.phone}
                                </p>
                                {request.address && (
                                    <p className="truncate text-[11px] text-muted">{request.address}</p>
                                )}
                            </div>

                            <div className="flex shrink-0 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleAction(request.id, 'vip')}
                                    className="flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
                                >
                                    <Icon name="checkmark" size={18} />
                                    قبول
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAction(request.id, 'none')}
                                    className="flex items-center gap-1 rounded-lg bg-error px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
                                >
                                    <Icon name="close" size={18} />
                                    رفض
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
