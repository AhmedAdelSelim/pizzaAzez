'use client';

import { useState } from 'react';
import Icon from './Icon';
import { cx } from '@/lib/utils';

export default function SearchBar({
    placeholder = 'ابحث عن أكلة...',
    value,
    onChange,
    onSubmit,
}) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.(value);
            }}
            className={cx(
                'flex items-center gap-2.5 rounded-2xl border-[1.5px] bg-surface px-4 py-3 transition-colors',
                isFocused ? 'border-primary' : 'border-transparent'
            )}
        >
            <Icon
                name="search-outline"
                size={20}
                className={isFocused ? 'text-primary' : 'text-muted'}
            />
            <input
                type="search"
                // text-base, not text-sm: iOS Safari zooms the whole page when a
                // focused input is under 16px, and the user has to pinch back out.
                className="min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {value ? (
                <button type="button" onClick={() => onChange?.('')} aria-label="مسح البحث">
                    <Icon name="close-circle" size={18} className="text-muted" />
                </button>
            ) : null}
        </form>
    );
}
