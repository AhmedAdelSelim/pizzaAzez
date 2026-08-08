'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { useSSE } from '@/context/SSEContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import { egp } from '@/lib/utils';

const SECTIONS = [
    {
        title: 'إدارة العمليات',
        cards: [
            { title: 'إدارة الطلبات', subtitle: 'متابعة وتحديث حالة طلبات العملاء', icon: 'list', href: '/admin/orders', badge: 'pendingOrders' },
            { title: 'شكاوي واقتراحات', subtitle: 'متابعة آراء واقتراحات العملاء', icon: 'chatbubbles-outline', href: '/admin/suggestions' },
            { title: 'طلبات الـ VIP', subtitle: 'مراجعة وقبول طلبات العضوية المميزة', icon: 'star-outline', href: '/admin/vip-requests', badge: 'pendingVipRequests' },
            { title: 'العملاء الأكثر نشاطاً', subtitle: 'عرض وترتيب العملاء حسب عدد الطلبات', icon: 'people-outline', href: '/admin/active-users' },
            { title: 'إدارة العملاء', subtitle: 'إيقاف وتفعيل حسابات المستخدمين', icon: 'people-circle-outline', href: '/admin/users' },
            { title: 'إحصائيات الأيام', subtitle: 'متابعة أداء الطلبات اليومي', icon: 'bar-chart-outline', href: '/admin/stats' },
        ],
    },
    {
        title: 'إدارة المحتوى',
        cards: [
            { title: 'إدارة القائمة', subtitle: 'إضافة، تعديل وحذف عناصر القائمة', icon: 'restaurant', href: '/admin/menu' },
            { title: 'إدارة الأقسام', subtitle: 'إدارة أقسام الأطعمة والمشروبات', icon: 'folder-open-outline', href: '/admin/categories' },
            { title: 'إدارة القصص', subtitle: 'إضافة وحذف وتعديل القصص', icon: 'images-outline', href: '/admin/stories' },
        ],
    },
    {
        title: 'الإعدادات والخصومات',
        cards: [
            { title: 'إدارة الكوبونات', subtitle: 'إدارة أكواد الخصم والعروض', icon: 'ticket-outline', href: '/admin/coupons' },
            { title: 'مناطق التوصيل', subtitle: 'إدارة مناطق التوصيل وأسعار الشحن', icon: 'map-outline', href: '/admin/delivery-zones' },
        ],
    },
];

