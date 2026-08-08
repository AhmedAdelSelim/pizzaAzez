'use client';

import { useCallback, useState } from 'react';
import Button from '@/components/Button';
import Ltr from '@/components/Ltr';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import { cx } from '@/lib/utils';

export default function AdminCouponsPage() {
    const { token } = useAuth();
    const { alert, confirm, toast } = useUI();

    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [isActive, setIsActive] = useState(true);

    const fetchCoupons = useCallback(() => api.getAdminCoupons(token), [token]);
    const {
        data: coupons,
        loading,
        reload: loadCoupons,
    } = useApiResource(fetchCoupons, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => alert('خطأ', error.message),
    });

    const resetForm = () => {
        setCode('');
        setDiscountType('percentage');
        setDiscountValue('');
        setIsActive(true);
    };

    const handleAddCoupon = async () => {
        if (!code.trim() || !discountValue) {
            alert('تنبيه', 'يرجى إكمال جميع الحقول');
            return;
        }

        try {
            setSubmitting(true);
            await api.addCoupon(
                {
                    code: code.trim().toUpperCase(),
                    type: discountType,
                    value: parseFloat(discountValue),
                    is_active: isActive,
                },
                token
            );
            setModalOpen(false);
            resetForm();
            loadCoupons();
            toast('تم إضافة الكوبون بنجاح', 'success');
        } catch (error) {
            alert('خطأ', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCoupon = async (coupon) => {
        const ok = await confirm('حذف الكوبون', `هل أنت متأكد من حذف كود الخصم "${coupon.code}"؟`, {
            confirmText: 'حذف',
            destructive: true,
        });
        if (!ok) return;

        try {
            await api.deleteCoupon(coupon.id, token);
            loadCoupons();
            toast('تم حذف الكوبون بنجاح', 'success');
        } catch (error) {
            alert('خطأ', error.message);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="إدارة الكوبونات"
                backHref="/admin"
                action={
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        aria-label="إضافة كوبون"
                        className="grid size-10 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
                    >
                        <Icon name="add" size={24} />
                    </button>
                }
            />

            {loading ? (
                <div className="grid flex-1 place-items-center text-primary">
                    <Spinner size={36} />
                </div>
            ) : coupons.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="ticket-outline" size={64} />
                    <p className="text-sm">لا توجد كوبونات مضافة</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5">
                    {coupons.map((coupon) => (
                        <div key={coupon.id} className="rounded-2xl border border-border bg-surface p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-base font-extrabold tracking-widest text-primary">
                                    <Ltr>{coupon.code}</Ltr>
                                </span>
                                <span
                                    className={cx(
                                        'rounded-full px-3 py-1 text-[11px] font-semibold',
                                        coupon.is_active
                                            ? 'bg-accent/15 text-accent'
                                            : 'bg-muted/20 text-muted'
                                    )}
                                >
                                    {coupon.is_active ? 'نشط' : 'معطل'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted">
                                    الخصم: {coupon.value}
                                    {coupon.type === 'percentage' ? '%' : ' ج.م'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteCoupon(coupon)}
                                    aria-label="حذف"
                                    className="grid size-9 place-items-center rounded-xl bg-error/15 text-error transition hover:bg-error/25"
                                >
                                    <Icon name="trash-outline" size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    resetForm();
                }}
                title="إضافة كوبون جديد"
            >
                <label className="mb-3 block">
                    <span className="mb-2 block text-sm font-semibold text-text">كود الخصم</span>
                    <input
                        className="az-input uppercase"
                        placeholder="مثلاً: PIZZA10"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                    />
                </label>

                <div className="mb-3">
                    <span className="mb-2 block text-sm font-semibold text-text">نوع الخصم</span>
                    <div className="flex gap-2">
                        {[
                            { value: 'percentage', label: 'نسبة مئوية (%)' },
                            { value: 'fixed', label: 'مبلغ ثابت' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setDiscountType(option.value)}
                                className={cx(
                                    'flex-1 rounded-xl border py-2.5 text-xs transition',
                                    discountType === option.value
                                        ? 'border-primary bg-primary font-bold text-white'
                                        : 'border-border bg-background-light text-muted'
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <label className="mb-3 block">
                    <span className="mb-2 block text-sm font-semibold text-text">قيمة الخصم</span>
                    <input
                        type="number"
                        className="az-input"
                        placeholder="القيمة"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                    />
                </label>

                <button
                    type="button"
                    onClick={() => setIsActive((v) => !v)}
                    className="mb-5 flex items-center gap-2.5 text-sm text-text"
                >
                    <Icon
                        name={isActive ? 'checkbox' : 'square-outline'}
                        size={24}
                        className={isActive ? 'text-primary' : 'text-muted'}
                    />
                    تفعيل الكوبون فوراً
                </button>

                <div className="flex gap-3">
                    <Button
                        title="إلغاء"
                        variant="secondary"
                        onClick={() => {
                            setModalOpen(false);
                            resetForm();
                        }}
                    />
                    <Button
                        title={submitting ? 'جاري الحفظ...' : 'حفظ'}
                        onClick={handleAddCoupon}
                        loading={submitting}
                    />
                </div>
            </Modal>
        </main>
    );
}
