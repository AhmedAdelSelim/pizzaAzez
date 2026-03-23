import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    StatusBar, Alert, ActivityIndicator, Image, Dimensions,
    KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

const TEXT_BG_OPTIONS = [
    { id: 'orange',  colors: ['#E85D2C', '#B03A18'] },
    { id: 'purple',  colors: ['#7B2FBE', '#4A1080'] },
    { id: 'blue',    colors: ['#1565C0', '#0D47A1'] },
    { id: 'teal',    colors: ['#00897B', '#00574E'] },
    { id: 'dark',    colors: ['#1A1A2E', '#16213E'] },
    { id: 'red',     colors: ['#C62828', '#8E0000'] },
];

// ── Type selector ─────────────────────────────────────────────────────────────
function TypeSelector({ onSelect, onClose, insets }) {
    return (
        <View style={[sel.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={sel.header}>
                <TouchableOpacity onPress={onClose} style={sel.closeBtn}>
                    <Ionicons name="close" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={sel.title}>نوع القصة</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={sel.vipNote}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={sel.vipText}>متاح لأعضاء VIP والمشرفين فقط</Text>
            </View>

            <View style={sel.cards}>
                <TouchableOpacity style={sel.card} onPress={() => onSelect('photo')} activeOpacity={0.8}>
                    <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={sel.cardGrad}>
                        <Ionicons name="image-outline" size={40} color={COLORS.white} />
                    </LinearGradient>
                    <Text style={sel.cardLabel}>صورة</Text>
                    <Text style={sel.cardSub}>شارك صورة مع متابعيك</Text>
                </TouchableOpacity>

                <TouchableOpacity style={sel.card} onPress={() => onSelect('text')} activeOpacity={0.8}>
                    <LinearGradient colors={['#7B2FBE', '#4A1080']} style={sel.cardGrad}>
                        <Ionicons name="text-outline" size={40} color={COLORS.white} />
                    </LinearGradient>
                    <Text style={sel.cardLabel}>نص</Text>
                    <Text style={sel.cardSub}>شارك رأيك أو إعلاناً</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const sel = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.spacing_xl },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
    title: { color: COLORS.text, fontSize: SIZES.xl, ...FONTS.bold },
    vipNote: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: SIZES.radius_md, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', marginBottom: 32 },
    vipText: { color: '#FFD700', fontSize: SIZES.sm, ...FONTS.semiBold },
    cards: { flexDirection: 'row', gap: 16 },
    card: { flex: 1, alignItems: 'center', gap: 12 },
    cardGrad: { width: '100%', aspectRatio: 0.65, borderRadius: SIZES.radius_xxl, alignItems: 'center', justifyContent: 'center' },
    cardLabel: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold },
    cardSub: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular, textAlign: 'center' },
});

// ── Photo story ───────────────────────────────────────────────────────────────
function PhotoStory({ onBack, token, user, navigation }) {
    const insets = useSafeAreaInsets();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('صلاحية مطلوبة', 'يرجى السماح بالوصول إلى الصور'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 0.85,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const handlePublish = async () => {
        if (!image) { Alert.alert('خطأ', 'يرجى اختيار صورة'); return; }
        setLoading(true);
        try {
            await api.createStory({ image, title: '' }, token);
            Alert.alert('تم ✅', 'تم نشر قصتك!', [{ text: 'حسناً', onPress: () => navigation.goBack() }]);
        } catch (e) { Alert.alert('خطأ', e.message); }
        finally { setLoading(false); }
    };

    if (image) {
        return (
            <View style={ph.container}>
                <StatusBar hidden />
                <Image source={{ uri: image }} style={ph.bg} blurRadius={18} />
                <View style={ph.bgDim} />
                <Image source={{ uri: image }} style={ph.fg} resizeMode="contain" />
                <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={ph.topGrad} pointerEvents="none" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={ph.bottomGrad} pointerEvents="none" />

                {/* Top bar */}
                <View style={[ph.topBar, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => setImage(null)} style={ph.iconBtn}>
                        <Ionicons name="arrow-forward" size={22} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={ph.ownerRow}>
                        <View style={ph.avatar}><Text style={ph.avatarTxt}>{user?.name?.charAt(0)?.toUpperCase() || '؟'}</Text></View>
                        <Text style={ph.ownerName}>{user?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={pickImage} style={ph.iconBtn}>
                        <Ionicons name="image-outline" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Publish */}
                <View style={[ph.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                    <TouchableOpacity style={[ph.publishBtn, loading && { opacity: 0.6 }]} onPress={handlePublish} disabled={loading}>
                        {loading ? <ActivityIndicator color={COLORS.white} size="small" /> : <>
                            <Text style={ph.publishTxt}>نشر الصورة</Text>
                            <Ionicons name="paper-plane" size={18} color={COLORS.white} />
                        </>}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={ph.pickerContainer}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={[ph.pickerHeader, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity onPress={onBack} style={ph.iconBtnDark}><Ionicons name="arrow-forward" size={22} color={COLORS.text} /></TouchableOpacity>
                <Text style={ph.pickerTitle}>قصة صورة</Text>
                <View style={{ width: 40 }} />
            </View>
            <TouchableOpacity style={ph.pickZone} onPress={pickImage} activeOpacity={0.8}>
                <Ionicons name="image-outline" size={48} color={COLORS.primary} />
                <Text style={ph.pickLabel}>اختر صورة من معرضك</Text>
                <Text style={ph.pickSub}>يُفضَّل نسبة 9:16 للعرض الأمثل</Text>
            </TouchableOpacity>
        </View>
    );
}

const ph = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    bg: { ...StyleSheet.absoluteFillObject, width, height },
    bgDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    fg: { position: 'absolute', width, height },
    topGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
    bottomGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 },
    topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
    iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
    ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
    avatarTxt: { color: COLORS.white, fontSize: SIZES.sm, ...FONTS.bold },
    ownerName: { color: COLORS.white, fontSize: SIZES.sm, ...FONTS.bold },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20 },
    publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.primary, borderRadius: SIZES.radius_xl, paddingVertical: 14, ...SHADOWS.medium },
    publishTxt: { color: COLORS.white, fontSize: SIZES.md, ...FONTS.bold },
    pickerContainer: { flex: 1, backgroundColor: COLORS.background },
    pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.spacing_xl, paddingBottom: SIZES.spacing_base },
    iconBtnDark: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
    pickerTitle: { color: COLORS.text, fontSize: SIZES.xl, ...FONTS.bold },
    pickZone: { flex: 1, margin: SIZES.spacing_xl, borderRadius: SIZES.radius_xxl, borderWidth: 2, borderColor: COLORS.primary + '40', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: COLORS.primary + '08' },
    pickLabel: { color: COLORS.text, fontSize: SIZES.lg, ...FONTS.bold },
    pickSub: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.regular },
});