export default function AdminDashboardPage() {
    const { token, logout } = useAuth();
    const sse = useSSE();
    const { alert, confirm, toast } = useUI();

    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastBody, setBroadcastBody] = useState('');
    const [broadcastLoading, setBroadcastLoading] = useState(false);

    const fetchStats = useCallback(() => api.getAdminStats(token), [token]);
    const {
        data: stats,
        loading,
        reload: loadStats,
    } = useApiResource(fetchStats, {
        enabled: Boolean(token),
        onError: (error) => console.error('Stats Error:', error),
    });

    // Keep the counters live as orders arrive.
    useEffect(() => {
        if (!sse) return;
        const unsubNew = sse.on('new_order', loadStats);
        const unsubUpdated = sse.on('order_updated', loadStats);
        return () => {
            unsubNew();
            unsubUpdated();
        };
    }, [sse, loadStats]);

    const handleBroadcast = async () => {
        if (!broadcastTitle.trim() || !broadcastBody.trim()) {
            alert('تنبيه', 'يرجى إدخال العنوان والمحتوى');
            return;
        }
        setBroadcastLoading(true);
        try {
            const result = await api.broadcastNotification(
                broadcastTitle.trim(),
                broadcastBody.trim(),
                token
            );
            setShowBroadcast(false);
            setBroadcastTitle('');
            setBroadcastBody('');
            toast(`تم إرسال الإشعار لـ ${result.sent} مستخدم`, 'success');
        } catch (error) {
            alert('خطأ', error.message);
        } finally {
            setBroadcastLoading(false);
        }
    };

    const handleLogout = async () => {
        const ok = await confirm('تسجيل الخروج', 'هل أنت متأكد أنك تريد تسجيل الخروج؟', {
            confirmText: 'خروج',
            destructive: true,
        });
        if (ok) logout();
    };

    return (
        <main className="flex flex-1 flex-col">
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur">
                <span className="w-10" />
                <h1 className="text-xl font-bold text-text">لوحة الإدارة</h1>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={loadStats}
                        aria-label="تحديث"
                        className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-text"
                    >
                        <Icon name="refresh-outline" size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        aria-label="تسجيل الخروج"
                        className="grid size-10 place-items-center rounded-full text-error transition hover:bg-error/10"
                    >
                        <Icon name="log-out-outline" size={24} />
                    </button>
                </div>
            </header>

            <div className="p-5">
                <div className="mb-6 grid grid-cols-2 gap-3">
                    <StatCard
                        title="إجمالي المبيعات"
                        value={egp(stats?.totalRevenue || 0)}
                        icon="cash-outline"
                        color="#4CAF50"
                        loading={loading}
                    />
                    <StatCard
                        title="إجمالي الطلبات"
                        value={stats?.totalOrders || 0}
                        icon="cart-outline"
                        color="#2196F3"
                        loading={loading}
                    />
                    <StatCard
                        title="طلبات قيد التنفيذ"
                        value={stats?.pendingOrders || 0}
                        icon="time-outline"
                        color="#FF9800"
                        loading={loading}
                    />
                    <StatCard
                        title="إجمالي العملاء"
                        value={stats?.totalUsers || 0}
                        icon="people-outline"
                        color="#9C27B0"
                        loading={loading}
                    />
                </div>

                {SECTIONS.map((section) => (
                    <section key={section.title} className="mb-6">
                        <h2 className="mb-3 text-base font-bold text-text">{section.title}</h2>
                        <div className="flex flex-col gap-3">
                            {section.cards.map((card) => (
                                <Link
                                    key={card.href}
                                    href={card.href}
                                    className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition hover:border-primary/50"
                                >
                                    <span className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-background-light">
                                        <Icon name={card.icon} size={28} className="text-primary" />
                                        {card.badge && stats?.[card.badge] > 0 && (
                                            <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
                                                {stats[card.badge] > 99 ? '99+' : stats[card.badge]}
                                            </span>
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-bold text-text">{card.title}</span>
                                        <span className="block text-[11px] text-muted">{card.subtitle}</span>
                                    </span>
                                    <Icon name="chevron-back" size={24} className="text-muted" />
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}

                <section className="mb-6">
                    <h2 className="mb-3 text-base font-bold text-text">التسويق</h2>
                    <button
                        type="button"
                        onClick={() => setShowBroadcast(true)}
                        className="flex w-full items-center gap-4 rounded-2xl border border-primary/30 bg-surface p-4 text-start transition hover:border-primary"
                    >
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/15">
                            <Icon name="megaphone-outline" size={28} className="text-primary" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-text">إشعار جماعي</span>
                            <span className="block text-[11px] text-muted">
                                إرسال إشعار لجميع المستخدمين
                            </span>
                        </span>
                        <Icon name="chevron-back" size={24} className="text-muted" />
                    </button>
                </section>

                <Link
                    href="/"
                    className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-border py-3.5 text-sm font-semibold text-muted transition hover:text-text"
                >
                    <Icon name="home-outline" size={18} />
                    عرض المتجر
                </Link>
            </div>

            <Modal open={showBroadcast} onClose={() => setShowBroadcast(false)} title="إرسال إشعار جماعي">
                <input
                    className="az-input mb-3"
                    placeholder="عنوان الإشعار"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                />
                <textarea
                    className="az-input mb-4 min-h-20 resize-y"
                    placeholder="محتوى الإشعار"
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                />
                <Button
                    title={broadcastLoading ? 'جاري الإرسال...' : 'إرسال للجميع'}
                    onClick={handleBroadcast}
                    loading={broadcastLoading}
                    icon={<Icon name="send-outline" size={18} />}
                />
                <button
                    type="button"
                    onClick={() => setShowBroadcast(false)}
                    className="mt-2 w-full py-3 text-sm text-muted transition hover:text-text"
                >
                    إلغاء
                </button>
            </Modal>
        </main>
    );
}

function StatCard({ title, value, icon, color, loading }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <span
                className="grid size-11 shrink-0 place-items-center rounded-xl"
                style={{ background: `${color}1A` }}
            >
                <Icon name={icon} size={24} color={color} />
            </span>
            <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-text">
                    {loading && value === 0 ? '—' : value}
                </p>
                <p className="truncate text-[11px] text-muted">{title}</p>
            </div>
        </div>
    );
}
