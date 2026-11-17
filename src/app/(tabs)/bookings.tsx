import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CalendarCheck,
  Clock,
  MapPin,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  Star,
  FileText,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Wrench,
  Sparkles,
  Zap,
  Info,
  Car,
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';

// Status types
export type BookingStatus =
  | 'confirmed'
  | 'dispatched'
  | 'en_route'
  | 'on_site'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type BookingTab = 'active' | 'completed' | 'cancelled';

export interface BookingTechnician {
  _id: string;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  completedJobs: number;
  trade: string;
  vehicleInfo?: string;
}

export interface BookingAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface BookingPricing {
  basePrice: number;
  pricingType: 'fixed' | 'hourly';
  estimatedHours?: number;
  dispatchFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
}

export interface CustomerBooking {
  _id: string;
  bookingNumber: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  serviceImage?: string;
  status: BookingStatus;
  statusLabel: string;
  isEmergency: boolean;
  scheduledDate: string;
  scheduledTimeWindow: string;
  createdAt: string;
  etaMinutes?: number;
  etaLabel?: string;
  serviceAddress: BookingAddress;
  technician: BookingTechnician;
  pricing: BookingPricing;
  notes?: string;
  ratingGiven?: number;
  reviewComment?: string;
  cancellationReason?: string;
}

