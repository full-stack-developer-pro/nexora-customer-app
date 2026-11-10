import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, LogOut, ShieldCheck, Mail, ArrowRight } from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your Nexora customer account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logout();
              router.replace('/(auth)/login');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to sign out');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 24) + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Account & Profile</Text>
        <Text style={styles.subtitle}>Manage your customer settings and preferences</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <User size={36} color="#ffffff" />
        </View>
        <View style={styles.profileMeta}>
          <Text style={styles.userName}>{user?.name || 'Nexora Customer'}</Text>
          <View style={styles.emailRow}>
            <Mail size={13} color={NexoraColors.textSecondary} />
            <Text style={styles.userEmail}>{user?.email || 'customer@nexora.com'}</Text>
          </View>
          <View style={styles.roleBadge}>
            <ShieldCheck size={12} color="#059669" />
            <Text style={styles.roleText}>VERIFIED CUSTOMER</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions Card */}
      <View style={styles.sectionCard}>
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>Full Profile Screen In Progress</Text>
          <Text style={styles.noticeText}>
            Dedicated address book, payment methods, saved pros, and service history will be styled in the upcoming profile build.
          </Text>
        </View>

        {/* Primary Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <LogOut size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Sign Out of Nexora</Text>
            </>
          )}
        </TouchableOpacity>
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
    marginBottom: 20,
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.card,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    marginBottom: 2,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 12.5,
    color: NexoraColors.textSecondary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  roleText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  noticeBox: {
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
