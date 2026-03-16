import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

export default function AdminStoryFormScreen({ navigation, route }) {
    const { token } = useAuth();
    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [active, setActive] = useState(true);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!title || !image) {
            Alert.alert('خطأ', 'يرجى إدخال عنوان وصورة للقصة');
            return;
        }

        try {
            setLoading(true);
            const storyData = {
                title,
                image,
                active,
                // Assuming we also want to timestamp when it was created
                created_at: new Date().toISOString()
            };

            await api.addStoryAdmin(storyData, token);
            Alert.alert('نجاح', 'تم إضافة القصة بنجاح!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>إضافة قصة جديدة</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.imagePickerContainer}>
                    <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.previewImage} />
                        ) : (
                            <>
                                <Ionicons name="camera" size={40} color={COLORS.primary} />
                                <Text style={styles.imageText}>اختر صورة طولية للقصة</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>عنوان القصة</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="أدخل عنواناً قصيراً للقصة"
                        placeholderTextColor={COLORS.textMuted}
                        textAlign="right"
                    />
                </View>

                <View style={styles.switchContainer}>
                    <View style={styles.switchLabelContainer}>
                        <Text style={styles.label}>حالة القصة (نشطة)</Text>
                        <Text style={styles.switchSubLabel}>القصة ستظهر للعملاء إذا كانت نشطة</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.switch, active && styles.switchActive]}
                        onPress={() => setActive(!active)}
                    >
                        <View style={[styles.switchThumb, active && styles.switchThumbActive]} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Text style={styles.saveButtonText}>حفظ القصة</Text>
                            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
        justifyContent: 'space-between'
    },
    backButton: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center', justifyContent: 'center',
        ...SHADOWS.small
    },
    headerTitle: { color: COLORS.text, fontSize: SIZES.xl, ...FONTS.bold },
    content: { padding: SIZES.spacing_xl, gap: SIZES.spacing_lg },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: SIZES.spacing_md,
    },
    imagePlaceholder: {
        width: 140,
        height: 220,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageText: {
        color: COLORS.primary,
        fontSize: SIZES.sm,
        ...FONTS.medium,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    inputContainer: { gap: 8 },
    label: { color: COLORS.text, fontSize: SIZES.sm, ...FONTS.bold, textAlign: 'right' },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: 16,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.regular,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    switchContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: SIZES.radius_lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginTop: SIZES.spacing_sm,
    },
    switchLabelContainer: { flex: 1, alignItems: 'flex-end', marginRight: 12 },
    switchSubLabel: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular, marginTop: 4 },
    switch: {
        width: 50,
        height: 30,
        backgroundColor: COLORS.border,
        borderRadius: 15,
        padding: 2,
        justifyContent: 'center',
    },
    switchActive: { backgroundColor: COLORS.primary },
    switchThumb: {
        width: 26,
        height: 26,
        backgroundColor: COLORS.white,
        borderRadius: 13,
        transform: [{ translateX: 0 }],
        ...SHADOWS.small,
    },
    switchThumbActive: { transform: [{ translateX: 20 }] },
    footer: {
        padding: SIZES.spacing_xl,
        paddingBottom: 40,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: SIZES.radius_xl,
        gap: 8,
        ...SHADOWS.medium
    },
    saveButtonText: { color: COLORS.white, fontSize: SIZES.lg, ...FONTS.bold }
});
