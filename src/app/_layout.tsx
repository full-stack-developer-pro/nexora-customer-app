import React, { useState, useEffect } from 'react';
import { StatusBar as RNStatusBar, Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';
import { NexoraColors } from '@/constants/theme';
import { NexoraSplashScreen } from '@/components/common/NexoraSplashScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  initialRouteName: 'index',
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
      <AuthProvider>
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
          </Stack>

          {isMounted && showSplash && (
            <NexoraSplashScreen onFinish={() => setShowSplash(false)} />
          )}
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
