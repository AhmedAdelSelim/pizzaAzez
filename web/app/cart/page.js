'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Ltr from '@/components/Ltr';
import CartItem from '@/components/CartItem';
import EmptyState from '@/components/EmptyState';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import api from '@/lib/api';
import { egp } from '@/lib/utils';

const FREE_DELIVERY_THRESHOLD = 1000;

export default function CartPage() {
    const router = useRouter();
    const {
        items,
        removeItem,
        updateQuantity,
        getSubtotal,
        getItemCount,
        getDiscount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
    } = useCart();
    const { token } = useAuth();
    const { alert } = useUI();

    const [couponCode, setCouponCode] = useState('');
    const [validating, setValidating] = useState(false);

    const subtotal = getSubtotal();
    const discount = getDiscount();
    const total = subtotal - discount;
    const progressPct = Math.min(subtotal / FREE_DELIVERY_THRESHOLD, 1) * 100;
    const remaining = Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        setValidating(true);
        try {
            const coupon = await api.validateCoupon(couponCode.trim(), token);
            applyCoupon(coupon);
            setCouponCode('');
        } catch (error) {
            alert('خطأ', error.message || 'كود الخصم غير صحيح');
        } finally {
            setValidating(false);
        }
    };

    if (items.length === 0) {
        return (
            <main className="flex flex-1 flex-col">
                <header className="px-6 pb-4 pt-8">
                    <h1 className="text-2xl font-bold text-text">سلتي</h1>
                </header>
                <EmptyState
                    icon="cart-outline"
                    title="سلتك فارغة"
                    message="أضف بعض الأطباق اللذيذة من قائمتنا للبدء!"
                    action={
                        <Button
                            title="تصفح القائمة"
                            variant="outline"
                            size="large"
                            onClick={() => router.push('/menu')}
                        />
                    }
                />
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col pb-28">
            <header className="flex items-center justify-between px-6 pb-4 pt-8">
                <h1 className="text-2xl font-bold text-text">سلتي</h1>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                    {getItemCount()} عنصر
                </span>
            </header>

            <div className="px-6">
                {items.map((item, index) => (
                    <CartItem
                        key={`${item.id}-${index}`}
                        item={item}
                        index={index}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                    />
                ))}

                {/* Free-delivery progress */}
                <div className="mb-4 rounded-2xl border border-border bg-surface p-4">
                    {remaining > 0 ? (
                        <>
                            <div className="mb-3 flex items-center gap-2">
                                <Icon name="bicycle-outline" size={18} className="text-accent" />
                                <p className="text-xs text-text">
                                    أضف <span className="font-bold text-accent">{egp(remaining)}</span>{' '}
                                    للحصول على توصيل مجاني 🎁
                                </p>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-background-light">
                                <div
                                    className="h-full rounded-full bg-accent transition-[width] duration-500"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                            <p className="mt-2 text-end text-[10px] text-muted">
                                {subtotal} / {FREE_DELIVERY_THRESHOLD} ج.م
                            </p>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Icon name="checkmark-circle" size={20} className="text-accent" />
                            <p className="text-xs font-semibold text-accent">
                                مبروك! حصلت على توصيل مجاني 🎉
                            </p>
                        </div>
                    )}
                </div>

                {/* Coupon */}
                <form onSubmit={handleApplyCoupon} className="mb-4">
                    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5">
                        <Icon name="pricetag-outline" size={20} className="text-primary" />
                        <input
                            className="min-w-0 flex-1 bg-transparent text-sm uppercase text-text outline-none placeholder:normal-case placeholder:text-muted"
                            placeholder="أدخل كود الخصم"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                        <button
                            type="submit"
                            disabled={validating}
                            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
                        >
                            {validating ? '...' : 'تطبيق'}
                        </button>
                    </div>

                    {appliedCoupon && (
                        <div className="mt-2 flex items-center justify-between rounded-xl border border-[#4CAF50]/30 bg-[#4CAF50]/10 px-4 py-2.5">
                            <span className="flex items-center gap-2 text-xs font-semibold text-[#4CAF50]">
                                <Icon name="checkmark-circle" size={18} />
                                تم تطبيق: <Ltr>{appliedCoupon.code}</Ltr>
                            </span>
                            <button type="button" onClick={removeCoupon} aria-label="إزالة الكوبون">
                                <Icon name="close" size={16} className="text-muted" />
                            </button>
                        </div>
                    )}
                </form>

                {/* Summary */}
                <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-muted">المجموع الفرعي</span>
                        <span className="text-sm font-semibold text-text">{egp(subtotal)}</span>
                    </div>
                    {appliedCoupon && (
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-[#4CAF50]">
                                الخصم ({appliedCoupon.code})
                            </span>
                            <span className="text-sm font-semibold text-[#4CAF50]">
                                - {egp(discount)}
                            </span>
                        </div>
                    )}
                    <div className="my-2 h-px bg-border" />
                    <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-text">إجمالي الطلب</span>
                        <span key={total} className="text-xl font-extrabold text-primary animate-pop">
                            {egp(total)}
                        </span>
                    </div>
                    <p className="mt-2 text-[10px] text-muted">* يضاف التوصيل في الخطوة التالية</p>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-tabbar z-40 border-t border-border bg-surface/95 backdrop-blur">
                <div className="app-width px-6 py-4">
                    <Button
                        title={`إتمام الطلب  •  ${egp(total)}`}
                        size="large"
                        onClick={() => router.push('/checkout')}
                    />
                </div>
            </div>
        </main>
    );
}
