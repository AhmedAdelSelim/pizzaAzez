'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BottomTabs from './BottomTabs';
import Logo from './Logo';
import NetworkGuard from './NetworkGuard';
import { useAuth } from '@/context/AuthContext';

/** Routes reachable without a session. */
const PUBLIC_ROUTES = ['/login', '/register'];

/**
 * Mirrors the RN AppNavigator: unauthenticated users get the auth stack,
 * admins land on the dashboard, everyone else gets the tabbed storefront.
 */
export default function AppShell({ children }) {
    const { token, user, isInitialLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isPublic = PUBLIC_ROUTES.includes(pathname);
    const isAdminRoute = pathname.startsWith('/admin');

    useEffect(() => {
        if (isInitialLoading) return;

        if (!token && !isPublic) {
            router.replace('/login');
            return;
        }
        if (token && isPublic) {
            router.replace(user?.role === 'admin' ? '/admin' : '/');
            return;
        }
        if (token && isAdminRoute && user?.role !== 'admin') {
            router.replace('/');
        }
    }, [isInitialLoading, token, user?.role, isPublic, isAdminRoute, router]);

    if (isInitialLoading) {
        return (
            <div className="grid min-h-dvh place-items-center bg-background">
                <div className="flex flex-col items-center">
                    <Logo size={120} tagline="بيتزا عزيز" />
                </div>
            </div>
        );
    }

    // Avoid flashing protected content during the redirect above.
    if ((!token && !isPublic) || (token && isPublic)) {
        return <div className="min-h-dvh bg-background" />;
    }

    // Tabs stay visible on every customer-facing route. Full-screen views
    // (story viewer / composer) paint over them with their own z-50 overlay.
    const showTabs = Boolean(token) && user?.role !== 'admin';

    return (
        <>
            <NetworkGuard />
            <div className="app-width flex min-h-dvh flex-col bg-background">
                <div className={showTabs ? 'flex flex-1 flex-col pb-tabbar' : 'flex flex-1 flex-col'}>
                    {children}
                </div>
            </div>
            {showTabs && <BottomTabs />}
        </>
    );
}
