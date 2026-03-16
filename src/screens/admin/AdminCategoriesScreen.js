import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminCategoriesScreen({ navigation }) {
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminCategories(token);
            setCategories(data);
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('تنبيه', 'يرجى إدخال اسم القسم');
            return;
        }

        try {
            setSubmitting(true);
            await api.addCategory({ name: newCategoryName.trim() }, token);
            setModalVisible(false);
            setNewCategoryName('');
            loadCategories();
            Alert.alert('نجاح', 'تم إضافة القسم بنجاح');
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = (id, name) => {
        Alert.alert(
            'حذف القسم',
            `هل أنت متأكد من حذف قسم "${name}"؟ سيؤدي ذلك لإخفائه من القائمة.`,
            [
                { text: 'إلغاء', style: 'cancel' },
                { 
                    text: 'حذف', 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.deleteCategory(id, token);
                            loadCategories();
                            Alert.alert('نجاح', 'تم حذف القسم بنجاح');
                        } catch (error) {
                            Alert.alert('خطأ', error.message);
                            setLoading(false);
                        }
                    } 
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.cardName}>{item.name}</Text>
            <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => handleDeleteCategory(item.id, item.name)}
            >
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>إدارة الأقسام</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={categories}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCategories} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="folder-open-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا يوجد أقسام مضافة</Text>
                        </View>
                    )
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>إضافة قسم جديد</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="اسم القسم (مثلاً: بيتزا، مشروبات)"
                            placeholderTextColor={COLORS.textMuted}
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            textAlign="right"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.cancelBtn]} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>إلغاء</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.saveBtn]} 
                                onPress={handleAddCategory}
                                disabled={submitting}
                            >
                                <Text style={styles.saveBtnText}>{submitting ? 'جاري الحفظ...' : 'حفظ'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    title: { color: COLORS.text, fontSize: SIZES.xl, ...FONTS.bold },
    addButton: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
        ...SHADOWS.medium
    },
    listContainer: { padding: SIZES.spacing_xl, gap: SIZES.spacing_md },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_md,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.small
    },
    cardName: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold },
    deleteBtn: { padding: 8 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: COLORS.textMuted, fontSize: SIZES.md, ...FONTS.medium, marginTop: 16 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        padding: SIZES.spacing_xl,
        ...SHADOWS.large
    },
    modalTitle: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold, textAlign: 'center', marginBottom: 20 },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius_md,
        padding: SIZES.spacing_md,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.regular,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20
    },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalBtn: {
        flex: 1,
        height: 50,
        borderRadius: SIZES.radius_md,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    saveBtn: { backgroundColor: COLORS.primary },
    cancelBtnText: { color: COLORS.textMuted, fontSize: SIZES.md, ...FONTS.bold },
    saveBtnText: { color: COLORS.white, fontSize: SIZES.md, ...FONTS.bold }
});
