import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, ScrollView,
    TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { uploadProfileImage } from '../../services/supabaseStorage';
import Button from '../../components/Button';

export default function EditProfileScreen({ navigation }) {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [imageUri, setImageUri] = useState(user?.image || null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('تنبيه', 'نحتاج إذن الوصول للمعرض لاختيار صورة');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            const localUri = result.assets[0].uri;
            setImageUri(localUri);

            // Upload immediately
            setIsUploading(true);
            try {
                const publicUrl = await uploadProfileImage(
                    user.id,
                    localUri,
                    user?.image // previous image to delete
                );
                setImageUri(publicUrl);

                // Update profile with new image URL
                await updateProfile({ image: publicUrl });
                Alert.alert('نجاح', 'تم تحديث الصورة بنجاح');
            } catch (error) {
                console.error('Upload error:', error);
                Alert.alert('خطأ', 'فشل رفع الصورة. حاول مرة أخرى.');
                setImageUri(user?.image || null); // revert
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('خطأ', 'يرجى إدخال الاسم');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                name: name.trim(),
            });
            Alert.alert('نجاح', 'تم تحديث البيانات بنجاح', [
                { text: 'تم', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('خطأ', 'حدث خطأ أثناء التحديث');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>تعديل الملف الشخصي</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formContainer}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                            <View style={styles.avatarWrapper}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                {isUploading ? (
                                    <View style={styles.uploadingOverlay}>
                                        <ActivityIndicator color={COLORS.white} size="large" />
                                    </View>
                                ) : (
                                    <View style={styles.cameraIcon}>
                                        <Ionicons name="camera" size={18} color={COLORS.white} />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.changePicButton} onPress={pickImage}>
                            <Text style={styles.changePicText}>تغيير الصورة</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>الاسم الكامل</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="أدخل اسمك"
                                placeholderTextColor={COLORS.textMuted}
                                textAlign="right"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>رقم الهاتف</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                placeholder="أدخل رقمك"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="phone-pad"
                                textAlign="right"
                                editable={false}
                            />
                        </View>
                    </View>

                    <Button
                        title="حفظ التغييرات"
                        onPress={handleSave}
                        loading={isLoading}
                        size="large"
                        style={styles.saveButton}
                    />
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
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
        gap: 16,
    },
    backButton: {
        padding: 4,
    },
    title: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.bold,
        flex: 1,
        textAlign: 'right',
    },
    formContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SIZES.spacing_xl,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        position: 'relative',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    avatarText: {
        color: COLORS.white,
        fontSize: 40,
        ...FONTS.bold,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    changePicButton: {
        marginTop: 12,
    },
    changePicText: {
        color: COLORS.primary,
        fontSize: SIZES.md,
        ...FONTS.semiBold,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.md,
        ...FONTS.medium,
        marginBottom: 8,
        textAlign: 'right',
    },
    inputContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_md,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        color: COLORS.text,
        fontSize: SIZES.base,
        ...FONTS.regular,
        padding: 0,
    },
    saveButton: {
        marginTop: 10,
    },
});
