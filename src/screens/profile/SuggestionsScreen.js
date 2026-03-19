import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, ScrollView,
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
    StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import Button from '../../components/Button';

import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function SuggestionsScreen({ navigation }) {
    const { token } = useAuth();
    const [suggestion, setSuggestion] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!suggestion.trim()) return;

        setLoading(true);
        try {
            await api.submitSuggestion(suggestion, token);
            setIsSubmitted(true);
            setTimeout(() => {
                navigation.goBack();
            }, 2500);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={100} color={COLORS.primary} />
                </View>
                <Text style={styles.successTitle}>شكراً لك!</Text>
                <Text style={styles.successText}>تم استلام اقتراحك بنجاح. نحن نهتم دائماً برأيك لتطوير خدماتنا.</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.title}>اقتراحاتكم</Text>
                    </View>

                    <View>
                        <View style={styles.infoCard}>
                            <Ionicons name="bulb-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.infoText}>
                                رأيك يهمنا! شاركنا أفكارك لتطوير تطبيق بيتزا عزيز أو اترك لنا ملاحظاتك حول تجربتك.
                            </Text>
                        </View>
                    </View>

                    <View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>اكتب اقتراحك هنا</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="مثلاً: إضافة قسم جديد، تحسين سرعة التوصيل..."
                                placeholderTextColor={COLORS.textMuted}
                                multiline
                                numberOfLines={10}
                                textAlignVertical="top"
                                value={suggestion}
                                onChangeText={setSuggestion}
                            />
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            title="إرسال الاقتراح"
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={!suggestion.trim()}
                            size="large"
                        />
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SIZES.spacing_xl,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.spacing_xxl,
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SIZES.spacing_lg,
        borderRadius: SIZES.radius_lg,
        gap: 12,
        marginBottom: SIZES.spacing_xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoText: {
        flex: 1,
        color: COLORS.text,
        fontSize: SIZES.sm,
        ...FONTS.regular,
        lineHeight: 22,
        textAlign: 'right',
    },
    inputContainer: {
        marginBottom: SIZES.spacing_xxl,
    },
    label: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.semiBold,
        marginBottom: 12,
        textAlign: 'right',
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_lg,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.regular,
        textAlign: 'right',
        minHeight: 200,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    buttonContainer: {
        marginTop: SIZES.spacing_sm,
    },
    successContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SIZES.spacing_xxl,
    },
    successIcon: {
        marginBottom: 24,
    },
    successTitle: {
        color: COLORS.text,
        fontSize: SIZES.xxxl,
        ...FONTS.extraBold,
        marginBottom: 16,
    },
    successText: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
        textAlign: 'center',
        lineHeight: 24,
    },
});
