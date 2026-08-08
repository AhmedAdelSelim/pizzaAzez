'use client';

import { cx } from '@/lib/utils';

export default function CategoryCard({ category, onClick, isSelected }) {
    return (
        <button
            type="button"
            onClick={() => onClick?.(category)}
            className="flex w-20 shrink-0 flex-col items-center active:scale-90 transition-transform"
        >
            <span
                className={cx(
                    'mb-2 grid size-16 place-items-center rounded-full border-2 text-3xl shadow-sm-soft transition',
                    isSelected
                        ? 'border-primary bg-surface-light glow-primary'
                        : 'border-transparent bg-surface'
                )}
            >
                {category.icon}
            </span>
            <span
                className={cx(
                    'w-full truncate text-center text-[10px]',
                    isSelected ? 'font-bold text-primary' : 'font-medium text-muted'
                )}
            >
                {category.name}
            </span>
            {isSelected && <span className="mt-1 size-1.5 rounded-full bg-primary" />}
        </button>
    );
}
