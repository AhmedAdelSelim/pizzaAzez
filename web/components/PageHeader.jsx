'use client';

import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { cx } from '@/lib/utils';

/**
 * Sticky screen header with the RTL back affordance the native stack provided.
 */
export default function PageHeader({ title, back = true, backHref, action, className }) {
    const router = useRouter();

    const goBack = () => {
        if (backHref) router.push(backHref);
        else router.back();
    };

    return (
        <header
            className={cx(
                'sticky top-0 z-30 flex items-center gap-4 border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur',
                className
            )}
        >
            {back && (
                <button
                    type="button"
                    onClick={goBack}
                    aria-label="رجوع"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-text transition hover:bg-surface-light"
                >
                    <Icon name="arrow-forward" size={22} />
                </button>
            )}
            <h1 className="flex-1 truncate text-xl font-bold text-text">{title}</h1>
            {action}
        </header>
    );
}
