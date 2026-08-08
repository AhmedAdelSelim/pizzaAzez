'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import api from '@/lib/api';
import { uploadStoryImage } from '@/lib/supabaseStorage';
import { cx, storyCount } from '@/lib/utils';

const TEXT_BG_OPTIONS = [
    { id: 'orange', colors: ['#E85D2C', '#B03A18'] },
    { id: 'purple', colors: ['#7B2FBE', '#4A1080'] },
    { id: 'blue', colors: ['#1565C0', '#0D47A1'] },
    { id: 'teal', colors: ['#00897B', '#00574E'] },
    { id: 'dark', colors: ['#1A1A2E', '#16213E'] },
    { id: 'red', colors: ['#C62828', '#8E0000'] },
];

export default function CreateStoryPage() {
    const router = useRouter();
    const { token, user } = useAuth();
    const { alert, toast } = useUI();
    const [mode, setMode] = useState(null); // null | 'photo' | 'text'
    const [quota, setQuota] = useState(null);

    const canAddStory = user?.vip_status === 'vip' || user?.role === 'admin';

    useEffect(() => {
        if (user && !canAddStory) {
            alert('غير متاح', 'نشر القصص متاح لأعضاء VIP والمشرفين فقط');
            router.replace('/');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, canAddStory]);

    useEffect(() => {
        if (!token || !canAddStory) return;
        api.getStoryQuota(token).then(setQuota).catch(() => { });
    }, [token, canAddStory]);

    // Admins are unlimited; for everyone else the server is the authority and
    // this only mirrors it so the composer isn't offered when it would fail.
    const limited = quota && !quota.unlimited;
    const subscriptionEnded = limited && !quota.vipActive;
    const outOfStories = limited && quota.vipActive && quota.remaining <= 0;

    if (subscriptionEnded || outOfStories) {
        return (
            <QuotaBlocked
                onBack={() => router.back()}
                title={subscriptionEnded ? 'انتهى اشتراك VIP' : 'انتهى رصيد هذا الشهر'}
                message={
                    subscriptionEnded
                        ? 'انتهى اشتراكك الشهري في VIP. يرجى التواصل مع الإدارة للتجديد ومتابعة نشر القصص.'
                        : `لقد استخدمت ${quota.limit} قصص هذا الشهر. للحصول على قصص إضافية يرجى الاتصال بالإدارة.`
                }
            />
        );
    }

    if (mode === 'photo') {
        return (
            <PhotoStory
                onBack={() => setMode(null)}
                token={token}
                user={user}
                onDone={() => router.back()}
                alert={alert}
                toast={toast}
            />
        );
    }

    if (mode === 'text') {
        return (
            <TextStory
                onBack={() => setMode(null)}
                token={token}
                user={user}
                onDone={() => router.back()}
                alert={alert}
                toast={toast}
            />
        );
    }

    return (
        <main className="flex flex-1 flex-col px-6 py-6">
            <div className="mb-6 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => router.back()}
                    aria-label="إغلاق"
                    className="grid size-10 place-items-center rounded-full bg-surface text-text transition hover:bg-surface-light"
                >
                    <Icon name="close" size={22} />
                </button>
                <h1 className="text-xl font-bold text-text">نوع القصة</h1>
                <span className="w-10" />
            </div>

            <div className="mx-auto mb-8 flex flex-row-reverse items-center gap-1.5 rounded-xl border border-star/30 bg-star/10 px-3.5 py-2.5">
                <Icon name="star" size={14} className="text-star" />
                <span className="text-xs font-semibold text-star">
                    {limited
                        ? `متبقٍ لك ${quota.remaining} من ${quota.limit} قصص هذا الشهر`
                        : 'متاح لأعضاء VIP والمشرفين فقط'}
                </span>
            </div>

            {limited && quota.bonus > 0 && (
                <p className="-mt-6 mb-8 text-center text-[11px] text-muted">
                    تشمل {storyCount(quota.bonus)} إضافية من الإدارة
                </p>
            )}

            <div className="grid grid-cols-2 gap-4">
                <StoryTypeCard
                    onClick={() => setMode('photo')}
                    gradient="linear-gradient(160deg, #E85D2C, #C44A1E)"
                    icon="image-outline"
                    label="صورة"
                    sub="شارك صورة مع متابعيك"
                />
                <StoryTypeCard
                    onClick={() => setMode('text')}
                    gradient="linear-gradient(160deg, #7B2FBE, #4A1080)"
                    icon="text-outline"
                    label="نص"
                    sub="شارك رأيك أو إعلاناً"
                />
            </div>
        </main>
    );
}

/** Shown instead of the composer when the member has nothing left to post with. */
function QuotaBlocked({ onBack, title, message }) {
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || '01021317616';

    return (
        <main className="flex flex-1 flex-col px-6 py-6">
            <div className="mb-6 flex items-center justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="إغلاق"
                    className="grid size-10 place-items-center rounded-full bg-surface text-text transition hover:bg-surface-light"
                >
                    <Icon name="close" size={22} />
                </button>
                <h1 className="text-xl font-bold text-text">القصص</h1>
                <span className="w-10" />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <span className="grid size-20 place-items-center rounded-full bg-star/10">
                    <Icon name="star" size={38} className="text-star" />
                </span>
                <h2 className="text-lg font-bold text-text">{title}</h2>
                <p className="max-w-sm text-sm leading-relaxed text-muted">{message}</p>

                <a
                    href={`tel:${adminPhone}`}
                    className="mt-2 flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-bold text-white transition hover:bg-primary-dark"
                >
                    <Icon name="call-outline" size={18} />
                    اتصل بالإدارة
                </a>
                <span className="text-xs text-muted">{adminPhone}</span>
            </div>
        </main>
    );
}

function StoryTypeCard({ onClick, gradient, icon, label, sub }) {
    return (
        <button type="button" onClick={onClick} className="flex flex-col items-center gap-3">
            <span
                className="grid aspect-[0.65] w-full place-items-center rounded-3xl transition hover:brightness-110"
                style={{ background: gradient }}
            >
                <Icon name={icon} size={40} className="text-white" />
            </span>
            <span className="text-lg font-bold text-text">{label}</span>
            <span className="text-center text-[10px] text-muted">{sub}</span>
        </button>
    );
}

function PhotoStory({ onBack, token, user, onDone, alert, toast }) {
    const fileInput = useRef(null);
    // The object URL is created when a file is picked and revoked on replace.
    const [{ file, preview }, setPicked] = useState({ file: null, preview: null });
    const [loading, setLoading] = useState(false);

    const pickFile = (picked) =>
        setPicked((prev) => {
            if (prev.preview) URL.revokeObjectURL(prev.preview);
            return picked
                ? { file: picked, preview: URL.createObjectURL(picked) }
                : { file: null, preview: null };
        });

    const handlePublish = async () => {
        if (!file) {
            alert('خطأ', 'يرجى اختيار صورة');
            return;
        }
        setLoading(true);
        try {
            const publicUrl = await uploadStoryImage(user.id, file);
            await api.createStory({ image: publicUrl, title: '' }, token);
            toast('تم نشر قصتك!', 'success');
            onDone();
        } catch (e) {
            alert('خطأ', e.message);
        } finally {
            setLoading(false);
        }
    };

    const picker = (
        <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
                const picked = e.target.files?.[0];
                e.target.value = '';
                if (picked) pickFile(picked);
            }}
        />
    );

    if (!preview) {
        return (
            <main className="flex flex-1 flex-col px-6 py-6">
                {picker}
                <div className="mb-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onBack}
                        aria-label="رجوع"
                        className="grid size-10 place-items-center rounded-full bg-surface text-text"
                    >
                        <Icon name="arrow-forward" size={22} />
                    </button>
                    <h1 className="text-xl font-bold text-text">قصة صورة</h1>
                    <span className="w-10" />
                </div>

                <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="flex flex-1 flex-col items-center justify-center gap-3.5 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-10 transition hover:bg-primary/10"
                >
                    <Icon name="image-outline" size={48} className="text-primary" />
                    <span className="text-lg font-bold text-text">اختر صورة من جهازك</span>
                    <span className="text-sm text-muted">يُفضَّل نسبة 9:16 للعرض الأمثل</span>
                </button>
            </main>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {picker}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="absolute inset-0 size-full scale-110 object-cover blur-2xl" />
            <div className="absolute inset-0 bg-black/45" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="معاينة" className="absolute inset-0 size-full object-contain" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-45 bg-gradient-to-b from-black/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-50 bg-gradient-to-t from-black/70 to-transparent" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <button
                    type="button"
                    onClick={() => pickFile(null)}
                    aria-label="رجوع"
                    className="grid size-9.5 place-items-center rounded-full bg-black/35 text-white"
                >
                    <Icon name="arrow-forward" size={22} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-full border-2 border-white/60 bg-primary text-xs font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || '؟'}
                    </span>
                    <span className="text-sm font-bold text-white">{user?.name}</span>
                </div>
                <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    aria-label="اختر صورة أخرى"
                    className="grid size-9.5 place-items-center rounded-full bg-black/35 text-white"
                >
                    <Icon name="image-outline" size={20} />
                </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 px-5 pb-6">
                <button
                    type="button"
                    onClick={handlePublish}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary py-3.5 text-base font-bold text-white shadow-md-soft transition hover:bg-primary-dark disabled:opacity-60"
                >
                    {loading ? (
                        <Spinner size={18} />
                    ) : (
                        <>
                            نشر الصورة
                            <Icon name="paper-plane" size={18} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function TextStory({ onBack, token, user, onDone, alert, toast }) {
    const [text, setText] = useState('');
    const [bgIndex, setBgIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const bg = TEXT_BG_OPTIONS[bgIndex];

    const handlePublish = async () => {
        if (!text.trim()) {
            alert('خطأ', 'يرجى كتابة نص للقصة');
            return;
        }
        setLoading(true);
        try {
            await api.createStory(
                { image: '', title: text.trim(), bg_colors: bg.colors.join(',') },
                token
            );
            toast('تم نشر قصتك!', 'success');
            onDone();
        } catch (e) {
            alert('خطأ', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: `linear-gradient(160deg, ${bg.colors.join(', ')})` }}
        >
            <div className="flex items-center justify-between p-4">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="رجوع"
                    className="grid size-9.5 place-items-center rounded-full bg-black/30 text-white"
                >
                    <Icon name="arrow-forward" size={22} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-full border-2 border-white/60 bg-white/25 text-xs font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || '؟'}
                    </span>
                    <span className="text-sm font-bold text-white">{user?.name}</span>
                </div>
                <span className="w-9.5" />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-7">
                <textarea
                    autoFocus
                    maxLength={200}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="اكتب ما تريد مشاركته…"
                    className="w-full resize-none bg-transparent text-center text-2xl font-bold leading-relaxed text-white outline-none drop-shadow placeholder:text-white/40"
                    rows={5}
                />
                <span className="mt-2 text-[10px] text-white/40">{text.length}/200</span>
            </div>

            <div className="flex flex-col gap-3.5 p-4 pb-6">
                <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-1 py-1">
                    {TEXT_BG_OPTIONS.map((option, i) => (
                        <button
                            key={option.id}
                            type="button"
                            aria-label={`خلفية ${option.id}`}
                            onClick={() => setBgIndex(i)}
                            className={cx(
                                'size-8.5 shrink-0 rounded-full border-2 p-[3px]',
                                i === bgIndex ? 'border-white' : 'border-transparent'
                            )}
                        >
                            <span
                                className="block size-full rounded-full"
                                style={{ background: `linear-gradient(160deg, ${option.colors.join(', ')})` }}
                            />
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handlePublish}
                    disabled={!text.trim() || loading}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/35 bg-white/20 py-3.5 text-base font-bold text-white transition hover:bg-white/30 disabled:opacity-50"
                >
                    {loading ? (
                        <Spinner size={18} />
                    ) : (
                        <>
                            نشر النص
                            <Icon name="paper-plane" size={18} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
