'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Ltr from '@/components/Ltr';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import api from '@/lib/api';
import { LAST_ORDER_KEY } from '@/lib/storage';
import { cx, egp } from '@/lib/utils';

/** Cash on delivery is the only method the restaurant accepts. */
const PAYMENT_METHOD = {
    id: 'cod',
    label: 'الدفع عند الاستلام',
    sub: 'ادفع نقداً عند استلام طلبك',
    icon: 'cash-outline',
    iconColor: '#00C9A7',
};

export default function CheckoutPage() {
    const router = useRouter();
    const {
        items,
        getSubtotal,
        getDeliveryFee,
        getTotal,
        getDiscount,
        appliedCoupon,
        clearCart,
        selectedZone,
        setDeliveryZone,
    } = useCart();
    const { user, token } = useAuth();
    const { alert, toast } = useUI();

    // AppShell holds rendering until auth is restored, so `user` is ready here.
    const [address, setAddress] = useState(user?.address || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [deliveryZones, setDeliveryZones] = useState([]);

    // Loyalty
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    const [redeemingPoints, setRedeemingPoints] = useState(false);
    const [pointsDiscount, setPointsDiscount] = useState(0);
    const [birthdayDiscount, setBirthdayDiscount] = useState(0);

    useEffect(() => {
        api.getDeliveryZones()
            .then(setDeliveryZones)
            .catch((error) => console.error('Error fetching zones:', error));
    }, []);

    useEffect(() => {
        if (!token) return;

        api.getLoyaltyPoints(token)
            .then((data) => setLoyaltyPoints(data.points || 0))
            .catch(() => { });

        api.checkBirthdayDiscount(token)
            .then((result) => {
                if (result?.has_discount) {
                    setBirthdayDiscount(result.discount_percent);
                    alert(
                        '🎂 عيد ميلاد سعيد!',
                        `لديك خصم ${result.discount_percent}٪ خاص بعيد ميلادك اليوم!`
                    );
                }
            })
            .catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // An empty cart has nothing to check out.
    useEffect(() => {
        if (items.length === 0 && !loading) router.replace('/cart');
    }, [items.length, loading, router]);

    const handleRedeemPoints = async () => {
        if (pointsToRedeem <= 0 || pointsToRedeem > loyaltyPoints) return;
        setRedeemingPoints(true);
        try {
            const result = await api.redeemLoyaltyPoints(pointsToRedeem, token);
            const discount = result.discount || Math.floor(pointsToRedeem / 10);
            setPointsDiscount(discount);
            toast(`تم خصم ${discount} ج.م من نقاطك`, 'success');
        } catch (error) {
            alert('خطأ', error.message);
        } finally {
            setRedeemingPoints(false);
        }
    };

    const birthdayDiscountAmount = Math.floor((getSubtotal() * birthdayDiscount) / 100);
    const finalTotal = Math.max(0, getTotal() - pointsDiscount - birthdayDiscountAmount);

    const handlePlaceOrder = async () => {
        if (!selectedZone) return alert('المنطقة مطلوبة', 'يرجى اختيار منطقة التوصيل.');
        if (!address.trim()) return alert('العنوان مطلوب', 'يرجى إدخال عنوان التوصيل.');
        if (!phone.trim()) return alert('الهاتف مطلوب', 'يرجى إدخال رقم الهاتف.');

        setLoading(true);
        try {
            const result = await api.placeOrder(
                {
                    items,
                    address: address.trim(),
                    phone: phone.trim(),
                    notes: notes.trim(),
                    deliveryZone: selectedZone.name,
                    deliveryFee: getDeliveryFee(),
                    discount: getDiscount() + pointsDiscount + birthdayDiscountAmount,
                    total: finalTotal,
                    couponCode: appliedCoupon?.code || null,
                    paymentMethod: PAYMENT_METHOD.id,
                },
                token
            );

            // The confirmation screen reads the placed order from here.
            sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(result));
            clearCart();
            router.replace('/order-confirmation');
        } catch (error) {
            alert('خطأ', error?.message || 'فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.');
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-1 flex-col pb-28">
            <PageHeader title="إتمام الطلب" backHref="/cart" />

            <div className="flex flex-col gap-6 px-6 py-6">
                {/* Delivery zone */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <Icon name="map-outline" size={20} className="text-primary" />
                        <h2 className="text-base font-bold text-text">منطقة التوصيل</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {deliveryZones.map((zone) => {
                            const isSelected = selectedZone?.id === zone.id;
                            return (
                                <button
                                    key={zone.id}
                                    type="button"
                                    onClick={() => setDeliveryZone(zone)}
                                    className={cx(
                                        'rounded-full border px-4 py-2 text-xs transition',
                                        isSelected
                                            ? 'border-primary bg-primary font-bold text-white'
                                            : 'border-border bg-surface text-muted hover:border-primary/50'
                                    )}
                                >
                                    {zone.name} ({zone.price} ج.م)
                                </button>
                            );
                        })}
                    </div>
                    {selectedZone && (
                        <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted">
                            <Icon name="time-outline" size={14} />
                            الوقت المتوقع:{' '}
                            {selectedZone.estimated_minutes
                                ? `${selectedZone.estimated_minutes} دقيقة`
                                : '٣٠-٤٥ دقيقة'}
                        </p>
                    )}
                </section>

                {/* Delivery details */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <Icon name="location-outline" size={20} className="text-primary" />
                        <h2 className="text-base font-bold text-text">تفاصيل التوصيل</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        <textarea
                            className="az-input min-h-20 resize-y"
                            placeholder="عنوان التوصيل"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                        <input
                            type="tel"
                            className="az-input"
                            placeholder="رقم الهاتف"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </section>

                {/* Notes */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <Icon name="chatbubble-outline" size={20} className="text-primary" />
                        <h2 className="text-base font-bold text-text">ملاحظات الطلب</h2>
                    </div>
                    <textarea
                        className="az-input min-h-24 resize-y"
                        placeholder="أي تعليمات خاصة؟ (اختياري)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </section>

                {/* Payment method */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <Icon name="card-outline" size={20} className="text-primary" />
                        <h2 className="text-base font-bold text-text">طريقة الدفع</h2>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary/5 p-3">
                        <span
                            className="grid size-11 shrink-0 place-items-center rounded-xl"
                            style={{ background: `${PAYMENT_METHOD.iconColor}20` }}
                        >
                            <Icon
                                name={PAYMENT_METHOD.icon}
                                size={24}
                                color={PAYMENT_METHOD.iconColor}
                            />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-primary">
                                {PAYMENT_METHOD.label}
                            </span>
                            <span className="block text-[11px] text-muted">{PAYMENT_METHOD.sub}</span>
                        </span>
                        <Icon name="checkmark-circle" size={22} className="shrink-0 text-primary" />
                    </div>
                </section>

                {/* Loyalty */}
                {loyaltyPoints >= 100 && (
                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <Icon name="gift-outline" size={20} className="text-star" />
                            <h2 className="text-base font-bold text-text">نقاط الولاء</h2>
                        </div>
                        <div className="rounded-2xl border border-star/25 bg-surface p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm text-text">
                                    رصيدك: <span className="font-bold text-star">{loyaltyPoints} نقطة</span>
                                </p>
                                <p className="text-[10px] text-muted">100 نقطة = 10 ج.م خصم</p>
                            </div>

                            {pointsDiscount > 0 ? (
                                <div className="flex items-center gap-2">
                                    <Icon name="checkmark-circle" size={20} className="text-[#4CAF50]" />
                                    <span className="flex-1 text-xs font-semibold text-[#4CAF50]">
                                        تم خصم {pointsDiscount} ج.م من نقاطك
                                    </span>
                                    <button
                                        type="button"
                                        aria-label="إلغاء الخصم"
                                        onClick={() => {
                                            setPointsDiscount(0);
                                            setPointsToRedeem(0);
                                        }}
                                    >
                                        <Icon name="close-circle" size={20} className="text-muted" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2.5">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        className="az-input flex-1 text-center"
                                        placeholder="عدد النقاط"
                                        value={pointsToRedeem > 0 ? pointsToRedeem : ''}
                                        onChange={(e) =>
                                            setPointsToRedeem(
                                                Math.min(parseInt(e.target.value, 10) || 0, loyaltyPoints)
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRedeemPoints}
                                        disabled={pointsToRedeem < 100 || redeemingPoints}
                                        className="shrink-0 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-50"
                                    >
                                        {redeemingPoints ? <Spinner size={16} /> : 'استرداد'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Order summary */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <Icon name="receipt-outline" size={20} className="text-primary" />
                        <h2 className="text-base font-bold text-text">ملخص الطلب</h2>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-4">
                        {items.map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                className="flex items-center justify-between py-1"
                            >
                                <span className="flex min-w-0 items-center gap-2">
                                    <span className="text-xs font-bold text-primary">
                                        <Ltr>{item.quantity}x</Ltr>
                                    </span>
                                    <span className="truncate text-xs text-text">{item.name}</span>
                                </span>
                                <span className="shrink-0 text-xs text-muted">
                                    {egp(item.price * item.quantity)}
                                </span>
                            </div>
                        ))}

                        <div className="my-3 h-px bg-border" />

                        <SummaryRow label="المجموع الفرعي" value={egp(getSubtotal())} />
                        {appliedCoupon && (
                            <SummaryRow
                                label={`خصم الكوبون (${appliedCoupon.code})`}
                                value={`- ${egp(getDiscount())}`}
                                accent
                            />
                        )}
                        {pointsDiscount > 0 && (
                            <SummaryRow label="خصم النقاط ⭐" value={`- ${egp(pointsDiscount)}`} accent />
                        )}
                        {birthdayDiscountAmount > 0 && (
                            <SummaryRow
                                label="خصم عيد الميلاد 🎂"
                                value={`- ${egp(birthdayDiscountAmount)}`}
                                accent
                            />
                        )}
                        <SummaryRow
                            label="التوصيل"
                            value={getDeliveryFee() === 0 ? 'مجاناً' : egp(getDeliveryFee())}
                            accent={getDeliveryFee() === 0}
                        />

                        <div className="my-3 h-px bg-border" />

                        <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-text">المجموع الكلي</span>
                            <span className="text-xl font-extrabold text-primary">{egp(finalTotal)}</span>
                        </div>
                    </div>
                </section>
            </div>

            <div className="fixed inset-x-0 bottom-tabbar z-40 border-t border-border bg-surface/95 backdrop-blur">
                <div className="app-width px-6 py-4">
                    <Button
                        title={`تأكيد الطلب  •  ${egp(finalTotal)}`}
                        onClick={handlePlaceOrder}
                        loading={loading}
                        size="large"
                    />
                </div>
            </div>
        </main>
    );
}

function SummaryRow({ label, value, accent }) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-sm text-muted">{label}</span>
            <span className={cx('text-sm font-semibold', accent ? 'text-[#4CAF50]' : 'text-text')}>
                {value}
            </span>
        </div>
    );
}
