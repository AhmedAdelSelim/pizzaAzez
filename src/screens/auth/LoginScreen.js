import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

export default function LoginScreen({ navigation }) {
    const { login, error, isLoading } = useAuth();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleLogin = async () => {
        setLocalError('');
        if (!phone.trim()) return setLocalError('يرجى إدخال رقم الهاتف');
        if (!password.trim()) return setLocalError('يرجى إدخال كلمة المرور');
        try {
            await login(phone.trim(), password);
        } catch (e) {
            setLocalError(e.message);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.logoArea}>
                        <Image
                            source={require('../../../assets/images/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.tagline}>بيتزا لذيذة وأكل شرقي</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.title}>أهلاً بعودتك</Text>
                        <Text style={styles.subtitle}>سجّل دخولك لمتابعة الطلب</Text>

                        {(localError || error) ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                                <Text style={styles.errorText}>{localError || error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputGroup}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="رقم الهاتف"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    textAlign="right"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="كلمة المرور"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    textAlign="right"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color={COLORS.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Button
                            title="تسجيل الدخول"
                            onPress={handleLogin}
                            loading={isLoading}
                            size="large"
                            style={styles.loginButton}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>ليس لديك حساب؟ </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.footerLink}>إنشاء حساب</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingVertical: SIZES.spacing_xxxl,
    },
    logoArea: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoImage: {
        width: 140,
        height: 140,
        marginBottom: 8,
    },
    tagline: {
        color: COLORS.textSecondary,
        fontSize: SIZES.md,
        ...FONTS.regular,
    },
    form: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xxl,
        padding: SIZES.spacing_xl,
        ...SHADOWS.large,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
        marginBottom: 4,
        textAlign: 'right',
    },
    subtitle: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
        marginBottom: 24,
        textAlign: 'right',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,107,107,0.1)',
        borderRadius: SIZES.radius_sm,
        padding: 12,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        color: COLORS.error,
        fontSize: SIZES.sm,
        ...FONTS.medium,
        flex: 1,
        textAlign: 'right',
    },
    inputGroup: {
        gap: 14,
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundLight,
        borderRadius: SIZES.radius_md,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: SIZES.base,
        ...FONTS.regular,
        padding: 0,
    },
    loginButton: {
        marginBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
    },
    footerLink: {
        color: COLORS.primary,
        fontSize: SIZES.md,
        ...FONTS.bold,
    },
});
