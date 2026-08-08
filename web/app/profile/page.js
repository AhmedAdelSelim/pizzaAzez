'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import Ltr from '@/components/Ltr';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import api from '@/lib/api';
import { cx } from '@/lib/utils';

/**
 * An entry either navigates (`href`) or explains itself (`note`).
 *
 * The `note` form exists because the RN screen these were ported from left some
 * rows deliberately inert, and the port gave them arbitrary destinations to fill
 * the gap — "طريقة الدفع" pointed at /checkout, which redirects straight back to
 * /cart whenever the cart is empty. Saying "cash only" is more use than a row
 * that bounces you somewhere unrelated.
 */
const MENU_ITEMS = [
    { icon: 'person-outline', label: 'تعديل الملف الشخصي', href: '/profile/edit' },
    { icon: 'time-outline', label: 'سجل الطلبات', href: '/orders' },
    { icon: 'heart-outline', label: 'المفضلة', href: '/favorites' },
    { icon: 'location-outline', label: 'عناوين التوصيل', href: '/profile/edit#address' },
    {
        icon: 'card-outline',
        label: 'طريقة الدفع',
        note: {
            title: 'طريقة الدفع',
            message: 'الدفع عند الاستلام نقداً هو الطريقة الوحيدة المتاحة حالياً.',
        },
    },
    { icon: 'help-circle-outline', label: 'المساعدة والدعم', href: '/about' },
    { icon: 'bulb-outline', label: 'الاقتراحات والشكاوي', href: '/suggestions' },
    { icon: 'information-circle-outline', label: 'عن التطبيق', href: '/about' },
];

const VIP_BENEFITS = [
    { icon: 'gift-outline', text: 'خصومات حصرية تصل إلى ٢٥٪ على جميع الطلبات', color: '#FFD700' },
    { icon: 'restaurant-outline', text: 'تجربة أصناف جديدة قبل الجميع', color: '#E85D2C' },
    { icon: 'headset-outline', text: 'خدمة عملاء مخصصة وذات أولوية', color: '#00C9A7' },
    { icon: 'car-outline', text: 'توصيل مجاني للطلبات فوق ١٠٠ ج.م', color: '#2196F3' },
];

function getLoyaltyTier(points) {
    if (points >= 1000) return { label: 'ذهبي', icon: '🥇', color: '#FFD700', next: null };
    if (points >= 500)
        return { label: 'فضي', icon: '🥈', color: '#C0C0C0', next: 1000, needed: 1000 - points };
    return { label: 'برونزي', icon: '🥉', color: '#CD7F32', next: 500, needed: 500 - points };
}

