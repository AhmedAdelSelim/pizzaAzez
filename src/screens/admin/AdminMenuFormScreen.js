import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminMenuFormScreen({ route, navigation }) {
    const { token } = useAuth();
    const item = route.params?.item;
    const isEdit = !!item;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price?.toString() || '',
        category_id: item?.category_id || '',
        image: item?.image || '',
        calories: item?.calories?.toString() || '',
        preparation_time: item?.preparation_time || '',
    });

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.getCategories();
                setCategories(data);
                if (!isEdit && data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: data[0].id }));
                }
            } catch (err) {
                console.log('Failed to fetch categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.category_id) {
            Alert.alert('تنبيه', 'يرجى إدخال الاسم والسعر والقسم');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                calories: formData.calories ? parseInt(formData.calories) : null,
            };

            if (isEdit) {
                await api.updateMenuItemAdmin(item.id, payload, token);
            } else {
                await api.addMenuItem(payload, token);
            }

            Alert.alert('نجاح', isEdit ? 'تم تحديث العنصر' : 'تم إضافة العنصر');
            navigation.goBack();
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>{isEdit ? 'تعديل الصنف' : 'صنف جديد'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>اسم الصنف *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(txt) => setFormData({ ...formData, name: txt })}
                        placeholder="مثال: بيتزا مارجريتا"
                        placeholderTextColor={COLORS.textMuted}
                        textAlign="right"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>الوصف</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(txt) => setFormData({ ...formData, description: txt })}
                        placeholder="مكونات الصنف وتفاصيله"
                        placeholderTextColor={COLORS.textMuted}
                        textAlign="right"
                        multiline
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.label}>السعر (ج.م) *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.price}
                            onChangeText={(txt) => setFormData({ ...formData, price: txt })}
                            placeholder="0.00"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="decimal-pad"
                            textAlign="right"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>السعرات (اختياري)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.calories}
                            onChangeText={(txt) => setFormData({ ...formData, calories: txt })}
                            placeholder="مثال: 450"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="number-pad"
                            textAlign="right"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>رابط الصورة (URL)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.image}
                        onChangeText={(txt) => setFormData({ ...formData, image: txt })}
                        placeholder="https://example.com/image.jpg"
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="none"
                        textAlign="left"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>القسم *</Text>
                    <View style={styles.categoriesContainer}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryChip,
                                    formData.category_id === cat.id && styles.categoryChipActive
                                ]}
                                onPress={() => setFormData({ ...formData, category_id: cat.id })}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    formData.category_id === cat.id && styles.categoryChipTextActive
                                ]}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>حفظ</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
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
    title: { color: COLORS.text, fontSize: SIZES.xl, ...FONTS.bold },
    content: { padding: SIZES.spacing_xl },
    inputGroup: { marginBottom: 20 },
    label: { color: COLORS.text, fontSize: SIZES.sm, ...FONTS.bold, textAlign: 'right', marginBottom: 8 },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius_lg,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.regular
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
    categoriesContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: SIZES.radius_full,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    categoryChipText: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.medium },
    categoryChipTextActive: { color: COLORS.white, ...FONTS.bold },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius_xl,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        ...SHADOWS.medium
    },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: COLORS.white, fontSize: SIZES.lg, ...FONTS.bold }
});
