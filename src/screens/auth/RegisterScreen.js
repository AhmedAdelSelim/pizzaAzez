import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

export default function RegisterScreen({ navigation }) {
    const { register, error, isLoading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleRegister = async () => {
        setLocalError('');
        if (!name.trim()) return setLocalError('يرجى إدخال الاسم');
        if (!phone.trim()) return setLocalError('يرجى إدخال رقم الهاتف');
        if (!password.trim()) return setLocalError('يرجى إدخال كلمة المرور');
        if (password.length < 6) return setLocalError('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
        try {
            await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), address: address.trim() });
        } catch (e) {
            setLocalError(e.message);
        }
    };

    const fields = [
        { icon: 'person-outline', placeholder: 'الاسم الكامل', value: name, onChangeText: setName },
        { icon: 'call-outline', placeholder: 'رقم الهاتف (الأساسي)', value: phone, onChangeText: setPhone, keyboard: 'phone-pad' },
        { icon: 'mail-outline', placeholder: 'البريد الإلكتروني (اختياري)', value: email, onChangeText: setEmail, keyboard: 'email-address' },
        { icon: 'location-outline', placeholder: 'عنوان التوصيل', value: address, onChangeText: setAddress },
    ];

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
                    <View style={styles.header}>
                        <Image
                            source={require('../../../assets/images/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>انضم لبيتزا عزيز</Text>
                        <Text style={styles.tagline}>أنشئ حسابك وابدأ بالطلب</Text>
                    </View>

                    <View style={styles.form}>
                        {(localError || error) ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                                <Text style={styles.errorText}>{localError || error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputGroup}>
                            {fields.map((field, idx) => (
                                <View key={idx} style={styles.inputContainer}>
                                    <Ionicons name={field.icon} size={20} color={COLORS.textMuted} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={field.placeholder}
                                        placeholderTextColor={COLORS.textMuted}
                                        value={field.value}
                                        onChangeText={field.onChangeText}
                                        keyboardType={field.keyboard || 'default'}
                                        autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
                                        textAlign="right"
                                    />
                                </View>
                            ))}

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="كلمة المرور (٦ أحرف على الأقل)"
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
                            title="إنشاء حساب"
                            onPress={handleRegister}
                            loading={isLoading}
                            size="large"
                            style={styles.registerButton}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>لديك حساب بالفعل؟ </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.footerLink}>تسجيل الدخول</Text>
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
        paddingHorizontal: SIZES.spacing_xl,
        paddingVertical: SIZES.spacing_xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    logoImage: {
        width: 110,
        height: 110,
        marginBottom: 8,
    },
    appName: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.extraBold,
        marginBottom: 4,
    },
    tagline: {
        color: COLORS.textSecondary,
        fontSize: SIZES.sm,
        ...FONTS.regular,
    },
    form: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xxl,
        padding: SIZES.spacing_xl,
        ...SHADOWS.large,
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
        gap: 12,
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
    registerButton: {
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
