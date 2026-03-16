import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminUsersScreen({ navigation }) {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminUsers(token);
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            Alert.alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadUsers();
        });
        return unsubscribe;
    }, [navigation]);

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text) {
            const filtered = users.filter((user) =>
                user.name?.toLowerCase().includes(text.toLowerCase()) ||
                user.phone?.includes(text)
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        const actionText = newStatus ? 'تفعيل' : 'تعطيل';

        Alert.alert(
            `تأكيد ال${actionText}`,
            `هل أنت متأكد من ${actionText} هذا الحساب؟`,
            [
                { text: 'إلغاء', style: 'cancel' },
                { 
                    text: 'تأكيد', 
                    style: newStatus ? 'default' : 'destructive', 
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.updateUserStatus(userId, newStatus, token);
                            Alert.alert('نجاح', `تم ${actionText} الحساب بنجاح`);
                            loadUsers();
                        } catch (error) {
                            Alert.alert('خطأ', error.message);
                            setLoading(false);
                        }
                    } 
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        // Assume default True if undefined, to prevent bugging out on newly migrated missing rows
        const isActive = item.is_active !== false; 
        
        return (
            <View style={styles.userCard}>
                <View style={styles.cardInfo}>
                    <Text style={styles.userName}>{item.name || 'بدون اسم'}</Text>
                    <Text style={styles.userPhone}>{item.phone}</Text>
                    <Text style={styles.userRole}>الدور: {item.role === 'admin' ? 'مدير' : 'عميل'}</Text>
                </View>
                
                <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
                    <Text style={styles.statusText}>{isActive ? 'نشط' : 'معطل'}</Text>
                </View>

                {item.role !== 'admin' && (
                    <TouchableOpacity 
                        style={[styles.toggleBtn, isActive ? styles.toggleBtnInactive : styles.toggleBtnActive]}
                        onPress={() => toggleUserStatus(item.id, isActive)}
                    >
                        <Text style={styles.toggleBtnText}>
                            {isActive ? 'تعطيل' : 'تفعيل'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>إدارة العملاء</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    textAlign="right"
                />
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadUsers} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لم يتم العثور على مستخدمين</Text>
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
    title: { color: COLORS.text, fontSize: SIZES.xl, ...FONTS.bold },
    searchContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: SIZES.spacing_xl,
        marginBottom: SIZES.spacing_base,
        paddingHorizontal: SIZES.spacing_md,
        borderRadius: SIZES.radius_lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 50,
    },
    searchIcon: {
        marginLeft: SIZES.spacing_sm,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.regular,
        height: '100%',
    },
    listContainer: { padding: SIZES.spacing_xl, gap: SIZES.spacing_md, paddingBottom: 100 },
    userCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_md,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        ...SHADOWS.small
    },
    cardInfo: { flex: 1, marginRight: 16, alignItems: 'flex-end' },
    userName: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold, textAlign: 'right' },
    userPhone: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.medium, marginTop: 4 },
    userRole: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular, marginTop: 2 },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    statusActive: { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
    statusInactive: { backgroundColor: 'rgba(244, 67, 54, 0.1)' },
    statusText: { color: COLORS.text, fontSize: SIZES.xs, ...FONTS.bold },
    toggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: SIZES.radius_md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleBtnActive: { backgroundColor: COLORS.success },
    toggleBtnInactive: { backgroundColor: COLORS.error },
    toggleBtnText: { color: COLORS.white, fontSize: SIZES.sm, ...FONTS.bold }
});
