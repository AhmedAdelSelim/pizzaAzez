import React, { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { MenuProvider } from './src/context/MenuContext';
import AppNavigator from './src/navigation/AppNavigator';

// Force RTL for Arabic
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
