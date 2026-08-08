'use client';

import { useCallback, useState } from 'react';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';

export default function AdminCategoriesPage() {
    const { token } = useAuth();
    const { fetchMenu } = useMenu();
    const { alert, confirm, toast } = useUI();

    const [modalOpen, setModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = useCallback(() => api.getAdminCategories(token), [token]);
    const {
        data: categories,
        loading,
        reload: loadCategories,
    } = useApiResource(fetchCategories, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => alert('خطأ', error.message),
    });

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            alert('تنبيه', 'يرجى إدخال اسم القسم');
            return;
        }

        try {
            setSubmitting(true);
            await api.addCategory(
                { name: newCategoryName.trim(), icon: newCategoryIcon.trim() || '🍕' },
                token
            );
            setModalOpen(false);
            setNewCategoryName('');
            setNewCategoryIcon('');
            loadCategories();
            fetchMenu();
            toast('تم إضافة القسم بنجاح', 'success');
        } catch (error) {
            alert('خطأ', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async (category) => {
        const ok = await confirm(
            'حذف القسم',
            `هل أنت متأكد من حذف قسم "${category.name}"؟ سيؤدي ذلك لإخفائه من القائمة.`,
            { confirmText: 'حذف', destructive: true }
        );
        if (!ok) return;

        try {
            await api.deleteCategory(category.id, token);
            loadCategories();
            fetchMenu();
            toast('تم حذف القسم بنجاح', 'success');
        } catch (error) {
            alert('خطأ', error.message);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="إدارة الأقسام"
                backHref="/admin"
                action={
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        aria-label="إضافة قسم"
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
            ) : categories.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="folder-open-outline" size={64} />
                    <p className="text-sm">لا يوجد أقسام مضافة</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                        >
                            <span className="text-2xl">{category.icon || '🍕'}</span>
                            <span className="flex-1 text-sm font-bold text-text">{category.name}</span>
                            <button
                                type="button"
                                onClick={() => handleDeleteCategory(category)}
                                aria-label="حذف"
                                className="grid size-10 place-items-center rounded-xl bg-error/15 text-error transition hover:bg-error/25"
                            >
                                <Icon name="trash-outline" size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="إضافة قسم جديد">
                <input
                    className="az-input mb-3"
                    placeholder="اسم القسم (مثلاً: بيتزا، مشروبات)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <input
                    className="az-input mb-4"
                    placeholder="أيقونة القسم (إيموجي، مثلاً 🍕)"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                />
                <div className="flex gap-3">
                    <Button
                        title="إلغاء"
                        variant="secondary"
                        onClick={() => setModalOpen(false)}
                    />
                    <Button
                        title={submitting ? 'جاري الحفظ...' : 'حفظ'}
                        onClick={handleAddCategory}
                        loading={submitting}
                    />
                </div>
            </Modal>
        </main>
    );
}
