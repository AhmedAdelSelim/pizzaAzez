import React, { useEffect, useRef } from 'react';
import { I18nManager } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import { SSEProvider } from './src/context/SSEContext';
import { CartProvider } from './src/context/CartContext';
import { MenuProvider } from './src/context/MenuContext';
import AppNavigator from './src/navigation/AppNavigator';
import NetworkGuard from './src/components/NetworkGuard';
import ErrorBoundary from './src/components/ErrorBoundary';
import { navigationRef } from './src/utils/navigationUtils';
import { setupNotificationHandler } from './src/utils/notifications';

// Force RTL for Arabic
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

// Show notifications while the app is in the foreground
setupNotificationHandler();

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Fired when a notification is received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notification received:', notification);
      }
    );

    // Fired when the user taps a notification (foreground, background, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        const data = response.notification.request.content.data;
        if (!navigationRef.isReady()) return;

        if (data?.orderId) {
          // Admin → go to orders management; user → go to their orders list
          const currentRoute = navigationRef.getCurrentRoute()?.name || '';
          const isAdminScreen = currentRoute.startsWith('Admin');

          if (isAdminScreen) {
            navigationRef.navigate('AdminOrders');
          } else {
            navigationRef.navigate('Orders');
          }
        }
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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
