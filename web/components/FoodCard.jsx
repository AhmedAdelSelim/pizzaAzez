'use client';

import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { useFavorites } from '@/hooks/useFavorites';
import { foodImage } from '@/lib/imageUrl';
import { cx, egp, itemEmoji } from '@/lib/utils';

export default function FoodCard({ item, onAddToCart }) {
    const router = useRouter();
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorite = isFavorite(item.id);

    const unavailable = item.is_available === false;

    return (
        <article
            onClick={() => router.push(`/item/${item.id}`)}
            className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-surface shadow-md-soft transition hover:-translate-y-0.5 hover:shadow-lg-soft"
        >
            <div className="relative h-36 shrink-0">
                {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={foodImage(item.image, { width: 220, ratio: '4:3' })}
                        alt={item.name}
                        className="size-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="grid size-full place-items-center bg-surface-light text-5xl">
                        {itemEmoji(item)}
                    </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background/65 to-transparent" />

                {(item.is_special || item.isSpecial) && (
                    <span className="absolute start-2 top-2 rounded-lg bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        🔥 عرض
                    </span>
                )}

                <button
                    type="button"
                    aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item);
                    }}
                    className="absolute end-2 top-2 grid size-8 place-items-center rounded-full bg-black/35 transition hover:bg-black/55"
                >
                    <Icon
                        name={favorite ? 'heart' : 'heart-outline'}
                        size={18}
                        color={favorite ? '#FF4757' : '#FFFFFF'}
                    />
                </button>

                {unavailable && (
                    <div className="absolute inset-0 grid place-items-center bg-black/60 text-sm font-bold text-white">
                        غير متاح حالياً
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-3">
                <h3 className="mb-1.5 truncate text-sm font-bold text-text">{item.name}</h3>
                <div className="mb-2.5 flex items-center gap-1">
                    <Icon name="star" size={11} className="text-star" />
                    <span className="text-[10px] font-semibold text-star">{item.rating ?? 0}</span>
                    <span className="text-[10px] text-muted">
                        ({Array.isArray(item.reviews) ? item.reviews.length : item.reviews || 0})
                    </span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-base font-extrabold text-primary">
                        {item.sizes?.length ? `من ${item.price} ج.م` : egp(item.price)}
                    </span>
                    <button
                        type="button"
                        aria-label="أضف للسلة"
                        disabled={unavailable}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.currentTarget.classList.remove('animate-pop');
                            void e.currentTarget.offsetWidth;
                            e.currentTarget.classList.add('animate-pop');
                            onAddToCart?.(item);
                        }}
                        className={cx(
                            'grid size-8.5 place-items-center rounded-full bg-primary text-white glow-primary transition',
                            unavailable ? 'cursor-not-allowed opacity-40' : 'hover:bg-primary-dark'
                        )}
                    >
                        <Icon name="add" size={20} />
                    </button>
                </div>
            </div>
        </article>
    );
}