export default function ProfilePage() {
    const { user, token, logout, refreshProfile } = useAuth();
    const { alert, confirm, toast } = useUI();

    const [isRequesting, setIsRequesting] = useState(false);
    const [showVipModal, setShowVipModal] = useState(false);
    const [loyaltyPoints, setLoyaltyPoints] = useState(null);
    const [referralStats, setReferralStats] = useState(null);

    useEffect(() => {
        if (!token) return;
        refreshProfile();
        api.getLoyaltyPoints(token)
            .then((d) => setLoyaltyPoints(d.points || 0))
            .catch(() => { });
        api.getReferralStats(token)
            .then(setReferralStats)
            .catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const isVip = user?.vip_status === 'vip';
    const loyaltyTier = loyaltyPoints !== null ? getLoyaltyTier(loyaltyPoints) : null;
    const referralCode = user?.phone ? `AZEZ${user.phone.slice(-4)}` : null;

    const handleShareReferral = async () => {
        if (!referralCode) return;
        const message = `استخدم كود الإحالة الخاص بي ${referralCode} في تطبيق بيتزا عزيز واحصل على 50 نقطة مجاناً! 🍕`;
        try {
            if (navigator.share) {
                await navigator.share({ text: message });
            } else {
                await navigator.clipboard.writeText(message);
                toast('تم نسخ كود الإحالة', 'success');
            }
        } catch {
            // user dismissed the share sheet
        }
    };

    const handleLogout = async () => {
        const ok = await confirm('تسجيل الخروج', 'هل أنت متأكد أنك تريد تسجيل الخروج؟', {
            confirmText: 'خروج',
            destructive: true,
        });
        if (ok) logout();
    };

    const handleRequestVip = async () => {
        setIsRequesting(true);
        try {
            await api.requestVip(token);
            setShowVipModal(false);
            toast('تم إرسال طلب الانضمام للـ VIP بنجاح', 'success');
            await refreshProfile();
        } catch (error) {
            alert('خطأ', error.message);
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <header className="px-6 pb-4 pt-8">
                <h1 className="text-2xl font-bold text-text">حسابي</h1>
            </header>

            <div className="flex flex-col gap-4 px-6 pb-6">
                {/* User card */}
                <section
                    className={cx(
                        'flex items-center gap-4 rounded-2xl p-5',
                        isVip ? 'border border-star/40' : 'border border-border'
                    )}
                    style={{
                        background: isVip
                            ? 'linear-gradient(135deg, #2D2000, #1A1A2E)'
                            : 'var(--color-surface)',
                    }}
                >
                    <span
                        className={cx(
                            'grid size-18 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-light',
                            isVip && 'ring-2 ring-star'
                        )}
                    >
                        {user?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.image} alt="" className="size-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-primary">
                                {user?.name?.charAt(0)?.toUpperCase() || '؟'}
                            </span>
                        )}
                    </span>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-bold text-text">
                            {user?.name || 'المستخدم'}
                        </p>
                        <p className="text-xs text-muted" dir="ltr">
                            {user?.phone || 'بدون رقم هاتف'}
                        </p>

                        <div className="mt-2">
                            {isVip ? (
                                <span className="inline-block rounded-full bg-star/15 px-3 py-1 text-xs font-bold text-star animate-vip-glow">
                                    👑 عضو VIP
                                </span>
                            ) : user?.vip_status === 'pending' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-3 py-1 text-xs font-bold text-warning">
                                    <Icon name="time-outline" size={12} />
                                    الطلب قيد المراجعة
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowVipModal(true)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-light px-3 py-1.5 text-xs font-bold text-text transition hover:bg-border"
                                >
                                    <Icon name="star" size={13} className="text-star" />
                                    انضم للـ VIP
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Loyalty */}
                {loyaltyTier && (
                    <section
                        className="flex items-center justify-between rounded-2xl p-5"
                        style={{ background: 'linear-gradient(to left, #3D2800, #1A1A2E)' }}
                    >
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-lg">{loyaltyTier.icon}</span>
                                <span className="text-sm font-bold" style={{ color: loyaltyTier.color }}>
                                    {loyaltyTier.label}
                                </span>
                            </div>
                            <p className="text-2xl font-extrabold text-text">{loyaltyPoints} نقطة</p>
                            {loyaltyTier.next && (
                                <p className="text-[11px] text-muted">
                                    {loyaltyTier.needed} نقطة للمستوى التالي
                                </p>
                            )}
                            <p className="text-[11px] text-muted">100 نقطة = خصم 10 ج.م</p>
                        </div>
                        <span className="text-5xl">{loyaltyTier.icon}</span>
                    </section>
                )}

                {/* Referral */}
                {referralCode && (
                    <section className="rounded-2xl border border-border bg-surface p-5">
                        <div className="mb-1 flex items-center gap-2">
                            <Icon name="people-outline" size={20} className="text-accent" />
                            <h2 className="text-base font-bold text-text">كود الإحالة</h2>
                        </div>
                        <p className="mb-3 text-xs text-muted">
                            شارك كودك واحصل على 50 نقطة لكل صديق
                        </p>

                        {referralStats?.referral_count > 0 && (
                            <div className="mb-3 flex items-center rounded-xl bg-background-light py-3">
                                <div className="flex-1 text-center">
                                    <p className="text-lg font-extrabold text-accent">
                                        {referralStats.referral_count}
                                    </p>
                                    <p className="text-[10px] text-muted">صديق</p>
                                </div>
                                <div className="h-8 w-px bg-border" />
                                <div className="flex-1 text-center">
                                    <p className="text-lg font-extrabold text-star">
                                        {referralStats.points_from_referrals}
                                    </p>
                                    <p className="text-[10px] text-muted">نقطة مكتسبة</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <span className="flex-1 rounded-xl border border-dashed border-accent/50 bg-background-light py-2.5 text-center text-base font-extrabold tracking-widest text-accent">
                                <Ltr>{referralCode}</Ltr>
                            </span>
                            <button
                                type="button"
                                onClick={handleShareReferral}
                                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark"
                            >
                                <Icon name="share-social-outline" size={18} />
                                شارك
                            </button>
                        </div>
                    </section>
                )}

                {/* Menu */}
                <section className="overflow-hidden rounded-2xl border border-border bg-surface">
                    {user?.role === 'admin' && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 border-b border-border p-4 transition hover:bg-surface-light"
                        >
                            <span className="grid size-10 place-items-center rounded-xl bg-primary/15">
                                <Icon name="shield-checkmark" size={20} className="text-primary" />
                            </span>
                            <span className="flex-1 text-sm font-medium text-text">لوحة الإدارة</span>
                            <Icon name="chevron-back" size={18} className="text-muted" />
                        </Link>
                    )}

                    {MENU_ITEMS.map((item, index) => {
                        const rowClass = cx(
                            'flex w-full items-center gap-3 p-4 text-right transition hover:bg-surface-light',
                            index < MENU_ITEMS.length - 1 && 'border-b border-border'
                        );
                        const body = (
                            <>
                                <span className="grid size-10 place-items-center rounded-xl bg-background-light">
                                    <Icon name={item.icon} size={20} className="text-primary" />
                                </span>
                                <span className="flex-1 text-sm font-medium text-text">
                                    {item.label}
                                </span>
                                <Icon name="chevron-back" size={18} className="text-muted" />
                            </>
                        );

                        return item.href ? (
                            <Link key={item.label} href={item.href} className={rowClass}>
                                {body}
                            </Link>
                        ) : (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => alert(item.note.title, item.note.message)}
                                className={rowClass}
                            >
                                {body}
                            </button>
                        );
                    })}
                </section>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-error/30 py-4 text-sm font-bold text-error transition hover:bg-error/10"
                >
                    <Icon name="log-out-outline" size={22} />
                    تسجيل الخروج
                </button>

                <p className="text-center text-[11px] text-muted">بيتزا عزيز • الإصدار ١.٠.٠</p>
            </div>

            {/* VIP benefits modal */}
            {showVipModal && (
                <div
                    className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 sm:items-center sm:p-6 animate-fade-in"
                    onClick={() => setShowVipModal(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="w-full max-w-md overflow-hidden rounded-t-3xl bg-surface animate-slide-up sm:rounded-3xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="p-6 text-center"
                            style={{ background: 'linear-gradient(135deg, #3D2800, #232946)' }}
                        >
                            <p className="text-4xl">👑</p>
                            <h2 className="mt-2 text-xl font-bold text-text">مميزات عضوية VIP</h2>
                            <p className="text-xs text-muted">انضم للنخبة واستمتع بمزايا حصرية</p>
                        </div>

                        <div className="flex flex-col gap-3 p-6">
                            {VIP_BENEFITS.map((benefit) => (
                                <div key={benefit.text} className="flex items-center gap-3">
                                    <span
                                        className="grid size-10 shrink-0 place-items-center rounded-xl"
                                        style={{ background: `${benefit.color}20` }}
                                    >
                                        <Icon name={benefit.icon} size={20} color={benefit.color} />
                                    </span>
                                    <span className="flex-1 text-xs leading-5 text-text">
                                        {benefit.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 pb-6">
                            <button
                                type="button"
                                onClick={handleRequestVip}
                                disabled={isRequesting}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-primary to-primary-dark py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-70"
                            >
                                {isRequesting ? (
                                    <Spinner size={18} />
                                ) : (
                                    <>
                                        <Icon name="star" size={18} className="text-star" />
                                        تأكيد طلب الانضمام
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowVipModal(false)}
                                className="mt-2 w-full py-3 text-sm text-muted transition hover:text-text"
                            >
                                ليس الآن
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
