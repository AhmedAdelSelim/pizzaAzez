import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminStoriesScreen({ navigation }) {
    const { token } = useAuth();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStories = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminStories(token);
            setStories(data);
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadStories();
        });
        return unsubscribe;
    }, [navigation]);

    const handleDelete = (id) => {
        Alert.alert(
            'تأكيد الحذف',
            'هل أنت متأكد من حذف هذه القصة؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                { 
                    text: 'حذف', 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            await api.deleteStoryAdmin(id, token);
                            Alert.alert('نجاح', 'تم حذف القصة');
                            loadStories();
                        } catch (error) {
                            Alert.alert('خطأ', error.message);
                        }
                    } 
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.storyCard}>
            <View style={styles.imageContainer}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} />
                ) : (
                    <Ionicons name="image-outline" size={32} color={COLORS.primary} />
                )}
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.itemName}>{item.title || 'بدون عنوان'}</Text>
                <Text style={styles.itemSubtitle}>{item.active ? 'نشط' : 'غير نشط'}</Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: COLORS.error + '15' }]}
                    onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash" size={20} color={COLORS.error} />
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
                <Text style={styles.title}>إدارة القصص (الستوريز)</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AdminStoryForm')} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={stories}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStories} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="images-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد قصص حتى الآن</Text>
                        </View>
                    )
                }
            />
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
    addButton: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
        ...SHADOWS.small
    },
    title: { color: COLORS.text, fontSize: SIZES.xl, ...FONTS.bold },
    listContainer: { padding: SIZES.spacing_xl, gap: SIZES.spacing_md, paddingBottom: 100 },
    storyCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_md,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        ...SHADOWS.small
    },
    imageContainer: {
        width: 60, height: 60,
        borderRadius: SIZES.radius_md,
        backgroundColor: 'rgba(232,93,44,0.1)',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden'
    },
    image: { width: '100%', height: '100%' },
    cardInfo: { flex: 1, marginRight: 16, alignItems: 'flex-end' },
    itemName: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold, textAlign: 'right' },
    itemSubtitle: { color: COLORS.primary, fontSize: SIZES.sm, ...FONTS.medium, marginTop: 4 },
    actionButtons: { flexDirection: 'row-reverse', gap: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyText: { color: COLORS.textMuted, fontSize: SIZES.lg, ...FONTS.medium, marginTop: 16 }
});