// Realistic initial bookings dataset
const INITIAL_BOOKINGS: CustomerBooking[] = [
  {
    _id: 'bkg_101',
    bookingNumber: 'NX-94281',
    serviceId: 'serv_elec_1',
    serviceTitle: 'Master Electrician: Switchboard Rewiring & Load Diagnostics',
    serviceCategory: 'Electrical & Wiring',
    serviceImage:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=700&q=80',
    status: 'en_route',
    statusLabel: 'En Route to Location',
    isEmergency: true,
    scheduledDate: 'Today, Nov 17, 2026',
    scheduledTimeWindow: '2:30 PM - 3:30 PM',
    createdAt: '2026-11-17T08:45:00Z',
    etaMinutes: 15,
    etaLabel: '~15 mins arrival',
    serviceAddress: {
      label: 'Home',
      street: 'F301, Phase 8B, Industrial Area',
      city: 'Mohali',
      state: 'Punjab',
      zipCode: '160055',
    },
    technician: {
      _id: 'tech_01',
      name: 'Harman Chawla',
      phone: '+1 (800) 555-0199',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      rating: 5.0,
      completedJobs: 145,
      trade: 'Licensed Master Electrician',
      vehicleInfo: 'Nexora Service Van #04',
    },
    pricing: {
      basePrice: 75.0,
      pricingType: 'fixed',
      dispatchFee: 0.0,
      tax: 0.0,
      total: 75.0,
      paymentMethod: 'MasterCard •••• 4242',
      paymentStatus: 'pending',
    },
    notes: 'Circuit breaker trips when AC and water heater run simultaneously. Main panel checked last month.',
  },
  {
    _id: 'bkg_102',
    bookingNumber: 'NX-92147',
    serviceId: 'serv_hvac_2',
    serviceTitle: 'Precision AC & HVAC Coil Cleaning, Gas Refill & Duct Sanitization',
    serviceCategory: 'HVAC & Climate Control',
    serviceImage:
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=700&q=80',
    status: 'confirmed',
    statusLabel: 'Confirmed & Scheduled',
    isEmergency: false,
    scheduledDate: 'Tomorrow, Nov 18, 2026',
    scheduledTimeWindow: '10:00 AM - 11:30 AM',
    createdAt: '2026-11-16T14:20:00Z',
    serviceAddress: {
      label: 'Home',
      street: 'F301, Phase 8B, Industrial Area',
      city: 'Mohali',
      state: 'Punjab',
      zipCode: '160055',
    },
    technician: {
      _id: 'tech_02',
      name: 'Austin Master Pro LLC',
      phone: '+1 (800) 555-0144',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      rating: 4.9,
      completedJobs: 82,
      trade: 'HVAC Certified Specialist',
      vehicleInfo: 'Service Truck #12',
    },
    pricing: {
      basePrice: 95.0,
      pricingType: 'fixed',
      dispatchFee: 0.0,
      tax: 0.0,
      total: 95.0,
      paymentMethod: 'Apple Pay',
      paymentStatus: 'pending',
    },
    notes: 'Seasonal preventive maintenance and filter replacement.',
  },
  {
    _id: 'bkg_103',
    bookingNumber: 'NX-88210',
    serviceId: 'serv_plumb_3',
    serviceTitle: 'Emergency Pipe Leak Repair & Rapid Valve Replacement',
    serviceCategory: 'Plumbing & Water Systems',
    serviceImage:
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=700&q=80',
    status: 'completed',
    statusLabel: 'Completed & Certified',
    isEmergency: true,
    scheduledDate: 'Thu, Nov 12, 2026',
    scheduledTimeWindow: '3:30 PM - 5:00 PM',
    createdAt: '2026-11-12T10:15:00Z',
    serviceAddress: {
      label: 'Home',
      street: 'F301, Phase 8B, Industrial Area',
      city: 'Mohali',
      state: 'Punjab',
      zipCode: '160055',
    },
    technician: {
      _id: 'tech_03',
      name: 'Mohali Pro Rapid Trade Services',
      phone: '+1 (800) 555-0199',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      rating: 4.9,
      completedJobs: 112,
      trade: 'Master Plumber',
      vehicleInfo: 'Rapid Plumbing Van #01',
    },
    pricing: {
      basePrice: 49.0,
      pricingType: 'hourly',
      estimatedHours: 2,
      dispatchFee: 10.0,
      tax: 0.0,
      total: 108.0,
      paymentMethod: 'MasterCard •••• 4242',
      paymentStatus: 'paid',
    },
    notes: 'Kitchen sink pipe burst under counter. Water turned off at main valve.',
    ratingGiven: 5,
    reviewComment:
      'Technician arrived within 20 mins! Replaced the copper joint quickly and cleaned up thoroughly. Highly recommended.',
  },
  {
    _id: 'bkg_104',
    bookingNumber: 'NX-81492',
    serviceId: 'serv_carp_4',
    serviceTitle: 'Custom Cabinet Door Realignment & Concealed Hinge Replacement',
    serviceCategory: 'Carpentry & Woodwork',
    serviceImage:
      'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&w=700&q=80',
    status: 'completed',
    statusLabel: 'Completed & Certified',
    isEmergency: false,
    scheduledDate: 'Wed, Nov 05, 2026',
    scheduledTimeWindow: '1:00 PM - 2:30 PM',
    createdAt: '2026-11-04T12:00:00Z',
    serviceAddress: {
      label: 'Home',
      street: 'F301, Phase 8B, Industrial Area',
      city: 'Mohali',
      state: 'Punjab',
      zipCode: '160055',
    },
    technician: {
      _id: 'tech_04',
      name: 'David Miller Trade Services',
      phone: '+1 (800) 555-0177',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      rating: 4.8,
      completedJobs: 64,
      trade: 'Senior Cabinet Maker',
    },
    pricing: {
      basePrice: 65.0,
      pricingType: 'fixed',
      dispatchFee: 0.0,
      tax: 0.0,
      total: 65.0,
      paymentMethod: 'Visa •••• 8819',
      paymentStatus: 'paid',
    },
    ratingGiven: 5,
    reviewComment: 'Very professional, fixed 4 cabinet hinges smoothly.',
  },
  {
    _id: 'bkg_105',
    bookingNumber: 'NX-77319',
    serviceId: 'serv_hvac_5',
    serviceTitle: 'Commercial HVAC & Industrial Chiller Diagnostic',
    serviceCategory: 'HVAC & Climate Control',
    serviceImage:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    isEmergency: false,
    scheduledDate: 'Mon, Nov 02, 2026',
    scheduledTimeWindow: '11:00 AM - 1:00 PM',
    createdAt: '2026-11-01T15:30:00Z',
    serviceAddress: {
      label: 'Office',
      street: 'Kalka Industrial Zone, Sector 4',
      city: 'Kalka',
      state: 'Haryana',
      zipCode: '133302',
    },
    technician: {
      _id: 'tech_05',
      name: 'Industrial HVAC Specialists Co.',
      phone: '+1 (800) 555-0188',
      rating: 4.7,
      completedJobs: 41,
      trade: 'Commercial Refrigeration Pro',
    },
    pricing: {
      basePrice: 110.0,
      pricingType: 'hourly',
      dispatchFee: 0.0,
      tax: 0.0,
      total: 110.0,
      paymentMethod: 'Company Card',
      paymentStatus: 'pending',
    },
    cancellationReason: 'Building management scheduled central boiler shutdown instead.',
  },
];

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<BookingTab>('active');
  const [bookings, setBookings] = useState<CustomerBooking[]>(INITIAL_BOOKINGS);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<CustomerBooking | null>(null);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedCancelBooking, setSelectedCancelBooking] = useState<CustomerBooking | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<CustomerBooking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Counts
  const activeBookings = useMemo(() => bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled'), [bookings]);
  const completedBookings = useMemo(() => bookings.filter((b) => b.status === 'completed'), [bookings]);
  const cancelledBookings = useMemo(() => bookings.filter((b) => b.status === 'cancelled'), [bookings]);

  const displayedList = useMemo(() => {
    if (activeTab === 'active') return activeBookings;
    if (activeTab === 'completed') return completedBookings;
    return cancelledBookings;
  }, [activeTab, activeBookings, completedBookings, cancelledBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  // Actions
  const handleCallPro = (phone: string, proName: string) => {
    Alert.alert('Call Specialist', `Call ${proName} at ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => Linking.openURL(`tel:${phone.replace(/\D/g, '')}`) },
    ]);
  };

  const handleMessagePro = (proName: string) => {
    Alert.alert('Direct Message', `Open direct chat with ${proName}? Live dispatch chat is encrypted.`, [
      { text: 'Close', style: 'cancel' },
      { text: 'Open Chat', onPress: () => Alert.alert('Chat Connected', `Connected to ${proName}.`) },
    ]);
  };

  const openInvoiceModal = (booking: CustomerBooking) => {
    setSelectedInvoiceBooking(booking);
    setInvoiceModalVisible(true);
  };

  const openCancelModal = (booking: CustomerBooking) => {
    setSelectedCancelBooking(booking);
    setCancelReason('Change of plans');
    setCancelModalVisible(true);
  };

  const confirmCancellation = () => {
    if (!selectedCancelBooking) return;
    setBookings((prev) =>
      prev.map((b) =>
        b._id === selectedCancelBooking._id
          ? { ...b, status: 'cancelled', statusLabel: 'Cancelled by Customer', cancellationReason: cancelReason }
          : b
      )
    );
    setCancelModalVisible(false);
    Alert.alert('Booking Cancelled', 'Your service booking has been cancelled. No cancellation fee was charged.');
  };

  const openReviewModal = (booking: CustomerBooking) => {
    setSelectedReviewBooking(booking);
    setReviewRating(booking.ratingGiven || 5);
    setReviewFeedback(booking.reviewComment || '');
    setReviewModalVisible(true);
  };

  const submitReview = () => {
    if (!selectedReviewBooking) return;
    setBookings((prev) =>
      prev.map((b) =>
        b._id === selectedReviewBooking._id
          ? { ...b, ratingGiven: reviewRating, reviewComment: reviewFeedback }
          : b
      )
    );
    setReviewModalVisible(false);
    Alert.alert('Review Submitted', 'Thank you for rating your trade specialist!');
  };

  // Render Dispatch Stepper for live ongoing jobs
  const renderDispatchStepper = (status: BookingStatus, isEmergency: boolean) => {
    const steps = [
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'dispatched', label: isEmergency ? 'Dispatched' : 'Assigned' },
      { key: 'en_route', label: 'En Route' },
      { key: 'on_site', label: 'On-Site' },
    ];

    let currentStepIdx = 0;
    if (status === 'confirmed') currentStepIdx = 0;
    else if (status === 'dispatched') currentStepIdx = 1;
    else if (status === 'en_route') currentStepIdx = 2;
    else if (status === 'on_site' || status === 'in_progress') currentStepIdx = 3;

    return (
      <View style={styles.stepperContainer}>
        <View style={styles.stepperTrackRow}>
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <React.Fragment key={step.key}>
                {/* Step Circle */}
                <View
                  style={[
                    styles.stepperCircle,
                    isCompleted && styles.stepperCircleCompleted,
                    isCurrent && styles.stepperCircleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={13} color="#ffffff" />
                  ) : (
                    <View style={[styles.stepperInnerDot, isCurrent && styles.stepperInnerDotCurrent]} />
                  )}
                </View>

                {/* Connecting Line (except last) */}
                {idx < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepperLine,
                      idx < currentStepIdx && styles.stepperLineCompleted,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* Labels Row */}
        <View style={styles.stepperLabelsRow}>
          {steps.map((step, idx) => {
            const isCurrent = idx === currentStepIdx;
            const isCompleted = idx <= currentStepIdx;
            return (
              <Text
                key={step.key}
                style={[
                  styles.stepperLabelText,
                  isCompleted && styles.stepperLabelCompleted,
                  isCurrent && styles.stepperLabelCurrent,
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Midnight Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 24) + 10 }]}>
        <View style={styles.headerTopNavRow}>
          <View>
            <Text style={styles.screenTitle}>My Bookings</Text>
            <Text style={styles.screenSubtitle}>Active dispatches & service history</Text>
          </View>
          <NexoraLogo size="sm" subtitle="" inverted={true} />
        </View>

        {/* Segmented Tab Switcher (Active vs Completed vs Cancelled) */}
        <View style={styles.segmentSwitcher}>
          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'active' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentButtonText, activeTab === 'active' && styles.segmentButtonTextActive]}>
              Active ({activeBookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'completed' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('completed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentButtonText, activeTab === 'completed' && styles.segmentButtonTextActive]}>
              Completed ({completedBookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'cancelled' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('cancelled')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentButtonText, activeTab === 'cancelled' && styles.segmentButtonTextActive]}>
              Cancelled ({cancelledBookings.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List ScrollView */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NexoraColors.primary} />
        }
      >
        {displayedList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <CalendarCheck size={36} color={NexoraColors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'active'
                ? 'No Active Dispatches'
                : activeTab === 'completed'
                  ? 'No Completed Jobs Yet'
                  : 'No Cancelled Bookings'}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'active'
                ? 'When you schedule a trade specialist or request 24/7 emergency dispatch, your live technician tracking will appear here.'
                : activeTab === 'completed'
                  ? 'Your finished jobs, warranty records, and invoices will be stored here for easy reference.'
                  : 'You have zero cancelled service requests.'}
            </Text>

            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyActionBtnText}>Explore Available Trades</Text>
              <ArrowRight size={15} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          displayedList.map((item) => {
            const isEnRoute = item.status === 'en_route';
            const isActiveJob = item.status !== 'completed' && item.status !== 'cancelled';

            return (
              <View
                key={item._id}
                style={[
                  styles.bookingCard,
                  isEnRoute && styles.bookingCardEnRoute,
                ]}
              >
                {/* Live ETA Banner for In-Transit Emergency / Ongoing Jobs */}
                {isEnRoute && (
                  <View style={styles.liveEtaBanner}>
                    <View style={styles.liveEtaLeft}>
                      <Car size={16} color="#ffffff" />
                      <Text style={styles.liveEtaText}>
                        Technician En Route • {item.etaLabel || 'Arriving soon'}
                      </Text>
                    </View>
                    <View style={styles.livePulseDot} />
                  </View>
                )}

                {/* Card Top: Booking ID + Status Badge */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.bookingNumberText}>{item.bookingNumber}</Text>
                    {item.isEmergency && (
                      <View style={styles.emergencyPill}>
                        <Zap size={10} color="#e90402" />
                        <Text style={styles.emergencyPillText}>24/7 EMERGENCY</Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      item.status === 'en_route' && styles.statusPillEnRoute,
                      item.status === 'confirmed' && styles.statusPillConfirmed,
                      item.status === 'completed' && styles.statusPillCompleted,
                      item.status === 'cancelled' && styles.statusPillCancelled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        item.status === 'en_route' && styles.statusPillTextEnRoute,
                        item.status === 'confirmed' && styles.statusPillTextConfirmed,
                        item.status === 'completed' && styles.statusPillTextCompleted,
                        item.status === 'cancelled' && styles.statusPillTextCancelled,
                      ]}
                    >
                      {item.statusLabel}
                    </Text>
                  </View>
                </View>

                {/* Service Info Row */}
                <View style={styles.serviceMetaRow}>
                  {item.serviceImage ? (
                    <Image source={{ uri: item.serviceImage }} style={styles.serviceThumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.serviceThumbPlaceholder}>
                      <Wrench size={22} color={NexoraColors.primary} />
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceCategoryLabel}>{item.serviceCategory}</Text>
                    <Text style={styles.serviceTitleText} numberOfLines={2}>
                      {item.serviceTitle}
                    </Text>
                    <Text style={styles.servicePriceLabel}>
                      ${item.pricing.total.toFixed(2)}{' '}
                      <Text style={styles.servicePriceType}>
                        {item.pricing.pricingType === 'hourly' ? 'Hourly Est.' : 'Fixed Base'}
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* Stepper (Only for Active / Ongoing jobs) */}
                {isActiveJob && (
                  <View style={styles.stepperWrapper}>
                    {renderDispatchStepper(item.status, item.isEmergency)}
                  </View>
                )}

                {/* Date & Address Info Strip */}
                <View style={styles.infoStrip}>
                  <View style={styles.infoRow}>
                    <Clock size={13} color="#64748b" />
                    <Text style={styles.infoText}>
                      {item.scheduledDate} • {item.scheduledTimeWindow}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MapPin size={13} color="#64748b" />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {item.serviceAddress.street}, {item.serviceAddress.city}
                    </Text>
                  </View>
                </View>

                {/* Assigned Technician Row */}
                <View style={styles.technicianRow}>
                  {item.technician.avatar ? (
                    <Image source={{ uri: item.technician.avatar }} style={styles.techAvatar} resizeMode="cover" />
                  ) : (
                    <View style={styles.techAvatarPlaceholder}>
                      <Text style={styles.techAvatarInitial}>{item.technician.name.charAt(0)}</Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.techName} numberOfLines={1}>
                        {item.technician.name}
                      </Text>
                      <ShieldCheck size={13} color="#059669" />
                    </View>
                    <Text style={styles.techTrade} numberOfLines={1}>
                      {item.technician.trade} • {item.technician.vehicleInfo || 'Service Pro'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                      <Star size={11} color="#f59e0b" fill="#f59e0b" />
                      <Text style={styles.techRating}>
                        {item.technician.rating.toFixed(1)} ({item.technician.completedJobs} jobs)
                      </Text>
                    </View>
                  </View>

                  {/* Call & Message Actions for Active Jobs */}
                  {isActiveJob && (
                    <View style={styles.techActionGroup}>
                      <TouchableOpacity
                        style={styles.techCallBtn}
                        onPress={() => handleCallPro(item.technician.phone, item.technician.name)}
                        activeOpacity={0.8}
                      >
                        <PhoneCall size={14} color="#084e8a" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.techMsgBtn}
                        onPress={() => handleMessagePro(item.technician.name)}
                        activeOpacity={0.8}
                      >
                        <MessageSquare size={14} color="#084e8a" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Notes (if any) */}
                {item.notes && (
                  <View style={styles.notesBox}>
                    <Info size={12} color="#084e8a" style={{ marginTop: 2 }} />
                    <Text style={styles.notesText} numberOfLines={2}>
                      <Text style={{ fontWeight: '700' }}>Note: </Text>
                      {item.notes}
                    </Text>
                  </View>
                )}

                {/* Cancellation Reason (For cancelled jobs) */}
                {item.status === 'cancelled' && (
                  <View style={styles.cancellationBox}>
                    <AlertCircle size={13} color="#dc2626" />
                    <Text style={styles.cancellationText}>
                      Reason: {item.cancellationReason || 'Cancelled upon request'}
                    </Text>
                  </View>
                )}

                {/* Bottom Card Actions Row */}
                <View style={styles.cardActionsRow}>
                  {isActiveJob ? (
                    <>
                      <TouchableOpacity
                        style={styles.cancelLinkBtn}
                        onPress={() => openCancelModal(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cancelLinkText}>Cancel Dispatch</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.invoiceBtn}
                        onPress={() => openInvoiceModal(item)}
                        activeOpacity={0.85}
                      >
                        <FileText size={13} color="#ffffff" />
                        <Text style={styles.invoiceBtnText}>View Breakdown</Text>
                      </TouchableOpacity>
                    </>
                  ) : item.status === 'completed' ? (
                    <>
                      <TouchableOpacity
                        style={styles.rateProBtn}
                        onPress={() => openReviewModal(item)}
                        activeOpacity={0.8}
                      >
                        <Star size={13} color={item.ratingGiven ? '#f59e0b' : '#64748b'} fill={item.ratingGiven ? '#f59e0b' : 'transparent'} />
                        <Text style={styles.rateProBtnText}>
                          {item.ratingGiven ? `Rated ${item.ratingGiven}.0` : 'Rate Specialist'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.invoiceBtnOutline}
                        onPress={() => openInvoiceModal(item)}
                        activeOpacity={0.85}
                      >
                        <FileText size={13} color={NexoraColors.primary} />
                        <Text style={styles.invoiceBtnOutlineText}>Receipt</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.rebookBtn}
                      onPress={() => router.push('/(tabs)/search')}
                      activeOpacity={0.85}
                    >
                      <RotateCcw size={13} color="#ffffff" />
                      <Text style={styles.rebookBtnText}>Book Alternative Service</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ===================== INVOICE / RECEIPT MODAL ===================== */}
      <Modal
        visible={invoiceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInvoiceModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setInvoiceModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.invoiceCard}>
                <View style={styles.invoiceHeaderRow}>
                  <View style={styles.invoiceIconCircle}>
                    <FileText size={18} color={NexoraColors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.invoiceCardTitle}>Service Pricing Breakdown</Text>
                    <Text style={styles.invoiceCardSub}>
                      Booking #{selectedInvoiceBooking?.bookingNumber}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setInvoiceModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Line Items */}
                <View style={styles.invoiceBody}>
                  <View style={styles.invoiceLine}>
                    <Text style={styles.invoiceLineLabel}>
                      {selectedInvoiceBooking?.serviceTitle}
                    </Text>
                    <Text style={styles.invoiceLineValue}>
                      ${selectedInvoiceBooking?.pricing.basePrice.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.invoiceLine}>
                    <Text style={styles.invoiceLineLabel}>Nexora Guaranteed Dispatch</Text>
                    <Text style={styles.invoiceLineValue}>
                      {selectedInvoiceBooking?.pricing.dispatchFee === 0
                        ? 'FREE'
                        : `$${selectedInvoiceBooking?.pricing.dispatchFee.toFixed(2)}`}
                    </Text>
                  </View>

                  <View style={styles.invoiceLine}>
                    <Text style={styles.invoiceLineLabel}>Platform Escrow & Tax</Text>
                    <Text style={styles.invoiceLineValue}>
                      ${selectedInvoiceBooking?.pricing.tax.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.invoiceDivider} />

                  <View style={styles.invoiceTotalRow}>
                    <Text style={styles.invoiceTotalLabel}>Total Amount</Text>
                    <Text style={styles.invoiceTotalValue}>
                      ${selectedInvoiceBooking?.pricing.total.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.invoicePaymentRow}>
                    <Text style={styles.invoicePaymentLabel}>Payment Method:</Text>
                    <Text style={styles.invoicePaymentValue}>
                      {selectedInvoiceBooking?.pricing.paymentMethod}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.invoiceCloseBtn}
                  onPress={() => setInvoiceModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.invoiceCloseBtnText}>Close Receipt</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ===================== CANCEL BOOKING MODAL ===================== */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCancelModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.cancelCard}>
                <View style={styles.cancelHeaderRow}>
                  <View style={styles.cancelIconCircle}>
                    <XCircle size={22} color="#dc2626" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cancelTitle}>Cancel Service Dispatch?</Text>
                    <Text style={styles.cancelSub}>No fee will be charged before technician arrives on-site</Text>
                  </View>
                  <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
                    <X size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cancelReasonHeader}>Please select a cancellation reason:</Text>
                {[
                  'Issue resolved on my own',
                  'Emergency delay / Need reschedule',
                  'Booked by mistake',
                  'Found alternative service',
                ].map((reason) => {
                  const isSelected = cancelReason === reason;
                  return (
                    <TouchableOpacity
                      key={reason}
                      style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
                      onPress={() => setCancelReason(reason)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.reasonRadio, isSelected && styles.reasonRadioSelected]}>
                        {isSelected && <View style={styles.reasonRadioInner} />}
                      </View>
                      <Text style={[styles.reasonOptionText, isSelected && styles.reasonOptionTextSelected]}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.cancelBtnRow}>
                  <TouchableOpacity
                    style={styles.keepBookingBtn}
                    onPress={() => setCancelModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.keepBookingBtnText}>Keep Dispatch</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmCancelBtn}
                    onPress={confirmCancellation}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.confirmCancelBtnText}>Cancel Job</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ===================== RATE & REVIEW MODAL ===================== */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setReviewModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.reviewCard}>
                <View style={styles.invoiceHeaderRow}>
                  <View style={[styles.invoiceIconCircle, { backgroundColor: '#fffbeb' }]}>
                    <Sparkles size={18} color="#b45309" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.invoiceCardTitle}>Rate Your Specialist</Text>
                    <Text style={styles.invoiceCardSub}>
                      {selectedReviewBooking?.technician.name}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                    <X size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* 5-Star Selector */}
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((starNum) => (
                    <TouchableOpacity
                      key={starNum}
                      onPress={() => setReviewRating(starNum)}
                      activeOpacity={0.7}
                      style={{ padding: 6 }}
                    >
                      <Star
                        size={28}
                        color={starNum <= reviewRating ? '#f59e0b' : '#cbd5e1'}
                        fill={starNum <= reviewRating ? '#f59e0b' : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.reviewInput}
                  placeholder="Share feedback on technician workmanship, punctuality, and cleanliness..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  value={reviewFeedback}
                  onChangeText={setReviewFeedback}
                />

                <TouchableOpacity
                  style={styles.submitReviewBtn}
                  onPress={submitReview}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitReviewBtnText}>Submit Rating & Review</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    backgroundColor: NexoraColors.midnightHeader,
    paddingHorizontal: 20,
    paddingBottom: 16,
    ...Shadows.sm,
  },
  headerTopNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  segmentSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.full,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  segmentButtonActive: {
    backgroundColor: NexoraColors.primary,
  },
  segmentButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  segmentButtonTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.card,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12.5,
    color: NexoraColors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 290,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  emptyActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Booking Card
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
    ...Shadows.sm,
  },
  bookingCardEnRoute: {
    borderColor: '#084e8a',
    borderWidth: 1.5,
  },
  liveEtaBanner: {
    backgroundColor: NexoraColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginBottom: 12,
  },
  liveEtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveEtaText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookingNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  emergencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#e90402',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: '#f1f5f9',
  },
  statusPillEnRoute: {
    backgroundColor: '#eef5fc',
  },
  statusPillConfirmed: {
    backgroundColor: '#fffbeb',
  },
  statusPillCompleted: {
    backgroundColor: '#ecfdf5',
  },
  statusPillCancelled: {
    backgroundColor: '#fef2f2',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  statusPillTextEnRoute: {
    color: '#084e8a',
    fontWeight: '800',
  },
  statusPillTextConfirmed: {
    color: '#b45309',
    fontWeight: '800',
  },
  statusPillTextCompleted: {
    color: '#059669',
    fontWeight: '800',
  },
  statusPillTextCancelled: {
    color: '#dc2626',
    fontWeight: '800',
  },

  // Service Info
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  serviceThumb: {
    width: 68,
    height: 68,
    borderRadius: Radius.md,
    backgroundColor: '#f1f5f9',
  },
  serviceThumbPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: Radius.md,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCategoryLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: NexoraColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  serviceTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    lineHeight: 19,
    marginBottom: 4,
  },
  servicePriceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  servicePriceType: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },

  // Stepper
  stepperWrapper: {
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  stepperContainer: {
    width: '100%',
  },
  stepperTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  stepperCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepperCircleCompleted: {
    backgroundColor: '#059669',
  },
  stepperCircleCurrent: {
    backgroundColor: NexoraColors.primary,
    borderWidth: 2,
    borderColor: '#bdd8f2',
  },
  stepperInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  stepperInnerDotCurrent: {
    backgroundColor: '#ffffff',
  },
  stepperLine: {
    flex: 1,
    height: 2.5,
    backgroundColor: '#e2e8f0',
    marginHorizontal: -2,
    zIndex: 1,
  },
  stepperLineCompleted: {
    backgroundColor: '#059669',
  },
  stepperLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  stepperLabelText: {
    fontSize: 9.5,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
    width: 65,
  },
  stepperLabelCompleted: {
    color: '#334155',
    fontWeight: '700',
  },
  stepperLabelCurrent: {
    color: NexoraColors.primary,
    fontWeight: '800',
  },

  // Info Strip
  infoStrip: {
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },

  // Technician
  technicianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginBottom: 12,
  },
  techAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
  },
  techAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techAvatarInitial: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  techName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  techTrade: {
    fontSize: 11,
    color: '#64748b',
  },
  techRating: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#b45309',
  },
  techActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  techCallBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  techMsgBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Notes
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.sm,
    padding: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    flex: 1,
  },
  cancellationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    borderRadius: Radius.sm,
    padding: 8,
    marginBottom: 12,
  },
  cancellationText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },

  // Actions
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelLinkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cancelLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
  },
  invoiceBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  rateProBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  rateProBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  invoiceBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: NexoraColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
  },
  invoiceBtnOutlineText: {
    color: NexoraColors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  rebookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: NexoraColors.primary,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  rebookBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal Backdrop & Base
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Invoice Card
  invoiceCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 20,
    ...Shadows.floating,
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  invoiceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  invoiceCardSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  invoiceBody: {
    backgroundColor: '#f8fafc',
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 16,
  },
  invoiceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceLineLabel: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
    marginRight: 10,
  },
  invoiceLineValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  invoiceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  invoiceTotalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  invoicePaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoicePaymentLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  invoicePaymentValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  invoiceCloseBtn: {
    backgroundColor: NexoraColors.primary,
    borderRadius: Radius.md,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceCloseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Cancel Card
  cancelCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 20,
    ...Shadows.floating,
  },
  cancelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cancelIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  cancelSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  cancelReasonHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: '#f8fafc',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reasonOptionSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  reasonRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonRadioSelected: {
    borderColor: '#dc2626',
  },
  reasonRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  reasonOptionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  reasonOptionTextSelected: {
    color: '#dc2626',
    fontWeight: '700',
  },
  cancelBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  keepBookingBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 11,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  keepBookingBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 11,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  confirmCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Review Card
  reviewCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: Radius.xl,
    padding: 20,
    ...Shadows.floating,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  reviewInput: {
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    fontSize: 12.5,
    color: NexoraColors.textPrimary,
    textAlignVertical: 'top',
    height: 85,
    marginBottom: 16,
  },
  submitReviewBtn: {
    backgroundColor: NexoraColors.primary,
    paddingVertical: 11,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
