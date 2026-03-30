import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { SSEProvider } from './src/context/SSEContext';
import { CartProvider } from './src/context/CartContext';
import { MenuProvider } from './src/context/MenuContext';
import AppNavigator from './src/navigation/AppNavigator';
import NetworkGuard from './src/components/NetworkGuard';
import ErrorBoundary from './src/components/ErrorBoundary';

// Force RTL for Arabic
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SSEProvider>
          <MenuProvider>
            <CartProvider>
              <NetworkGuard />
              <AppNavigator />
            </CartProvider>
          </MenuProvider>
        </SSEProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
