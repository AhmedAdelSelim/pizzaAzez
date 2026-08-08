'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Ltr from '@/components/Ltr';
import Icon from '@/components/Icon';
import Spinner from '@/components/Spinner';
import { LAST_ORDER_KEY } from '@/lib/storage';
import { egp } from '@/lib/utils';

const PAYMENT_LABELS = {
    vodafone_cash: '📱 فودافون كاش',
    fawry: '🏪 فوري',
    cod: '💵 عند الاستلام',
};

export default function OrderConfirmationPage() {
    const router = useRouter();
    // Read once on mount — checkout stashes the placed order in sessionStorage.
    const [result] = useState(() => {
        if (typeof window === 'undefined') return undefined;
        try {
            const raw = sessionStorage.getItem(LAST_ORDER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (result === null) router.replace('/');
    }, [result, router]);

    if (!result) {
        return (
            <main className="grid flex-1 place-items-center text-primary">
                <Spinner size={36} />
            </main>
        );
    }

    const order = result.order || {};
    const pointsEarned = result.points_earned || 0;

    return (
        <main className="flex flex-1 flex-col justify-center px-6 py-10">
            <div className="mb-8 flex justify-center">
                <span className="grid size-28 place-items-center rounded-full bg-accent animate-stamp">
                    <Icon name="checkmark" size={60} className="text-white" />
                </span>
            </div>

            <div className="animate-rise">
                <h1 className="text-center text-2xl font-extrabold text-text">تم تأكيد طلبك!</h1>
                <p className="mb-6 mt-1 text-center text-sm text-muted">طلبك في الطريق إليك 🚀</p>

                <div className="rounded-2xl border border-border bg-surface p-5">
                    <DetailRow label="رقم الطلب" value={<Ltr>{String(order.id || '').substring(0, 8)}</Ltr>} />
                    <Divider />
                    <DetailRow label="الوقت المتوقع" value={result.estimatedTime || '٣٠-٤٥ دقيقة'} />
                    {order.discount > 0 && (
                        <>
                            <Divider />
                            <DetailRow
                                label="الخصم"
                                value={`- ${egp(order.discount)}`}
                                valueClass="text-[#4CAF50]"
                            />
                        </>
                    )}
                    <Divider />
                    <DetailRow
                        label="المجموع"
                        value={egp(order.total)}
                        valueClass="text-lg font-extrabold text-primary"
                    />
                    <Divider />
                    <DetailRow
                        label="الدفع"
                        value={PAYMENT_LABELS[order.payment_method] || PAYMENT_LABELS.cod}
                    />
                </div>

                {pointsEarned > 0 && (
                    <div
                        className="mt-4 flex items-center gap-3 rounded-2xl p-4 animate-stamp"
                        style={{ background: 'linear-gradient(to left, #3D2800, #5C3D00)' }}
                    >
                        <span className="text-3xl">⭐</span>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-star">ربحت {pointsEarned} نقطة!</p>
                            <p className="text-[11px] text-white/70">استخدمها في طلبك القادم</p>
                        </div>
                        <span className="rounded-full bg-star/20 px-3 py-1 text-sm font-extrabold text-star">
                            +{pointsEarned}
                        </span>
                    </div>
                )}

                <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted">
                    <Icon name="information-circle-outline" size={18} />
                    سنتصل بك عند وصول طلبك
                </p>

                <div className="mt-8 flex flex-col gap-3">
                    <Button title="تتبّع الطلب" variant="outline" size="large" onClick={() => router.push('/orders')} />
                    <Button title="العودة للرئيسية" size="large" onClick={() => router.replace('/')} />
                </div>
            </div>
        </main>
    );
}

function DetailRow({ label, value, valueClass = 'text-text' }) {
    return (
        <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-muted">{label}</span>
            <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
        </div>
    );
}

function Divider() {
    return <div className="h-px bg-border" />;
}
