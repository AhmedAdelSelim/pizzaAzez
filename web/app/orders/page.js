'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Ltr from '@/components/Ltr';
import EmptyState from '@/components/EmptyState';
import Icon from '@/components/Icon';
import OrderJourneyTracker from '@/components/OrderJourneyTracker';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useSSE } from '@/context/SSEContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import { cx, egp } from '@/lib/utils';

const STATUS_CONFIG = {
    pending: { color: '#9E9E9E', label: 'تم الاستلام', icon: 'receipt-outline' },
    preparing: { color: '#FFA000', label: 'جاري التحضير', icon: 'time-outline' },
    baking: { color: '#E85D2C', label: 'في الفرن', icon: 'flame-outline' },
    shipping: { color: '#2196F3', label: 'جاري التوصيل', icon: 'bicycle-outline' },
    delivered: { color: '#4CAF50', label: 'تم التوصيل', icon: 'checkmark-circle-outline' },
    cancelled: { color: '#FF6B6B', label: 'ملغي', icon: 'close-circle-outline' },
};

const ACTIVE_STATUSES = ['pending', 'preparing', 'baking', 'shipping'];

export default function OrdersPage() {
    const router = useRouter();
    const { token } = useAuth();
    const { addItem, clearCart } = useCart();
    const sse = useSSE();
    const { alert, confirm } = useUI();

    const fetchOrders = useCallback(async () => {
        const data = await api.getOrders(token);
        return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [token]);

    const {
        data: orders,
        loading,
        reload: reloadOrders,
        setData: setOrders,
    } = useApiResource(fetchOrders, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => console.error('Error fetching orders:', error),
    });

    // Auto-refresh every 30s as a fallback
    useEffect(() => {
        const interval = setInterval(reloadOrders, 30000);
        return () => clearInterval(interval);
    }, [reloadOrders]);

    // Real-time order status updates
    useEffect(() => {
        if (!sse) return;
        return sse.on('order_status', (data) => {
            if (!data?.orderId || !data?.status) return;
            setOrders((prev) =>
                prev.map((o) => (o.id === data.orderId ? { ...o, status: data.status } : o))
            );
        });
    }, [sse, setOrders]);

    const handleReorder = async (order) => {
        if (!order.items?.length) return;
        const ok = await confirm('إعادة الطلب', 'هل تريد إضافة نفس المنتجات إلى سلة التسوق؟', {
            confirmText: 'نعم، أضف إلى السلة',
        });
        if (!ok) return;

        clearCart();
        order.items.forEach((item) => {
            addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                selectedSize: item.selectedSize || item.size || null,
                image: item.image || null,
            });
        });
        router.push('/cart');
    };

    if (loading) {
        return (
            <main className="flex flex-1 flex-col">
                <PageHeader title="سجل الطلبات" />
                <div className="grid flex-1 place-items-center text-primary">
                    <Spinner size={36} />
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="سجل الطلبات"
                action={
                    orders.length > 0 && (
                        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                            {orders.length}
                        </span>
                    )
                }
            />

            {orders.length === 0 ? (
                <EmptyState
                    icon="receipt-outline"
                    title="لا يوجد طلبات سابقة"
                    message="اطلب الآن واستمتع بأشهى المأكولات!"
                    action={<Button title="اطلب الآن" size="large" onClick={() => router.push('/menu')} />}
                />
            ) : (
                <div className="flex flex-col gap-4 p-6">
                    {orders.map((order) => {
                        const status = STATUS_CONFIG[order.status] || {
                            color: '#8B8FA3',
                            label: 'غير معروف',
                            icon: 'help-outline',
                        };
                        const active = ACTIVE_STATUSES.includes(order.status);

                        return (
                            <article
                                key={order.id}
                                className={cx(
                                    'rounded-2xl border bg-surface p-4',
                                    active ? 'border-primary/40' : 'border-border'
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-extrabold text-text">
                                            <Ltr>#{String(order.id).slice(-6).toUpperCase()}</Ltr>
                                        </p>
                                        <p className="text-[11px] text-muted">{order.date}</p>
                                    </div>
                                    <span
                                        className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                        style={{
                                            background: `${status.color}20`,
                                            borderColor: `${status.color}40`,
                                            color: status.color,
                                        }}
                                    >
                                        <Icon name={status.icon} size={13} />
                                        {status.label}
                                    </span>
                                </div>

                                {active && <OrderJourneyTracker currentStatus={order.status} />}

                                <div className="my-3 h-px bg-border" />

                                <div className="flex flex-col gap-1">
                                    {(order.items || []).map((orderItem, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-primary">
                                                <Ltr>{orderItem.quantity}x</Ltr>
                                            </span>
                                            <span className="truncate text-xs text-text">
                                                {orderItem.name}
                                                {orderItem.size ? ` (${orderItem.size})` : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm text-muted">
                                        الإجمالي:{' '}
                                        <span className="font-extrabold text-primary">
                                            {egp(order.total)}
                                        </span>
                                    </p>
                                    {/* No cancel button: customers do not cancel their
                                        own orders. isCancellable() on the server refuses
                                        it too, so this is not the only guard. */}
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleReorder(order)}
                                            className="flex items-center gap-1 rounded-lg border border-primary/40 px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
                                        >
                                            <Icon name="refresh-outline" size={14} />
                                            إعادة طلب
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
