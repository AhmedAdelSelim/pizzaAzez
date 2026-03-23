import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Image, Dimensions, Animated,
    TouchableOpacity, TouchableWithoutFeedback, StatusBar, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../../theme/theme';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000;

export default function StoryViewScreen({ navigation, route }) {
    const { storyId } = route.params;
    const insets = useSafeAreaInsets();
    const [stories, setStories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);

    const progress = useRef(new Animated.Value(0)).current;
    const pausedAt = useRef(0);
    const animRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const data = await api.getStories();
            setStories(data);
            const idx = data.findIndex(s => s.id === storyId);
            setCurrentIndex(idx >= 0 ? idx : 0);
        } catch {}
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!loading && stories.length > 0) {
            // Fade in new story
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
            startTimer(0);
        }
        return () => animRef.current?.stop();
    }, [currentIndex, loading]);

    const startTimer = (from = 0) => {
        progress.setValue(from);
        animRef.current = Animated.timing(progress, {
            toValue: 1,
            duration: STORY_DURATION * (1 - from),
            useNativeDriver: false,
        });
        animRef.current.start(({ finished }) => {
            if (finished) handleNext();
        });
    };

    const handlePause = () => {
        animRef.current?.stop();
        progress.stopAnimation(val => { pausedAt.current = val; });
        setPaused(true);
    };

    const handleResume = () => {
        setPaused(false);
        startTimer(pausedAt.current);
    };

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            navigation.goBack();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
        } else {
            startTimer(0);
        }
    };

    const handleTap = (evt) => {
        const x = evt.nativeEvent.locationX;
        if (x < width * 0.33) handlePrev();
        else handleNext();
    };

    const currentStory = stories[currentIndex];

    if (loading || !currentStory) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar hidden />
                <ActivityIndicator size="large" color={COLORS.white} />
            </View>
        );
    }

    const ownerInitial = currentStory.owner?.charAt(0)?.toUpperCase() || '؟';

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {currentStory.image ? (
                /* ── Photo story ── */
                <>
                    {/* Blurred background — fills screen with no black bars */}
                    <Image
                        source={typeof currentStory.image === 'number'
                            ? currentStory.image
                            : { uri: currentStory.image }}
                        style={styles.bgImage}
                        resizeMode="cover"
                        blurRadius={18}
                    />
                    <View style={styles.bgDim} />

                    {/* Foreground image — fully visible, nothing cropped */}
                    <Animated.View style={[styles.imageWrapper, { opacity: fadeAnim }]}>
                        <Image
                            source={typeof currentStory.image === 'number'
                                ? currentStory.image
                                : { uri: currentStory.image }}
                            style={styles.storyImage}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </>
            ) : (
                /* ── Text story ── */
                <Animated.View style={[styles.imageWrapper, { opacity: fadeAnim }]}>
                    <LinearGradient
                        colors={currentStory.bg_colors
                            ? currentStory.bg_colors.split(',')
                            : ['#1A1A2E', '#16213E']}
                        style={styles.textStoryBg}
                    >
                        <Text style={styles.textStoryContent}>{currentStory.title}</Text>
                    </LinearGradient>
                </Animated.View>
            )}

            {/* Top gradient — ensures progress + header always readable */}
            <LinearGradient
                colors={['rgba(0,0,0,0.72)', 'rgba(0,0,0,0)']}
                style={styles.topGradient}
                pointerEvents="none"
            />

            {/* Bottom gradient — for title/description readability */}
            <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
                style={styles.bottomGradient}
                pointerEvents="none"
            />

            {/* Tap zones (left third = prev, right two-thirds = next) */}
            <TouchableWithoutFeedback onPress={handleTap} onLongPress={handlePause} onPressOut={paused ? handleResume : undefined}>
                <View style={styles.tapZone} />
            </TouchableWithoutFeedback>

            {/* Top UI — progress bars + header */}
            <View style={[styles.topUI, { paddingTop: insets.top + 10 }]}>
                {/* Progress Bars */}
                <View style={styles.progressRow}>
                    {stories.map((_, i) => (
                        <View key={i} style={styles.progressBg}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: i === currentIndex
                                            ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                                            : i < currentIndex ? '100%' : '0%',
                                    }
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Header row */}
                <View style={styles.headerRow}>
                    {/* Owner info */}
                    <View style={styles.ownerRow}>
                        {currentStory.owner_image ? (
                            <Image source={{ uri: currentStory.owner_image }} style={styles.ownerAvatar} />
                        ) : (
                            <View style={styles.ownerAvatarFallback}>
                                <Text style={styles.ownerInitial}>{ownerInitial}</Text>
                            </View>
                        )}
                        <View>
                            <Text style={styles.ownerName}>{currentStory.owner || 'بيتزا عزيز'}</Text>
                            <Text style={styles.storyCounter}>{currentIndex + 1} / {stories.length}</Text>
                        </View>
                    </View>

                    {/* Close */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Ionicons name="close" size={26} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Pause indicator */}
            {paused && (
                <View style={styles.pauseIndicator} pointerEvents="none">
                    <Ionicons name="pause" size={40} color="rgba(255,255,255,0.7)" />
                </View>
            )}

            {/* Bottom content — caption for photo stories only */}
            {currentStory.image && currentStory.title && (
                <View style={[styles.bottomContent, { paddingBottom: insets.bottom + 20 }]}>
                    <Text style={styles.storyTitle}>{currentStory.title}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.black,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgImage: {
        ...StyleSheet.absoluteFillObject,
        width,
        height,
    },
    bgDim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    imageWrapper: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    storyImage: {
        width,
        height,
    },
    textStoryBg: {
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    textStoryContent: {
        color: COLORS.white,
        fontSize: 28,
        ...FONTS.bold,
        textAlign: 'center',
        lineHeight: 40,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 280,
    },
    tapZone: {
        ...StyleSheet.absoluteFillObject,
    },

    // Top UI
    topUI: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 14,
    },
    progressRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 12,
    },
    progressBg: {
        flex: 1,
        height: 2.5,
        backgroundColor: 'rgba(255,255,255,0.35)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ownerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    ownerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.7)',
    },
    ownerAvatarFallback: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.7)',
    },
    ownerInitial: {
        color: COLORS.white,
        fontSize: SIZES.md,
        ...FONTS.bold,
    },
    ownerName: {
        color: COLORS.white,
        fontSize: SIZES.md,
        ...FONTS.bold,
    },
    storyCounter: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: SIZES.xs,
        ...FONTS.regular,
        marginTop: 1,
    },
    closeBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Pause
    pauseIndicator: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Bottom content
    bottomContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    storyTitle: {
        color: COLORS.white,
        fontSize: SIZES.xxl,
        ...FONTS.extraBold,
        textAlign: 'right',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    storyDescription: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: SIZES.md,
        ...FONTS.regular,
        textAlign: 'right',
        lineHeight: 22,
        marginBottom: 12,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    swipeUpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginTop: 4,
    },
    swipeUpText: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: SIZES.xs,
        ...FONTS.medium,
    },
});
