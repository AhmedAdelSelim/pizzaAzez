'use client';

import { useCallback, useState } from 'react';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import { egp } from '@/lib/utils';

export default function AdminDeliveryZonesPage() {
    const { token } = useAuth();
    const { alert, confirm, toast } = useUI();

    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const [name, setName] = useState('');
    const [fee, setFee] = useState('');

    const fetchZones = useCallback(() => api.getAdminDeliveryZones(token), [token]);
    const {
        data: zones,
        loading,
        reload: loadZones,
    } = useApiResource(fetchZones, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => alert('خطأ', error.message),
    });

    const resetForm = () => {
        setName('');
        setFee('');
        setEditItem(null);
    };

    const closeModal = () => {
        setModalOpen(false);
        resetForm();
    };

    const handleSaveZone = async () => {
        if (!name.trim() || !fee) {
            alert('تنبيه', 'يرجى إدخال اسم المنطقة وسعر التوصيل');
            return;
        }

        try {
            setSubmitting(true);
            const payload = { name: name.trim(), price: parseFloat(fee) };

            if (editItem) await api.updateDeliveryZone(editItem.id, payload, token);
            else await api.addDeliveryZone(payload, token);

            toast(editItem ? 'تم تحديث المنطقة بنجاح' : 'تم إضافة المنطقة بنجاح', 'success');
            closeModal();
            loadZones();
        } catch (error) {
            alert('خطأ', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (zone) => {
        setEditItem(zone);
        setName(zone.name);
        setFee(String(zone.price));
        setModalOpen(true);
    };

    const handleDeleteZone = async (zone) => {
        const ok = await confirm('حذف المنطقة', `هل أنت متأكد من حذف منطقة "${zone.name}"؟`, {
            confirmText: 'حذف',
            destructive: true,
        });
        if (!ok) return;

        try {
            await api.deleteDeliveryZone(zone.id, token);
            loadZones();
            toast('تم حذف المنطقة بنجاح', 'success');
        } catch (error) {
            alert('خطأ', error.message);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="مناطق التوصيل"
                backHref="/admin"
                action={
                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setModalOpen(true);
                        }}
                        aria-label="إضافة منطقة"
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
            ) : zones.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="map-outline" size={64} />
                    <p className="text-sm">لا توجد مناطق مضافة</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5">
                    {zones.map((zone) => (
                        <div
                            key={zone.id}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-text">{zone.name}</p>
                                <p className="text-xs text-muted">سعر التوصيل: {egp(zone.price)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleEdit(zone)}
                                aria-label="تعديل"
                                className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary transition hover:bg-primary/25"
                            >
                                <Icon name="pencil-outline" size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteZone(zone)}
                                aria-label="حذف"
                                className="grid size-10 place-items-center rounded-xl bg-error/15 text-error transition hover:bg-error/25"
                            >
                                <Icon name="trash-outline" size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editItem ? 'تعديل منطقة توصيل' : 'إضافة منطقة توصيل'}
            >
                <input
                    className="az-input mb-3"
                    placeholder="اسم المنطقة (مثلاً: مدينة نصر)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="number"
                    className="az-input mb-5"
                    placeholder="سعر التوصيل (ج.م)"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                />
                <div className="flex gap-3">
                    <Button title="إلغاء" variant="secondary" onClick={closeModal} />
                    <Button
                        title={submitting ? 'جاري الحفظ...' : 'حفظ'}
                        onClick={handleSaveZone}
                        loading={submitting}
                    />
                </div>
            </Modal>
        </main>
    );
}
