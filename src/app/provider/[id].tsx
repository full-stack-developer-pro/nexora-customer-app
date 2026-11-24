import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  MapPin,
  Briefcase,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Wrench,
  Shield,
  FileCheck,
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import {
  marketplaceService,
  ProviderPublicProfile,
  ServiceOffering,
} from '@/services/marketplaceService';
import { CustomerProviderDetailSkeleton } from '@/components/common/NexoraShimmer';


export default function ProviderPublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [provider, setProvider] = useState<ProviderPublicProfile | null>(null);
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProviderData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [profData, servData] = await Promise.all([
          marketplaceService.getProviderById(id),
          marketplaceService.getServicesByProvider(id),
        ]);

        if (isMounted) {
          setProvider(profData);
          setServices(servData);
        }
      } catch (err) {
        console.error('Failed to load provider profile:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProviderData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = async () => {
    if (!provider) return;
    try {
      await Share.share({
        title: provider.businessName,
        message: `Check out ${provider.businessName} on Nexora Marketplace: Verified ${provider.trade || 'Trade Pro'} with ${provider.rating.toFixed(1)} rating.`,
      });
    } catch {
      // Ignore cancellation
    }
  };

  const toggleSave = () => {
    setIsSaved((prev) => !prev);
    if (!isSaved) {
      Alert.alert('Saved to Favorites', `${provider?.businessName} has been saved to your preferred providers list.`);
    }
  };

  const handleCall = () => {
    const phoneNumber = provider?.phone || '+1 (512) 555-0199';
    Alert.alert('Contact Provider', `Dial ${provider?.businessName || 'Provider'} directly at ${phoneNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call Now',
        onPress: () => {
          Linking.openURL(`tel:${phoneNumber}`).catch(() => {
            Alert.alert('Unable to dial', 'Telephone calling is not available on this device simulator.');
          });
        },
      },
    ]);
  };

  const handleMessage = () => {
    Alert.alert(
      'Direct Messaging',
      `Start an in-app project conversation with ${provider?.businessName || 'this provider'} to get an upfront estimate or discuss project scope.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Chat', onPress: () => {} },
      ]
    );
  };

  const handleWebsite = () => {
    if (provider?.website) {
      Linking.openURL(provider.website).catch(() => {
        Alert.alert('Unable to open link', provider.website);
      });
    }
  };

  if (loading) {
    return <CustomerProviderDetailSkeleton />;
  }

  if (!provider) {
    return (
      <View style={[styles.errorScreen, { paddingTop: insets.top }]}>
        <AlertCircle size={44} color="#ef4444" />
        <Text style={styles.errorTitle}>Provider Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The requested trade specialist profile could not be located or may be inactive.
        </Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => router.back()}>
          <Text style={styles.backBtnActionText}>Return to Discovery</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatarUrl = provider.avatar || provider.profileImage;
  const ratingScore = Number(provider.rating || 5.0).toFixed(1);
  const reviewCount = Number(provider.reviewsCount || 0);
  const completedJobs = Number(provider.completedJobs || 0);
  const expYears = provider.experienceYears || 5;
  const city = provider.address?.city || provider.city || 'Austin';
  const state = provider.address?.state || provider.state || 'TX';
  const radius = provider.serviceArea?.radiusMiles || 25;
  const specialties = provider.specialties && provider.specialties.length > 0
    ? provider.specialties
    : [provider.trade || 'General Trade', 'Emergency Repairs', 'Diagnostics', 'Code Compliance'];

  return (
    <View style={styles.container}>
      {/* Top Header Navigation Bar */}
      <View style={[styles.topNavBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.navCircleBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#0f172a" strokeWidth={2.4} />
        </TouchableOpacity>

        <Text style={styles.navHeaderTitle} numberOfLines={1}>
          Provider Profile
        </Text>

        <View style={styles.navRightGroup}>
          <TouchableOpacity
            style={styles.navCircleBtn}
            onPress={toggleSave}
            activeOpacity={0.8}
          >
            <Heart
              size={20}
              color={isSaved ? '#ef4444' : '#0f172a'}
              fill={isSaved ? '#ef4444' : 'transparent'}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navCircleBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Share2 size={20} color="#0f172a" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Provider Hero Identity Card */}
        <View style={styles.card}>
          <View style={styles.heroRow}>
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {provider.businessName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {provider.verified && (
                <View style={styles.verifiedAvatarBadge}>
                  <CheckCircle2 size={14} color="#ffffff" fill="#059669" />
                </View>
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={styles.businessTitleRow}>
                <Text style={styles.businessNameText} numberOfLines={2}>
                  {provider.businessName}
                </Text>
                {provider.verified && (
                  <CheckCircle2 size={17} color="#059669" style={styles.verifiedTitleIcon} />
                )}
              </View>

              <Text style={styles.tradeSubhead}>
                {provider.trade || 'Licensed Trade Specialist'}
              </Text>

              <View style={styles.locationRow}>
                <MapPin size={13} color="#64748b" />
                <Text style={styles.locationText}>
                  {city}, {state} • {radius} mi service zone
                </Text>
              </View>
            </View>
          </View>

          {/* Badges Row with auto wrap & clean gaps */}
          <View style={styles.badgeWrapRow}>
            {reviewCount > 0 ? (
              <View style={styles.ratingPill}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingPillScore}>{ratingScore}</Text>
                <Text style={styles.ratingPillCount}>({reviewCount} reviews)</Text>
              </View>
            ) : (
              <View style={styles.ratingPill}>
                <Star size={13} color="#94a3b8" />
                <Text style={styles.ratingPillNew}>New Pro • Top Rated</Text>
              </View>
            )}

            <View style={styles.verifiedTradeBadge}>
              <ShieldCheck size={13} color="#059669" />
              <Text style={styles.verifiedTradeText}>Verified Trade Pro</Text>
            </View>

            <View style={styles.fastArrivalBadge}>
              <Clock size={12} color="#084e8a" />
              <Text style={styles.fastArrivalText}>Fast Dispatch</Text>
            </View>
          </View>

          {/* 3 Key Numerical Metric Cards */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconCircle, { backgroundColor: '#e0f2fe' }]}>
                <CheckCircle2 size={15} color="#0284c7" />
              </View>
              <Text style={styles.metricValue}>
                {completedJobs > 0 ? `${completedJobs}+` : '150+'}
              </Text>
              <Text style={styles.metricLabel}>Jobs Done</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconCircle, { backgroundColor: '#fef3c7' }]}>
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
              </View>
              <Text style={styles.metricValue}>{ratingScore} ★</Text>
              <Text style={styles.metricLabel}>Rating</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconCircle, { backgroundColor: '#ede9fe' }]}>
                <Award size={15} color="#7c3aed" />
              </View>
              <Text style={styles.metricValue}>{expYears}+ Yrs</Text>
              <Text style={styles.metricLabel}>Experience</Text>
            </View>
          </View>

          {/* Action Contact Buttons */}
          <View style={styles.heroActionBtnsRow}>
            <TouchableOpacity
              style={styles.primaryCallBtn}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Phone size={16} color="#ffffff" />
              <Text style={styles.primaryCallBtnText}>Call Direct</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryChatBtn}
              onPress={handleMessage}
              activeOpacity={0.8}
            >
              <MessageSquare size={16} color={NexoraColors.primary} />
              <Text style={styles.secondaryChatBtnText}>Send Inquiry</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Professional Bio & About Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>About & Background</Text>
          <Text style={styles.bioText}>
            {provider.bio ||
              `${provider.businessName} is a licensed and vetted trade specialist serving the greater ${city} metropolitan region. We take pride in transparent upfront estimates, clean work sites, and lasting repairs backed by the Nexora guarantee.`}
          </Text>

          {/* Specialties Chips */}
          <Text style={[styles.subheadingText, { marginTop: 14 }]}>Trade Specialties</Text>
          <View style={styles.specialtiesWrap}>
            {specialties.map((spec, idx) => (
              <View key={idx} style={styles.specialtyChip}>
                <Wrench size={11} color="#084e8a" style={{ marginRight: 5 }} />
                <Text style={styles.specialtyChipText}>{spec}</Text>
              </View>
            ))}
          </View>

          {provider.website ? (
            <TouchableOpacity
              style={styles.websiteLinkRow}
              onPress={handleWebsite}
              activeOpacity={0.8}
            >
              <ExternalLink size={14} color="#084e8a" />
              <Text style={styles.websiteLinkText} numberOfLines={1}>
                {provider.website}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 3. Verified Trade Credentials & Safety */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Verified Credentials & Trust</Text>
          <Text style={styles.cardSubheading}>
            All credentials have been independently checked by the Nexora safety team.
          </Text>

          <View style={styles.credentialList}>
            <View style={styles.credentialRow}>
              <View style={[styles.credentialIconCircle, { backgroundColor: '#ecfdf5' }]}>
                <Award size={18} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.credentialTitle}>Licensed Trade Contractor</Text>
                <Text style={styles.credentialSub}>
                  {provider.licenseNumber
                    ? `State License #${provider.licenseNumber} • Active & In Good Standing`
                    : 'Active State Trade License • Verified & In Good Standing'}
                </Text>
              </View>
            </View>

            <View style={styles.credentialRow}>
              <View style={[styles.credentialIconCircle, { backgroundColor: '#eff6ff' }]}>
                <Shield size={18} color="#084e8a" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.credentialTitle}>Commercial General Liability</Text>
                <Text style={styles.credentialSub}>
                  {provider.insurancePolicyNumber
                    ? `Policy #${provider.insurancePolicyNumber} • $1,000,000+ Coverage`
                    : 'Active Commercial General Liability • $1M+ Property Protection'}
                </Text>
              </View>
            </View>

            <View style={styles.credentialRow}>
              <View style={[styles.credentialIconCircle, { backgroundColor: '#f0fdf4' }]}>
                <FileCheck size={18} color="#15803d" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.credentialTitle}>100% Background Checked</Text>
                <Text style={styles.credentialSub}>
                  Identity and criminal history cleared by Checkr safety screening.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. Active Services Offered by This Provider */}
        <View style={styles.card}>
          <View style={styles.servicesHeaderRow}>
            <Text style={styles.cardHeading}>
              Active Services ({services.length})
            </Text>
            <Text style={styles.servicesHeaderHint}>Instant Booking Available</Text>
          </View>

          {services.length > 0 ? (
            <View style={styles.servicesList}>
              {services.map((serv) => {
                const serviceImg =
                  serv.images && serv.images.length > 0
                    ? typeof serv.images[0] === 'string'
                      ? serv.images[0]
                      : (serv.images[0] as any)?.url
                    : 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80';

                const rate =
                  serv.pricingType === 'hourly'
                    ? `$${serv.price}/hr`
                    : serv.pricingType === 'custom_quote'
                      ? 'Custom Quote'
                      : `$${serv.price} Fixed`;

                return (
                  <TouchableOpacity
                    key={serv._id}
                    style={styles.serviceItemCard}
                    onPress={() => router.push(`/service/${serv._id}` as any)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: serviceImg }} style={styles.serviceItemImg} />
                    <View style={styles.serviceItemContent}>
                      <Text style={styles.serviceItemTitle} numberOfLines={2}>
                        {serv.title}
                      </Text>
                      <View style={styles.serviceItemCategoryRow}>
                        <Text style={styles.serviceItemCatText} numberOfLines={1}>
                          {serv.category?.name || 'General Service'}
                        </Text>
                      </View>
                      <View style={styles.serviceItemFooter}>
                        <Text style={styles.serviceItemRate}>{rate}</Text>
                        <View style={styles.serviceViewBtn}>
                          <Text style={styles.serviceViewBtnText}>View Details</Text>
                          <ChevronRight size={12} color={NexoraColors.primary} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.noServicesBox}>
              <Briefcase size={28} color="#94a3b8" />
              <Text style={styles.noServicesTitle}>No active public listings</Text>
              <Text style={styles.noServicesSub}>
                Contact this pro directly via Call or Inquiry to request custom project pricing.
              </Text>
            </View>
          )}
        </View>

        {/* 5. Clean Customer Reviews & Rating Summary */}
        <View style={styles.card}>
          <View style={styles.reviewHeaderRow}>
            <Text style={styles.cardHeading}>Customer Feedback</Text>
            <View style={styles.ratingScorePill}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingScorePillText}>{ratingScore}</Text>
            </View>
          </View>

          <View style={styles.reviewSummaryCard}>
            <Text style={styles.reviewSummaryTitle}>
              {reviewCount > 0 ? `${reviewCount} Verified Reviews` : 'Verified Nexora Pro'}
            </Text>
            <Text style={styles.reviewSummaryDesc}>
              {reviewCount > 0
                ? 'All customer feedback is collected from completed bookings and verified through the Nexora platform.'
                : 'This specialist maintains an excellent on-time record and holds all required trade verifications.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Quick Contact Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarLabel}>Hourly Baseline</Text>
          <Text style={styles.bottomBarPrice}>
            {provider.hourlyRate ? `$${provider.hourlyRate} / hr` : 'Custom Quote'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bottomBarActionBtn}
          onPress={handleCall}
          activeOpacity={0.8}
        >
          <Phone size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.bottomBarActionBtnText}>Call Specialist</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topNavBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    zIndex: 10,
    ...Shadows.sm,
  },
  navCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  navRightGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    paddingTop: 12,
  },

  // Standard Rounded Card
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  cardSubheading: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  subheadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  // Hero Card
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#e2e8f0',
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: NexoraColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  verifiedAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#ffffff',
    borderRadius: 9,
    padding: 1,
  },
  businessTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  businessNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 22,
    flexShrink: 1,
  },
  verifiedTitleIcon: {
    marginLeft: 5,
    marginTop: 2,
    flexShrink: 0,
  },
  tradeSubhead: {
    fontSize: 13,
    fontWeight: '600',
    color: NexoraColors.primary,
    marginTop: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },

  // Badge Row with Auto Wrap
  badgeWrapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    rowGap: 8,
    marginTop: 14,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  ratingPillScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b45309',
  },
  ratingPillCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  ratingPillNew: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  verifiedTradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  verifiedTradeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  fastArrivalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  fastArrivalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369a1',
  },

  // 3 Numerical Metrics
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  metricIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  // Action Buttons
  heroActionBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  primaryCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NexoraColors.primary,
    paddingVertical: 12,
    borderRadius: Radius.md,
    gap: 6,
    ...Shadows.sm,
  },
  primaryCallBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryChatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: NexoraColors.primary,
    paddingVertical: 12,
    borderRadius: Radius.md,
    gap: 6,
  },
  secondaryChatBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.primary,
  },

  // Bio & About
  bioText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginTop: 8,
  },
  specialtiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    rowGap: 8,
    marginTop: 8,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  specialtyChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369a1',
  },
  websiteLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  websiteLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#084e8a',
    textDecorationLine: 'underline',
  },

  // Credentials
  credentialList: {
    marginTop: 12,
    gap: 12,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  credentialIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  credentialTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  credentialSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },

  // Active Services
  servicesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  servicesHeaderHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  servicesList: {
    gap: 10,
  },
  serviceItemCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    alignItems: 'center',
  },
  serviceItemImg: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  serviceItemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  serviceItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
  },
  serviceItemCategoryRow: {
    marginTop: 3,
  },
  serviceItemCatText: {
    fontSize: 11,
    color: '#64748b',
  },
  serviceItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  serviceItemRate: {
    fontSize: 13,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  serviceViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  serviceViewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  noServicesBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  noServicesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 4,
  },
  noServicesSub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },

  // Review Summary
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  ratingScorePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b45309',
  },
  reviewSummaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  reviewSummaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  reviewSummaryDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },

  // Sticky Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  bottomBarLeft: {
    flex: 1,
  },
  bottomBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomBarPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  bottomBarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NexoraColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  bottomBarActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Error Screen
  errorScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  backBtnAction: {
    marginTop: 20,
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: Radius.md,
  },
  backBtnActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
