'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CategoryCard from '@/components/CategoryCard';
import Ltr from '@/components/Ltr';
import CraveRecommendations from '@/components/CraveRecommendations';
import FoodCard from '@/components/FoodCard';
import Icon from '@/components/Icon';
import StoryBar from '@/components/StoryBar';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useApiResource } from '@/hooks/useApiResource';
import { useRecentlyViewed } from '@/hooks/useFavorites';
import api from '@/lib/api';
import { useClientSnapshot } from '@/lib/localStore';
import { cx, itemEmoji } from '@/lib/utils';

const BANNERS = [
    {
        id: '1',
        title: 'بيتزا طازجة',
        subtitle: 'يومياً من الفرن 🍕',
        buttonText: 'اطلب الآن',
        emoji: '🍕',
        gradient: 'linear-gradient(135deg, #E85D2C, #C44A1E)',
    },
    {
        id: '2',
        title: 'عروض حصرية',
        subtitle: 'خصومات تصل ٣٠٪ 🔥',
        buttonText: 'شاهد العروض',
        emoji: '🔥',
        gradient: 'linear-gradient(135deg, #7B2FBE, #5A1F9B)',
    },
    {
        id: '3',
        title: 'توصيل سريع',
        subtitle: '٣٠-٤٥ دقيقة فقط 🛵',
        buttonText: 'اعرف أكثر',
        emoji: '🛵',
        gradient: 'linear-gradient(135deg, #1565C0, #0D47A1)',
    },
];

