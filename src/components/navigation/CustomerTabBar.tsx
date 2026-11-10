import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Search,
  CalendarCheck,
  User,
  Zap,
  PhoneCall,
  Clock,
  MessageSquare,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';

export interface CustomerTabBarProps {
  state: any;
  descriptors: any;
  navigation?: any;
  [key: string]: any;
}

export const CustomerTabBar: React.FC<CustomerTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // Group tabs into Left 2, Center Button, Right 2
  // state.routes = ['index', 'search', 'bookings', 'profile']
  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2, 4);

  const renderTabItem = (route: { key: string; name: string }, index: number) => {
    const isFocused = state.index === index;

    const onPress = () => {
      if (navigation?.emit) {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!isFocused && !event?.defaultPrevented) {
          if (navigation?.navigate) {
            navigation.navigate(route.name);
          } else {
            router.push(`/(tabs)/${route.name === 'index' ? '' : route.name}` as any);
          }
        }
      } else if (!isFocused) {
        if (route.name === 'index') {
          router.push('/(tabs)');
        } else {
          router.push(`/(tabs)/${route.name}` as any);
        }
      }
    };

    const getIcon = () => {
      const color = isFocused ? NexoraColors.primary : '#94a3b8';
      const size = 22;

      switch (route.name) {
        case 'index':
          return <Home size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
        case 'search':
          return <Search size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
        case 'bookings':
          return <CalendarCheck size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
        case 'profile':
          return <User size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
        default:
          return <Home size={size} color={color} />;
      }
    };

    const getLabel = () => {
      switch (route.name) {
        case 'index':
          return 'Explore';
        case 'search':
          return 'Browse';
        case 'bookings':
          return 'Bookings';
        case 'profile':
          return 'Profile';
        default:
          return route.name;
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrap}>{getIcon()}</View>
        <Text
          style={[
            styles.tabLabel,
            isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          {getLabel()}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleQuickAction = (actionKey: string) => {
    setActionModalVisible(false);

    if (actionKey === 'emergency') {
      Alert.alert(
        '24/7 Emergency Dispatch',
        'Direct connection requested. Nearest on-call licensed emergency technician dispatched to your location.',
        [{ text: 'OK' }]
      );
    } else if (actionKey === 'quick_book') {
      Alert.alert(
        'Quick Book Pro',
        'Select trade category and time window for direct dispatch.',
        [{ text: 'Understood' }]
      );
    } else if (actionKey === 'quote') {
      Alert.alert(
        'Request Direct Estimate',
        'Submit photos and project scope to receive fixed-price bids within 2 hours.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <>
      {/* Elevated Custom Bottom Bar */}
      <View
        style={[
          styles.barContainer,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            height: 60 + Math.max(insets.bottom, 10),
          },
        ]}
      >
        {/* Left Side: Explore & Browse */}
        <View style={styles.halfSide}>
          {leftRoutes.map((route: { key: string; name: string }, i: number) =>
            renderTabItem(route, i)
          )}
        </View>

        {/* Center Floating Action Button (Instant / Emergency) */}
        <View style={styles.centerFabWrap}>
          <TouchableOpacity
            style={styles.centerFab}
            onPress={() => setActionModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.fabInner}>
              <Zap size={24} color="#ffffff" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <Text style={styles.fabLabel}>Instant</Text>
        </View>

        {/* Right Side: Bookings & Profile */}
        <View style={styles.halfSide}>
          {rightRoutes.map((route: { key: string; name: string }, i: number) =>
            renderTabItem(route, i + 2)
          )}
        </View>
      </View>

      {/* Quick Action Sheet Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setActionModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.sheetContent,
                  { paddingBottom: Math.max(insets.bottom, 20) + 24 },
                ]}
              >
                {/* Pull handle */}
                <View style={styles.sheetHandle} />

                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.sheetTitle}>Instant Pro Dispatch</Text>
                    <Text style={styles.sheetSubtitle}>
                      Fast-track booking for home emergencies & repairs
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setActionModalVisible(false)}
                  >
                    <X size={18} color={NexoraColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Actions Grid */}
                <View style={styles.actionsList}>
                  {/* Action 1: 24/7 Emergency Dispatch */}
                  <TouchableOpacity
                    style={[styles.actionCard, styles.actionCardEmergency]}
                    onPress={() => handleQuickAction('emergency')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: '#fee2e2' }]}>
                      <PhoneCall size={22} color="#dc2626" />
                    </View>
                    <View style={styles.actionMeta}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.actionName, { color: '#991b1b' }]}>
                          24/7 Emergency Dispatch
                        </Text>
                        <View style={styles.urgentTag}>
                          <Text style={styles.urgentTagText}>URGENT</Text>
                        </View>
                      </View>
                      <Text style={styles.actionDesc}>
                        Burst pipe, electrical outage, or HVAC failure. Pro on-site in 30 mins.
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#dc2626" />
                  </TouchableOpacity>

                  {/* Action 2: Quick-Book Nearest Pro */}
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => handleQuickAction('quick_book')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: '#eef5fc' }]}>
                      <Clock size={22} color={NexoraColors.primary} />
                    </View>
                    <View style={styles.actionMeta}>
                      <Text style={styles.actionName}>Quick-Book Next Available Pro</Text>
                      <Text style={styles.actionDesc}>
                        Guaranteed upfront fixed rate with a verified background-checked specialist.
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#94a3b8" />
                  </TouchableOpacity>

                  {/* Action 3: Request Direct Estimate */}
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => handleQuickAction('quote')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: '#ecfdf5' }]}>
                      <MessageSquare size={22} color="#059669" />
                    </View>
                    <View style={styles.actionMeta}>
                      <Text style={styles.actionName}>Request Free Direct Estimate</Text>
                      <Text style={styles.actionDesc}>
                        Upload photos and project notes to get competitive bids from local pros.
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {/* Trust Footer */}
                <View style={styles.sheetTrustRow}>
                  <ShieldCheck size={16} color="#059669" />
                  <Text style={styles.sheetTrustText}>
                    All dispatch requests backed by the Nexora $1M Workmanship Guarantee.
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: NexoraColors.border,
    paddingTop: 6,
    ...Shadows.card,
  },
  halfSide: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 64,
  },
  iconWrap: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: NexoraColors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: '#94a3b8',
  },
  centerFabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.floating,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  fabInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NexoraColors.primary,
  },
  fabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.primary,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingTop: 12,
    ...Shadows.floating,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  sheetSubtitle: {
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
  actionsList: {
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.lg,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: NexoraColors.border,
    ...Shadows.sm,
  },
  actionCardEmergency: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionMeta: {
    flex: 1,
    paddingRight: 8,
  },
  actionName: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  actionDesc: {
    fontSize: 11.5,
    color: NexoraColors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  urgentTag: {
    backgroundColor: '#e90402',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  urgentTagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sheetTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  sheetTrustText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
});
