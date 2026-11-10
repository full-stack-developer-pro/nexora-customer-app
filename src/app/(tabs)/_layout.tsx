import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, ShoppingBag, Calendar, User } from 'lucide-react-native';
import { NexoraColors } from '@/constants/theme';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: NexoraColors.primary,
        tabBarInactiveTintColor: NexoraColors.textMuted,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: NexoraColors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
    </Tabs>
  );
}
