import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme/theme';

const { width } = Dimensions.get('window');

const statuses = [
    { key: 'pending', label: 'تم الاستلام', icon: 'receipt-outline', color: '#9E9E9E' },
    { key: 'preparing', label: 'التحضير', image: require('../../assets/images/preparing.png'), color: '#FF9800' },
    { key: 'baking', label: 'في الفرن', image: require('../../assets/images/baking.png'), color: '#E85D2C' },
    { key: 'shipping', label: 'التوصيل', image: require('../../assets/images/shipping.png'), color: '#2196F3' },
    { key: 'delivered', label: 'وصلنا!', icon: 'checkmark-circle-outline', color: '#4CAF50' },
];

export default function OrderJourneyTracker({ currentStatus = 'pending' }) {
    const currentIndex = statuses.findIndex(s => s.key === currentStatus);
    
    // Fallback to 0 if status is unknown or cancelled
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    return (
        <View style={styles.container}>
            <View style={styles.stepsContainer}>
                {statuses.map((status, index) => {
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <React.Fragment key={status.key}>
                            {/* Connecting Line */}
                            {index > 0 && (
                                <View style={[
                                    styles.line,
                                    { backgroundColor: index <= activeIndex ? statuses[index].color : COLORS.border }
                                ]} />
                            )}
                            
                            {/* Step Item */}
                            <View style={styles.stepItem}>
                                <View style={[
                                    styles.iconContainer,
                                    { 
                                        borderColor: isActive ? status.color : COLORS.border,
                                        backgroundColor: isCurrent ? status.color : COLORS.surface,
                                        transform: [{ scale: isCurrent ? 1.2 : 1 }]
                                    }
                                ]}>
                                    {status.image ? (
                                        <Image 
                                            source={status.image} 
                                            style={[styles.statusImage, { tintColor: isCurrent ? COLORS.white : (isActive ? status.color : COLORS.textMuted) }]} 
                                        />
                                    ) : (
                                        <Ionicons 
                                            name={status.icon} 
                                            size={20} 
                                            color={isCurrent ? COLORS.white : (isActive ? status.color : COLORS.textMuted)} 
                                        />
                                    )}
                                </View>
                                <Text style={[
                                    styles.label,
                                    { 
                                        color: isActive ? status.color : COLORS.textMuted,
                                        ... (isCurrent ? FONTS.bold : FONTS.regular)
                                    }
                                ]}>
                                    {status.label}
                                </Text>
                            </View>
                        </React.Fragment>
                    );
                })}
            </View>

            {/* Current Status Highlight */}
            <View style={[styles.highlightCard, { backgroundColor: statuses[activeIndex].color + '15' }]}>
                <Ionicons name="information-circle" size={20} color={statuses[activeIndex].color} />
                <Text style={[styles.highlightText, { color: statuses[activeIndex].color }]}>
                    {currentStatus === 'cancelled' ? 'تم إلغاء الطلب' : `طلبك الآن في مرحلة: ${statuses[activeIndex].label}`}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: SIZES.spacing_lg,
        width: '100%',
    },
    stepsContainer: {
        flexDirection: 'row-reverse', // RTL Support
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    stepItem: {
        alignItems: 'center',
        zIndex: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
    },
    statusImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    line: {
        flex: 1,
        height: 3,
        marginHorizontal: -5,
        zIndex: 1,
    },
    label: {
        fontSize: 10,
        marginTop: 8,
        textAlign: 'center',
    },
    highlightCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 12,
        borderRadius: SIZES.radius_md,
        gap: 10,
    },
    highlightText: {
        fontSize: SIZES.sm,
        ...FONTS.medium,
        textAlign: 'right',
    }
});
