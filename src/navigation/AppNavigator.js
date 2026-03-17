import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { navigationRef } from '../utils/navigationUtils';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import CategoryScreen from '../screens/menu/CategoryScreen';
import FoodDetailScreen from '../screens/menu/FoodDetailScreen';
import StoryViewScreen from '../screens/home/StoryViewScreen';
import OffersScreen from '../screens/home/OffersScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import OrderConfirmationScreen from '../screens/cart/OrderConfirmationScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SuggestionsScreen from '../screens/profile/SuggestionsScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import OrdersScreen from '../screens/profile/OrdersScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminMenuScreen from '../screens/admin/AdminMenuScreen';
import AdminMenuFormScreen from '../screens/admin/AdminMenuFormScreen';
import AdminStoriesScreen from '../screens/admin/AdminStoriesScreen';
import AdminStoryFormScreen from '../screens/admin/AdminStoryFormScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import AdminCouponsScreen from '../screens/admin/AdminCouponsScreen';
import AdminDeliveryZonesScreen from '../screens/admin/AdminDeliveryZonesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.surface,
        borderTopColor: COLORS.border,
        borderTopWidth: 0.5,
        height: 85,
        paddingTop: 8,
        paddingBottom: 28,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    tabLabel: {
        fontSize: 11,
        ...FONTS.medium,
        marginTop: 4,
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -10,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 9,
        ...FONTS.bold,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingLogo: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    loadingText: {
        color: COLORS.text,
        fontSize: SIZES.xxl,
        ...FONTS.extraBold,
    },
});

function CartBadge({ count }) {
    if (count <= 0) return null;
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
    );
}

function HomeTabs() {
    const { getItemCount } = useCart();
    const cartCount = getItemCount();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'MenuTab') iconName = focused ? 'restaurant' : 'restaurant-outline';
                    else if (route.name === 'CartTab') iconName = focused ? 'cart' : 'cart-outline';
                    else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';

                    return (
                        <View>
                            <Ionicons name={iconName} size={24} color={color} />
                            {route.name === 'CartTab' && <CartBadge count={cartCount} />}
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'الرئيسية' }} />
            <Tab.Screen name="MenuTab" component={MenuScreen} options={{ tabBarLabel: 'القائمة' }} />
            <Tab.Screen name="CartTab" component={CartScreen} options={{ tabBarLabel: 'السلة' }} />
            <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'حسابي' }} />
        </Tab.Navigator>
    );
}

function MainStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeTabs" component={HomeTabs} />
            
            {/* Auth Screens - Now part of MainStack for guest access */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />

            <Stack.Screen
                name="StoryView"
                component={StoryViewScreen}
                options={{
                    presentation: 'fullScreenModal',
                    animation: 'fade'
                }}
            />
            <Stack.Screen name="Category" component={CategoryScreen} />
            <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
            <Stack.Screen name="Offers" component={OffersScreen} />
            <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />

            {/* Admin Screens */}
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
            <Stack.Screen name="AdminMenu" component={AdminMenuScreen} />
            <Stack.Screen name="AdminMenuForm" component={AdminMenuFormScreen} />
            <Stack.Screen name="AdminStories" component={AdminStoriesScreen} />
            <Stack.Screen name="AdminStoryForm" component={AdminStoryFormScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
            <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
            <Stack.Screen name="AdminCoupons" component={AdminCouponsScreen} />
            <Stack.Screen name="AdminDeliveryZones" component={AdminDeliveryZonesScreen} />
        </Stack.Navigator>
    );
}

function AdminStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
            <Stack.Screen name="AdminMenu" component={AdminMenuScreen} />
            <Stack.Screen name="AdminMenuForm" component={AdminMenuFormScreen} />
            <Stack.Screen name="AdminStories" component={AdminStoriesScreen} />
            <Stack.Screen name="AdminStoryForm" component={AdminStoryFormScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
            <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
            <Stack.Screen name="AdminCoupons" component={AdminCouponsScreen} />
            <Stack.Screen name="AdminDeliveryZones" component={AdminDeliveryZonesScreen} />
        </Stack.Navigator>
    );
}

function AppNavigator() {
    const { user, token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.loadingLogo}
                    resizeMode="contain"
                />
                <Text style={styles.loadingText}>بيتزا عزيز</Text>
            </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            {user?.role === 'admin' ? <AdminStack /> : <MainStack />}
        </NavigationContainer>
    );
}

export default AppNavigator;
