import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, BackHandler, Platform, Alert, Modal, StatusBar } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme/theme';

export default function NetworkGuard() {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected && state.isInternetReachable !== false);
        });

        return () => unsubscribe();
    }, []);

    const handleExit = () => {
        if (Platform.OS === 'android') {
            BackHandler.exitApp();
        } else {
            // iOS exit is restricted, the modal remains visible
            Alert.alert(
                "خطأ في الاتصال",
                "يرجى التأكد من اتصالك بالإنترنت للمتابعة.",
                [{ text: "حسناً" }]
            );
        }
    };

    if (isConnected) return null;

    return (
        <Modal transparent visible={!isConnected} animationType="fade">
            <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="wifi-outline" size={50} color={COLORS.error} />
                        <View style={styles.slash} />
                    </View>
                    <Text style={styles.title}>لا يوجد اتصال بالإنترنت</Text>
                    <Text style={styles.message}>
                        عذراً، تطبيق بيتزا عزيز يتطلب اتصالاً نشطاً بالإنترنت للعمل بشكل صحيح.
                    </Text>
                    <View style={styles.buttonContainer}>
                        <Text 
                            style={styles.exitButton} 
                            onPress={handleExit}
                        >
                            {Platform.OS === 'android' ? 'خروج من التطبيق' : 'محاولة ثانية'}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.spacing_xl,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xxl,
        padding: SIZES.spacing_xxl,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    iconContainer: {
        marginBottom: 20,
        position: 'relative',
    },
    slash: {
        position: 'absolute',
        width: 60,
        height: 4,
        backgroundColor: COLORS.error,
        top: 23,
        left: -5,
        transform: [{ rotate: '45deg' }],
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xl,
        ...FONTS.bold,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        color: COLORS.textSecondary,
        fontSize: SIZES.md,
        ...FONTS.regular,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
    },
    exitButton: {
        backgroundColor: COLORS.error,
        color: COLORS.white,
        paddingVertical: 14,
        borderRadius: SIZES.radius_md,
        textAlign: 'center',
        ...FONTS.bold,
        fontSize: SIZES.base,
        overflow: 'hidden',
    },
});
