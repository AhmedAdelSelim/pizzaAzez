'use client';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import { OWNER_INFO } from '@/lib/restaurant';

export default function AboutPage() {
    return (
        <main className="flex flex-1 flex-col">
            <PageHeader title="عن المطعم" />

            <div className="flex flex-col gap-6 p-6">
                <section className="flex flex-col items-center rounded-3xl border border-border bg-surface p-6">
                    <div className="relative mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/azez.jpg"
                            alt={OWNER_INFO.name}
                            className="size-28 rounded-full border-2 border-primary object-cover"
                        />
                        <span className="absolute bottom-0 end-0 grid size-8 place-items-center rounded-full border-2 border-surface bg-primary">
                            <Icon name="pizza" size={16} className="text-white" />
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-text">{OWNER_INFO.name}</h2>
                    <p className="mb-4 text-xs text-muted">{OWNER_INFO.role}</p>

                    <div className="flex gap-3">
                        <a
                            href={OWNER_INFO.socials.facebook}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Facebook"
                            className="grid size-11 place-items-center rounded-full bg-background-light transition hover:bg-border"
                        >
                            <Icon name="logo-facebook" size={24} color="#1877F2" />
                        </a>
                        <a
                            href={OWNER_INFO.socials.instagram}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Instagram"
                            className="grid size-11 place-items-center rounded-full bg-background-light transition hover:bg-border"
                        >
                            <Icon name="logo-instagram" size={24} color="#E4405F" />
                        </a>
                        <a
                            href={`tel:${OWNER_INFO.phone}`}
                            aria-label="اتصل بنا"
                            className="grid size-11 place-items-center rounded-full bg-background-light transition hover:bg-border"
                        >
                            <Icon name="call" size={24} className="text-primary" />
                        </a>
                    </div>
                </section>

                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <Icon name="heart" size={20} className="text-primary" />
                        <h2 className="text-base font-bold text-text">قصتنا</h2>
                    </div>
                    <p className="text-sm leading-7 text-text-secondary">{OWNER_INFO.bio}</p>
                </section>

                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <Icon name="location" size={20} className="text-primary" />
                        <h2 className="text-base font-bold text-text">موقعنا</h2>
                    </div>

                    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
                        <Icon name="map-outline" size={24} className="text-muted" />
                        <div className="flex-1">
                            <p className="text-[11px] text-muted">العنوان</p>
                            <p className="text-sm text-text">{OWNER_INFO.address}</p>
                        </div>
                    </div>

                    <a
                        href={`tel:${OWNER_INFO.phone}`}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:border-primary"
                    >
                        <Icon name="call-outline" size={24} className="text-muted" />
                        <div className="flex-1">
                            <p className="text-[11px] text-muted">التواصل المباشر</p>
                            <p className="text-sm text-text" dir="ltr">
                                {OWNER_INFO.phone}
                            </p>
                        </div>
                        <Icon name="chevron-back" size={20} className="text-border" />
                    </a>
                </section>

                <footer className="pb-4 text-center">
                    <p className="text-sm font-semibold text-text">بيتزا عزيز © ٢٠٢٦</p>
                    <p className="text-xs text-muted">بكل الحب من الزرقا ❤️</p>
                </footer>
            </div>
        </main>
    );
}
