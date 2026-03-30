import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

    const toggleVipStatus = async (userId, currentVipStatus) => {
        const isVip = currentVipStatus === 'vip';
        const actionText = isVip ? 'إلغاء VIP' : 'تفعيل VIP';

        Alert.alert(
            actionText,
            isVip
                ? 'هل تريد إلغاء عضوية VIP لهذا المستخدم؟'
                : 'هل تريد تفعيل عضوية VIP لهذا المستخدم؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'تأكيد',
                    style: isVip ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            await api.handleVipRequest(userId, isVip ? 'none' : 'vip', token);
                            loadUsers();
                        } catch (error) {
                            Alert.alert('خطأ', error.message);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isActive = item.is_active !== false;
        const isVip = item.vip_status === 'vip';
        const isPending = item.vip_status === 'pending';

        return (
            <View style={styles.userCard}>
                {/* User info */}
                <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>{item.name || 'بدون اسم'}</Text>
                        {isVip && (
                            <LinearGradient colors={['#FFD700', '#FFA000']} style={styles.vipBadge}>
                                <Ionicons name="star" size={10} color="#fff" />
                                <Text style={styles.vipBadgeText}>VIP</Text>
                            </LinearGradient>
                        )}
                        {isPending && (
                            <View style={styles.pendingBadge}>
                                <Text style={styles.pendingBadgeText}>معلق</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.userPhone}>{item.phone}</Text>
                    <Text style={styles.userRole}>
                        {item.role === 'admin' ? 'مدير' : 'عميل'}
                    </Text>
                </View>

                {/* Action buttons */}
                {item.role !== 'admin' && (
                    <View style={styles.actions}>
                        {/* VIP toggle */}
                        <TouchableOpacity
                            style={[styles.actionBtn, isVip ? styles.btnRevokeVip : styles.btnGrantVip]}
                            onPress={() => toggleVipStatus(item.id, item.vip_status)}
                        >
                            <Ionicons name={isVip ? 'star' : 'star-outline'} size={13} color={COLORS.white} />
                            <Text style={styles.actionBtnText}>{isVip ? 'إلغاء VIP' : 'VIP'}</Text>
                        </TouchableOpacity>

                        {/* Active toggle */}
                        <TouchableOpacity
                            style={[styles.actionBtn, isActive ? styles.btnDeactivate : styles.btnActivate]}
                            onPress={() => toggleUserStatus(item.id, isActive)}
                        >
                            <Ionicons name={isActive ? 'ban-outline' : 'checkmark-circle-outline'} size={13} color={COLORS.white} />
                            <Text style={styles.actionBtnText}>{isActive ? 'تعطيل' : 'تفعيل'}</Text>
                        </TouchableOpacity>
                    </View>
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
        ...SHADOWS.small,
    },
    cardInfo: { alignItems: 'flex-end', marginBottom: 12 },
    nameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 4 },
    userName: { color: COLORS.text, fontSize: SIZES.md, ...FONTS.bold },
    userPhone: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.medium, marginTop: 2 },
    userRole: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular, marginTop: 2 },
    vipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: SIZES.radius_full,
    },
    vipBadgeText: { color: COLORS.white, fontSize: 10, ...FONTS.bold },
    pendingBadge: {
        backgroundColor: 'rgba(255,160,0,0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: SIZES.radius_full,
        borderWidth: 1,
        borderColor: 'rgba(255,160,0,0.4)',
    },
    pendingBadgeText: { color: '#FFA000', fontSize: 10, ...FONTS.bold },
    actions: { flexDirection: 'row-reverse', gap: 8 },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingVertical: 9,
        borderRadius: SIZES.radius_md,
    },
    actionBtnText: { color: COLORS.white, fontSize: SIZES.xs, ...FONTS.bold },
    btnGrantVip: { backgroundColor: '#FFA000' },
    btnRevokeVip: { backgroundColor: '#7B2FBE' },
    btnActivate: { backgroundColor: COLORS.success || '#4CAF50' },
    btnDeactivate: { backgroundColor: COLORS.error || '#F44336' },
});
