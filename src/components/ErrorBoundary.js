import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme/theme';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service here
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    handleExit = () => {
        if (Platform.OS === 'android') {
            BackHandler.exitApp();
        } else {
            this.handleReset();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="alert-circle" size={80} color={COLORS.error} />
                        </View>
                        <Text style={styles.title}>عذراً، حدث خطأ ما</Text>
                        <Text style={styles.message}>
                            لقد واجه التطبيق مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو العودة لاحقاً.
                        </Text>
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={styles.retryButton} 
                                onPress={this.handleReset}
                            >
                                <Text style={styles.retryText}>محاولة مرة أخرى</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.exitButton} 
                                onPress={this.handleExit}
                            >
                                <Text style={styles.exitText}>
                                    {Platform.OS === 'android' ? 'خروج من التطبيق' : 'إغلاق'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {__DEV__ && (
                            <View style={styles.debugContainer}>
                                <Text style={styles.debugTitle}>Debug Info:</Text>
                                <Text style={styles.debugText}>{this.state.error?.toString()}</Text>
                            </View>
                        )}
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.spacing_xl,
    },
    content: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius_xxl,
        padding: SIZES.spacing_xxl,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: SIZES.xl,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: SIZES.md,
        ...FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: SIZES.radius_md,
        alignItems: 'center',
    },
    retryText: {
        color: COLORS.white,
        ...FONTS.bold,
        fontSize: SIZES.base,
    },
    exitButton: {
        backgroundColor: 'transparent',
        paddingVertical: 14,
        borderRadius: SIZES.radius_md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    exitText: {
        color: COLORS.text,
        ...FONTS.medium,
        fontSize: SIZES.base,
    },
    debugContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        width: '100%',
    },
    debugTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 4,
    },
    debugText: {
        fontSize: 10,
        color: '#888',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    }
});

export default ErrorBoundary;
