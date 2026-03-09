import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';
import api from '../services/api';

export default function StoryBar({ onStoryPress }) {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const data = await api.getStories();
            setStories(data);
        } catch (error) {
            console.error('Error fetching stories:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>آخر التحديثات</Text>
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
            </View>
        );
    }

    if (!stories.length) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>آخر التحديثات</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {stories.map((story) => (
                    <TouchableOpacity
                        key={story.id}
                        style={styles.storyContainer}
                        onPress={() => onStoryPress(story)}
                        activeOpacity={0.8}
                    >
                        <View style={[
                            styles.imageWrapper,
                            !story.is_seen && styles.unseenBorder
                        ]}>
                            <Image
                                source={typeof story.image === 'number' ? story.image : { uri: story.image }}
                                style={styles.storyImage}
                            />
                        </View>
                        <Text style={styles.storyTitle} numberOfLines={1}>
                            {story.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: SIZES.spacing_base,
    },
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
        flexDirection: 'row-reverse', // Align with RTL
    },
    storyContainer: {
        alignItems: 'center',
        marginLeft: 16,
        width: 75,
    },
    imageWrapper: {
        width: 70,
        height: 70,
        borderRadius: 35,
        padding: 3,
        borderWidth: 2,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    unseenBorder: {
        borderColor: COLORS.primary,
    },
    storyImage: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    storyTitle: {
        fontSize: SIZES.xs,
        ...FONTS.medium,
        color: COLORS.text,
        marginTop: 6,
        textAlign: 'center',
    },
});
