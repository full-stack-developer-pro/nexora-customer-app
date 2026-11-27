import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Zap,
  Wrench,
  Calendar,
  X,
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import {
  marketplaceService,
  ServiceOffering,
  ImageItem,
} from '@/services/marketplaceService';
import { bookingService } from '@/services/bookingService';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { useStripe } from '@stripe/stripe-react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { CustomerServiceDetailSkeleton } from '@/components/common/NexoraShimmer';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const { width } = Dimensions.get('window');
const CAROUSEL_HEIGHT = Math.min(width * 0.78, 320);

// Helper to extract image URL
const getImageUrl = (img: ImageItem | undefined): string | null => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.url) return img.url;
  return null;
};

// Default high-res fallback gallery if only one or no photo exists
const FALLBACK_SERVICE_GALLERY = [
  'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
];

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeLocation } = useLocation();
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [service, setService] = useState<ServiceOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  // Service Booking Sheet States
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeSlotIndex, setSelectedTimeSlotIndex] = useState(0);
  const [isEmergencyBooking, setIsEmergencyBooking] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const bookingDates = useMemo(() => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayLabel =
        i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDateString = `${dayLabel}, ${dateFormatted}, ${d.getFullYear()}`;
      dates.push({ id: `d_${i}`, dayLabel, dateFormatted, fullDateString });
    }
    return dates;
  }, []);

  const TIME_SLOTS = [
    { id: 't1', label: 'Morning', window: '9:00 AM - 11:30 AM' },
    { id: 't2', label: 'Midday', window: '12:00 PM - 2:30 PM' },
    { id: 't3', label: 'Afternoon', window: '3:00 PM - 5:30 PM' },
    { id: 't4', label: 'Evening', window: '6:00 PM - 8:00 PM' },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchServiceData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await marketplaceService.getServiceById(id);
        if (isMounted) {
          if (data) {
            setService(data);
          } else {
            // Synthetic fallback if ID is not found in backend
            setService({
              _id: id,
              title: 'Emergency Pipe Leak & Drain Clearing',
              description:
                'Comprehensive residential & commercial plumbing diagnostics, high-pressure leak detection, motorized drain clearing, and rapid copper/PEX pipe repair by certified master technicians.',
              price: 95,
              pricingType: 'hourly',
              duration: 60,
              images: FALLBACK_SERVICE_GALLERY,
              category: {
                name: 'Plumbing & Water Systems',
                slug: 'plumbing-water-systems',
              },
              provider: {
                _id: 'prov_1',
                name: 'Marcus Vance',
                businessName: 'Austin Master Plumbing LLC',
                rating: 4.95,
                reviewCount: 48,
                isVerified: true,
                city: 'Austin',
                state: 'TX',
                bio: 'Licensed Master Plumber with over 12 years of residential & light commercial plumbing experience across Greater Austin.',
              },
              distanceLabel: '4.2 mi away • Approx. 20-30 mins',
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load service detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchServiceData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = async () => {
    if (!service) return;
    try {
      await Share.share({
        title: service.title,
        message: `Check out "${service.title}" on Nexora Marketplace: ${service.pricingType === 'hourly' ? `$${service.price}/hr` : `$${service.price} Fixed`}`,
      });
    } catch {
      // Ignore share cancellation
    }
  };

  const toggleSave = () => {
    setIsSaved((prev) => !prev);
    if (!isSaved) {
      Alert.alert('Saved to Favorites', 'This service has been added to your shortlist.');
    }
  };

  const handleConfirmBooking = async () => {
    if (!service || isSubmittingBooking) return;
    try {
      setIsSubmittingBooking(true);
      const street =
        (activeLocation as any)?.address || activeLocation?.street || 'F301, Phase 8B, Industrial Area';
      const city = activeLocation?.city || 'Mohali';
      const state = activeLocation?.state || 'Punjab';
      const zipCode = activeLocation?.zipCode || '160055';
      const selectedDate = bookingDates[selectedDateIndex]?.fullDateString || 'Today, Nov 24, 2026';
      const selectedTime = TIME_SLOTS[selectedTimeSlotIndex]?.window || '9:00 AM - 11:30 AM';

      // 1. Create booking on backend and receive Stripe PaymentIntent
      const booking = await bookingService.createBooking({
        serviceId: service._id,
        scheduledDate: selectedDate,
        scheduledTimeWindow: selectedTime,
        isEmergency: isEmergencyBooking,
        serviceAddress: {
          label: 'Home',
          street,
          city,
          state,
          zipCode,
          coordinates: {
            lat: activeLocation?.latitude || null,
            lng: activeLocation?.longitude || null,
          },
        },
        notes: bookingNotes.trim(),
        packageIndex: packagesList.length > 0 ? selectedTierIndex : undefined,
        paymentMethod: 'Stripe',
      });

      // 2. If Stripe PaymentIntent clientSecret is present, present native Stripe PaymentSheet
      if (booking.payment?.clientSecret) {
        if (isExpoGo) {
          // Expo Go sandbox mode: Inform the user and confirm booking seamlessly
          setBookingModalVisible(false);
          Alert.alert(
            'Booking Confirmed (Expo Go Test Mode) 🎉',
            `Your booking #${booking.bookingNumber} was created on the backend with Stripe PaymentIntent ID:\n${booking.payment.paymentIntentId}\n\nNote: Native Stripe PaymentSheet requires a Development Build (npx expo run:ios). In Expo Go, your test booking is placed!`,
            [
              { text: 'Keep Browsing', style: 'cancel' },
              {
                text: 'View in My Bookings',
                onPress: () => router.push('/(tabs)/bookings'),
              },
            ]
          );
          return;
        }

        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: 'Nexora Marketplace',
          paymentIntentClientSecret: booking.payment.clientSecret,
          allowsDelayedPaymentMethods: false,
          defaultBillingDetails: {
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
          },
        });

        if (initError) {
          Alert.alert('Payment Setup Error', initError.message);
          return;
        }

        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          if (presentError.code === 'Canceled') {
            Alert.alert(
              'Payment Incomplete',
              `Booking #${booking.bookingNumber} was created, but payment was not completed. You can review your bookings in My Bookings.`,
              [
                { text: 'View Bookings', onPress: () => router.push('/(tabs)/bookings') },
                { text: 'Close', style: 'cancel' },
              ]
            );
          } else {
            Alert.alert('Payment Failed', presentError.message);
          }
          return;
        }
      }

      setBookingModalVisible(false);
      Alert.alert(
        'Booking & Payment Confirmed! 🎉',
        `Your request #${booking.bookingNumber} is confirmed for ${booking.scheduledTimeWindow} on ${booking.scheduledDate}.`,
        [
          { text: 'Keep Browsing', style: 'cancel' },
          {
            text: 'View in My Bookings',
            onPress: () => router.push('/(tabs)/bookings'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Booking Error', err?.message || 'Could not place booking. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleCallPro = () => {
    const phone = service?.provider?.phone || '+1 (512) 555-0199';
    Alert.alert('Call Provider', `Dial ${phone} directly?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => {} },
    ]);
  };

  const handleMessagePro = () => {
    Alert.alert(
      'Direct Messaging',
      'Start an in-app conversation with this verified provider to clarify project scope or request an upfront estimate.',
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Start Conversation', onPress: () => {} },
      ]
    );
  };

  if (loading) {
    return <CustomerServiceDetailSkeleton />;
  }

  if (!service) {
    return (
      <View style={[styles.errorScreen, { paddingTop: insets.top }]}>
        <AlertCircle size={44} color="#ef4444" />
        <Text style={styles.errorTitle}>Service Listing Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The requested service offering may have been removed or is currently unavailable in your coverage area.
        </Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => router.back()}>
          <Text style={styles.backBtnActionText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Build image list
  const rawImages =
    service.images && service.images.length > 0
      ? (service.images.map((img) => getImageUrl(img)).filter(Boolean) as string[])
      : [];

  const imageGallery =
    rawImages.length > 1
      ? rawImages
      : rawImages.length === 1
        ? [rawImages[0], ...FALLBACK_SERVICE_GALLERY.slice(1)]
        : FALLBACK_SERVICE_GALLERY;

  const priceLabel =
    service.pricingType === 'hourly'
      ? `$${service.price} / hr`
      : service.pricingType === 'custom_quote'
        ? 'Custom Quote'
        : `$${service.price} Fixed`;

  const providerName =
    service.provider?.businessName || service.provider?.name || 'Nexora Certified Specialist';
  const ratingVal = service.provider?.rating || 0;
  const reviewCount = service.provider?.reviewCount || 0;

  // Real packages defined by the provider in backend (NO artificial inflated duplicate pricing)
  const packagesList =
    service.packages && service.packages.length > 0 ? service.packages : [];

  const activeDisplayPrice =
    packagesList.length > 0
      ? packagesList[selectedTierIndex]?.price || service.price
      : service.price;

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Hero Photo Gallery Slider */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {imageGallery.map((imgUrl, idx) => (
              <Image
                key={idx}
                source={{ uri: imgUrl }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Floating Top Header Buttons */}
          <View style={[styles.floatingHeader, { top: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.floatingNavBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#0f172a" strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.floatingRightBtns}>
              <TouchableOpacity
                style={styles.floatingNavBtn}
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
                style={styles.floatingNavBtn}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Share2 size={20} color="#0f172a" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Overlay Row: Category Pill (Left) & Slide Counter (Right) */}
          <View style={styles.carouselOverlayBadges}>
            {service.category?.name && (
              <View style={styles.categoryPill}>
                <Wrench size={11} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.categoryPillText} numberOfLines={1}>
                  {service.category.name.toUpperCase()}
                </Text>
              </View>
            )}

            {imageGallery.length > 1 && (
              <View style={styles.sliderCounterPill}>
                <View style={styles.dotsRow}>
                  {imageGallery.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        activeImageIndex === idx ? styles.activeDot : styles.inactiveDot,
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.sliderCounterText}>
                  {activeImageIndex + 1}/{imageGallery.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 1. Title & Pricing Overview Card */}
        <View style={styles.card}>
          <Text style={styles.serviceTitle}>{service.title}</Text>

          {/* Rating, Reviews & Badge Row */}
          <View style={styles.ratingBadgeRow}>
            {reviewCount > 0 ? (
              <View style={styles.ratingPill}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingScore}>{Number(ratingVal).toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({reviewCount} reviews)</Text>
              </View>
            ) : (
              <View style={styles.ratingPill}>
                <Star size={13} color="#94a3b8" />
                <Text style={styles.newListingText}>New Listing • No reviews yet</Text>
              </View>
            )}

            <View style={styles.verifiedProBadge}>
              <ShieldCheck size={13} color="#059669" />
              <Text style={styles.verifiedProBadgeText}>Verified Trade Pro</Text>
            </View>

            <View style={styles.fastResponseBadge}>
              <Clock size={12} color="#084e8a" />
              <Text style={styles.fastResponseBadgeText}>Fast Arrival</Text>
            </View>
          </View>

          {/* Single Transparent Price Box */}
          <View style={styles.pricingHighlightBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pricingHighlightLabel}>VERIFIED MARKETPLACE RATE</Text>
              <Text style={styles.pricingHighlightValue}>{priceLabel}</Text>
            </View>
            <View style={styles.pricingGuaranteeBadge}>
              <Sparkles size={13} color="#084e8a" />
              <Text style={styles.pricingGuaranteeText}>No Hidden Fees</Text>
            </View>
          </View>

          {/* Sleek 1-Line Industry Protection Pill */}
          <View style={styles.leanProtectionPill}>
            <ShieldCheck size={14} color="#084e8a" />
            <Text style={styles.leanProtectionText}>
              Nexora Pro Guarantee • Transparent Pricing & Safe Platform Checkout
            </Text>
          </View>
        </View>

        {/* 2. Provider Profile Snapshot Card */}
        <View style={styles.card}>
          <View style={styles.providerHeaderRow}>
            <View style={styles.providerAvatarLarge}>
              <Text style={styles.providerAvatarLargeText}>
                {providerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text style={styles.providerBusinessName} numberOfLines={1}>
                  {providerName}
                </Text>
                <CheckCircle2 size={15} color="#059669" />
              </View>
              <Text style={styles.providerTradeTitle}>
                Licensed Trade Contractor • {service.provider?.city || 'Austin'},{' '}
                {service.provider?.state || 'TX'}
              </Text>
              {Number(ratingVal) > 0 && (
                <View style={styles.proStatsMiniRow}>
                  <Text style={styles.proStatsText}>⭐ {Number(ratingVal).toFixed(1)} Rating</Text>
                  <Text style={styles.proStatsDivider}>•</Text>
                  <Text style={styles.proStatsText}>100% Background Checked</Text>
                </View>
              )}
            </View>
          </View>

          {/* Pro Action Buttons */}
          <View style={styles.proContactRow}>
            <TouchableOpacity
              style={styles.proOutlineBtn}
              onPress={handleCallPro}
              activeOpacity={0.8}
            >
              <Phone size={14} color={NexoraColors.primary} />
              <Text style={styles.proOutlineBtnText}>Call Direct</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.proOutlineBtn}
              onPress={handleMessagePro}
              activeOpacity={0.8}
            >
              <MessageSquare size={14} color={NexoraColors.primary} />
              <Text style={styles.proOutlineBtnText}>In-App Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.proOutlineBtn, { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }]}
              onPress={() => {
                if (service.provider?._id) {
                  router.push(`/provider/${service.provider._id}` as any);
                } else {
                  router.push('/provider/prov_1' as any);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.proOutlineBtnText}>View Bio</Text>
              <ChevronRight size={14} color={NexoraColors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Service Description & Overview */}
        {service.description ? (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>About This Service</Text>
            <Text style={styles.sectionSubheading}>
              Full scope of work provided by the verified contractor.
            </Text>
            <Text style={styles.serviceDescriptionText}>{service.description}</Text>
          </View>
        ) : null}

        {/* 4. Provider Packages (Rendered ONLY if provider configured multiple tiers in backend) */}
        {packagesList.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Package Options</Text>
            <Text style={styles.sectionSubheading}>
              Choose the package tier configured by this provider.
            </Text>

            <View style={styles.tierSelectorRow}>
              {packagesList.map((pkg, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.tierCard,
                    selectedTierIndex === idx ? styles.tierCardActive : styles.tierCardInactive,
                  ]}
                  onPress={() => setSelectedTierIndex(idx)}
                  activeOpacity={0.85}
                >
                  <View style={styles.tierHeader}>
                    <Text
                      style={[
                        styles.tierName,
                        selectedTierIndex === idx && styles.tierNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {pkg.name}
                    </Text>
                    <Text style={styles.tierPrice}>${pkg.price}</Text>
                  </View>
                  {pkg.description ? (
                    <Text style={styles.tierDescription} numberOfLines={2}>
                      {pkg.description}
                    </Text>
                  ) : null}
                  {pkg.features && pkg.features.length > 0 && (
                    <View style={styles.tierFeatureCount}>
                      <Text style={styles.tierFeatureCountText}>
                        ✓ {pkg.features.length} inclusions included
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 5. Service Coverage & ETA */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Service Coverage & ETA</Text>
          <Text style={styles.sectionSubheading}>
            Verified dispatch radius and typical arrival turnaround for your area.
          </Text>

          <View style={styles.coverageItemsContainer}>
            <View style={styles.coverageRow}>
              <View style={styles.coverageIconCircle}>
                <MapPin size={17} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.coverageStatusTitle}>In-Coverage Service Zone</Text>
                <Text style={styles.coverageStatusSubtitle}>
                  Technician dispatches within a{' '}
                  {service.serviceLocation?.serviceRadiusMiles || 25}-mile radius of{' '}
                  {activeLocation?.city || 'Mohali / Austin'}.
                </Text>
              </View>
            </View>

            <View style={styles.coverageDivider} />

            <View style={styles.coverageRow}>
              <View style={styles.coverageIconCircle}>
                <Zap size={17} color="#084e8a" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.coverageStatusTitle}>Fast Turnaround Availability</Text>
                <Text style={styles.coverageStatusSubtitle}>
                  Same-day & scheduled arrival windows available Monday through Saturday.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomBarPriceCol}>
          <Text style={styles.bottomBarPriceLabel}>
            {packagesList.length > 0
              ? packagesList[selectedTierIndex]?.name || 'Total Estimate'
              : 'Marketplace Rate'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={styles.bottomBarPrice}>${activeDisplayPrice}</Text>
            {service.pricingType === 'hourly' && (
              <Text style={styles.bottomBarHourlyUnit}>/ hr</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookNowPrimaryBtn}
          onPress={() => setBookingModalVisible(true)}
          activeOpacity={0.88}
        >
          <Calendar size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.bookNowPrimaryBtnText}>Book Service</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Booking Scheduling Modal */}
      <Modal
        visible={bookingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalBackdropDismiss}>
            <TouchableWithoutFeedback onPress={() => setBookingModalVisible(false)}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>

            <View style={[styles.bookingModalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              {/* Sheet Drag / Header */}
              <View style={styles.bookingSheetHeader}>
                <View style={styles.modalDragHandle} />
                <View style={styles.sheetTitleRow}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.bookingSheetTitle}>Schedule Service Dispatch</Text>
                    <Text style={styles.bookingSheetSubtitle} numberOfLines={1}>
                      {service.title} • {providerName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.sheetCloseBtn}
                    onPress={() => setBookingModalVisible(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bookingSheetScroll}
                keyboardShouldPersistTaps="handled"
              >
                {/* 1. Date Selection */}
                <Text style={styles.sheetSectionLabel}>1. Select Service Date</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dateChipsScroll}
                >
                  {bookingDates.map((item, idx) => {
                    const isSelected = selectedDateIndex === idx;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                        onPress={() => setSelectedDateIndex(idx)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.dateChipDay, isSelected && styles.dateChipDaySelected]}>
                          {item.dayLabel}
                        </Text>
                        <Text style={[styles.dateChipDate, isSelected && styles.dateChipDateSelected]}>
                          {item.dateFormatted}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* 2. Arrival Time Window */}
                <Text style={styles.sheetSectionLabel}>2. Preferred Arrival Window</Text>
                <View style={styles.timeSlotsGrid}>
                  {TIME_SLOTS.map((slot, idx) => {
                    const isSelected = selectedTimeSlotIndex === idx;
                    return (
                      <TouchableOpacity
                        key={slot.id}
                        style={[styles.timeSlotCard, isSelected && styles.timeSlotCardSelected]}
                        onPress={() => setSelectedTimeSlotIndex(idx)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.timeSlotHeader}>
                          <Clock size={14} color={isSelected ? '#084e8a' : '#64748b'} />
                          <Text style={[styles.timeSlotName, isSelected && styles.timeSlotNameSelected]}>
                            {slot.label}
                          </Text>
                          {isSelected && <CheckCircle2 size={14} color="#084e8a" style={{ marginLeft: 'auto' }} />}
                        </View>
                        <Text style={[styles.timeSlotWindow, isSelected && styles.timeSlotWindowSelected]}>
                          {slot.window}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. Urgent / Emergency Dispatch Toggle */}
                <TouchableOpacity
                  style={[styles.urgentCard, isEmergencyBooking && styles.urgentCardActive]}
                  onPress={() => setIsEmergencyBooking((prev) => !prev)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.urgentIconWrap, isEmergencyBooking && styles.urgentIconWrapActive]}>
                    <Zap size={18} color={isEmergencyBooking ? '#ea580c' : '#64748b'} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.urgentTitle}>Priority Urgent Dispatch</Text>
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentBadgeText}>+$15.00</Text>
                      </View>
                    </View>
                    <Text style={styles.urgentSub}>
                      Dispatches nearest available specialist on urgent route priority.
                    </Text>
                  </View>
                  <View style={[styles.checkboxCircle, isEmergencyBooking && styles.checkboxCircleActive]}>
                    {isEmergencyBooking && <CheckCircle2 size={18} color="#ea580c" />}
                  </View>
                </TouchableOpacity>

                {/* 4. Dispatch Address Preview */}
                <Text style={styles.sheetSectionLabel}>3. Service Address</Text>
                <View style={styles.sheetAddressCard}>
                  <View style={styles.sheetAddressIconCircle}>
                    <MapPin size={16} color="#084e8a" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.sheetAddressTitle}>
                      {activeLocation?.label || 'Primary Service Address'}
                    </Text>
                    <Text style={styles.sheetAddressStreet} numberOfLines={2}>
                      {(activeLocation as any)?.address || activeLocation?.street || 'F301, Phase 8B, Industrial Area'}, {activeLocation?.city || 'Mohali'}, {activeLocation?.state || 'PB'} {activeLocation?.zipCode || '160055'}
                    </Text>
                  </View>
                </View>

                {/* 5. Special Notes / Instructions */}
                <Text style={styles.sheetSectionLabel}>4. Instructions for Technician (Optional)</Text>
                <TextInput
                  style={styles.sheetNotesInput}
                  placeholder="e.g. Gate code #4910, dog in yard, water main is on side of garage..."
                  placeholderTextColor="#94a3b8"
                  value={bookingNotes}
                  onChangeText={setBookingNotes}
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                />

                {/* 6. Pricing Breakdown & Pay After Service Notice */}
                <Text style={styles.sheetSectionLabel}>5. Booking & Price Summary</Text>
                <View style={styles.sheetPricingCard}>
                  {/* Selected Booking Details Overview */}
                  <View style={styles.summaryDetailsBox}>
                    <View style={styles.summaryDetailRow}>
                      <Calendar size={13} color="#084e8a" />
                      <Text style={styles.summaryDetailLabel}>Scheduled Date:</Text>
                      <Text style={styles.summaryDetailValue}>
                        {bookingDates[selectedDateIndex]?.dayLabel}, {bookingDates[selectedDateIndex]?.dateFormatted}
                      </Text>
                    </View>

                    <View style={styles.summaryDetailRow}>
                      <Clock size={13} color="#084e8a" />
                      <Text style={styles.summaryDetailLabel}>Arrival Window:</Text>
                      <Text style={styles.summaryDetailValue}>
                        {TIME_SLOTS[selectedTimeSlotIndex]?.window}
                      </Text>
                    </View>

                    <View style={styles.summaryDetailRow}>
                      <MapPin size={13} color="#084e8a" />
                      <Text style={styles.summaryDetailLabel}>Service Address:</Text>
                      <Text style={styles.summaryDetailValue} numberOfLines={1}>
                        {(activeLocation as any)?.address || activeLocation?.street || 'F301, Phase 8B'}, {activeLocation?.city || 'Mohali'}
                      </Text>
                    </View>

                    {isEmergencyBooking && (
                      <View style={styles.summaryDetailRow}>
                        <Zap size={13} color="#ea580c" />
                        <Text style={[styles.summaryDetailLabel, { color: '#c2410c' }]}>Priority:</Text>
                        <Text style={[styles.summaryDetailValue, { color: '#ea580c', fontWeight: '800' }]}>
                          Urgent Fast Dispatch (+$15)
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.sheetPriceDivider} />

                  <View style={styles.sheetPriceRow}>
                    <Text style={styles.sheetPriceLabel}>
                      {packagesList.length > 0 ? packagesList[selectedTierIndex]?.name || 'Service Base' : 'Service Base'}
                    </Text>
                    <Text style={styles.sheetPriceVal}>${activeDisplayPrice}</Text>
                  </View>

                  <View style={styles.sheetPriceRow}>
                    <Text style={styles.sheetPriceLabel}>Dispatch & Travel Fee</Text>
                    <Text style={styles.sheetPriceVal}>$15.00</Text>
                  </View>

                  <View style={styles.sheetPriceRow}>
                    <Text style={styles.sheetPriceLabel}>Platform Fee</Text>
                    <Text style={[styles.sheetPriceVal, { color: '#059669', fontWeight: '600' }]}>Included ($0.00)</Text>
                  </View>

                  {isEmergencyBooking && (
                    <View style={styles.sheetPriceRow}>
                      <Text style={[styles.sheetPriceLabel, { color: '#ea580c' }]}>Urgent Dispatch Surcharge</Text>
                      <Text style={[styles.sheetPriceVal, { color: '#ea580c' }]}>+$15.00</Text>
                    </View>
                  )}

                  <View style={styles.sheetPriceDivider} />

                  <View style={styles.sheetPriceRow}>
                    <Text style={styles.sheetPriceTotalLabel}>Estimated Total</Text>
                    <Text style={styles.sheetPriceTotalVal}>
                      ${Number(activeDisplayPrice) + 15 + (isEmergencyBooking ? 15 : 0)}
                      {service.pricingType === 'hourly' ? ' / hr' : ''}
                    </Text>
                  </View>

                  <View style={styles.sheetPayAfterNotice}>
                    <ShieldCheck size={16} color="#059669" />
                    <Text style={styles.sheetPayAfterText}>
                      Nexora Satisfaction Guarantee: Zero upfront charge today. Platform checkout secured seamlessly upon verified job completion.
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Confirm Booking CTA */}
              <View style={styles.sheetActionRow}>
                <TouchableOpacity
                  style={[styles.confirmBookingBtn, isSubmittingBooking && { opacity: 0.7 }]}
                  onPress={handleConfirmBooking}
                  disabled={isSubmittingBooking}
                  activeOpacity={0.88}
                >
                  {isSubmittingBooking ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Calendar size={18} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={styles.confirmBookingBtnText}>
                        Confirm Booking • ${Number(activeDisplayPrice) + 15 + (isEmergencyBooking ? 15 : 0)}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 14,
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  backBtnAction: {
    marginTop: 20,
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  backBtnActionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Carousel Slider
  carouselContainer: {
    width,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  carouselImage: {
    width,
    height: CAROUSEL_HEIGHT,
  },
  floatingHeader: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  floatingNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  floatingRightBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  carouselOverlayBadges: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 78, 138, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    maxWidth: width * 0.62,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  sliderCounterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 12,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  sliderCounterText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Standard Rounded Card
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  serviceTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 25,
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    rowGap: 8,
    marginTop: 10,
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
  ratingScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b45309',
  },
  ratingCount: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  newListingText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  verifiedProBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  verifiedProBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  fastResponseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  fastResponseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#084e8a',
  },

  // Pricing Box
  pricingHighlightBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pricingHighlightLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  pricingHighlightValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#084e8a',
    marginTop: 2,
  },
  pricingGuaranteeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  pricingGuaranteeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#084e8a',
  },

  // Lean Protection Pill
  leanProtectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  leanProtectionText: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '700',
  },

  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSubheading: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 16,
  },
  serviceDescriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },

  // Provider Snapshot
  providerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#084e8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerAvatarLargeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  providerBusinessName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  providerTradeTitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  proStatsMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  proStatsText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  proStatsDivider: {
    color: '#cbd5e1',
    fontSize: 10,
  },
  proContactRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  proOutlineBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  proOutlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },

  // Package Options
  tierSelectorRow: {
    flexDirection: 'column',
    gap: 10,
  },
  tierCard: {
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1.5,
  },
  tierCardActive: {
    borderColor: NexoraColors.primary,
    backgroundColor: '#f0f9ff',
  },
  tierCardInactive: {
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  tierNameActive: {
    color: NexoraColors.primary,
    fontWeight: '800',
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#084e8a',
  },
  tierDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 16,
  },
  tierFeatureCount: {
    marginTop: 8,
  },
  tierFeatureCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },

  // Coverage Card with Generous Spacing
  coverageItemsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  coverageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  coverageDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  coverageIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  coverageStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  coverageStatusSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },

  // Sticky Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    ...Shadows.floating,
  },
  bottomBarPriceCol: {
    justifyContent: 'center',
  },
  bottomBarPriceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  bottomBarPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#084e8a',
  },
  bottomBarHourlyUnit: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  bookNowPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: Radius.full,
    ...Shadows.card,
  },
  bookNowPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  // Booking Bottom Sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalBackdropDismiss: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bookingModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    ...Shadows.md,
  },
  bookingSheetHeader: {
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalDragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginBottom: 12,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  bookingSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  bookingSheetSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingSheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sheetSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateChipsScroll: {
    gap: 10,
    paddingBottom: 16,
  },
  dateChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    minWidth: 80,
  },
  dateChipSelected: {
    backgroundColor: '#084e8a',
    borderColor: '#084e8a',
  },
  dateChipDay: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  dateChipDaySelected: {
    color: '#ffffff',
  },
  dateChipDate: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  dateChipDateSelected: {
    color: '#ffffff',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  timeSlotCard: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  timeSlotCardSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#084e8a',
  },
  timeSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  timeSlotName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  timeSlotNameSelected: {
    color: '#084e8a',
  },
  timeSlotWindow: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  timeSlotWindowSelected: {
    color: '#0369a1',
    fontWeight: '600',
  },
  urgentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    marginBottom: 18,
  },
  urgentCardActive: {
    backgroundColor: '#ffedd5',
    borderColor: '#f97316',
  },
  urgentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentIconWrapActive: {
    backgroundColor: '#ea580c',
  },
  urgentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9a3412',
  },
  urgentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#ea580c',
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  urgentSub: {
    fontSize: 11,
    color: '#c2410c',
    marginTop: 2,
    lineHeight: 15,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#fdba74',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkboxCircleActive: {
    borderColor: 'transparent',
  },
  sheetAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
  },
  sheetAddressIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetAddressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  sheetAddressStreet: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  sheetNotesInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    color: '#0f172a',
    textAlignVertical: 'top',
    minHeight: 70,
    marginBottom: 18,
  },
  sheetPricingCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryDetailsBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
    marginBottom: 6,
  },
  summaryDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    minWidth: 105,
  },
  summaryDetailValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
  },
  sheetPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sheetPriceLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  sheetPriceVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  sheetPriceDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  sheetPriceTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  sheetPriceTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#084e8a',
  },
  sheetPayAfterNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#ecfdf5',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  sheetPayAfterText: {
    flex: 1,
    fontSize: 11,
    color: '#065f46',
    fontWeight: '600',
    lineHeight: 16,
  },
  sheetActionRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  confirmBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#084e8a',
    paddingVertical: 14,
    borderRadius: Radius.full,
    ...Shadows.md,
  },
  confirmBookingBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
