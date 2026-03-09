import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Image, Dimensions, Animated,
    TouchableOpacity, StatusBar, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../theme/theme';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function StoryViewScreen({ navigation, route }) {
    const { storyId } = route.params;
    const [stories, setStories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const data = await api.getStories();
            setStories(data);
            const initialIndex = data.findIndex(s => s.id === storyId);
            setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
        } catch (error) {
            console.error('Error fetching stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentStory = stories[currentIndex];

    useEffect(() => {
        if (!loading && stories.length > 0) {
            startAnimation();
        }
        return () => progress.stopAnimation();
    }, [currentIndex, loading]);

    const startAnimation = () => {
        progress.setValue(0);
        Animated.timing(progress, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                handleNext();
            }
        });
    };

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            navigation.goBack();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            startAnimation();
        }
    };

    const handlePress = (evt) => {
        const x = evt.nativeEvent.locationX;
        if (x < width / 3) {
            handlePrev();
        } else {
            handleNext();
        }
    };

    if (loading || !currentStory) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.white} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <TouchableOpacity
                activeOpacity={1}
                onPress={handlePress}
                style={styles.pressArea}
            >
                <Image
                    source={typeof currentStory.image === 'number' ? currentStory.image : { uri: currentStory.image }}
                    style={styles.storyImage}
                    resizeMode="cover"
                />

                <SafeAreaView style={styles.overlay}>
                    {/* Progress Bars */}
                    <View style={styles.progressContainer}>
                        {stories.map((_, index) => (
                            <View key={index} style={styles.progressBarBackground}>
                                <Animated.View
                                    style={[
                                        styles.progressBarFilled,
                                        {
                                            width: index === currentIndex
                                                ? progress.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%']
                                                })
                                                : index < currentIndex ? '100%' : '0%'
                                        }
                                    ]}
                                />
                            </View>
                        ))}
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.ownerInfo}>
                            <Image source={currentStory.owner_image ? { uri: currentStory.owner_image } : undefined} style={styles.ownerAvatar} />
                            <Text style={styles.ownerName}>{currentStory.owner}</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                            <Ionicons name="close" size={30} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    pressArea: {
        flex: 1,
    },
    storyImage: {
        width: width,
        height: height,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 10,
    },
    progressContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        gap: 5,
        marginTop: 10,
    },
    progressBarBackground: {
        flex: 1,
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFilled: {
        height: '100%',
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 20,
    },
    ownerInfo: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 10,
    },
    ownerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.white,
    },
    ownerName: {
        color: COLORS.white,
        fontSize: SIZES.md,
        ...FONTS.bold,
    },
    closeButton: {
        padding: 4,
    },
});
