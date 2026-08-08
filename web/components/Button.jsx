'use client';

import { cx } from '@/lib/utils';
import Spinner from './Spinner';

const sizeStyles = {
    small: 'px-4 py-2 text-xs rounded-lg gap-1.5',
    medium: 'px-6 py-3.5 text-base rounded-xl gap-2',
    large: 'px-8 py-4 text-lg rounded-2xl gap-2',
};

const variantStyles = {
    primary:
        'bg-gradient-to-l from-primary to-primary-dark text-white shadow-sm-soft hover:brightness-110',
    secondary: 'bg-surface text-text shadow-sm-soft hover:bg-surface-light',
    outline: 'border-[1.5px] border-primary text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:bg-primary/10',
};

export default function Button({
    title,
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon,
    className,
    fullWidth = true,
}) {
    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={cx(
                'inline-flex items-center justify-center font-semibold transition',
                fullWidth && 'w-full',
                sizeStyles[size],
                // A dimmed gradient reads as a rendering fault rather than a
                // disabled control, so drop the variant styling entirely.
                isDisabled
                    ? 'cursor-not-allowed border-[1.5px] border-border bg-surface-light text-muted'
                    : variantStyles[variant],
                className
            )}
        >
            {loading ? (
                <Spinner size={size === 'small' ? 14 : 18} />
            ) : (
                <>
                    {icon}
                    {title ?? children}
                </>
            )}
        </button>
    );
}
