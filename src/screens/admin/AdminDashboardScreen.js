import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';

export default function AdminDashboardScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>لوحة الإدارة</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('AdminOrders')}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="list" size={32} color={COLORS.primary} />
                    </View>
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>إدارة الطلبات</Text>
                        <Text style={styles.cardSubtitle}>متابعة وتحديث حالة طلبات العملاء</Text>
                    </View>
                    <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('AdminMenu')}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="restaurant" size={32} color={COLORS.primary} />
                    </View>
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>إدارة القائمة</Text>
                        <Text style={styles.cardSubtitle}>إضافة، تعديل وحذف عناصر القائمة</Text>
                    </View>
                    <Ionicons name="chevron-back" size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
            </ScrollView>
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
    content: { padding: SIZES.spacing_xl, gap: SIZES.spacing_lg },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xl,
        padding: SIZES.spacing_xl,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.medium
    },
    iconContainer: {
        width: 60, height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(232,93,44,0.1)',
        alignItems: 'center', justifyContent: 'center'
    },
    cardTextContainer: { flex: 1, marginHorizontal: 16 },
    cardTitle: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold, textAlign: 'right', marginBottom: 4 },
    cardSubtitle: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.regular, textAlign: 'right' }
});
