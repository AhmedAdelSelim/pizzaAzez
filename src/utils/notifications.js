import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Tell Expo how to present notifications while the app is in the foreground.
 * Must be called before any notification can appear.
 */
export function setupNotificationHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
}

/**
 * Register the device for Expo push notifications and return the push token.
 * Works for both regular users and admins.
 */
export const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Create a high-priority Android notification channel for orders
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('orders', {
            name: 'الطلبات',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#E85D2C',
            sound: 'default',
            enableVibrate: true,
        });

        // Default channel for general notifications
        await Notifications.setNotificationChannelAsync('default', {
            name: 'عام',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#E85D2C',
            sound: 'default',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
    }

    try {
        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ||
            '73e93a74-9844-486a-8b1e-62772659f77f';
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push token:', token);
        return token;
    } catch (e) {
        console.log('Error fetching push token:', e.message);
        return null;
    }
};
