'use client';

import Link from 'next/link';
import { foodImage } from '@/lib/imageUrl';
import { useClientSnapshot } from '@/lib/localStore';

const RECOMMENDATIONS = [
    {
        from: 5,
        title: 'صباح الخير! ☀️',
        subtitle: 'ابدأ يومك فطائر مشلتت ساخنة وعروض مميزة',
        image: '/images/lunch_deals.png',
        color: '#FF9800',
        suggestion: 'فطير مشلتت بالسمن البلدي',
    },
    {
        from: 12,
        title: 'ساعة الغداء! 🍕',
        subtitle: 'وفر أكتر مع عروض الوجبات الفردية والكومبو',
        image: '/images/lunch_deals.png',
        color: '#E85D2C',
        suggestion: 'عرض الكومبو الفردي',
    },
    {
        from: 17,
        title: 'جمعة العيلة! 👨‍👩‍👧‍👦',
        subtitle: 'بيتزا الحجم العائلي هي اللي تجمعكم الليلة',
        image: '/images/family_feast.png',
        color: '#4CAF50',
        suggestion: 'بيتزا سوبر سوبريم عائلي',
    },
    {
        from: 23,
        title: 'جوع نص الليل؟ 🌙',
        subtitle: 'اطلب دلوقتي وعلينا التوصيل السريع لأي مكان',
        image: '/images/late_night.png',
        color: '#673AB7',
        suggestion: 'بيتزا رانش بالكريمة',
    },
];

function pickByTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return RECOMMENDATIONS[0];
    if (hour >= 12 && hour < 17) return RECOMMENDATIONS[1];
    if (hour >= 17 && hour < 23) return RECOMMENDATIONS[2];
    return RECOMMENDATIONS[3];
}

export default function CraveRecommendations({ href = '/menu' }) {
    // Resolved on the client so server and client markup agree on first paint.
    const recommendation = useClientSnapshot(pickByTimeOfDay, RECOMMENDATIONS[1]);

    return (
        <Link
            href={href}
            className="relative mx-6 mb-6 block h-45 overflow-hidden rounded-3xl bg-surface shadow-md-soft"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={foodImage(recommendation.image, { width: 420, ratio: '21:9' })}
                alt=""
                className="absolute inset-0 size-full object-cover"
            />
            {/* Bottom-weighted scrim: the copy sits low, so darken there rather
                than flattening the whole photo with a uniform overlay. */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

            <div className="relative flex size-full flex-col justify-between p-5">
                <span
                    className="self-start rounded-xl px-2.5 py-1 text-[10px] font-bold text-white"
                    style={{ background: recommendation.color }}
                >
                    عروض مخصصة لك
                </span>
                <div>
                    <h3 className="text-xl font-extrabold text-white drop-shadow-md">
                        {recommendation.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-white drop-shadow">
                        {recommendation.subtitle}
                    </p>
                    <span className="mt-2 inline-block rounded-lg border border-white/30 bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white">
                        جرب: {recommendation.suggestion}
                    </span>
                </div>
            </div>
        </Link>
    );
}
