import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, StatusBar, RefreshControl, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminSuggestionsScreen({ navigation }) {
    const { token } = useAuth();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadSuggestions = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminSuggestions(token);
            setSuggestions(data);
        } catch (error) {
            console.error('Fetch Suggestions Error:', error);
            Alert.alert('خطأ', 'فشل تحميل الاقتراحات');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadSuggestions();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadSuggestions();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const SuggestionItem = ({ item }) => (
        <View style={styles.suggestionCard}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user?.name || 'مستخدم غير معروف'}</Text>
                    <Text style={styles.userPhone}>{item.user?.phone || '-'}</Text>
                </View>
                <View style={styles.dateInfo}>
                    <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.suggestionText}>{item.content}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>اقتراحات العملاء</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <SuggestionItem item={item} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد اقتراحات حالياً</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.spacing_xl,
        paddingTop: 60,
        paddingBottom: SIZES.spacing_base,
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
        fontSize: SIZES.xl,
        ...FONTS.bold,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: SIZES.spacing_xl,
    },
    suggestionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_lg,
        padding: SIZES.spacing_lg,
        marginBottom: SIZES.spacing_md,
        ...SHADOWS.small,
        borderRightWidth: 4,
        borderRightColor: COLORS.primary,
    },
    cardHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    userInfo: {
        alignItems: 'flex-end',
    },
    userName: {
        color: COLORS.text,
        fontSize: SIZES.md,
        ...FONTS.bold,
    },
    userPhone: {
        color: COLORS.textMuted,
        fontSize: SIZES.xs,
        ...FONTS.regular,
    },
    dateInfo: {
        alignItems: 'flex-start',
    },
    dateText: {
        color: COLORS.textMuted,
        fontSize: 10,
        ...FONTS.regular,
    },
    cardContent: {
        paddingTop: 4,
    },
    suggestionText: {
        color: COLORS.text,
        fontSize: SIZES.sm,
        ...FONTS.regular,
        lineHeight: 22,
        textAlign: 'right',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: SIZES.md,
        ...FONTS.regular,
        marginTop: 16,
    },
});
