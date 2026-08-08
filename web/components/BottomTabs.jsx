'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { useCart } from '@/context/CartContext';
import { cx } from '@/lib/utils';

const TABS = [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/menu', label: 'القائمة', icon: 'restaurant' },
    { href: '/cart', label: 'السلة', icon: 'cart' },
    { href: '/profile', label: 'حسابي', icon: 'person' },
];

export const TAB_ROUTES = TABS.map((t) => t.href);

export default function BottomTabs() {
    const pathname = usePathname();
    const { getItemCount } = useCart();
    const cartCount = getItemCount();

    return (
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface shadow-[0_-6px_16px_rgba(0,0,0,0.2)]">
            <div className="app-width flex h-tabbar items-stretch">
                {TABS.map((tab) => {
                    const active = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cx(
                                'flex flex-1 flex-col items-center justify-center gap-1 transition',
                                active ? 'text-primary' : 'text-muted hover:text-text'
                            )}
                        >
                            <span className="relative">
                                <Icon name={active ? tab.icon : `${tab.icon}-outline`} size={24} />
                                {tab.href === '/cart' && cartCount > 0 && (
                                    <span className="absolute -end-2.5 -top-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full border-2 border-surface bg-primary px-1 text-[9px] font-bold text-white">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </span>
                            <span className="text-[11px] font-medium">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
