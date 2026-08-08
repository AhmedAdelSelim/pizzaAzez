'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import ReviewItem from '@/components/ReviewItem';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useMenu } from '@/context/MenuContext';
import { useUI } from '@/context/UIContext';
import { pushRecentlyViewed } from '@/hooks/useFavorites';
import api from '@/lib/api';
import { foodImage } from '@/lib/imageUrl';
import { cx, egp, itemEmoji } from '@/lib/utils';

const COMBO_OPTIONS = [
    { id: 'drink', label: 'مشروب غازي', price: 15, emoji: '🥤' },
    { id: 'fries', label: 'بطاطس مقلية', price: 20, emoji: '🍟' },
    { id: 'coleslaw', label: 'كولسلو', price: 12, emoji: '🥗' },
    { id: 'dessert', label: 'كيكة الشوكولاتة', price: 25, emoji: '🍰' },
];

export default function FoodDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addItem } = useCart();
    const { token } = useAuth();
    const { getItemById, isLoading: menuLoading } = useMenu();
    const { alert, toast } = useUI();

    const [fetchedItem, setFetchedItem] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [selectedCombos, setSelectedCombos] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    // Prefer the already-loaded menu, fall back to a direct fetch on deep links.
    const item = getItemById(id) || fetchedItem;

    useEffect(() => {
        if (item || menuLoading) return;
        api.getMenuItem(id)
            .then(setFetchedItem)
            .catch(() => setNotFound(true));
    }, [id, item, menuLoading]);

    useEffect(() => {
        if (!item) return;

        api.getItemReviews(item.id)
            .then((data) => {
                if (Array.isArray(data)) setReviews(data);
            })
            .catch(() => { });

        pushRecentlyViewed(item);
        // Only re-run when a different item is opened.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item?.id]);

    if (notFound) {
        return (
            <main className="grid flex-1 place-items-center p-6 text-center">
                <div>
                    <p className="mb-4 text-lg font-bold text-text">العنصر غير موجود</p>
                    <Button title="رجوع للقائمة" onClick={() => router.push('/menu')} fullWidth={false} />
                </div>
            </main>
        );
    }

    if (!item) {
        return (
            <main className="grid flex-1 place-items-center text-primary">
                <Spinner size={36} />
            </main>
        );
    }

    const needsSize = item.sizes?.length > 0;
    const currentPrice = selectedSize?.price ?? (needsSize ? null : item.price);
    const comboTotal = selectedCombos.reduce(
        (sum, comboId) => sum + (COMBO_OPTIONS.find((o) => o.id === comboId)?.price || 0),
        0
    );

    const toggleCombo = (comboId) =>
        setSelectedCombos((prev) =>
            prev.includes(comboId) ? prev.filter((c) => c !== comboId) : [...prev, comboId]
        );

    const toggleExtra = (extra) =>
        setSelectedExtras((prev) =>
            prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
        );

    const handleAddToCart = () => {
        if (needsSize && !selectedSize) return;

        addItem({
            ...item,
            price: currentPrice,
            quantity,
            selectedSize: selectedSize?.name || null,
            selectedExtras,
        });

        selectedCombos.forEach((comboId) => {
            const combo = COMBO_OPTIONS.find((o) => o.id === comboId);
            if (combo) {
                addItem({
                    id: `combo-${comboId}`,
                    name: combo.label,
                    price: combo.price,
                    quantity: 1,
                    selectedSize: null,
                    selectedExtras: [],
                });
            }
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleSubmitReview = async () => {
        if (!token) {
            alert('تنبيه', 'يجب تسجيل الدخول أولاً');
            return;
        }
        setSubmittingReview(true);
        try {
            const newReview = await api.addItemReview(item.id, reviewRating, reviewComment, token);
            setReviews((prev) => [newReview, ...prev]);
            setReviewComment('');
            setReviewRating(5);
            setShowReviewForm(false);
            toast('تم إرسال تقييمك بنجاح', 'success');
        } catch (error) {
            alert('خطأ', error.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <main className="flex flex-1 flex-col pb-28">
            <div className="relative h-70">
                {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={foodImage(item.image, { width: 800, ratio: '16:9' })}
                        alt={item.name}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="grid size-full place-items-center bg-surface-light text-[110px]">
                        {itemEmoji(item)}
                    </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-30 bg-gradient-to-t from-background to-transparent" />

                <button
                    type="button"
                    onClick={() => router.back()}
                    aria-label="رجوع"
                    className="absolute end-5 top-5 grid size-10 place-items-center rounded-full bg-surface/90 text-text backdrop-blur transition hover:bg-surface"
                >
                    <Icon name="arrow-forward" size={22} />
                </button>

                {(item.is_special || item.isSpecial) && (
                    <span className="absolute start-5 top-5 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white">
                        🔥 عرض خاص
                    </span>
                )}
            </div>

            <div className="px-6">
                <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-extrabold text-text">{item.name}</h1>
                        <div className="mt-1 flex items-center gap-1.5">
                            <Icon name="star" size={14} className="text-star" />
                            <span className="text-xs font-semibold text-star">{item.rating ?? 0}</span>
                            <span className="text-xs text-muted">
                                (
                                {Array.isArray(item.reviews) ? item.reviews.length : item.reviews || 0}{' '}
                                تقييم)
                            </span>
                        </div>
                    </div>
                    <div className="shrink-0 rounded-xl bg-surface px-4 py-2 text-lg font-extrabold text-primary">
                        {currentPrice ? egp(currentPrice) : 'اختر'}
                    </div>
                </div>

                {item.description && (
                    <p className="mb-6 text-sm leading-6 text-muted">{item.description}</p>
                )}

                {needsSize && (
                    <section className="mb-6">
                        <h2 className="mb-3 text-base font-bold text-text">اختر الحجم</h2>
                        {/* Four sizes in a 3-column grid leaves XL stranded on its
                            own row, so fall back to 2 columns when 3 won't divide. */}
                        <div
                            className={cx(
                                'grid gap-3',
                                item.sizes.length % 3 === 0 || item.sizes.length % 2 !== 0
                                    ? 'grid-cols-3'
                                    : 'grid-cols-2'
                            )}
                        >
                            {item.sizes.map((sizeObj) => {
                                const isSelected = selectedSize?.name === sizeObj.name;
                                return (
                                    <button
                                        key={sizeObj.name}
                                        type="button"
                                        onClick={() => setSelectedSize(sizeObj)}
                                        className={cx(
                                            'relative rounded-xl border-[1.5px] p-3 text-center transition',
                                            isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border bg-surface hover:border-primary/50'
                                        )}
                                    >
                                        <p
                                            className={cx(
                                                'text-sm font-bold',
                                                isSelected ? 'text-primary' : 'text-text'
                                            )}
                                        >
                                            {sizeObj.name}
                                        </p>
                                        <p
                                            className={cx(
                                                'text-xs',
                                                isSelected ? 'text-primary' : 'text-muted'
                                            )}
                                        >
                                            {sizeObj.price} ج.م
                                        </p>
                                        {isSelected && (
                                            <span className="absolute -top-2 start-1/2 grid size-5 -translate-x-1/2 place-items-center rounded-full bg-primary">
                                                <Icon name="checkmark" size={12} className="text-white" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                {item.extras?.length > 0 && (
                    <section className="mb-6">
                        <h2 className="mb-3 text-base font-bold text-text">إضافات</h2>
                        <div className="flex flex-wrap gap-2">
                            {item.extras.map((extra) => {
                                const isSelected = selectedExtras.includes(extra);
                                return (
                                    <button
                                        key={extra}
                                        type="button"
                                        onClick={() => toggleExtra(extra)}
                                        className={cx(
                                            'flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition',
                                            isSelected
                                                ? 'border-accent bg-accent/10 font-semibold text-accent'
                                                : 'border-border bg-surface text-muted hover:border-accent/50'
                                        )}
                                    >
                                        <Icon
                                            name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                                            size={16}
                                        />
                                        {extra}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                <section className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-bold text-text">أكمل وجبتك 🎯</h2>
                        {comboTotal > 0 && (
                            <span className="text-sm font-bold text-accent">+{comboTotal} ج.م</span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {COMBO_OPTIONS.map((combo) => {
                            const isSelected = selectedCombos.includes(combo.id);
                            return (
                                <button
                                    key={combo.id}
                                    type="button"
                                    onClick={() => toggleCombo(combo.id)}
                                    className={cx(
                                        'relative rounded-xl border-[1.5px] p-3 text-center transition',
                                        isSelected
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border bg-surface hover:border-primary/50'
                                    )}
                                >
                                    <span className="mb-1 block text-2xl">{combo.emoji}</span>
                                    <span
                                        className={cx(
                                            'block truncate text-xs font-semibold',
                                            isSelected ? 'text-primary' : 'text-text'
                                        )}
                                    >
                                        {combo.label}
                                    </span>
                                    <span
                                        className={cx(
                                            'block text-[10px]',
                                            isSelected ? 'text-primary' : 'text-muted'
                                        )}
                                    >
                                        +{combo.price} ج.م
                                    </span>
                                    {isSelected && (
                                        <span className="absolute -top-1.5 start-1/2 grid size-4 -translate-x-1/2 place-items-center rounded-full bg-primary">
                                            <Icon name="checkmark" size={10} className="text-white" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="mb-6">
                    <h2 className="mb-3 text-base font-bold text-text">الكمية</h2>
                    <div className="flex w-fit items-center gap-5 rounded-xl bg-surface px-4 py-2.5">
                        <button
                            type="button"
                            aria-label="إنقاص الكمية"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="grid size-9 place-items-center rounded-full bg-surface-light text-text transition hover:bg-border"
                        >
                            <Icon name="remove" size={20} />
                        </button>
                        <span key={quantity} className="min-w-8 text-center text-xl font-bold text-text animate-pop">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            aria-label="زيادة الكمية"
                            onClick={() => setQuantity((q) => q + 1)}
                            className="grid size-9 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
                        >
                            <Icon name="add" size={20} />
                        </button>
                    </div>
                </section>

                <section className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-bold text-text">آراء العملاء</h2>
                        <button
                            type="button"
                            onClick={() => setShowReviewForm((v) => !v)}
                            className="flex items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                        >
                            <Icon name="star-outline" size={14} />
                            أضف تقييم
                        </button>
                    </div>

                    {showReviewForm && (
                        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
                            <div className="mb-3 flex flex-row-reverse justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        aria-label={`${star} نجوم`}
                                        onClick={() => setReviewRating(star)}
                                    >
                                        <Icon
                                            name={star <= reviewRating ? 'star' : 'star-outline'}
                                            size={28}
                                            className="text-star"
                                        />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                className="az-input mb-3 min-h-24 resize-y"
                                placeholder="اكتب رأيك هنا..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                            />
                            <Button
                                title={submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                                onClick={handleSubmitReview}
                                loading={submittingReview}
                            />
                        </div>
                    )}

                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <ReviewItem key={review.id ?? index} review={review} />
                        ))
                    ) : (
                        <p className="py-4 text-center text-sm text-muted">
                            لا يوجد تقييمات بعد. كن أول من يقيّم!
                        </p>
                    )}
                </section>
            </div>

            <div className="fixed inset-x-0 bottom-tabbar z-40 border-t border-border bg-surface/95 backdrop-blur">
                <div className="app-width flex items-center gap-4 px-6 py-4">
                    {/* Before a size is picked there is no total to show, so say
                        what is missing instead of printing a placeholder dash. */}
                    <div className="shrink-0">
                        {currentPrice ? (
                            <>
                                <p className="text-[10px] text-muted">المجموع</p>
                                <p className="text-lg font-extrabold text-primary">
                                    {egp(currentPrice * quantity + comboTotal)}
                                </p>
                            </>
                        ) : (
                            <p className="max-w-20 text-[11px] leading-tight font-semibold text-muted">
                                اختر الحجم أولاً
                            </p>
                        )}
                    </div>
                    <div className="flex-1">
                        <Button
                            title={isAdded ? 'تمت الإضافة ✅' : 'أضف للسلة'}
                            onClick={handleAddToCart}
                            variant={isAdded ? 'secondary' : 'primary'}
                            size="large"
                            disabled={needsSize && !selectedSize}
                            icon={
                                <Icon
                                    name={isAdded ? 'checkmark-circle' : 'cart-outline'}
                                    size={20}
                                />
                            }
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
