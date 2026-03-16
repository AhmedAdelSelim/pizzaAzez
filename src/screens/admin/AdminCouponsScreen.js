import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Alert, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminCouponsScreen({ navigation }) {
    const { token } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage'); // or 'fixed'
    const [discountValue, setDiscountValue] = useState('');
    const [isActive, setIsActive] = useState(true);

    const loadCoupons = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminCoupons(token);
            setCoupons(data);
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const handleAddCoupon = async () => {
        if (!code.trim() || !discountValue) {
            Alert.alert('تنبيه', 'يرجى إكمال جميع الحقول');
            return;
        }

        try {
            setSubmitting(true);
            const couponData = {
                code: code.trim().toUpperCase(),
                type: discountType,
                value: parseFloat(discountValue),
                is_active: isActive
            };
            await api.addCoupon(couponData, token);
            setModalVisible(false);
            resetForm();
            loadCoupons();
            Alert.alert('نجاح', 'تم إضافة الكوبون بنجاح');
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setCode('');
        setDiscountType('percentage');
        setDiscountValue('');
        setIsActive(true);
    };

    const handleDeleteCoupon = (id, codeText) => {
        Alert.alert(
            'حذف الكوبون',
            `هل أنت متأكد من حذف كود الخصم "${codeText}"؟`,
            [
                { text: 'إلغاء', style: 'cancel' },
                { 
                    text: 'حذف', 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.deleteCoupon(id, token);
                            loadCoupons();
                            Alert.alert('نجاح', 'تم حذف الكوبون بنجاح');
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
            <View style={styles.cardHeader}>
                <Text style={styles.cardCode}>{item.code}</Text>
                <View style={[styles.statusBadge, item.is_active ? styles.statusActive : styles.statusInactive]}>
                    <Text style={styles.statusText}>{item.is_active ? 'نشط' : 'معطل'}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.cardInfo}>الخصم: {item.value}{item.type === 'percentage' ? '%' : ' ج.م'}</Text>
                <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteCoupon(item.id, item.code)}
                >
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>إدارة الكوبونات</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={coupons}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCoupons} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="ticket-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد كوبونات مضافة</Text>
                        </View>
                    )
                }
            />

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>إضافة كوبون جديد</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>كود الخصم</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="مثلاً: PIZZA10"
                                placeholderTextColor={COLORS.textMuted}
                                value={code}
                                onChangeText={setCode}
                                autoCapitalize="characters"
                                textAlign="right"
                            />

                            <Text style={styles.label}>نوع الخصم</Text>
                            <View style={styles.typeContainer}>
                                <TouchableOpacity 
                                    style={[styles.typeBtn, discountType === 'percentage' && styles.typeBtnActive]}
                                    onPress={() => setDiscountType('percentage')}
                                >
                                    <Text style={[styles.typeBtnText, discountType === 'percentage' && styles.typeBtnTextActive]}>نسبة مئوية (%)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.typeBtn, discountType === 'fixed' && styles.typeBtnActive]}
                                    onPress={() => setDiscountType('fixed')}
                                >
                                    <Text style={[styles.typeBtnText, discountType === 'fixed' && styles.typeBtnTextActive]}>مبلغ ثابت</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>قيمة الخصم</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="القيمة"
                                placeholderTextColor={COLORS.textMuted}
                                value={discountValue}
                                onChangeText={setDiscountValue}
                                keyboardType="numeric"
                                textAlign="right"
                            />

                            <TouchableOpacity 
                                style={styles.statusToggle} 
                                onPress={() => setIsActive(!isActive)}
                            >
                                <Ionicons 
                                    name={isActive ? "checkbox" : "square-outline"} 
                                    size={24} 
                                    color={isActive ? COLORS.primary : COLORS.textMuted} 
                                />
                                <Text style={styles.statusToggleText}>تفعيل الكوبون فوراً</Text>
                            </TouchableOpacity>

                            <View style={[styles.modalButtons, { marginTop: 20 }]}>
                                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelBtnText}>إلغاء</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.saveBtn]} 
                                    onPress={handleAddCoupon}
                                    disabled={submitting}
                                >
                                    <Text style={styles.saveBtnText}>{submitting ? 'جاري الحفظ...' : 'حفظ'}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
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
        ...SHADOWS.small
    },
    cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardCode: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusActive: { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
    statusInactive: { backgroundColor: 'rgba(244, 67, 54, 0.1)' },
    statusText: { fontSize: SIZES.xs, ...FONTS.bold, color: COLORS.text },
    cardBody: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
    cardInfo: { color: COLORS.textMuted, fontSize: SIZES.md, ...FONTS.medium },
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
        width: '90%',
        maxHeight: '80%',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        padding: SIZES.spacing_xl,
        ...SHADOWS.large
    },
    modalTitle: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold, textAlign: 'center', marginBottom: 20 },
    label: { color: COLORS.text, fontSize: SIZES.sm, ...FONTS.bold, textAlign: 'right', marginBottom: 8 },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius_md,
        padding: SIZES.spacing_md,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.regular,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16
    },
    typeContainer: { flexDirection: 'row-reverse', gap: 10, marginBottom: 16 },
    typeBtn: {
        flex: 1,
        height: 45,
        borderRadius: SIZES.radius_md,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center'
    },
    typeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    typeBtnText: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.bold },
    typeBtnTextActive: { color: COLORS.white },
    statusToggle: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
    statusToggleText: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.medium },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1, height: 50, borderRadius: SIZES.radius_md, alignItems: 'center', justifyContent: 'center' },
    cancelBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    saveBtn: { backgroundColor: COLORS.primary },
    cancelBtnText: { color: COLORS.textMuted, fontSize: SIZES.md, ...FONTS.bold },
    saveBtnText: { color: COLORS.white, fontSize: SIZES.md, ...FONTS.bold }
});
