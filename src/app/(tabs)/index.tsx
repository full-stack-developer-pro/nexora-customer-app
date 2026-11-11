import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Search,
  SlidersHorizontal,
  Droplets,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Sparkles,
  Wrench,
  ShieldCheck,
  Star,
  Package,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Flame,
  Store,
  Tag,
  AlertTriangle,
  PhoneCall,
  Award,
  ArrowRight,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { LocationHeaderPill } from '@/components/common/LocationHeaderPill';
import {
  NexoraShimmer,
  HomeServiceSlideSkeleton,
  HomeProviderSlideSkeleton,
  HomeProductSlideSkeleton,
} from '@/components/common/NexoraShimmer';
import {
  marketplaceService,
  ServiceCategory,
  ServiceOffering,
  MarketplaceProduct,
  FeaturedProvider,
} from '@/services/marketplaceService';

const { width } = Dimensions.get('window');

// Category Icon Helper with Fuzzy Slug Matching
const renderCategoryIcon = (slug = '', color = '#ffffff', size = 22) => {
  const s = (slug || '').toLowerCase();
  if (s.includes('plumb') || s.includes('water')) return <Droplets size={size} color={color} />;
  if (s.includes('electr') || s.includes('wire')) return <Zap size={size} color={color} />;
  if (s.includes('hvac') || s.includes('climate') || s.includes('air')) return <Wind size={size} color={color} />;
  if (s.includes('carpent') || s.includes('wood')) return <Hammer size={size} color={color} />;
  if (s.includes('paint') || s.includes('finish')) return <Paintbrush size={size} color={color} />;
  if (s.includes('clean')) return <Sparkles size={size} color={color} />;
  if (s.includes('roof') || s.includes('gutter')) return <ShieldCheck size={size} color={color} />;
  return <Wrench size={size} color={color} />;
};

// Clean trade labels for icon circles (standard in consumer service apps: Plumbing, Electrical, etc.)
const getTradeDisplayName = (slug = '', name = ''): string => {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (s.includes('plumb') || n.includes('plumb')) return 'Plumbing';
  if (s.includes('electr') || n.includes('electr')) return 'Electrical';
  if (s.includes('hvac') || n.includes('hvac') || n.includes('climate')) return 'HVAC';
  if (s.includes('carpent') || n.includes('carpent') || n.includes('wood')) return 'Carpentry';
  if (s.includes('paint') || n.includes('paint')) return 'Painting';
  if (s.includes('roof') || n.includes('roof') || n.includes('gutter')) return 'Roofing';
  if (s.includes('remodel') || s.includes('contract') || n.includes('remodel') || n.includes('contract')) return 'Remodeling';
  if (s.includes('clean') || n.includes('clean')) return 'Cleaning';

  if (name.includes(' & ')) return name.split(' & ')[0].trim();
  return name.trim();
};

const getCategoryColor = (slug = '') => {
  const s = (slug || '').toLowerCase();
  if (s.includes('plumb') || s.includes('water')) return '#084e8a';
  if (s.includes('electr') || s.includes('wire')) return '#f59e0b';
  if (s.includes('hvac') || s.includes('climate') || s.includes('air')) return '#0284c7';
  if (s.includes('carpent') || s.includes('wood')) return '#b45309';
  if (s.includes('paint') || s.includes('finish')) return '#e90402';
  if (s.includes('roof') || s.includes('gutter')) return '#475569';
  if (s.includes('remodel') || s.includes('contract')) return '#0f766e';
  return '#084e8a';
};

// Safe Image URL Resolver (Handles both String URLs and Cloudinary { url, publicId } objects)
const getImageUrl = (item: any): string | null => {
  if (!item) return null;
  if (typeof item === 'string') return item.trim() || null;
  if (typeof item === 'object') {
    if (typeof item.url === 'string' && item.url.trim().length > 0) return item.url.trim();
    if (typeof item.uri === 'string' && item.uri.trim().length > 0) return item.uri.trim();
  }
  return null;
};

