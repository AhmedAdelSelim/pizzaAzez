'use client';

import { useCallback, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useSSE } from '@/context/SSEContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';

export default function AdminStoriesPage() {
    const { token } = useAuth();
    const sse = useSSE();
    const { alert, confirm, toast } = useUI();

    const fetchStories = useCallback(() => api.getAdminStories(token), [token]);
    const {
        data: stories,
        loading,
        setData: setStories,
    } = useApiResource(fetchStories, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => alert('خطأ', error.message),
    });

    // Stay in sync with realtime story events
    useEffect(() => {
        const unsubAdd = sse.on('new_story', (story) => setStories((prev) => [...prev, story]));
        const unsubDel = sse.on('story_deleted', ({ id }) =>
            setStories((prev) => prev.filter((s) => s.id !== id))
        );
        return () => {
            unsubAdd();
            unsubDel();
        };
    }, [sse, setStories]);

    const handleDelete = async (story) => {
        const ok = await confirm('تأكيد الحذف', 'هل أنت متأكد من حذف هذه القصة؟', {
            confirmText: 'حذف',
            destructive: true,
        });
        if (!ok) return;

        try {
            await api.deleteStoryAdmin(story.id, token);
            setStories((prev) => prev.filter((s) => s.id !== story.id));
            toast('تم حذف القصة', 'success');
        } catch (error) {
            alert('خطأ', error.message);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader
                title="إدارة القصص"
                backHref="/admin"
                action={
                    <Link
                        href="/admin/stories/new"
                        aria-label="إضافة قصة"
                        className="grid size-10 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
                    >
                        <Icon name="add" size={24} />
                    </Link>
                }
            />

            {loading ? (
                <div className="grid flex-1 place-items-center text-primary">
                    <Spinner size={36} />
                </div>
            ) : stories.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="images-outline" size={64} />
                    <p className="text-sm">لا توجد قصص حتى الآن</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5">
                    {stories.map((story) => (
                        <div
                            key={story.id}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
                        >
                            <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-background-light">
                                {story.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={story.image} alt="" className="size-full object-cover" />
                                ) : (
                                    <Icon name="text-outline" size={28} className="text-primary" />
                                )}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-text">
                                    {story.title || 'بدون عنوان'}
                                </p>
                                <p className="text-[11px] text-muted">
                                    {story.active === false ? 'غير نشط' : 'نشط'}
                                    {story.owner ? ` • ${story.owner}` : ''}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDelete(story)}
                                aria-label="حذف"
                                className="grid size-10 place-items-center rounded-xl bg-error/15 text-error transition hover:bg-error/25"
                            >
                                <Icon name="trash" size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
