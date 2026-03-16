import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminDeliveryZonesScreen({ navigation }) {
    const { token } = useAuth();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [fee, setFee] = useState('');

    const loadZones = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminDeliveryZones(token);
            setZones(data);
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadZones();
    }, []);

    const handleAddZone = async () => {
        if (!name.trim() || !fee) {
            Alert.alert('تنبيه', 'يرجى إدخال اسم المنطقة وسعر التوصيل');
            return;
        }

        try {
            setSubmitting(true);
            const payload = { name: name.trim(), price: parseFloat(fee) };
            
            if (editItem) {
                await api.updateDeliveryZone(editItem.id, payload, token);
            } else {
                await api.addDeliveryZone(payload, token);
            }

            setModalVisible(false);
            resetForm();
            loadZones();
            Alert.alert('نجاح', editItem ? 'تم تحديث المنطقة بنجاح' : 'تم إضافة المنطقة بنجاح');
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setFee('');
        setEditItem(null);
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setName(item.name);
        setFee(item.price.toString());
        setModalVisible(true);
    };

    const handleDeleteZone = (id, zoneName) => {
        Alert.alert(
            'حذف المنطقة',
            `هل أنت متأكد من حذف منطقة "${zoneName}"؟`,
            [
                { text: 'إلغاء', style: 'cancel' },
                { 
                    text: 'حذف', 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.deleteDeliveryZone(id, token);
                            loadZones();
                            Alert.alert('نجاح', 'تم حذف المنطقة بنجاح');
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
            <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardFee}>سعر التوصيل: {item.price} ج.م</Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={styles.editBtn}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteZone(item.id, item.name)}
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
                <Text style={styles.title}>مناطق التوصيل</Text>
                <TouchableOpacity onPress={() => { resetForm(); setModalVisible(true); }} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={zones}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadZones} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="map-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد مناطق مضافة</Text>
                        </View>
                    )
                }
            />

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => { setModalVisible(false); resetForm(); }}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editItem ? 'تعديل منطقة توصيل' : 'إضافة منطقة توصيل'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="اسم المنطقة (مثلاً: مدينة نصر)"
                            placeholderTextColor={COLORS.textMuted}
                            value={name}
                            onChangeText={setName}
                            textAlign="right"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="سعر التوصيل (ج.م)"
                            placeholderTextColor={COLORS.textMuted}
                            value={fee}
                            onChangeText={setFee}
                            keyboardType="numeric"
                            textAlign="right"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => { setModalVisible(false); resetForm(); }}>
                                <Text style={styles.cancelBtnText}>إلغاء</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.saveBtn]} 
                                onPress={handleAddZone}
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
    cardInfo: { flex: 1, alignItems: 'flex-end' },
    cardName: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold },
    cardFee: { color: COLORS.primary, fontSize: SIZES.sm, ...FONTS.bold, marginTop: 4 },
    actionButtons: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
    editBtn: { padding: 8 },
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
        marginBottom: 16
    },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1, height: 50, borderRadius: SIZES.radius_md, alignItems: 'center', justifyContent: 'center' },
    cancelBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    saveBtn: { backgroundColor: COLORS.primary },
    cancelBtnText: { color: COLORS.textMuted, fontSize: SIZES.md, ...FONTS.bold },
    saveBtnText: { color: COLORS.white, fontSize: SIZES.md, ...FONTS.bold }
});