const SERVICE_CARD_WIDTH = Math.min(width * 0.8, 320);
const SERVICE_CARD_GAP = 14;
const SERVICE_SNAP_INTERVAL = SERVICE_CARD_WIDTH + SERVICE_CARD_GAP;

const PROVIDER_CARD_WIDTH = Math.min(width * 0.64, 248);
const PROVIDER_CARD_GAP = 12;
const PROVIDER_SNAP_INTERVAL = PROVIDER_CARD_WIDTH + PROVIDER_CARD_GAP;

const PRODUCT_CARD_WIDTH = Math.min(width * 0.52, 200);
const PRODUCT_CARD_GAP = 12;
const PRODUCT_SNAP_INTERVAL = PRODUCT_CARD_WIDTH + PRODUCT_CARD_GAP;

export default function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const servicesScrollRef = React.useRef<any>(null);
  const providersScrollRef = React.useRef<any>(null);
  const productsScrollRef = React.useRef<any>(null);
  const [servicesScrollX, setServicesScrollX] = useState(0);
  const [providersScrollX, setProvidersScrollX] = useState(0);
  const [productsScrollX, setProductsScrollX] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [quickServices, setQuickServices] = useState<ServiceOffering[]>([]);
  const [quickProducts, setQuickProducts] = useState<MarketplaceProduct[]>([]);
  const [isSearchingQuick, setIsSearchingQuick] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Instant Quick Search Dropdown on Home
  useEffect(() => {
    if (!searchQuery.trim()) {
      setQuickServices([]);
      setQuickProducts([]);
      setIsSearchingQuick(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingQuick(true);
      try {
        const [servs, prods] = await Promise.all([
          marketplaceService.getFeaturedServices({ search: searchQuery.trim(), limit: 2 }),
          marketplaceService.getProducts({ search: searchQuery.trim(), limit: 2 }),
        ]);
        setQuickServices(servs.slice(0, 2));
        setQuickProducts(prods.slice(0, 2));
      } catch {
        // fallback
      } finally {
        setIsSearchingQuick(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNavigateToSearch = (query = searchQuery.trim()) => {
    setIsSearchFocused(false);
    router.push({
      pathname: '/(tabs)/search',
      params: query ? { q: query } : undefined,
    });
  };

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [providers, setProviders] = useState<FeaturedProvider[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const scrollServices = (direction: 'left' | 'right') => {
    const newOffset = direction === 'right'
      ? servicesScrollX + SERVICE_SNAP_INTERVAL
      : Math.max(0, servicesScrollX - SERVICE_SNAP_INTERVAL);
    servicesScrollRef.current?.scrollTo({ x: newOffset, animated: true });
    setServicesScrollX(newOffset);
  };

  const scrollProviders = (direction: 'left' | 'right') => {
    const newOffset = direction === 'right'
      ? providersScrollX + PROVIDER_SNAP_INTERVAL
      : Math.max(0, providersScrollX - PROVIDER_SNAP_INTERVAL);
    providersScrollRef.current?.scrollTo({ x: newOffset, animated: true });
    setProvidersScrollX(newOffset);
  };

  const scrollProducts = (direction: 'left' | 'right') => {
    const newOffset = direction === 'right'
      ? productsScrollX + PRODUCT_SNAP_INTERVAL
      : Math.max(0, productsScrollX - PRODUCT_SNAP_INTERVAL);
    productsScrollRef.current?.scrollTo({ x: newOffset, animated: true });
    setProductsScrollX(newOffset);
  };

  const loadMarketplaceData = useCallback(async () => {
    try {
      const [catData, servData, provData, prodData] = await Promise.all([
        marketplaceService.getCategories(),
        marketplaceService.getFeaturedServices(6),
        marketplaceService.getFeaturedProviders(6),
        marketplaceService.getProducts(6),
      ]);
      setCategories(catData);
      setServices(servData);
      setProviders(provData);
      setProducts(prodData);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMarketplaceData();
  }, [loadMarketplaceData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMarketplaceData();
  };

  // Filtered services if category selected (matches slug, title, subcategory)
  const displayedServices = selectedCategory === 'all'
    ? services
    : services.filter((s) => {
      const catSlug = (s.category?.slug || '').toLowerCase();
      const catName = (s.category?.name || '').toLowerCase();
      const subCat = ((s as any).subcategory || '').toLowerCase();
      const title = (s.title || '').toLowerCase();
      const sel = selectedCategory.toLowerCase();
      return (
        catSlug === sel ||
        catSlug.includes(sel) ||
        sel.includes(catSlug) ||
        catName.includes(sel) ||
        subCat.includes(sel) ||
        title.includes(sel)
      );
    });

  const selectedCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const sectionHeaderTitle = selectedCategory === 'all'
    ? 'Featured Services'
    : `${getTradeDisplayName(selectedCategoryObj?.slug || selectedCategory, selectedCategoryObj?.name)} Services`;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Top Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 24) + 12 }]}>
        {/* Top Nav Row: Location Pill on Left, Brand Logo on Right */}
        <View style={styles.headerTopNavRow}>
          <LocationHeaderPill inverted={true} />
          <NexoraLogo size="sm" subtitle="" inverted={true} />
        </View>

        {/* Greeting Row */}
        <View style={styles.greetingCol}>
          <Text style={styles.welcomeSubtitle} numberOfLines={1}>Welcome back,</Text>
          <Text style={styles.customerName} numberOfLines={1}>{user?.name || 'Nexora Customer'}</Text>
        </View>

        {/* Global Search Bar with Live Suggestions Dropdown */}
        <View style={styles.searchBarWrapper}>
          <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plumbing, HVAC, electrical, tools..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            returnKeyType="search"
            onSubmitEditing={() => handleNavigateToSearch()}
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.filterIconButton}
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/search',
                  params: { openFilter: 'true' },
                });
              }}
              activeOpacity={0.7}
            >
              <SlidersHorizontal size={16} color={NexoraColors.primary} />
            </TouchableOpacity>
          )}

          {/* Floating Live Suggestions Dropdown */}
          {searchQuery.trim().length > 0 && isSearchFocused && (
            <View style={styles.quickSearchPopup}>
              {isSearchingQuick ? (
                <View style={styles.quickSearchLoading}>
                  <NexoraShimmer width="65%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
                  <NexoraShimmer width="85%" height={14} borderRadius={4} />
                </View>
              ) : quickServices.length > 0 || quickProducts.length > 0 ? (
                <View style={styles.quickSearchContent}>
                  {/* Quick Services */}
                  {quickServices.map((item) => (
                    <TouchableOpacity
                      key={item._id}
                      style={styles.quickResultRow}
                      onPress={() => handleNavigateToSearch(item.title)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.quickResultIconBox, { backgroundColor: '#eef5fc' }]}>
                        <Wrench size={14} color={NexoraColors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.quickResultTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.quickResultSubtitle} numberOfLines={1}>
                          Service • {getTradeDisplayName(item.category?.slug, item.category?.name)} • ${item.price}
                        </Text>
                      </View>
                      <ChevronRight size={14} color="#94a3b8" />
                    </TouchableOpacity>
                  ))}

                  {/* Quick Products */}
                  {quickProducts.map((item) => (
                    <TouchableOpacity
                      key={item._id}
                      style={styles.quickResultRow}
                      onPress={() => handleNavigateToSearch(item.name)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.quickResultIconBox, { backgroundColor: '#ecfdf5' }]}>
                        <Package size={14} color="#059669" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.quickResultTitle} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.quickResultSubtitle} numberOfLines={1}>
                          Supplies • ${Number(item.price).toFixed(2)}
                        </Text>
                      </View>
                      <ChevronRight size={14} color="#94a3b8" />
                    </TouchableOpacity>
                  ))}

                  {/* View All Matching Results Link */}
                  <TouchableOpacity
                    style={styles.viewAllSearchesBtn}
                    onPress={() => handleNavigateToSearch()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewAllSearchesText}>
                      View all results for "{searchQuery.trim()}"
                    </Text>
                    <ArrowRight size={14} color={NexoraColors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.noQuickMatchBox}
                  onPress={() => handleNavigateToSearch()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.noQuickMatchText}>
                    No quick preview for "{searchQuery.trim()}"
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Text style={styles.searchAllCatalogText}>Search full catalog</Text>
                    <ArrowRight size={13} color={NexoraColors.primary} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NexoraColors.primary} />
        }
      >
        {/* Hero Emergency / Guarantee Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Flame size={14} color="#e90402" />
            <Text style={styles.heroBadgeText}>VERIFIED PROS ON-DEMAND</Text>
          </View>
          <Text style={styles.heroTitle}>Book Certified Home & Trade Services</Text>
          <Text style={styles.heroSubtitle}>
            Upfront fixed pricing, licensed trade professionals, and guaranteed workmanship.
          </Text>
        </View>

        {/* 24/7 Emergency Quick-Dispatch Strip */}
        <TouchableOpacity style={styles.emergencyStrip} activeOpacity={0.88}>
          <View style={styles.emergencyLeftBadge}>
            <PhoneCall size={16} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.emergencyTitle}>24/7 Emergency Dispatch</Text>
              <View style={styles.livePulseDot} />
            </View>
            <Text style={styles.emergencySubtitle} numberOfLines={1}>
              Burst pipe, outage, or AC down? Pro on-site in 30m
            </Text>
          </View>
          <View style={styles.emergencyButton}>
            <Text style={styles.emergencyButtonText}>Call Pro</Text>
          </View>
        </TouchableOpacity>

        {/* Popular Trades Section (Round Colorful Icons) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Popular Trades</Text>
          <TouchableOpacity onPress={() => setSelectedCategory('all')}>
            <Text style={styles.seeAllText}>
              {selectedCategory !== 'all' ? 'Show All' : 'Browse All'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const bubbleColor = getCategoryColor(cat.slug);
            const tradeName = getTradeDisplayName(cat.slug, cat.name);

            return (
              <TouchableOpacity
                key={cat._id || cat.slug}
                style={styles.categoryCard}
                onPress={() => setSelectedCategory(isSelected ? 'all' : cat.slug)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.categoryIconCircle,
                    { backgroundColor: bubbleColor },
                    isSelected && styles.categoryIconCircleActive,
                  ]}
                >
                  {renderCategoryIcon(cat.slug, '#ffffff', 22)}
                </View>
                <Text
                  style={[styles.categoryName, isSelected && styles.categoryNameSelected]}
                  numberOfLines={1}
                >
                  {tradeName}
                </Text>
                {isSelected ? <View style={styles.activeIndicatorBar} /> : <View style={styles.indicatorPlaceholder} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Service Offerings Slider */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{sectionHeaderTitle}</Text>
          </View>

          <View style={styles.headerControlsGroup}>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => router.push({ pathname: '/(tabs)/search', params: { tab: 'services' } })}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>

            <View style={styles.arrowButtonGroup}>
              <TouchableOpacity
                style={styles.navArrowBtn}
                onPress={() => scrollServices('left')}
                activeOpacity={0.7}
              >
                <ChevronLeft size={16} color={NexoraColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navArrowBtn}
                onPress={() => scrollServices('right')}
                activeOpacity={0.7}
              >
                <ChevronRight size={16} color={NexoraColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesSliderContent}
          >
            <HomeServiceSlideSkeleton />
            <HomeServiceSlideSkeleton />
          </ScrollView>
        ) : displayedServices.length === 0 ? (
          <View style={styles.emptyServicesBox}>
            <Wrench size={32} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Services Available</Text>
            <Text style={styles.emptySub}>
              {selectedCategory !== 'all'
                ? `No published services in ${sectionHeaderTitle.replace(' Services', '')} right now.`
                : 'Verified local providers will list their services here soon.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={servicesScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SERVICE_SNAP_INTERVAL}
            decelerationRate="fast"
            contentContainerStyle={styles.servicesSliderContent}
            onScroll={(e) => setServicesScrollX(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
          >
            {displayedServices.map((service) => {
              const priceLabel =
                service.pricingType === 'hourly'
                  ? `$${service.price} / hr`
                  : service.pricingType === 'custom_quote'
                    ? 'Custom Quote'
                    : `$${service.price} Fixed`;

              const primaryImgUrl = getImageUrl(service.images?.[0]);
              const ratingVal = (service as any).ratings?.average || service.provider?.rating || 4.9;
              const reviewCountVal = (service as any).ratings?.count || service.provider?.reviewCount || 18;

              return (
                <View key={service._id} style={styles.serviceSlideCard}>
                  {primaryImgUrl ? (
                    <Image source={{ uri: primaryImgUrl }} style={styles.serviceThumbnail} resizeMode="cover" />
                  ) : (
                    <View style={styles.serviceThumbnailPlaceholder}>
                      <Wrench size={28} color="#94a3b8" />
                    </View>
                  )}

                  <View style={styles.serviceBody}>
                    {/* Category Pill + Price */}
                    <View style={styles.serviceTopRow}>
                      <View style={styles.serviceCategoryPill}>
                        <Text style={styles.serviceCategoryPillText} numberOfLines={1}>
                          {getTradeDisplayName(service.category?.slug, service.category?.name)}
                        </Text>
                      </View>
                      <Text style={styles.servicePrice}>{priceLabel}</Text>
                    </View>

                    {/* Title & Description */}
                    <Text style={styles.serviceTitle} numberOfLines={2}>
                      {service.title}
                    </Text>
                    <Text style={styles.serviceDesc} numberOfLines={2}>
                      {service.description}
                    </Text>

                    {/* Provider Info Row */}
                    <View style={styles.providerRow}>
                      <View style={styles.providerAvatarMini}>
                        <Text style={styles.providerInitial}>
                          {(service.provider?.businessName || service.provider?.name || 'P')[0]?.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={styles.providerNameText} numberOfLines={1}>
                            {service.provider?.businessName || service.provider?.name || 'Certified Specialist'}
                          </Text>
                          <CheckCircle2 size={12} color="#059669" />
                        </View>
                        <View style={styles.ratingRow}>
                          <Star size={12} color="#f59e0b" fill="#f59e0b" />
                          <Text style={styles.ratingText}>
                            {Number(ratingVal).toFixed(1)}
                          </Text>
                          <Text style={styles.reviewsCountText}>({reviewCountVal} reviews)</Text>
                        </View>
                      </View>

                      <TouchableOpacity style={styles.bookButton} activeOpacity={0.85}>
                        <Text style={styles.bookButtonText}>Book</Text>
                        <ChevronRight size={13} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Top-Rated Local Pros Slider */}
        {providers.length > 0 && (
          <>
            <View style={[styles.sectionHeaderRow, { marginTop: 28 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Top-Rated Local Pros</Text>
              </View>

              <View style={styles.headerControlsGroup}>
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => router.push({ pathname: '/(tabs)/search', params: { tab: 'products' } })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>

                <View style={styles.arrowButtonGroup}>
                  <TouchableOpacity
                    style={styles.navArrowBtn}
                    onPress={() => scrollProviders('left')}
                    activeOpacity={0.7}
                  >
                    <ChevronLeft size={16} color={NexoraColors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navArrowBtn}
                    onPress={() => scrollProviders('right')}
                    activeOpacity={0.7}
                  >
                    <ChevronRight size={16} color={NexoraColors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {loading ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.providersSliderContent}
              >
                <HomeProviderSlideSkeleton />
                <HomeProviderSlideSkeleton />
              </ScrollView>
            ) : (
              <ScrollView
                ref={providersScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={PROVIDER_SNAP_INTERVAL}
                decelerationRate="fast"
                contentContainerStyle={styles.providersSliderContent}
                onScroll={(e) => setProvidersScrollX(e.nativeEvent.contentOffset.x)}
                scrollEventThrottle={16}
              >
                {providers.map((pro) => (
                  <View key={pro._id} style={styles.providerCard}>
                    {/* Top: Avatar & Rating badge */}
                    <View style={styles.providerCardTop}>
                      <View style={styles.providerAvatarCircle}>
                        {pro.profileImage ? (
                          <Image source={{ uri: pro.profileImage }} style={styles.providerImg} resizeMode="cover" />
                        ) : (
                          <Text style={styles.providerAvatarInitials}>
                            {(pro.name || 'P')[0]?.toUpperCase()}
                          </Text>
                        )}
                        <View style={styles.verifiedCheckBadge}>
                          <CheckCircle2 size={12} color="#ffffff" fill="#059669" />
                        </View>
                      </View>

                      <View style={styles.proRatingPill}>
                        <Star size={11} color="#f59e0b" fill="#f59e0b" />
                        <Text style={styles.proRatingPillText}>{pro.rating ? pro.rating.toFixed(1) : '5.0'}</Text>
                      </View>
                    </View>

                    {/* Middle: Name, Business & Trade */}
                    <Text style={styles.proNameText} numberOfLines={1}>{pro.name}</Text>
                    <Text style={styles.proBusinessText} numberOfLines={1}>{pro.businessName}</Text>

                    <View style={styles.proTradeBadge}>
                      <Text style={styles.proTradeBadgeText} numberOfLines={1}>{pro.trade}</Text>
                    </View>

                    {/* Bottom: Stats & Action */}
                    <View style={styles.proStatsRow}>
                      <Text style={styles.proStatsText}>{pro.completedJobs}+ jobs completed</Text>
                      <Text style={styles.proLocationText}>• {pro.city}, {pro.state}</Text>
                    </View>

                    <TouchableOpacity style={styles.proHireBtn} activeOpacity={0.85}>
                      <Text style={styles.proHireBtnText}>Book Specialist</Text>
                      <ChevronRight size={13} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}

        {/* Physical Products / Hardware Supplies Slider */}
        {(loading || products.length > 0) && (
          <>
            <View style={[styles.sectionHeaderRow, { marginTop: 28 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Hardware & Supplies</Text>
              </View>

              <View style={styles.headerControlsGroup}>
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => router.push({ pathname: '/(tabs)/search', params: { tab: 'products' } })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>

                <View style={styles.arrowButtonGroup}>
                  <TouchableOpacity
                    style={styles.navArrowBtn}
                    onPress={() => scrollProducts('left')}
                    activeOpacity={0.7}
                  >
                    <ChevronLeft size={16} color={NexoraColors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navArrowBtn}
                    onPress={() => scrollProducts('right')}
                    activeOpacity={0.7}
                  >
                    <ChevronRight size={16} color={NexoraColors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {loading ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsSliderContent}
              >
                <HomeProductSlideSkeleton />
                <HomeProductSlideSkeleton />
              </ScrollView>
            ) : (
              <ScrollView
                ref={productsScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={PRODUCT_SNAP_INTERVAL}
                decelerationRate="fast"
                contentContainerStyle={styles.productsSliderContent}
                onScroll={(e) => setProductsScrollX(e.nativeEvent.contentOffset.x)}
                scrollEventThrottle={16}
              >
                {products.map((prod) => {
                  const prodImgUrl = getImageUrl(prod.images?.[0]);
                  const condition = (prod.condition || 'new').toLowerCase();
                  const conditionLabel =
                    condition === 'old'
                      ? 'PRE-OWNED'
                      : condition === 'refurbished'
                        ? 'REFURBISHED'
                        : 'BRAND NEW';
                  const hasDiscount = prod.compareAtPrice && prod.compareAtPrice > prod.price;
                  const discountPercent = hasDiscount
                    ? Math.round(((prod.compareAtPrice! - prod.price) / prod.compareAtPrice!) * 100)
                    : 0;

                  const sellerName = prod.seller?.businessName || prod.seller?.name || 'Verified Merchant';

                  return (
                    <TouchableOpacity key={prod._id} style={styles.productSlideCard} activeOpacity={0.88}>
                      {/* Product Image & Badges */}
                      <View style={styles.productImgContainer}>
                        {prodImgUrl ? (
                          <Image source={{ uri: prodImgUrl }} style={styles.productImg} resizeMode="cover" />
                        ) : (
                          <View style={styles.productImgPlaceholder}>
                            <Package size={26} color="#94a3b8" />
                          </View>
                        )}

                        {/* Condition Badge (Top Left) */}
                        <View
                          style={[
                            styles.productBadgeCondition,
                            condition === 'old'
                              ? styles.badgeOld
                              : condition === 'refurbished'
                                ? styles.badgeRefurb
                                : styles.badgeNew,
                          ]}
                        >
                          <Text style={styles.productBadgeConditionText}>{conditionLabel}</Text>
                        </View>

                        {/* Discount Badge (Top Right) */}
                        {hasDiscount && (
                          <View style={styles.productBadgeDiscount}>
                            <Text style={styles.productBadgeDiscountText}>{discountPercent}% OFF</Text>
                          </View>
                        )}
                      </View>

                      {/* Product Body Information */}
                      <View style={styles.productInfo}>
                        {/* Subcategory / Category Pill */}
                        <Text style={styles.productCategoryLabel} numberOfLines={1}>
                          {prod.subcategory || prod.category?.name || 'Hardware'}
                        </Text>

                        {/* Title */}
                        <Text style={styles.productTitle} numberOfLines={2}>
                          {prod.name}
                        </Text>

                        {/* Added by / Seller */}
                        <View style={styles.sellerRow}>
                          <Store size={11} color="#64748b" />
                          <Text style={styles.sellerNameText} numberOfLines={1}>
                            By {sellerName}
                          </Text>
                        </View>

                        {/* Pricing Row */}
                        <View style={styles.productPriceRow}>
                          <Text style={styles.productPrice}>${Number(prod.price).toFixed(2)}</Text>
                          {hasDiscount && (
                            <Text style={styles.productComparePrice}>
                              ${Number(prod.compareAtPrice).toFixed(2)}
                            </Text>
                          )}
                        </View>

                        {/* Stock Status */}
                        <View style={styles.inStockRow}>
                          <CheckCircle2 size={11} color={prod.stock > 0 ? '#059669' : '#dc2626'} />
                          <Text
                            style={[
                              styles.inStockText,
                              prod.stock === 0 && { color: '#dc2626' },
                            ]}
                          >
                            {prod.stock > 0
                              ? prod.stock <= 5
                                ? `Only ${prod.stock} left`
                                : `In Stock (${prod.stock})`
                              : 'Out of Stock'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </>
        )}

        {/* Nexora Trust & Guarantee Box */}
        <View style={styles.trustBanner}>
          <ShieldCheck size={28} color="#084e8a" style={{ marginBottom: 8 }} />
          <Text style={styles.trustTitle}>The Nexora Standard</Text>
          <Text style={styles.trustBody}>
            Every trade professional on Nexora is state-licensed, liability-insured, and identity-verified.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    backgroundColor: '#0b192c',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    zIndex: 100,
    elevation: 10,
  },
  headerTopNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingCol: {
    marginBottom: 14,
  },
  welcomeSubtitle: {
    fontSize: 11,
    color: '#93c5fd',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  customerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    height: 46,
    position: 'relative',
    zIndex: 101,
    ...Shadows.sm,
  },
  quickSearchPopup: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    zIndex: 1000,
    ...Shadows.floating,
    elevation: 20,
  },
  quickSearchLoading: {
    padding: 16,
  },
  quickSearchContent: {
    paddingVertical: 2,
  },
  quickResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 10,
  },
  quickResultIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickResultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  quickResultSubtitle: {
    fontSize: 11,
    color: NexoraColors.textSecondary,
    marginTop: 1,
  },
  viewAllSearchesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  viewAllSearchesText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  noQuickMatchBox: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noQuickMatchText: {
    fontSize: 12.5,
    color: NexoraColors.textSecondary,
    textAlign: 'center',
  },
  searchAllCatalogText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: NexoraColors.textPrimary,
    fontWeight: '500',
  },
  filterIconButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  heroBanner: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#e90402',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    lineHeight: 18,
  },
  emergencyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: Radius.lg,
    padding: 12,
    marginBottom: 20,
    ...Shadows.sm,
  },
  emergencyLeftBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e90402',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991b1b',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#e90402',
  },
  emergencySubtitle: {
    fontSize: 11,
    color: '#7f1d1d',
    marginTop: 2,
  },
  emergencyButton: {
    backgroundColor: '#e90402',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  headerControlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  arrowButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  verifiedCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  verifiedCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
  },
  categoryScroll: {
    gap: 12,
    paddingBottom: 4,
    marginBottom: 20,
  },
  categoryCard: {
    alignItems: 'center',
    width: 76,
    paddingVertical: 4,
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Shadows.sm,
  },
  categoryIconCircleActive: {
    transform: [{ scale: 1.06 }],
    shadowOpacity: 0.3,
    elevation: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: NexoraColors.primary,
    fontWeight: '800',
  },
  activeIndicatorBar: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: NexoraColors.primary,
    marginTop: 4,
  },
  indicatorPlaceholder: {
    width: 20,
    height: 3,
    marginTop: 4,
  },
  emptyServicesBox: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: NexoraColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  servicesSliderContent: {
    gap: SERVICE_CARD_GAP,
    paddingRight: 20,
    paddingBottom: 6,
  },
  serviceSlideCard: {
    width: SERVICE_CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    ...Shadows.sm,
  },
  serviceThumbnail: {
    width: '100%',
    height: 145,
    backgroundColor: '#f1f5f9',
  },
  serviceThumbnailPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceBody: {
    padding: 14,
  },
  serviceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  serviceCategoryPill: {
    backgroundColor: '#eef5fc',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: Radius.full,
  },
  serviceCategoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: NexoraColors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  serviceTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    lineHeight: 21,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12.5,
    color: NexoraColors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  providerAvatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInitial: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  providerNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  reviewsCountText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  bookButton: {
    backgroundColor: NexoraColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  providersSliderContent: {
    gap: PROVIDER_CARD_GAP,
    paddingRight: 20,
    paddingBottom: 6,
  },
  providerCard: {
    width: PROVIDER_CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  providerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  providerAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  providerImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  providerAvatarInitials: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  proRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  proRatingPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#b45309',
  },
  proNameText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  proBusinessText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
    marginBottom: 8,
  },
  proTradeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef5fc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginBottom: 10,
  },
  proTradeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  proStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  proStatsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  proLocationText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  proHireBtn: {
    backgroundColor: NexoraColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: Radius.sm,
  },
  proHireBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  productsSliderContent: {
    gap: PRODUCT_CARD_GAP,
    paddingRight: 20,
    paddingBottom: 6,
  },
  productSlideCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  productImgContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: '#f1f5f9',
  },
  productImg: {
    width: '100%',
    height: 120,
  },
  productImgPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productBadgeCondition: {
    position: 'absolute',
    top: 7,
    left: 7,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    zIndex: 2,
  },
  badgeNew: {
    backgroundColor: '#059669',
  },
  badgeOld: {
    backgroundColor: '#475569',
  },
  badgeRefurb: {
    backgroundColor: '#0284c7',
  },
  productBadgeConditionText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  productBadgeDiscount: {
    position: 'absolute',
    top: 7,
    right: 7,
    backgroundColor: '#e90402',
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 4,
    zIndex: 2,
  },
  productBadgeDiscountText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  productInfo: {
    padding: 10,
  },
  productCategoryLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#084e8a',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    lineHeight: 17,
    marginBottom: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  sellerNameText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
    flex: 1,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14.5,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  productComparePrice: {
    fontSize: 11,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  inStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  trustBanner: {
    backgroundColor: '#eef5fc',
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#bdd8f2',
  },
  trustTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: NexoraColors.primary,
    marginBottom: 4,
  },
  trustBody: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
