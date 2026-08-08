'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import Spinner from '@/components/Spinner';
import api from '@/lib/api';
import { cx } from '@/lib/utils';

const STORY_DURATION = 5000;

export default function StoryViewPage() {
    const { id } = useParams();
    const router = useRouter();

    const [stories, setStories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const holdTimer = useRef(null);
    const didHold = useRef(false);

    useEffect(() => {
        let cancelled = false;
        api.getStories()
            .then((data) => {
                if (cancelled) return;
                setStories(data);
                const idx = data.findIndex((s) => String(s.id) === String(id));
                setCurrentIndex(idx >= 0 ? idx : 0);
            })
            .catch(() => { })
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [id]);

    const close = () => router.back();

    const handleNext = () => {
        setCurrentIndex((i) => {
            if (i < stories.length - 1) return i + 1;
            close();
            return i;
        });
    };

    const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));

    // Keyboard controls
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') close();
            // RTL: left arrow advances, right arrow goes back
            if (e.key === 'ArrowLeft') handleNext();
            if (e.key === 'ArrowRight') handlePrev();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stories.length]);

    const handlePointerDown = () => {
        didHold.current = false;
        holdTimer.current = setTimeout(() => {
            didHold.current = true;
            setPaused(true);
        }, 220);
    };

    const handlePointerUp = (e) => {
        clearTimeout(holdTimer.current);
        if (didHold.current) {
            setPaused(false);
            return;
        }
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        // Left third goes forward in RTL reading order; the rest goes back.
        if (x < width * 0.33) handleNext();
        else handlePrev();
    };

    const currentStory = stories[currentIndex];

    if (loading || !currentStory) {
        return (
            <div className="grid min-h-dvh place-items-center bg-black text-white">
                <Spinner size={36} />
            </div>
        );
    }

    const ownerInitial = currentStory.owner?.charAt(0)?.toUpperCase() || '؟';

    return (
        <div className="fixed inset-0 z-50 select-none overflow-hidden bg-black">
            {currentStory.image ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={currentStory.image}
                        alt=""
                        className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
                    />
                    <div className="absolute inset-0 bg-black/45" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        key={currentStory.id}
                        src={currentStory.image}
                        alt={currentStory.title || 'قصة'}
                        className="absolute inset-0 size-full object-contain animate-fade-in"
                    />
                </>
            ) : (
                <div
                    key={currentStory.id}
                    className="absolute inset-0 grid place-items-center px-8 animate-fade-in"
                    style={{
                        background: `linear-gradient(160deg, ${(currentStory.bg_colors || '#1A1A2E,#16213E')
                            .split(',')
                            .join(', ')})`,
                    }}
                >
                    <p className="text-center text-3xl font-bold leading-relaxed text-white drop-shadow">
                        {currentStory.title}
                    </p>
                </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 h-50 bg-gradient-to-b from-black/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-70 bg-gradient-to-t from-black/75 to-transparent" />

            {/* Tap zones */}
            <div
                className="absolute inset-0"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={() => {
                    clearTimeout(holdTimer.current);
                    setPaused(false);
                }}
            />

            {/* Progress + header */}
            <div className="pointer-events-none absolute inset-x-0 top-0 px-3.5 pt-4">
                <div className="mb-3 flex gap-1">
                    {stories.map((story, i) => (
                        <div
                            key={story.id}
                            className="h-[2.5px] flex-1 overflow-hidden rounded-sm bg-white/35"
                        >
                            <div
                                className="h-full rounded-sm bg-white"
                                style={
                                    i === currentIndex
                                        ? {
                                            animation: `az-story-progress ${STORY_DURATION}ms linear forwards`,
                                            animationPlayState: paused ? 'paused' : 'running',
                                        }
                                        : { width: i < currentIndex ? '100%' : '0%' }
                                }
                                onAnimationEnd={i === currentIndex ? handleNext : undefined}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        {currentStory.owner_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={currentStory.owner_image}
                                alt=""
                                className="size-10.5 rounded-full border-2 border-white/70 object-cover"
                            />
                        ) : (
                            <span className="grid size-10.5 place-items-center rounded-full border-2 border-white/70 bg-primary text-sm font-bold text-white">
                                {ownerInitial}
                            </span>
                        )}
                        <div>
                            <p className="text-sm font-bold text-white">
                                {currentStory.owner || 'بيتزا عزيز'}
                            </p>
                            <p className="text-[10px] text-white/60">
                                {currentIndex + 1} / {stories.length}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={close}
                        aria-label="إغلاق"
                        className="pointer-events-auto grid size-9.5 place-items-center rounded-full bg-black/35 text-white transition hover:bg-black/60"
                    >
                        <Icon name="close" size={26} />
                    </button>
                </div>
            </div>

            {paused && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <Icon name="pause" size={40} className="text-white/70" />
                </div>
            )}

            {currentStory.image && currentStory.title && (
                <div className={cx('pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-8')}>
                    <p className="text-2xl font-extrabold text-white drop-shadow-lg">
                        {currentStory.title}
                    </p>
                </div>
            )}
        </div>
    );
}
