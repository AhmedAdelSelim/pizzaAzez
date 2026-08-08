'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { useUI } from '@/context/UIContext';
import api from '@/lib/api';
import { cx } from '@/lib/utils';

/** Shared by the "new item" and "edit item" admin routes. */
export default function MenuItemForm({ itemId }) {
    const router = useRouter();
    const { token } = useAuth();
    const { fetchMenu } = useMenu();
    const { alert, toast } = useUI();

    const isEdit = Boolean(itemId);
    const [loadingItem, setLoadingItem] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image: '',
        calories: '',
        preparation_time: '',
        is_available: true,
    });

    useEffect(() => {
        api.getCategories()
            .then((data) => {
                setCategories(data);
                if (!isEdit && data.length > 0) {
                    setForm((prev) => ({ ...prev, category_id: prev.category_id || data[0].id }));
                }
            })
            .catch((err) => console.log('Failed to fetch categories:', err));
    }, [isEdit]);

    useEffect(() => {
        if (!isEdit) return;
        api.getMenuItem(itemId)
            .then((item) =>
                setForm({
                    name: item.name || '',
                    description: item.description || '',
                    price: item.price?.toString() || '',
                    category_id: item.category_id || '',
                    image: item.image || '',
                    calories: item.calories?.toString() || '',
                    preparation_time: item.preparation_time || '',
                    is_available: item.is_available !== false,
                })
            )
            .catch((error) => alert('خطأ', error.message))
            .finally(() => setLoadingItem(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId, isEdit]);

    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.category_id) {
            alert('تنبيه', 'يرجى إدخال الاسم والسعر والقسم');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price),
                calories: form.calories ? parseInt(form.calories, 10) : null,
            };

            if (isEdit) await api.updateMenuItemAdmin(itemId, payload, token);
            else await api.addMenuItem(payload, token);

            toast(isEdit ? 'تم تحديث العنصر' : 'تم إضافة العنصر', 'success');
            fetchMenu();
            router.push('/admin/menu');
        } catch (error) {
            alert('خطأ', error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loadingItem) {
        return (
            <main className="flex flex-1 flex-col">
                <PageHeader title="تعديل الصنف" backHref="/admin/menu" />
                <div className="grid flex-1 place-items-center text-primary">
                    <Spinner size={36} />
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader title={isEdit ? 'تعديل الصنف' : 'صنف جديد'} backHref="/admin/menu" />

            <form onSubmit={handleSave} className="flex flex-col gap-4 p-5">
                <Field label="اسم الصنف *">
                    <input
                        className="az-input"
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="مثال: بيتزا مارجريتا"
                    />
                </Field>

                <Field label="الوصف">
                    <textarea
                        className="az-input min-h-24 resize-y"
                        value={form.description}
                        onChange={(e) => set('description', e.target.value)}
                        placeholder="مكونات الصنف وتفاصيله"
                    />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="السعر (ج.م) *">
                        <input
                            type="number"
                            step="0.01"
                            className="az-input"
                            value={form.price}
                            onChange={(e) => set('price', e.target.value)}
                            placeholder="0.00"
                        />
                    </Field>
                    <Field label="السعرات (اختياري)">
                        <input
                            type="number"
                            className="az-input"
                            value={form.calories}
                            onChange={(e) => set('calories', e.target.value)}
                            placeholder="مثال: 450"
                        />
                    </Field>
                </div>

                <Field label="وقت التحضير (اختياري)">
                    <input
                        className="az-input"
                        value={form.preparation_time}
                        onChange={(e) => set('preparation_time', e.target.value)}
                        placeholder="مثال: ٢٠ دقيقة"
                    />
                </Field>

                <Field label="رابط الصورة (URL)">
                    <input
                        className="az-input"
                        dir="ltr"
                        value={form.image}
                        onChange={(e) => set('image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                </Field>

                <Field label="القسم *">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => set('category_id', category.id)}
                                className={cx(
                                    'rounded-full border px-4 py-2 text-xs transition',
                                    form.category_id === category.id
                                        ? 'border-primary bg-primary font-bold text-white'
                                        : 'border-border bg-surface text-muted hover:border-primary/50'
                                )}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </Field>

                <label className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                    <span className="text-sm font-semibold text-text">متاح للطلب</span>
                    <input
                        type="checkbox"
                        className="size-5 accent-[var(--color-primary)]"
                        checked={form.is_available}
                        onChange={(e) => set('is_available', e.target.checked)}
                    />
                </label>

                <Button type="submit" title="حفظ" loading={saving} size="large" />
            </form>
        </main>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text">{label}</span>
            {children}
        </label>
    );
}