// ── Text story ────────────────────────────────────────────────────────────────
function TextStory({ onBack, token, user, navigation }) {
    const insets = useSafeAreaInsets();
    const [text, setText] = useState('');
    const [bgIndex, setBgIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const bg = TEXT_BG_OPTIONS[bgIndex];

    const handlePublish = async () => {
        if (!text.trim()) { Alert.alert('خطأ', 'يرجى كتابة نص للقصة'); return; }
        setLoading(true);
        try {
            await api.createStory({ image: '', title: text.trim(), bg_colors: bg.colors.join(',') }, token);
            Alert.alert('تم ✅', 'تم نشر قصتك!', [{ text: 'حسناً', onPress: () => navigation.goBack() }]);
        } catch (e) { Alert.alert('خطأ', e.message); }
        finally { setLoading(false); }
    };

    return (
        <View style={tx.container}>
            <StatusBar hidden />

            {/* Full-screen gradient preview */}
            <LinearGradient colors={bg.colors} style={tx.bgGrad} />

            {/* Top bar */}
            <View style={[tx.topBar, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={onBack} style={tx.iconBtn}>
                    <Ionicons name="arrow-forward" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <View style={tx.ownerRow}>
                    <View style={tx.avatar}><Text style={tx.avatarTxt}>{user?.name?.charAt(0)?.toUpperCase() || '؟'}</Text></View>
                    <Text style={tx.ownerName}>{user?.name}</Text>
                </View>
                <View style={{ width: 38 }} />
            </View>

            {/* Text input centered */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tx.inputArea}>
                <TextInput
                    style={tx.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="اكتب ما تريد مشاركته…"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    multiline
                    maxLength={200}
                    textAlign="center"
                    autoFocus
                />
                <Text style={tx.counter}>{text.length}/200</Text>
            </KeyboardAvoidingView>

            {/* Bottom: color picker + publish */}
            <View style={[tx.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tx.colorRow}>
                    {TEXT_BG_OPTIONS.map((opt, i) => (
                        <TouchableOpacity key={opt.id} onPress={() => setBgIndex(i)} style={[tx.colorDot, i === bgIndex && tx.colorDotSelected]}>
                            <LinearGradient colors={opt.colors} style={tx.colorDotInner} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity style={[tx.publishBtn, (!text.trim() || loading) && { opacity: 0.5 }]} onPress={handlePublish} disabled={!text.trim() || loading}>
                    {loading ? <ActivityIndicator color={COLORS.white} size="small" /> : <>
                        <Text style={tx.publishTxt}>نشر النص</Text>
                        <Ionicons name="paper-plane" size={18} color={COLORS.white} />
                    </>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const tx = StyleSheet.create({
    container: { flex: 1 },
    bgGrad: { ...StyleSheet.absoluteFillObject },
    topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, zIndex: 10 },
    iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
    ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
    avatarTxt: { color: COLORS.white, fontSize: SIZES.sm, ...FONTS.bold },
    ownerName: { color: COLORS.white, fontSize: SIZES.sm, ...FONTS.bold },
    inputArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
    input: { color: COLORS.white, fontSize: 26, ...FONTS.bold, textAlign: 'center', lineHeight: 36, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
    counter: { color: 'rgba(255,255,255,0.4)', fontSize: SIZES.xs, ...FONTS.regular, marginTop: 8 },
    bottomBar: { paddingHorizontal: 16, gap: 14, zIndex: 10 },
    colorRow: { paddingVertical: 4, gap: 10, paddingHorizontal: 4 },
    colorDot: { width: 34, height: 34, borderRadius: 17, padding: 3, borderWidth: 2, borderColor: 'transparent' },
    colorDotSelected: { borderColor: COLORS.white },
    colorDotInner: { flex: 1, borderRadius: 13 },
    publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: SIZES.radius_xl, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
    publishTxt: { color: COLORS.white, fontSize: SIZES.md, ...FONTS.bold },
});

// ── Root screen ───────────────────────────────────────────────────────────────
export default function CreateStoryScreen({ navigation }) {
    const { token, user } = useAuth();
    const insets = useSafeAreaInsets();
    const [mode, setMode] = useState(null); // null | 'photo' | 'text'

    if (mode === 'photo') return <PhotoStory onBack={() => setMode(null)} token={token} user={user} navigation={navigation} />;
    if (mode === 'text')  return <TextStory  onBack={() => setMode(null)} token={token} user={user} navigation={navigation} />;

    return <TypeSelector onSelect={setMode} onClose={() => navigation.goBack()} insets={insets} />;
}
