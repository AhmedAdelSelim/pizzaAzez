'use client';

import AppShell from '@/components/AppShell';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { MenuProvider } from '@/context/MenuContext';
import { SSEProvider } from '@/context/SSEContext';
import { UIProvider } from '@/context/UIContext';

export default function Providers({ children }) {
    return (
        <UIProvider>
            <AuthProvider>
                <SSEProvider>
                    <MenuProvider>
                        <CartProvider>
                            <AppShell>{children}</AppShell>
                        </CartProvider>
                    </MenuProvider>
                </SSEProvider>
            </AuthProvider>
        </UIProvider>
    );
}
