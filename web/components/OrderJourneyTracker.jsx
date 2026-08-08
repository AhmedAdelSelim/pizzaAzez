import Icon from './Icon';
import { cx } from '@/lib/utils';

const STATUSES = [
    { key: 'pending', label: 'تم الاستلام', icon: 'receipt-outline', color: '#9E9E9E' },
    { key: 'preparing', label: 'التحضير', image: '/images/preparing.png', color: '#FF9800' },
    { key: 'baking', label: 'في الفرن', image: '/images/baking.png', color: '#E85D2C' },
    { key: 'shipping', label: 'التوصيل', image: '/images/shipping.png', color: '#2196F3' },
    { key: 'delivered', label: 'وصلنا!', icon: 'checkmark-circle-outline', color: '#4CAF50' },
];

export default function OrderJourneyTracker({ currentStatus = 'pending' }) {
    const found = STATUSES.findIndex((s) => s.key === currentStatus);
    const activeIndex = found === -1 ? 0 : found;
    const active = STATUSES[activeIndex];

    return (
        <div className="w-full py-5">
            <div className="mb-4 flex items-start justify-between px-2">
                {STATUSES.map((status, index) => {
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={status.key} className="contents">
                            {index > 0 && (
                                <span
                                    className="mt-5 h-[3px] flex-1 rounded-sm"
                                    style={{
                                        background: isActive ? status.color : 'var(--color-border)',
                                    }}
                                />
                            )}
                            <div className="relative z-10 flex w-14 flex-col items-center">
                                {isCurrent && (
                                    <span
                                        className="absolute top-0 size-[52px] rounded-full border-2 animate-pulse-ring"
                                        style={{ borderColor: status.color }}
                                    />
                                )}
                                <span
                                    className="grid size-10 place-items-center rounded-full border-2 bg-surface"
                                    style={{
                                        borderColor: isActive ? status.color : 'var(--color-border)',
                                        background: isCurrent ? status.color : 'var(--color-surface)',
                                    }}
                                >
                                    {status.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={status.image}
                                            alt=""
                                            className="size-5.5 object-contain"
                                            style={{
                                                filter: isCurrent
                                                    ? 'brightness(0) invert(1)'
                                                    : isActive
                                                        ? 'none'
                                                        : 'grayscale(1) opacity(0.5)',
                                            }}
                                        />
                                    ) : (
                                        <Icon
                                            name={status.icon}
                                            size={18}
                                            color={
                                                isCurrent
                                                    ? '#FFFFFF'
                                                    : isActive
                                                        ? status.color
                                                        : 'var(--color-muted)'
                                            }
                                        />
                                    )}
                                </span>
                                <span
                                    className={cx('mt-2 text-center text-[10px]', isCurrent && 'font-bold')}
                                    style={{ color: isActive ? status.color : 'var(--color-muted)' }}
                                >
                                    {status.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div
                className="flex items-center gap-2.5 rounded-xl border border-transparent p-3"
                style={{ background: `${active.color}18` }}
            >
                <Icon name="radio-button-on" size={18} color={active.color} />
                <span className="text-xs font-semibold" style={{ color: active.color }}>
                    {currentStatus === 'cancelled'
                        ? 'تم إلغاء الطلب'
                        : `طلبك الآن في مرحلة: ${active.label}`}
                </span>
            </div>
        </div>
    );
}
