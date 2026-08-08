import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useSSE } from '../context/SSEContext';

export default function StoryBar({ onStoryPress, onAddStory }) {
    const { user } = useAuth();
    const sse = useSSE();
    const canAddStory = user?.vip_status === 'vip' || user?.role === 'admin';
    const [stories, setStories] = useState(() => sse.stories);

    useEffect(() => {
        const unsubInit = sse.on('stories_init', (data) => setStories(data));
        const unsubAdd  = sse.on('new_story',    (s)    => setStories(prev => [...prev, s]));
        const unsubDel  = sse.on('story_deleted', ({ id }) => setStories(prev => prev.filter(s => s.id !== id)));
        return () => { unsubInit(); unsubAdd(); unsubDel(); };
    }, []);

    if (!stories.length && !canAddStory) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>آخر التحديثات</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {canAddStory && (
                    <TouchableOpacity style={styles.storyContainer} onPress={onAddStory} activeOpacity={0.8}>
                        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.addStoryWrapper}>
                            <Ionicons name="add" size={28} color={COLORS.white} />
                        </LinearGradient>
                        <Text style={styles.storyTitle}>قصتي</Text>
                    </TouchableOpacity>
                )}

                {stories.map((story) => (
                    <TouchableOpacity
                        key={story.id}
                        style={styles.storyContainer}
                        onPress={() => onStoryPress(story)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.imageWrapper, !story.is_seen && styles.unseenBorder]}>
                            <Image
                                source={typeof story.image === 'number' ? story.image : { uri: story.image }}
                                style={styles.storyImage}
                            />
                        </View>
                        <Text style={styles.storyTitle} numberOfLines={1}>{story.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: SIZES.spacing_base },
    sectionTitle: {
        fontSize: SIZES.lg,
        ...FONTS.bold,
        color: COLORS.text,
        marginHorizontal: SIZES.spacing_xl,
        marginBottom: 12,
        textAlign: 'right',
    },
    scrollContent: {
        paddingHorizontal: SIZES.spacing_xl,
        flexDirection: 'row-reverse',
    },
    storyContainer: { alignItems: 'center', marginLeft: 16, width: 75 },
    addStoryWrapper: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
    imageWrapper: {
        width: 70, height: 70, borderRadius: 35,
        padding: 3, borderWidth: 2,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    unseenBorder: { borderColor: COLORS.primary },
    storyImage: { width: '100%', height: '100%', borderRadius: 32 },
    storyTitle: { fontSize: SIZES.xs, ...FONTS.medium, color: COLORS.text, marginTop: 6, textAlign: 'center' },
});