function useCountdown(expiresAt) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!expiresAt) return;
        const update = () => {
            const diff = new Date(expiresAt) - new Date();
            if (diff <= 0) {
                setTimeLeft('انتهى العرض');
                return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(
                `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            );
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [expiresAt]);

    return timeLeft;
}

function readGreeting() {
    const hour = new Date().getHours();
    return hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء النور' : 'مساء الخير';
}

export default function HomePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { categories, getPopularItems } = useMenu();
    const addToCart = useAddToCart();
    const greeting = useClientSnapshot(readGreeting, 'أهلاً');
    const recentlyViewed = useRecentlyViewed();
    const popularItems = getPopularItems();

    const [searchQuery, setSearchQuery] = useState('');
    const [currentBanner, setCurrentBanner] = useState(0);

    const fetchFlashDeals = useCallback(() => api.getFlashDeals(), []);
    const { data: flashDeals } = useApiResource(fetchFlashDeals, { initialData: [] });
    const flashDeal = Array.isArray(flashDeals) ? flashDeals[0] : null;
    const flashCountdown = useCountdown(flashDeal?.expires_at);

    useEffect(() => {
        const timer = setInterval(
            () => setCurrentBanner((prev) => (prev + 1) % BANNERS.length),
            3500
        );
        return () => clearInterval(timer);
    }, []);

    const banner = BANNERS[currentBanner];

    return (
        <main className="flex flex-1 flex-col">
            <header className="px-6 pb-4 pt-8">
                <h1 className="text-2xl font-bold text-text">
                    {greeting}، {user?.name?.split(' ')[0] || 'ضيفنا'} 👋
                </h1>
                <p className="mt-0.5 text-sm text-muted">شو تشتهي اليوم؟</p>
            </header>

            <form
                className="mb-4 px-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    router.push(
                        searchQuery.trim()
                            ? `/menu?search=${encodeURIComponent(searchQuery.trim())}`
                            : '/menu'
                    );
                }}
            >
                <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3">
                    <Icon name="search-outline" size={20} className="text-muted" />
                    <input
                        type="search"
                        className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
                        placeholder="ابحث عن أكلة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery('')} aria-label="مسح">
                            <Icon name="close-circle" size={18} className="text-muted" />
                        </button>
                    )}
                </div>
            </form>

            <StoryBar />

            <CraveRecommendations />

            {flashDeal && flashCountdown && flashCountdown !== 'انتهى العرض' && (
                <Link
                    href="/menu"
                    className="mx-6 mb-4 flex items-center gap-3 overflow-hidden rounded-2xl px-6 py-3.5 shadow-md-soft"
                    style={{ background: 'linear-gradient(to left, #7B1FA2, #4A148C)' }}
                >
                    <div className="min-w-0 flex-1">
                        <p className="mb-0.5 text-[10px] font-semibold text-white/70">⚡ عرض خاص</p>
                        <p className="mb-1 truncate text-sm font-extrabold text-white">
                            {flashDeal.title}
                        </p>
                        {flashDeal.discount_percent > 0 && (
                            <p className="text-xs font-bold text-star">
                                خصم {flashDeal.discount_percent}٪
                            </p>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="mb-0.5 text-[10px] text-white/60">ينتهي خلال</p>
                        <p className="text-xl font-extrabold tracking-[2px] text-star tabular-nums">
                            <Ltr>{flashCountdown}</Ltr>
                        </p>
                    </div>
                </Link>
            )}

            <div className="mx-6 mb-6">
                <div
                    className="relative h-40 overflow-hidden rounded-3xl"
                    style={{ background: banner.gradient }}
                >
                    <div key={banner.id} className="relative z-10 flex h-full flex-col justify-center p-6 animate-fade-slide">
                        <p className="mb-1 text-xs font-medium text-white/80">{banner.subtitle}</p>
                        <h2 className="mb-3.5 text-2xl font-extrabold text-white">{banner.title}</h2>
                        <Link
                            href="/offers"
                            className="flex w-fit items-center gap-1.5 rounded-full bg-black/25 px-4 py-2 text-xs font-bold text-white transition hover:bg-black/40"
                        >
                            {banner.buttonText}
                            <Icon name="arrow-back" size={15} />
                        </Link>
                    </div>
                    <span className="pointer-events-none absolute -bottom-2.5 -end-2.5 text-[120px] leading-none opacity-20">
                        {banner.emoji}
                    </span>
                </div>

                <div className="mt-2.5 flex justify-center gap-1.5">
                    {BANNERS.map((b, i) => (
                        <button
                            key={b.id}
                            type="button"
                            aria-label={`الإعلان ${i + 1}`}
                            onClick={() => setCurrentBanner(i)}
                            className={cx(
                                'h-1.5 rounded-sm transition-all',
                                i === currentBanner ? 'w-4.5 bg-primary' : 'w-1.5 bg-border'
                            )}
                        />
                    ))}
                </div>
            </div>

            <section className="mb-6">
                <div className="mb-4 flex items-center justify-between px-6">
                    <h2 className="text-lg font-bold text-text">الأقسام</h2>
                    <Link href="/menu" className="text-xs font-semibold text-primary">
                        عرض الكل
                    </Link>
                </div>
                <div className="no-scrollbar edge-fade-x flex gap-4 overflow-x-auto px-6 pb-1">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onClick={() => router.push(`/category/${category.id}`)}
                        />
                    ))}
                </div>
            </section>

            {recentlyViewed.length > 0 && (
                <section className="mb-6">
                    <h2 className="mb-4 px-6 text-lg font-bold text-text">👁 شاهدتها مؤخراً</h2>
                    <div className="no-scrollbar edge-fade-x flex gap-2.5 overflow-x-auto px-6 pb-1">
                        {recentlyViewed.map((item) => (
                            <Link
                                key={item.id}
                                href={`/item/${item.id}`}
                                className="flex w-25 shrink-0 flex-col items-center rounded-2xl border border-border bg-surface p-3 transition hover:border-primary"
                            >
                                <span className="mb-1.5 text-3xl">{itemEmoji(item)}</span>
                                <span className="mb-1 w-full truncate text-center text-[10px] font-bold text-text">
                                    {item.name}
                                </span>
                                <span className="text-[10px] font-semibold text-primary">
                                    {item.price} ج.م
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="mb-6">
                <div className="mb-4 flex items-center justify-between px-6">
                    <h2 className="text-lg font-bold text-text">🌟 الأكثر طلباً</h2>
                    <Link href="/menu" className="text-xs font-semibold text-primary">
                        عرض الكل
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 px-6 sm:grid-cols-3 lg:grid-cols-4">
                    {popularItems.slice(0, 6).map((item) => (
                        <FoodCard key={item.id} item={item} onAddToCart={addToCart} />
                    ))}
                </div>
            </section>
        </main>
    );
}
