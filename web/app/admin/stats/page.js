'use client';

import { useCallback } from 'react';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import { egp } from '@/lib/utils';

export default function AdminOrderStatsPage() {
    const { token } = useAuth();
    const { alert } = useUI();

    const fetchStats = useCallback(() => api.getAdminDailyStats(token), [token]);
    const {
        data: stats,
        loading,
        reload: loadStats,
    } = useApiResource(fetchStats, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => alert('خطأ', error.message),
    });

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="إحصائيات الأيام"
                backHref="/admin"
                action={
                    <button
                        type="button"
                        onClick={loadStats}
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
            ) : stats.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="bar-chart-outline" size={64} />
                    <p className="text-sm">لا توجد بيانات متاحة</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5">
                    {stats.map((day) => (
                        <article key={day.date} className="rounded-2xl border border-border bg-surface p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <Icon name="calendar-outline" size={20} className="text-primary" />
                                <span className="text-sm font-bold text-text">{day.date}</span>
                            </div>

                            <div className="grid grid-cols-4 divide-x divide-x-reverse divide-border">
                                <Stat value={day.total} label="إجمالي الطلبات" />
                                <Stat value={day.completed} label="تم التوصيل" color="text-accent" />
                                <Stat value={egp(day.revenue || 0)} label="المبيعات" color="text-primary" />
                                <Stat value={day.cancelled} label="ملغي" color="text-error" />
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

function Stat({ value, label, color = 'text-text' }) {
    return (
        <div className="px-1 text-center">
            <p className={`truncate text-sm font-extrabold ${color}`}>{value}</p>
            <p className="mt-0.5 text-[10px] text-muted">{label}</p>
        </div>
    );
}
