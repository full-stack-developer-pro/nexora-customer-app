import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarCheck } from 'lucide-react-native';
import { NexoraColors, Radius } from '@/constants/theme';

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 24) + 16 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>Active dispatches & service orders</Text>
      </View>

      <View style={styles.placeholderCard}>
        <View style={styles.iconCircle}>
          <CalendarCheck size={32} color={NexoraColors.primary} />
        </View>
        <Text style={styles.placeholderTitle}>No Active Bookings</Text>
        <Text style={styles.placeholderText}>
          When you book a service or request emergency dispatch, your active job status and technician tracking will appear here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
    marginTop: 4,
  },
  placeholderCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

