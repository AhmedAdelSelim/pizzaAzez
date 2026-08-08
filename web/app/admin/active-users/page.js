'use client';

import { useCallback } from 'react';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import { cx } from '@/lib/utils';

export default function AdminActiveUsersPage() {
    const { token } = useAuth();
    const { alert } = useUI();

    const fetchActiveUsers = useCallback(
        async () => (await api.getAdminStats(token)).activeUsers || [],
        [token]
    );
    const {
        data: activeUsers,
        loading,
        reload: loadActiveUsers,
    } = useApiResource(fetchActiveUsers, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => {
            console.error('Fetch Active Users Error:', error);
            alert('خطأ', 'فشل تحميل بيانات العملاء');
        },
    });

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="العملاء الأكثر نشاطاً"
                backHref="/admin"
                action={
                    <button
                        type="button"
                        onClick={loadActiveUsers}
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
            ) : activeUsers.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="people-outline" size={64} />
                    <p className="text-sm">لا توجد بيانات حالياً</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5">
                    {activeUsers.map((user, index) => (
                        <article
                            key={user.id}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                        >
                            <span
                                className={cx(
                                    'grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold',
                                    index < 3 ? 'bg-star text-black' : 'bg-background-light text-muted'
                                )}
                            >
                                {index + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-text">{user.name}</p>
                                <p className="text-xs text-muted" dir="ltr">
                                    {user.phone}
                                </p>
                            </div>

                            <div className="shrink-0 text-center">
                                <p className="text-lg font-extrabold text-primary">{user.orderCount}</p>
                                <p className="text-[10px] text-muted">طلب</p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
