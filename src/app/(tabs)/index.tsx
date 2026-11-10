import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, LogOut, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraButton } from '@/components/common/NexoraButton';

export default function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}>
        <View style={styles.headerTop}>
          <NexoraLogo size="sm" inverted={true} />
          <TouchableOpacity style={styles.logoutPill} onPress={handleSignOut}>
            <LogOut size={16} color="#ffffff" />
            <Text style={styles.logoutPillText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userBanner}>
          <View style={styles.avatarBox}>
            <User size={30} color={NexoraColors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeGreeting}>Welcome,</Text>
            <Text style={styles.userName}>{user?.name || 'Valued Customer'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'customer@nexora.com'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.iconCircle}>
              <CheckCircle2 size={24} color={NexoraColors.statusApproved} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Authentication Verified</Text>
              <Text style={styles.statusSub}>
                Customer session active • Role: <Text style={{ fontWeight: '700' }}>Customer</Text>
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>User ID</Text>
            <Text style={styles.metaVal}>{user?._id || '—'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Account Status</Text>
            <Text style={[styles.metaVal, { textTransform: 'capitalize' }]}>{user?.status || 'Active'}</Text>
          </View>
        </View>

        {/* Milestone Card */}
        <View style={styles.milestoneCard}>
          <View style={styles.badgeRow}>
            <Sparkles size={16} color={NexoraColors.primary} />
            <Text style={styles.badgeText}>PART 1 COMPLETED</Text>
          </View>
          <Text style={styles.milestoneTitle}>Splash & Authentication Live</Text>
          <Text style={styles.milestoneDesc}>
            The Splash screen animation, customer Login screen, Register screen, and Google Sign-in flows are fully wired. 
            Once you review and approve this foundation, we will build the Customer Home & Marketplace tabs!
          </Text>

          <NexoraButton
            title="Log Out to Test Again"
            variant="outline"
            onPress={handleSignOut}
            leftIcon={<LogOut size={16} color={NexoraColors.primary} />}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Security Tag */}
        <View style={styles.securityTag}>
          <ShieldCheck size={16} color={NexoraColors.textMuted} />
          <Text style={styles.securityText}>Nexora Secure Mobile Gateway</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NexoraColors.canvas,
  },
  header: {
    backgroundColor: NexoraColors.midnightDark,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  logoutPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeGreeting: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  userName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  userEmail: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 2,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    ...Shadows.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: NexoraColors.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NexoraColors.statusApprovedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  statusSub: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  metaLabel: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '600',
    color: NexoraColors.textPrimary,
  },
  milestoneCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: NexoraColors.primaryBorder,
    ...Shadows.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: NexoraColors.primary,
    letterSpacing: 1,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    marginBottom: 6,
  },
  milestoneDesc: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
    lineHeight: 19,
  },
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    color: NexoraColors.textMuted,
  },
});
