import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraColors } from '@/constants/theme';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <NexoraLogo size="xl" subtitle="LOCAL SERVICES & MARKETPLACE" inverted={true} />
        <ActivityIndicator
          size="large"
          color={NexoraColors.primary}
          style={styles.spinner}
        />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NexoraColors.midnightDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 32,
  },
});

