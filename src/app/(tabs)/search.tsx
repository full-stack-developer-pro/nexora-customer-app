import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Wrench,
  ShieldCheck,
  ChevronRight,
  Store,
  Tag,
  Package,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Droplets,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Shield,
  Home,
  Check,
  TrendingDown,
  TrendingUp,
  Clock,
  Layers,
  ArrowRight,
  MapPin,
} from 'lucide-react-native';
import { useLocation } from '@/context/LocationContext';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { LocationHeaderPill } from '@/components/common/LocationHeaderPill';
import {
  CustomerServiceCardSkeleton,
  CustomerProductCardSkeleton,
} from '@/components/common/NexoraShimmer';
import {
  marketplaceService,
  ServiceCategory,
  ServiceOffering,
  MarketplaceProduct,
  ProductCategoryItem,
} from '@/services/marketplaceService';

const { width } = Dimensions.get('window');

type TabType = 'services' | 'products';
type SortOption = 'recommended' | 'rating' | 'price_asc' | 'price_desc';

const SERVICE_TRADE_FALLBACK = [
  { _id: 'cat_1', name: 'Plumbing & Water Systems', slug: 'plumbing-water-systems' },
  { _id: 'cat_2', name: 'Electrical & Wiring', slug: 'electrical-wiring' },
  { _id: 'cat_3', name: 'HVAC & Climate Control', slug: 'hvac-climate-control' },
  { _id: 'cat_4', name: 'Carpentry & Woodwork', slug: 'carpentry-woodwork' },
  { _id: 'cat_5', name: 'Painting & Wall Finishes', slug: 'painting-wall-finishes' },
  { _id: 'cat_6', name: 'Roofing & Gutter Services', slug: 'roofing-gutters' },
  { _id: 'cat_7', name: 'Contractors & Remodeling', slug: 'contractors-remodeling' },
];

const PRODUCT_CATEGORY_FALLBACK: ProductCategoryItem[] = [
  { _id: 'pcat_1', name: 'Plumbing Fixtures & Supplies', slug: 'plumbing-fixtures-supplies' },
  { _id: 'pcat_2', name: 'Electrical Supplies & Wiring', slug: 'electrical-supplies-wiring' },
  { _id: 'pcat_3', name: 'Power Tools & Equipment', slug: 'power-tools-equipment' },
  { _id: 'pcat_4', name: 'HVAC Parts & Air Filtration', slug: 'hvac-parts-filtration' },
  { _id: 'pcat_5', name: 'Safety Gear & Workwear', slug: 'safety-gear-workwear' },
];

const getCategoryIcon = (slug = '') => {
  const s = slug.toLowerCase();
  if (s.includes('plumb') || s.includes('water')) return Droplets;
  if (s.includes('electr') || s.includes('wire')) return Zap;
  if (s.includes('hvac') || s.includes('climate') || s.includes('air')) return Wind;
  if (s.includes('carpent') || s.includes('wood')) return Hammer;
  if (s.includes('paint') || s.includes('finish')) return Paintbrush;
  if (s.includes('roof') || s.includes('gutter')) return Shield;
  if (s.includes('remodel') || s.includes('contractor') || s.includes('home')) return Home;
  if (s.includes('tool') || s.includes('drill') || s.includes('saw')) return Hammer;
  if (s.includes('safe') || s.includes('gear')) return Shield;
  return Sparkles;
};

const getImageUrl = (img: any): string | null => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.url) return img.url;
  return null;
};

