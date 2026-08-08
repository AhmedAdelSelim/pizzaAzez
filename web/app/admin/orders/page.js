'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import Ltr from '@/components/Ltr';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useSSE } from '@/context/SSEContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import { printOrderReceipt } from '@/lib/printReceipt';
import { egp, searchFilter } from '@/lib/utils';

const STATUS_OPTIONS = [
    { label: 'تم الاستلام', value: 'pending', color: '#8B8FA3' },
    { label: 'جاري التحضير', value: 'preparing', color: '#F4A442' },
    { label: 'في الفرن', value: 'baking', color: '#E85D2C' },
    { label: 'جاري التوصيل', value: 'shipping', color: '#E85D2C' },
    { label: 'تم التوصيل', value: 'delivered', color: '#00C9A7' },
    { label: 'ملغي', value: 'cancelled', color: '#FF6B6B' },
];

export default function AdminOrdersPage() {
    const { token } = useAuth();
    const sse = useSSE();
    const { alert, choose, toast } = useUI();

    const [searchQuery, setSearchQuery] = useState('');

    const fetchOrders = useCallback(async () => {
        const data = await api.getAdminOrders(token);
        return [...data].sort((a, b) => {
            const byDate = new Date(b.date) - new Date(a.date);
            return byDate !== 0 ? byDate : String(b.id).localeCompare(String(a.id));
        });
    }, [token]);

    const {
        data: orders,
        loading,
        reload: loadOrders,
        setData: setOrders,
    } = useApiResource(fetchOrders, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => alert('خطأ', error.message),
    });

    const filteredOrders = useMemo(
        () => searchFilter(orders, searchQuery, ['id', 'phone', 'customer_name']),
        [orders, searchQuery]
    );

    // Live updates: prepend new orders, refresh on status change
    useEffect(() => {
        if (!sse) return;
        const unsubNewOrder = sse.on('new_order', (order) => {
            if (order?.id) {
                setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
                toast(`طلب جديد #${String(order.id).substring(0, 8)}`, 'success');
            } else {
                loadOrders();
            }
        });
        const unsubUpdated = sse.on('order_updated', loadOrders);
        return () => {
            unsubNewOrder();
            unsubUpdated();
        };
    }, [sse, loadOrders, setOrders, toast]);

    /**
     * Printing is fire-and-forget, always. An offline printer, an empty tray or
     * a dismissed print dialog must never read as a failed status update, so
     * this swallows both a synchronous throw and a rejected promise and only
     * nudges the admin to use the per-order print button instead.
     */
    const printOrder = useCallback(
        (order) => {
            try {
                printOrderReceipt(order).catch((error) => {
                    console.error('Receipt print failed:', error);
                    toast('تعذرت الطباعة — استخدم زر الطباعة للمحاولة مرة أخرى', 'error');
                });
            } catch (error) {
                console.error('Receipt print failed:', error);
                toast('تعذرت الطباعة — استخدم زر الطباعة للمحاولة مرة أخرى', 'error');
            }
        },
        [toast]
    );

    const handleUpdateStatus = async (order) => {
        const status = await choose(
            'تحديث حالة الطلب',
            `اختر الحالة الجديدة للطلب #${String(order.id).substring(0, 8)}`,
            STATUS_OPTIONS
        );
        if (!status) return;

        let updated;
        try {
            updated = await api.updateOrderStatus(order.id, status, token);
            toast('تم تحديث حالة الطلب', 'success');
            loadOrders();
        } catch (error) {
            alert('خطأ', error.message);
            return;
        }

        // Confirming a new order prints its kitchen ticket. Kept outside the try
        // above on purpose — by this point the status change is already
        // committed server-side, and nothing the printer does may undo it.
        // A rejection isn't a confirmation, so it doesn't print.
        const isConfirmation = order.status === 'pending' && status !== 'cancelled';
        if (isConfirmation) printOrder(updated?.id ? updated : { ...order, status });
    };

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="إدارة الطلبات"
                backHref="/admin"
                action={
                    <button
                        type="button"
                        onClick={loadOrders}
                        aria-label="تحديث"
                        className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-text"
                    >
                        <Icon name="refresh-outline" size={20} />
                    </button>
                }
            />

            <div className="p-5 pb-3">
                <SearchBar
                    placeholder="ابحث بالاسم أو رقم الهاتف أو رقم الطلب..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
            </div>

            {loading && orders.length === 0 ? (
                <div className="grid flex-1 place-items-center text-primary">
                    <Spinner size={36} />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="receipt-outline" size={64} />
                    <p className="text-sm">لا توجد طلبات</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5 pt-2">
                    {filteredOrders.map((order) => {
                        const status =
                            STATUS_OPTIONS.find((s) => s.value === order.status) || STATUS_OPTIONS[0];
                        return (
                            <article
                                key={order.id}
                                className="rounded-2xl border border-border bg-surface p-4"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-extrabold text-text">
                                        <Ltr>#{String(order.id).substring(0, 8)}</Ltr>
                                    </span>
                                    <span
                                        className="rounded-full px-3 py-1 text-[11px] font-semibold"
                                        style={{ background: `${status.color}20`, color: status.color }}
                                    >
                                        {status.label}
                                    </span>
                                </div>

                                <div className="mb-3 flex flex-col gap-1 text-xs text-muted">
                                    <p className="text-sm font-bold text-text">
                                        {order.customer_name || 'عميل'}
                                    </p>
                                    <p>
                                        الهاتف: <span dir="ltr">{order.phone}</span>
                                    </p>
                                    <p>المبلغ: {egp(order.total)}</p>
                                    {order.address && <p>العنوان: {order.address}</p>}

                                    {/* The items are what the kitchen actually reads off this
                                        card, so they get their own block at a legible size
                                        instead of a comma-run in the muted metadata. */}
                                    <ul className="mt-2 flex flex-col gap-1">
                                        {order.items?.map((item, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-baseline gap-2 text-base font-bold text-text"
                                            >
                                                <Ltr>
                                                    <span className="text-primary">
                                                        {item.quantity}×
                                                    </span>
                                                </Ltr>
                                                <span className="flex-1">
                                                    {item.name}
                                                    {(item.selectedSize || item.size) && (
                                                        <span className="text-xs font-normal text-muted">
                                                            {' '}
                                                            ({item.selectedSize || item.size})
                                                        </span>
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {order.notes && (
                                        <p className="mt-2 italic">ملاحظات: {order.notes}</p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateStatus(order)}
                                        className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark"
                                    >
                                        تحديث الحالة
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => printOrder(order)}
                                        title="طباعة الفاتورة"
                                        className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2.5 text-sm font-bold text-text transition hover:border-primary hover:text-primary"
                                    >
                                        <Icon name="print-outline" size={18} />
                                        طباعة
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
