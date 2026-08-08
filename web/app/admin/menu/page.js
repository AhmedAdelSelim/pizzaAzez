'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import { foodImage } from '@/lib/imageUrl';
import { cx, egp, searchFilter } from '@/lib/utils';

export default function AdminMenuPage() {
    const { token } = useAuth();
    const { fetchMenu } = useMenu();
    const { alert, confirm, toast } = useUI();
    const [searchQuery, setSearchQuery] = useState('');

    const fetchItems = useCallback(() => api.getMenuItems(), []);
    const {
        data: menuItems,
        loading,
        reload: loadMenu,
        setData: setMenuItems,
    } = useApiResource(fetchItems, {
        initialData: [],
        onError: (error) => alert('خطأ', error.message),
    });

    const filteredItems = useMemo(
        () => searchFilter(menuItems, searchQuery, ['name', 'category_id']),
        [menuItems, searchQuery]
    );

    const handleDelete = async (item) => {
        const ok = await confirm('تأكيد الحذف', `هل أنت متأكد من حذف "${item.name}"؟`, {
            confirmText: 'حذف',
            destructive: true,
        });
        if (!ok) return;

        try {
            await api.deleteMenuItemAdmin(item.id, token);
            toast('تم حذف العنصر', 'success');
            loadMenu();
            fetchMenu();
        } catch (error) {
            alert('خطأ', error.message);
        }
    };

    const handleToggleAvailability = async (item) => {
        const next = item.is_available === false;
        try {
            await api.toggleMenuItemAvailability(item.id, next, token);
            setMenuItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, is_available: next } : i))
            );
            fetchMenu();
        } catch (error) {
            alert('خطأ', error.message);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="إدارة القائمة"
                backHref="/admin"
                action={
                    <Link
                        href="/admin/menu/new"
                        aria-label="إضافة صنف"
                        className="grid size-10 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
                    >
                        <Icon name="add" size={24} />
                    </Link>
                }
            />

            <div className="p-5 pb-3">
                <SearchBar placeholder="ابحث في المنيو..." value={searchQuery} onChange={setSearchQuery} />
            </div>

            {loading ? (
                <div className="grid flex-1 place-items-center text-primary">
                    <Spinner size={36} />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="restaurant-outline" size={64} />
                    <p className="text-sm">القائمة فارغة</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5 pt-2">
                    {filteredItems.map((item) => (
                        <article
                            key={item.id}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
                        >
                            <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-background-light">
                                {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={foodImage(item.image, { width: 56, ratio: '1:1' })}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <Icon name="fast-food-outline" size={32} className="text-primary" />
                                )}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-text">{item.name}</p>
                                <p className="text-xs text-primary">{egp(item.price)}</p>
                                <button
                                    type="button"
                                    onClick={() => handleToggleAvailability(item)}
                                    className={cx(
                                        'mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition',
                                        item.is_available === false
                                            ? 'bg-error/15 text-error'
                                            : 'bg-accent/15 text-accent'
                                    )}
                                >
                                    {item.is_available === false ? 'غير متاح' : 'متاح'}
                                </button>
                            </div>

                            <div className="flex shrink-0 gap-2">
                                <Link
                                    href={`/admin/menu/${item.id}`}
                                    aria-label="تعديل"
                                    className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary transition hover:bg-primary/25"
                                >
                                    <Icon name="pencil" size={20} />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    aria-label="حذف"
                                    className="grid size-10 place-items-center rounded-xl bg-error/15 text-error transition hover:bg-error/25"
                                >
                                    <Icon name="trash" size={20} />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
