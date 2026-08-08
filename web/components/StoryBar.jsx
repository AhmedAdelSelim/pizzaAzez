'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSSE } from '@/context/SSEContext';
import { useApiResource } from '@/hooks/useApiResource';
import { cx } from '@/lib/utils';

export default function StoryBar() {
    const router = useRouter();
    const { user } = useAuth();
    const sse = useSSE();
    const canAddStory = user?.vip_status === 'vip' || user?.role === 'admin';

    // Seed from the REST endpoint, then keep in sync with realtime events.
    const fetchStories = useCallback(() => api.getStories(), []);
    const { data: stories, setData: setStories } = useApiResource(fetchStories, {
        initialData: [],
    });

    useEffect(() => {
        const unsubInit = sse.on('stories_init', (data) => setStories(data));
        const unsubAdd = sse.on('new_story', (s) => setStories((prev) => [...prev, s]));
        const unsubDel = sse.on('story_deleted', ({ id }) =>
            setStories((prev) => prev.filter((s) => s.id !== id))
        );
        return () => {
            unsubInit();
            unsubAdd();
            unsubDel();
        };
    }, [sse, setStories]);

    if (!stories.length && !canAddStory) return null;

    return (
        <section className="my-4">
            <h2 className="mb-3 px-6 text-lg font-bold text-text">آخر التحديثات</h2>
            <div className="no-scrollbar edge-fade-x flex gap-4 overflow-x-auto px-6 pb-1">
                {canAddStory && (
                    <button
                        type="button"
                        onClick={() => router.push('/stories/create')}
                        className="flex w-[75px] shrink-0 flex-col items-center"
                    >
                        <span className="grid size-[70px] place-items-center rounded-full bg-gradient-to-b from-primary to-primary-dark">
                            <Icon name="add" size={28} className="text-white" />
                        </span>
                        <span className="mt-1.5 text-[10px] font-medium text-text">قصتي</span>
                    </button>
                )}

                {stories.map((story) => (
                    <button
                        key={story.id}
                        type="button"
                        onClick={() => router.push(`/stories/${story.id}`)}
                        className="flex w-[75px] shrink-0 flex-col items-center"
                    >
                        <span
                            className={cx(
                                'grid size-[70px] place-items-center overflow-hidden rounded-full border-2 bg-surface p-[3px]',
                                story.is_seen ? 'border-border' : 'border-primary'
                            )}
                        >
                            {story.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={story.image}
                                    alt={story.title || 'قصة'}
                                    className="size-full rounded-full object-cover"
                                />
                            ) : (
                                <span
                                    className="grid size-full place-items-center rounded-full px-1 text-center text-[9px] font-bold leading-tight text-white"
                                    style={{
                                        background: story.bg_colors
                                            ? `linear-gradient(160deg, ${story.bg_colors.split(',').join(', ')})`
                                            : 'linear-gradient(160deg, #1A1A2E, #16213E)',
                                    }}
                                >
                                    {(story.title || '').slice(0, 18)}
                                </span>
                            )}
                        </span>
                        <span className="mt-1.5 w-full truncate text-center text-[10px] font-medium text-text">
                            {story.title}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
