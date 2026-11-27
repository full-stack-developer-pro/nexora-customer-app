import React, { useState, useEffect } from 'react';
import { StatusBar as RNStatusBar, Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import { LocationPickerModal } from '@/components/common/LocationPickerModal';
import { NexoraColors } from '@/constants/theme';
import { NexoraSplashScreen } from '@/components/common/NexoraSplashScreen';
import { STRIPE_PUBLISHABLE_KEY, STRIPE_MERCHANT_ID } from '@/constants/stripe';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (Platform.OS === 'android') {
      (RNStatusBar as any).setTranslucent?.(false);
      (RNStatusBar as any).setBackgroundColor?.(NexoraColors.midnightDark);
    }
    const hideNativeSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Ignore
      }
    };
    hideNativeSplash();
  }, []);

  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier={STRIPE_MERCHANT_ID}
      >
        <AuthProvider>
          <LocationProvider>
            <StatusBar style="light" />
            <View style={{ flex: 1, backgroundColor: NexoraColors.midnightDark }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: NexoraColors.canvas },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="service/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="provider/[id]" options={{ headerShown: false }} />
              </Stack>

              {/* Global Location & Address Picker Sheet */}
              <LocationPickerModal />

              {isMounted && showSplash && (
                <NexoraSplashScreen onFinish={() => setShowSplash(false)} />
              )}
            </View>
          </LocationProvider>
        </AuthProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}