const getTradeDisplayName = (slug = '', name = '') => {
  const s = (slug || name || '').toLowerCase();
  if (s.includes('plumb') || s.includes('water')) return 'Plumbing';
  if (s.includes('electr') || s.includes('wire')) return 'Electrical';
  if (s.includes('hvac') || s.includes('climate') || s.includes('air')) return 'HVAC';
  if (s.includes('carpent') || s.includes('wood')) return 'Carpentry';
  if (s.includes('paint') || s.includes('finish')) return 'Painting';
  if (s.includes('roof') || s.includes('gutter')) return 'Roofing';
  if (s.includes('remodel') || s.includes('contractor')) return 'Remodeling';
  return name || 'General Trade';
};

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; category?: string; openFilter?: string; tab?: string }>();
  const { activeLocation } = useLocation();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Synchronize incoming navigation parameters (from Home screen)
  useEffect(() => {
    if (params.q !== undefined && params.q !== searchQuery) {
      setSearchQuery(params.q);
    }
    if (params.category && params.category !== selectedTrade) {
      setSelectedTrade(params.category);
    }
    if (params.tab === 'products' || params.tab === 'supplies') {
      setActiveTab('products');
    } else if (params.tab === 'services') {
      setActiveTab('services');
    }
    if (params.openFilter === 'true') {
      setFilterModalVisible(true);
    }
  }, [params.q, params.category, params.tab, params.openFilter]);

  // Advanced Filters
  const [pricingTypeFilter, setPricingTypeFilter] = useState<'all' | 'hourly' | 'fixed'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  // Data & Loading States
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuerying, setIsQuerying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic Categories from Backend
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategoryItem[]>([]);

  // Fetch Categories Dynamically from Backend on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const [servCats, prodCats] = await Promise.all([
          marketplaceService.getCategories(),
          marketplaceService.getProductCategories(),
        ]);
        if (isMounted) {
          if (servCats?.length) setServiceCategories(servCats);
          if (prodCats?.length) setProductCategories(prodCats);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Active Category Filters based on Active Tab (Services vs Supplies) - 100% Dynamic from Backend
  const activeCategoryFilters = useMemo(() => {
    if (activeTab === 'services') {
      const list = serviceCategories.length > 0 ? serviceCategories : SERVICE_TRADE_FALLBACK;
      return [
        { id: 'all', label: 'All Trades', slug: 'all', icon: Sparkles },
        ...list.map((c) => ({
          id: c.slug || c._id,
          label: getTradeDisplayName(c.slug, c.name),
          slug: c.slug,
          icon: getCategoryIcon(c.slug),
        })),
      ];
    } else {
      const list = productCategories.length > 0 ? productCategories : PRODUCT_CATEGORY_FALLBACK;
      return [
        { id: 'all', label: 'All Supplies', slug: 'all', icon: Sparkles },
        ...list.map((c) => ({
          id: c.slug || c._id,
          label: c.name.replace(/ & Supplies| Supplies| Parts| & Equipment/g, ''),
          slug: c.slug,
          icon: getCategoryIcon(c.slug),
        })),
      ];
    }
  }, [activeTab, serviceCategories, productCategories]);

  // Human-readable active category label (e.g. "Carpentry", "Plumbing")
  const activeCategoryLabel = useMemo(() => {
    if (selectedTrade === 'all') return '';
    const item = activeCategoryFilters.find((c) => c.id === selectedTrade || c.slug === selectedTrade);
    return item?.label || '';
  }, [selectedTrade, activeCategoryFilters]);

  const handleTabSwitch = (tab: TabType) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setSelectedTrade('all'); // Reset category selection when switching catalog
    }
  };

  // Backend query execution
  const fetchFromBackend = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setIsQuerying(true);

      const activeCatObj = activeCategoryFilters.find((c) => c.id === selectedTrade || c.slug === selectedTrade);
      const categoryParam = selectedTrade !== 'all' && activeCatObj ? activeCatObj.slug : undefined;

      const sortByParam =
        sortOption === 'price_asc' || sortOption === 'price_desc' ? sortOption : undefined;

      const [fetchedServices, fetchedProducts] = await Promise.all([
        marketplaceService.getFeaturedServices({
          search: debouncedSearch.trim() || undefined,
          category: activeTab === 'services' ? categoryParam : undefined,
          pricingType: pricingTypeFilter !== 'all' ? pricingTypeFilter : undefined,
          sortBy: sortByParam,
          lat: activeLocation?.latitude,
          lng: activeLocation?.longitude,
          city: activeLocation?.city,
          limit: 30,
        }),
        marketplaceService.getProducts({
          search: debouncedSearch.trim() || undefined,
          category: activeTab === 'products' ? categoryParam : undefined,
          inStock: inStockOnly ? true : undefined,
          sortBy: sortByParam,
          limit: 30,
        }),
      ]);

      setServices(fetchedServices);
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Failed to query catalog from backend:', err);
    } finally {
      setLoading(false);
      setIsQuerying(false);
      setRefreshing(false);
    }
  }, [
    debouncedSearch,
    activeTab,
    selectedTrade,
    activeCategoryFilters,
    pricingTypeFilter,
    inStockOnly,
    sortOption,
    activeLocation?.latitude,
    activeLocation?.longitude,
    activeLocation?.city,
  ]);

  // Trigger backend query when any filter or debounced search changes
  useEffect(() => {
    fetchFromBackend();
  }, [fetchFromBackend]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [servCats, prodCats] = await Promise.all([
        marketplaceService.getCategories(),
        marketplaceService.getProductCategories(),
      ]);
      if (servCats?.length) setServiceCategories(servCats);
      if (prodCats?.length) setProductCategories(prodCats);
    } catch {}
    fetchFromBackend();
  }, [fetchFromBackend]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedTrade !== 'all') count++;
    if (sortOption !== 'recommended') count++;
    if (pricingTypeFilter !== 'all') count++;
    if (inStockOnly) count++;
    if (minRating > 0) count++;
    return count;
  }, [selectedTrade, sortOption, pricingTypeFilter, inStockOnly, minRating]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedTrade('all');
    setSortOption('recommended');
    setPricingTypeFilter('all');
    setInStockOnly(false);
    setMinRating(0);
    setSearchQuery('');
    setFilterModalVisible(false);
  };

  // Filtered & Sorted Services
  const filteredServices = useMemo(() => {
    return services
      .filter((s) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = s.title?.toLowerCase().includes(q);
          const matchesDesc = s.description?.toLowerCase().includes(q);
          const matchesCat = s.category?.name?.toLowerCase().includes(q);
          const matchesProvider = s.provider?.businessName?.toLowerCase().includes(q) || s.provider?.name?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCat && !matchesProvider) return false;
        }

        // Trade category
        if (selectedTrade !== 'all') {
          const catObj = activeCategoryFilters.find((f) => f.id === selectedTrade);
          const tradeKey = catObj ? catObj.slug.split('-')[0] : selectedTrade;
          const catSlug = (s.category?.slug || s.category?.name || '').toLowerCase();
          if (!catSlug.includes(tradeKey)) return false;
        }

        // Pricing Type
        if (pricingTypeFilter !== 'all' && s.pricingType !== pricingTypeFilter) {
          return false;
        }

        // Min Rating
        if (minRating > 0) {
          const rating = (s as any).ratings?.average || s.provider?.rating || 0;
          if (rating < minRating) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price_asc') return a.price - b.price;
        if (sortOption === 'price_desc') return b.price - a.price;
        if (sortOption === 'rating') {
          const rA = (a as any).ratings?.average || a.provider?.rating || 0;
          const rB = (b as any).ratings?.average || b.provider?.rating || 0;
          return rB - rA;
        }
        return 0; // recommended
      });
  }, [services, searchQuery, selectedTrade, pricingTypeFilter, minRating, sortOption]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name?.toLowerCase().includes(q);
          const matchesDesc = p.description?.toLowerCase().includes(q);
          const matchesSub = p.subcategory?.toLowerCase().includes(q);
          const matchesSeller = p.seller?.businessName?.toLowerCase().includes(q) || p.seller?.name?.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesSub && !matchesSeller) return false;
        }

        // Product Category
        if (selectedTrade !== 'all') {
          const catObj = activeCategoryFilters.find((f) => f.id === selectedTrade);
          const tradeKey = catObj ? catObj.slug.split('-')[0] : selectedTrade;
          const sub = (p.subcategory || '').toLowerCase();
          const cat = (p.category?.name || p.category?.slug || '').toLowerCase();
          if (!sub.includes(tradeKey) && !cat.includes(tradeKey)) return false;
        }

        // In stock only
        if (inStockOnly && (p.stock <= 0)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price_asc') return a.price - b.price;
        if (sortOption === 'price_desc') return b.price - a.price;
        return 0;
      });
  }, [products, searchQuery, selectedTrade, inStockOnly, sortOption]);

  // Render Service Item
  const renderServiceCard = ({ item }: { item: ServiceOffering }) => {
    const primaryImgUrl = getImageUrl(item.images?.[0]);
    const priceLabel =
      item.pricingType === 'hourly'
        ? `$${item.price} / hr`
        : item.pricingType === 'custom_quote'
          ? 'Custom Quote'
          : `$${item.price} Fixed`;
    const ratingVal = (item as any).ratings?.average || item.provider?.rating || 4.9;
    const reviewCountVal = (item as any).ratings?.count || item.provider?.reviewCount || 18;
    const providerName = item.provider?.businessName || item.provider?.name || 'Austin Master Pro LLC';

    return (
      <View style={styles.serviceCard}>
        <View style={styles.serviceImageRow}>
          {primaryImgUrl ? (
            <Image source={{ uri: primaryImgUrl }} style={styles.serviceThumbnail} resizeMode="cover" />
          ) : (
            <View style={styles.serviceThumbnailPlaceholder}>
              <Wrench size={24} color="#94a3b8" />
            </View>
          )}

          <View style={styles.serviceMeta}>
            <View style={styles.categoryAndPriceRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText} numberOfLines={1}>
                  {getTradeDisplayName(item.category?.slug, item.category?.name)}
                </Text>
              </View>
              <Text style={styles.priceText}>{priceLabel}</Text>
            </View>

            <Text style={styles.serviceTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <Text style={styles.serviceDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>

        {/* Footer: Provider details + CTA */}
        <View style={styles.serviceFooter}>
          <View style={styles.providerInfoRow}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerAvatarText}>{providerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.providerNameText} numberOfLines={1}>
                  {providerName}
                </Text>
                <ShieldCheck size={13} color="#059669" />
              </View>
              <View style={styles.ratingRow}>
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingNumber}>{ratingVal.toFixed(1)}</Text>
                {item.distanceLabel ? (
                  <View style={styles.distanceBadge}>
                    <MapPin size={10} color={NexoraColors.primary} />
                    <Text style={styles.distanceBadgeText}>{item.distanceLabel}</Text>
                  </View>
                ) : (
                  <Text style={styles.reviewCount}>({reviewCountVal} reviews)</Text>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.bookButton} activeOpacity={0.85}>
            <Text style={styles.bookButtonText}>Book Pro</Text>
            <ChevronRight size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render Product Item
  const renderProductCard = ({ item }: { item: MarketplaceProduct }) => {
    const primaryImgUrl = getImageUrl(item.images?.[0]);
    const sellerName = item.seller?.businessName || item.seller?.name || 'Verified Nexora Supplier';
    const condition = (item.condition || 'new').toLowerCase();
    const isBrandNew = condition === 'new';
    const conditionLabel = isBrandNew ? 'BRAND NEW' : condition === 'refurbished' ? 'REFURBISHED' : 'PRE-OWNED';
    const discount =
      item.compareAtPrice && item.compareAtPrice > item.price
        ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
        : null;

    return (
      <View style={styles.productCard}>
        <View style={styles.productImageWrap}>
          {primaryImgUrl ? (
            <Image source={{ uri: primaryImgUrl }} style={styles.productImage} resizeMode="cover" />
          ) : (
            <View style={styles.productPlaceholder}>
              <Package size={28} color="#94a3b8" />
            </View>
          )}

          {/* Condition Badge */}
          <View style={[styles.conditionBadge, isBrandNew ? styles.badgeNew : styles.badgePreOwned]}>
            <Text style={styles.conditionText}>{conditionLabel}</Text>
          </View>

          {/* Discount Pill */}
          {discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.productBody}>
          {/* Subcategory */}
          <Text style={styles.productSubcategory} numberOfLines={1}>
            {(item.subcategory || item.category?.name || 'HARDWARE & SUPPLIES').toUpperCase()}
          </Text>

          {/* Title */}
          <Text style={styles.productTitle} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Seller Storefront */}
          <View style={styles.sellerRow}>
            <Store size={12} color="#64748b" />
            <Text style={styles.sellerText} numberOfLines={1}>
              By {sellerName}
            </Text>
          </View>

          {/* Pricing & Stock */}
          <View style={styles.productBottomRow}>
            <View>
              <View style={styles.priceStack}>
                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                {item.compareAtPrice ? (
                  <Text style={styles.productComparePrice}>${item.compareAtPrice.toFixed(2)}</Text>
                ) : null}
              </View>
              <Text style={styles.stockText}>
                {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
              </Text>
            </View>

            <TouchableOpacity style={styles.orderButton} activeOpacity={0.85}>
              <Text style={styles.orderButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Top Midnight Header with Universal Search */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 24) + 8 }]}>
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.headerTitle}>Browse & Search</Text>
            <Text style={styles.headerSubtitle}>Vetted local pros & hardware supplies</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LocationHeaderPill inverted={true} compact={true} />
            {activeFilterCount > 0 && (
              <TouchableOpacity style={styles.resetHeaderBtn} onPress={resetFilters}>
                <RotateCcw size={13} color="#ffffff" />
                <Text style={styles.resetHeaderBtnText}>Reset ({activeFilterCount})</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'services'
                ? 'Search plumbing, AC, electricians...'
                : 'Search copper pipes, tools, fittings...'
            }
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.filterTrigger, activeFilterCount > 0 && styles.filterTriggerActive]}
              onPress={() => setFilterModalVisible(true)}
            >
              <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#ffffff' : NexoraColors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Segment Switcher (Services vs Products) */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'services' && styles.tabButtonActive]}
            onPress={() => handleTabSwitch('services')}
            activeOpacity={0.8}
          >
            <Wrench size={14} color={activeTab === 'services' ? NexoraColors.primary : '#94a3b8'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === 'services' && styles.tabButtonTextActive]}>
              Services ({filteredServices.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'products' && styles.tabButtonActive]}
            onPress={() => handleTabSwitch('products')}
            activeOpacity={0.8}
          >
            <Package size={14} color={activeTab === 'products' ? NexoraColors.primary : '#94a3b8'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === 'products' && styles.tabButtonTextActive]}>
              Supplies ({filteredProducts.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Category Filter Chips Row (Switches automatically by Tab) */}
      <View style={styles.tradeFilterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={activeCategoryFilters}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tradeFilterContent}
          renderItem={({ item }) => {
            const isSelected = selectedTrade === item.id;
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                style={[styles.tradeChip, isSelected && styles.tradeChipActive]}
                onPress={() => setSelectedTrade(isSelected && item.id !== 'all' ? 'all' : item.id)}
                activeOpacity={0.75}
              >
                <IconComponent
                  size={13}
                  color={isSelected ? '#ffffff' : '#64748b'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.tradeChipText, isSelected && styles.tradeChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Results List with Shimmer Skeleton States */}
      {loading || isQuerying ? (
        <View
          style={[
            styles.listContainer,
            { paddingBottom: Math.max(insets.bottom, 10) + 90 },
          ]}
        >
          {activeTab === 'services' ? (
            <>
              <CustomerServiceCardSkeleton />
              <CustomerServiceCardSkeleton />
              <CustomerServiceCardSkeleton />
            </>
          ) : (
            <>
              <CustomerProductCardSkeleton />
              <CustomerProductCardSkeleton />
            </>
          )}
        </View>
      ) : activeTab === 'services' ? (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item._id}
          renderItem={renderServiceCard}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: Math.max(insets.bottom, 10) + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NexoraColors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Search size={32} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No Services Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `We couldn't find any trade services matching "${searchQuery}".`
                  : activeCategoryLabel
                    ? `No published services in ${activeCategoryLabel} right now.`
                    : 'No trade services match your current filters.'}{' '}
                Try adjusting your search or resetting filters.
              </Text>
              {activeFilterCount > 0 || searchQuery ? (
                <TouchableOpacity style={styles.clearFiltersBtn} onPress={resetFilters}>
                  <Text style={styles.clearFiltersBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          renderItem={renderProductCard}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: Math.max(insets.bottom, 10) + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NexoraColors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Package size={32} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No Supplies Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `No hardware supplies found matching "${searchQuery}".`
                  : activeCategoryLabel
                    ? `No supplies currently listed under ${activeCategoryLabel}.`
                    : 'No hardware supplies match your current search criteria.'}{' '}
                Try adjusting your search or resetting filters.
              </Text>
              {activeFilterCount > 0 || searchQuery ? (
                <TouchableOpacity style={styles.clearFiltersBtn} onPress={resetFilters}>
                  <Text style={styles.clearFiltersBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
      )}

      {/* Advanced Filter Modal Sheet */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.filterSheet, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
                {/* Pull handle */}
                <View style={styles.sheetHandle} />

                {/* Sheet Header */}
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetHeaderLeft}>
                    <View style={styles.filterTitleIconBox}>
                      <SlidersHorizontal size={18} color={NexoraColors.primary} />
                    </View>
                    <View style={{ flex: 1, paddingRight: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.sheetTitle}>Sort & Filter</Text>
                        {activeFilterCount > 0 && (
                          <View style={styles.filterCountBadge}>
                            <Text style={styles.filterCountBadgeText}>{activeFilterCount}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.sheetSubtitle} numberOfLines={1}>
                        Refine results by pricing, rating & trades
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sheetHeaderActions}>
                    {activeFilterCount > 0 && (
                      <TouchableOpacity style={styles.sheetResetBtn} onPress={resetFilters}>
                        <RotateCcw size={13} color="#dc2626" />
                        <Text style={styles.sheetResetText}>Reset</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.sheetCloseBtn}
                      onPress={() => setFilterModalVisible(false)}
                    >
                      <X size={18} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Scrollable Filter Sections */}
                <ScrollView
                  style={styles.filterScrollBody}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 16 }}
                >
                  {/* Section 1: 2x2 Sort Grid */}
                  <View style={styles.filterSection}>
                    <View style={styles.sectionTitleRow}>
                      <Text style={styles.filterSectionTitle}>SORT CATALOG BY</Text>
                      <Text style={styles.sectionSubtitleHint}>Tap to prioritize</Text>
                    </View>

                    <View style={styles.sortGrid}>
                      {[
                        {
                          id: 'recommended',
                          title: 'Recommended',
                          desc: 'Best overall match',
                          icon: Sparkles,
                          iconBg: '#eef5fc',
                          iconColor: NexoraColors.primary,
                        },
                        {
                          id: 'rating',
                          title: 'Top Rated',
                          desc: '4.8+ ★ verified pros',
                          icon: Star,
                          iconBg: '#fef3c7',
                          iconColor: '#d97706',
                        },
                        {
                          id: 'price_asc',
                          title: 'Lowest Price',
                          desc: 'Budget-first rates',
                          icon: TrendingDown,
                          iconBg: '#ecfdf5',
                          iconColor: '#059669',
                        },
                        {
                          id: 'price_desc',
                          title: 'Highest Price',
                          desc: 'Premium master pros',
                          icon: TrendingUp,
                          iconBg: '#f5f3ff',
                          iconColor: '#7c3aed',
                        },
                      ].map((item) => {
                        const isSelected = sortOption === item.id;
                        const IconComp = item.icon;
                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={[styles.sortCard, isSelected && styles.sortCardActive]}
                            onPress={() => setSortOption(item.id as SortOption)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.sortCardTop}>
                              <View style={[styles.sortIconBox, { backgroundColor: item.iconBg }]}>
                                <IconComp size={16} color={item.iconColor} />
                              </View>
                              <View
                                style={[
                                  styles.selectionRadio,
                                  isSelected && styles.selectionRadioActive,
                                ]}
                              >
                                {isSelected && <Check size={11} color="#ffffff" strokeWidth={3} />}
                              </View>
                            </View>
                            <Text
                              style={[styles.sortCardTitle, isSelected && styles.sortCardTitleActive]}
                              numberOfLines={1}
                            >
                              {item.title}
                            </Text>
                            <Text style={styles.sortCardDesc} numberOfLines={1}>
                              {item.desc}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Section 2: Pricing Structure (Services Tab Only) */}
                  {activeTab === 'services' && (
                    <View style={styles.filterSection}>
                      <View style={styles.sectionTitleRow}>
                        <Text style={styles.filterSectionTitle}>PRICING STRUCTURE</Text>
                        <Text style={styles.sectionSubtitleHint}>Billing format</Text>
                      </View>

                      <View style={styles.pricingTilesRow}>
                        {[
                          { id: 'all', title: 'All Rates', desc: 'Any pricing', icon: Layers },
                          { id: 'hourly', title: 'Hourly Rate', desc: 'Pay per hour', icon: Clock },
                          { id: 'fixed', title: 'Fixed Quote', desc: 'Guaranteed total', icon: Tag },
                        ].map((model) => {
                          const isSelected = pricingTypeFilter === model.id;
                          const IconComp = model.icon;
                          return (
                            <TouchableOpacity
                              key={model.id}
                              style={[
                                styles.pricingTile,
                                isSelected && styles.pricingTileActive,
                              ]}
                              onPress={() => setPricingTypeFilter(model.id as any)}
                              activeOpacity={0.8}
                            >
                              <IconComp
                                size={18}
                                color={isSelected ? NexoraColors.primary : '#64748b'}
                              />
                              <Text
                                style={[
                                  styles.pricingTileTitle,
                                  isSelected && styles.pricingTileTitleActive,
                                ]}
                              >
                                {model.title}
                              </Text>
                              <Text style={styles.pricingTileDesc}>{model.desc}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Section 3: Minimum Pro Rating (Services Tab Only) */}
                  {activeTab === 'services' && (
                    <View style={styles.filterSection}>
                      <View style={styles.sectionTitleRow}>
                        <Text style={styles.filterSectionTitle}>MINIMUM PRO RATING</Text>
                        <Text style={styles.sectionSubtitleHint}>Customer satisfaction</Text>
                      </View>

                      <View style={styles.ratingPillsRow}>
                        {[
                          { rating: 0, label: 'Any' },
                          { rating: 4.0, label: '4.0+' },
                          { rating: 4.5, label: '4.5+' },
                          { rating: 4.8, label: '4.8+' },
                        ].map((tier) => {
                          const isSelected = minRating === tier.rating;
                          return (
                            <TouchableOpacity
                              key={tier.rating}
                              style={[
                                styles.ratingPill,
                                isSelected && styles.ratingPillActive,
                              ]}
                              onPress={() => setMinRating(tier.rating)}
                              activeOpacity={0.8}
                            >
                              {tier.rating > 0 && (
                                <Star
                                  size={13}
                                  color={isSelected ? '#ffffff' : '#d97706'}
                                  fill={isSelected ? '#ffffff' : '#f59e0b'}
                                  style={{ marginRight: 4 }}
                                />
                              )}
                              <Text
                                style={[
                                  styles.ratingPillText,
                                  isSelected && styles.ratingPillTextActive,
                                ]}
                                numberOfLines={1}
                              >
                                {tier.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Dynamic Verification Note */}
                      <View style={styles.ratingExplainerRow}>
                        <ShieldCheck
                          size={13}
                          color={minRating > 0 ? '#059669' : '#94a3b8'}
                        />
                        <Text style={styles.ratingExplainerText} numberOfLines={1}>
                          {minRating === 0
                            ? 'Showing pros with all customer review levels'
                            : minRating === 4.0
                              ? 'Showing verified pros rated 4.0 stars & above'
                              : minRating === 4.5
                                ? 'Showing top-performing specialists rated 4.5+'
                                : 'Showing elite master tradespeople rated 4.8+'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Section 4: Availability & Stock (Supplies Tab Only) */}
                  {activeTab === 'products' && (
                    <View style={styles.filterSection}>
                      <View style={styles.sectionTitleRow}>
                        <Text style={styles.filterSectionTitle}>AVAILABILITY & DISPATCH</Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.toggleCard,
                          inStockOnly && styles.toggleCardActive,
                        ]}
                        onPress={() => setInStockOnly(!inStockOnly)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.toggleCardLeft}>
                          <View
                            style={[
                              styles.toggleIconBox,
                              { backgroundColor: inStockOnly ? '#ecfdf5' : '#f1f5f9' },
                            ]}
                          >
                            <Package
                              size={20}
                              color={inStockOnly ? '#059669' : '#64748b'}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.toggleCardTitle}>In-Stock Hardware Only</Text>
                            <Text style={styles.toggleCardSubtitle}>
                              Ready for same-day local pickup or next-day direct delivery
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.switchTrack,
                            inStockOnly && styles.switchTrackActive,
                          ]}
                        >
                          <View
                            style={[
                              styles.switchThumb,
                              inStockOnly && styles.switchThumbActive,
                            ]}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>

                {/* Footer Action Buttons */}
                <View style={styles.sheetFooter}>
                  <TouchableOpacity
                    style={styles.sheetClearBtn}
                    onPress={resetFilters}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sheetClearBtnText}>Clear All</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sheetApplyBtn}
                    onPress={() => setFilterModalVisible(false)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.sheetApplyBtnText}>
                      Apply Filters ({activeTab === 'services' ? filteredServices.length : filteredProducts.length})
                    </Text>
                    <ArrowRight size={16} color="#ffffff" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    backgroundColor: NexoraColors.midnightHeader,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  resetHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  resetHeaderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 12,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: NexoraColors.textPrimary,
    paddingVertical: 0,
  },
  filterTrigger: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTriggerActive: {
    backgroundColor: NexoraColors.primary,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radius.md,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    ...Shadows.sm,
  },
  tabButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  tabButtonTextActive: {
    color: NexoraColors.primary,
    fontWeight: '700',
  },
  tradeFilterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: NexoraColors.border,
    paddingVertical: 10,
  },
  tradeFilterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tradeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tradeChipActive: {
    backgroundColor: NexoraColors.primary,
    borderColor: NexoraColors.primary,
  },
  tradeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tradeChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 14,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    ...Shadows.card,
  },
  serviceImageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  serviceThumbnail: {
    width: 90,
    height: 90,
    borderRadius: Radius.md,
  },
  serviceThumbnailPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: Radius.md,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceMeta: {
    flex: 1,
  },
  categoryAndPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#eef5fc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: NexoraColors.primary,
    textTransform: 'uppercase',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  serviceTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    lineHeight: 19,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    lineHeight: 16,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  providerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  providerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  providerNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  ratingNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  reviewCount: {
    fontSize: 10.5,
    color: '#94a3b8',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#eef5fc',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  distanceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.md,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NexoraColors.border,
    ...Shadows.card,
  },
  productImageWrap: {
    height: 150,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeNew: {
    backgroundColor: '#059669',
  },
  badgePreOwned: {
    backgroundColor: '#64748b',
  },
  conditionText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e90402',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
  },
  productBody: {
    padding: 14,
  },
  productSubcategory: {
    fontSize: 10,
    fontWeight: '700',
    color: NexoraColors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    marginBottom: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  sellerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceStack: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  productComparePrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  stockText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  orderButton: {
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.md,
  },
  orderButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  loadingText: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
    marginTop: 10,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  emptyText: {
    fontSize: 12.5,
    color: NexoraColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  clearFiltersBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: NexoraColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  clearFiltersBtnText: {
    color: NexoraColors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.65)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '85%',
    ...Shadows.floating,
  },
  sheetHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 10,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  filterTitleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  filterCountBadge: {
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: Radius.full,
  },
  filterCountBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 11,
    color: NexoraColors.textSecondary,
    marginTop: 1,
  },
  sheetHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 14,
  },
  sheetResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginLeft: 6,
  },
  sheetResetText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#dc2626',
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScrollBody: {
    paddingTop: 8,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  filterSectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
    letterSpacing: 0.6,
  },
  sectionSubtitleHint: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortCard: {
    width: (width - 40 - 10) / 2,
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  sortCardActive: {
    backgroundColor: '#f0f7ff',
    borderColor: NexoraColors.primary,
    borderWidth: 1.5,
  },
  sortCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sortIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  selectionRadioActive: {
    backgroundColor: NexoraColors.primary,
    borderColor: NexoraColors.primary,
  },
  sortCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 2,
  },
  sortCardTitleActive: {
    color: NexoraColors.primary,
  },
  sortCardDesc: {
    fontSize: 10.5,
    color: NexoraColors.textSecondary,
  },
  pricingTilesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pricingTile: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  pricingTileActive: {
    backgroundColor: '#f0f7ff',
    borderColor: NexoraColors.primary,
    borderWidth: 1.5,
  },
  pricingTileTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  pricingTileTitleActive: {
    color: NexoraColors.primary,
  },
  pricingTileDesc: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
  },
  ratingPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 4,
    ...Shadows.sm,
  },
  ratingPillActive: {
    backgroundColor: NexoraColors.primary,
    borderColor: NexoraColors.primary,
  },
  ratingPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  ratingPillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  ratingExplainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 4,
  },
  ratingExplainerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.sm,
  },
  toggleCardActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#a7f3d0',
  },
  toggleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  toggleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 2,
  },
  toggleCardSubtitle: {
    fontSize: 11,
    color: NexoraColors.textSecondary,
    lineHeight: 15,
  },
  switchTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: '#10b981',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    ...Shadows.sm,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  sheetClearBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sheetClearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  sheetApplyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NexoraColors.primary,
    paddingVertical: 13,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  sheetApplyBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
