import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Switch,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  LogOut,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Home,
  Briefcase,
  Check,
  Trash2,
  Plus,
  ChevronRight,
  CalendarCheck,
  Package,
  Star,
  Bell,
  Headphones,
  FileText,
  Lock,
  Edit3,
  X,
  Crosshair,
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocation, CustomerLocation } from '@/context/LocationContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, refreshUser, updateProfile } = useAuth();
  const {
    activeLocation,
    savedAddresses,
    setActiveLocation,
    deleteAddress,
    openLocationModal,
  } = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch {
      // Ignore
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
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

  const handleCallSupport = () => {
    Linking.openURL('tel:18005550199').catch(() => {
      Alert.alert('Nexora Support Hotline', 'Call toll-free: 1-800-555-0199');
    });
  };

  // User Initials
  const userInitials = (user?.name || 'Customer')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Top Midnight Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 24) + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Account & Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your preferences, saved addresses & settings</Text>
          </View>
        </View>

        {/* User Hero Card */}
        <View style={styles.profileHeroCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>

          <View style={styles.heroDetailsCol}>
            <View style={styles.nameRow}>
              <Text style={styles.heroName} numberOfLines={1}>
                {user?.name || 'Nexora Customer'}
              </Text>
              <TouchableOpacity
                style={styles.editIconBtn}
                onPress={handleOpenEditModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Edit3 size={15} color="#084e8a" />
              </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
              <Mail size={12} color="#64748b" />
              <Text style={styles.metaText} numberOfLines={1}>
                {user?.email || 'customer@nexora.com'}
              </Text>
            </View>

            {user?.phone ? (
              <View style={styles.metaRow}>
                <Phone size={12} color="#64748b" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {user.phone}
                </Text>
              </View>
            ) : null}

            <View style={styles.verifiedBadge}>
              <ShieldCheck size={12} color="#059669" />
              <Text style={styles.verifiedBadgeText}>VERIFIED CUSTOMER</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Body */}
      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NexoraColors.primary} />
        }
      >
        {/* 1. Saved Addresses & Locations Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>SAVED SERVICE ADDRESSES</Text>
            <Text style={styles.sectionSubtitle}>Where pros deliver services and supplies</Text>
          </View>
          <TouchableOpacity
            style={styles.addAddressPill}
            onPress={openLocationModal}
            activeOpacity={0.8}
          >
            <Plus size={13} color={NexoraColors.primary} strokeWidth={2.5} />
            <Text style={styles.addAddressPillText}>Add Address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addressesCardList}>
          {savedAddresses.map((addr) => {
            const isActive =
              activeLocation?.formattedAddress === addr.formattedAddress ||
              activeLocation?.id === addr.id;
            return (
              <TouchableOpacity
                key={addr.id || addr.formattedAddress}
                style={[styles.addressItemRow, isActive && styles.addressItemRowActive]}
                onPress={() => setActiveLocation(addr)}
                activeOpacity={0.75}
              >
                <View style={[styles.addressIconBox, isActive && { backgroundColor: '#eef5fc' }]}>
                  {addr.label === 'Home' ? (
                    <Home size={16} color={isActive ? NexoraColors.primary : '#64748b'} />
                  ) : addr.label === 'Work' ? (
                    <Briefcase size={16} color={isActive ? NexoraColors.primary : '#64748b'} />
                  ) : (
                    <MapPin size={16} color={isActive ? NexoraColors.primary : '#64748b'} />
                  )}
                </View>

                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.addressItemLabel}>{addr.label}</Text>
                    {isActive && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>Active Dispatch</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressItemText} numberOfLines={2}>
                    {addr.formattedAddress}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {isActive && (
                    <View style={styles.activeCheckCircle}>
                      <Check size={13} color="#ffffff" strokeWidth={3} />
                    </View>
                  )}
                  {savedAddresses.length > 1 && (
                    <TouchableOpacity
                      onPress={() => addr.id && deleteAddress(addr.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 size={16} color="#cbd5e1" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Activity & Orders Hub */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>MY ACTIVITY & ORDERS</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/(tabs)/bookings')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#eef5fc' }]}>
              <CalendarCheck size={18} color={NexoraColors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabel}>Service Bookings</Text>
              <Text style={styles.menuSubLabel}>Track technician dispatches & active jobs</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/search',
                params: { tab: 'products' },
              })
            }
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#ecfdf5' }]}>
              <Package size={18} color="#059669" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabel}>Hardware & Supplies Catalog</Text>
              <Text style={styles.menuSubLabel}>Browse materials, parts & pro gear</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert('Reviews & Feedback', 'Your completed service reviews will be visible here once you book your first pro.')
            }
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#fffbeb' }]}>
              <Star size={18} color="#d97706" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabel}>My Reviews & Ratings</Text>
              <Text style={styles.menuSubLabel}>Feedback left for service pros</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* 3. App Preferences & Security */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>PREFERENCES & SECURITY</Text>
        </View>

        <View style={styles.menuCard}>
          <View style={styles.menuRow}>
            <View style={[styles.menuIconBox, { backgroundColor: '#f1f5f9' }]}>
              <Bell size={18} color="#475569" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabel}>Order & Dispatch Alerts</Text>
              <Text style={styles.menuSubLabel}>Push notifications for arrival times</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#cbd5e1', true: NexoraColors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={openLocationModal}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#f1f5f9' }]}>
              <Crosshair size={18} color="#475569" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabel}>Location & GPS Services</Text>
              <Text style={styles.menuSubLabel}>
                {activeLocation?.city ? `Active in ${activeLocation.city}` : 'Accurate pro matching'}
              </Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* 4. Support & Emergency */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>CUSTOMER CARE & DISPATCH</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleCallSupport}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#fef2f2' }]}>
              <Headphones size={18} color="#dc2626" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.menuLabel, { color: '#dc2626' }]}>24/7 Emergency Dispatch Line</Text>
              <Text style={styles.menuSubLabel}>1-800-555-0199 (Toll-Free)</Text>
            </View>
            <Phone size={16} color="#dc2626" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert('Nexora Guarantee', 'Every job is backed by the Nexora $1,000 Quality & Safety Protection Guarantee.')
            }
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#f1f5f9' }]}>
              <ShieldCheck size={18} color="#059669" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabel}>Nexora Quality Guarantee</Text>
              <Text style={styles.menuSubLabel}>Protection against property damage</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert('Terms of Service', 'Nexora Customer Terms of Service and Privacy Policy details.')
            }
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#f1f5f9' }]}>
              <FileText size={18} color="#475569" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabel}>Terms & Privacy Policy</Text>
              <Text style={styles.menuSubLabel}>Legal compliance & data usage</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* 5. Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#dc2626" />
          ) : (
            <>
              <LogOut size={18} color="#dc2626" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Sign Out of Nexora</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Version Footer */}
        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>Nexora Customer App • v1.0.0 (Build 58)</Text>
          <Text style={styles.copyrightText}>© 2026 Nexora Home Trade Network Inc.</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          />

          <View style={styles.editSheetContainer}>
            <View style={styles.sheetHandle} />

            <View style={styles.editHeaderRow}>
              <View>
                <Text style={styles.editSheetTitle}>Edit Profile</Text>
                <Text style={styles.editSheetSubtitle}>Update your customer contact details</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setEditModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContent}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your full name"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>EMAIL ADDRESS (READ-ONLY)</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.email || ''}
                editable={false}
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                disabled={savingProfile}
                activeOpacity={0.85}
              >
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    backgroundColor: '#0b192c',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...Shadows.card,
  },
  headerTop: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  profileHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 16,
    ...Shadows.card,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#084e8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroDetailsCol: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  editIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94a3b8',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: NexoraColors.textSecondary,
    marginTop: 1,
  },
  addAddressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef5fc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  addAddressPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  addressesCardList: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    ...Shadows.sm,
  },
  addressItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: Radius.lg,
  },
  addressItemRowActive: {
    backgroundColor: '#f8fbff',
  },
  addressIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressItemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  activePill: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  activePillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  addressItemText: {
    fontSize: 11.5,
    color: NexoraColors.textSecondary,
    marginTop: 2,
  },
  activeCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    ...Shadows.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  menuSubLabel: {
    fontSize: 11.5,
    color: NexoraColors.textSecondary,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: Radius.xl,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
  },
  versionFooter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  versionText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 15, 25, 0.65)',
  },
  backdrop: {
    flex: 1,
  },
  editSheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 36,
    ...Shadows.floating,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  editHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  editSheetTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  editSheetSubtitle: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#64748b',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: NexoraColors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  saveBtn: {
    backgroundColor: NexoraColors.primary,
    borderRadius: Radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    ...Shadows.card,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
