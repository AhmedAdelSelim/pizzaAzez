'use client';

import Icon from './Icon';
import { foodImage } from '@/lib/imageUrl';
import { cx, egp, itemEmoji } from '@/lib/utils';

export default function CartItem({ item, index, onUpdateQuantity, onRemove }) {
    return (
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm-soft">
            <div className="grid size-18 shrink-0 place-items-center overflow-hidden rounded-2xl bg-surface-light text-4xl">
                {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={foodImage(item.image, { width: 72, ratio: '1:1' })}
                        alt={item.name}
                        className="size-full object-cover"
                    />
                ) : (
                    itemEmoji(item)
                )}
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-text">{item.name}</h3>
                {item.selectedSize && (
                    <p className="text-[10px] text-muted">
                        الحجم:{' '}
                        {typeof item.selectedSize === 'object'
                            ? item.selectedSize.name
                            : item.selectedSize}
                    </p>
                )}
                {item.selectedExtras?.length > 0 && (
                    <p className="truncate text-[10px] text-accent">
                        + {item.selectedExtras.join('، ')}
                    </p>
                )}
                <p className="mt-1 text-sm font-extrabold text-primary">
                    {egp(item.price * item.quantity)}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
                <button
                    type="button"
                    aria-label={item.quantity <= 1 ? 'حذف العنصر' : 'إنقاص الكمية'}
                    onClick={() =>
                        item.quantity <= 1
                            ? onRemove?.(item.id, index)
                            : onUpdateQuantity?.(index, item.quantity - 1)
                    }
                    className={cx(
                        'grid size-8 place-items-center rounded-full border transition',
                        item.quantity <= 1
                            ? 'border-error/30 bg-error/10 text-error'
                            : 'border-border bg-surface-light text-text hover:bg-border'
                    )}
                >
                    <Icon name={item.quantity <= 1 ? 'trash-outline' : 'remove'} size={15} />
                </button>

                <span className="min-w-5 text-center text-base font-bold text-text">
                    {item.quantity}
                </span>

                <button
                    type="button"
                    aria-label="زيادة الكمية"
                    onClick={() => onUpdateQuantity?.(index, item.quantity + 1)}
                    className="grid size-8 place-items-center rounded-full border border-primary bg-primary text-white transition hover:bg-primary-dark"
                >
                    <Icon name="add" size={15} />
                </button>
            </div>
        </div>
    );
}
