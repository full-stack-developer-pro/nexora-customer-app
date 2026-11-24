import { apiClient } from './api';

export type ImageItem = string | { url: string; isPrimary?: boolean; publicId?: string };

export interface ServiceCategory {
  _id: string;
  name: string;
  slug: string;
  iconName?: string;
  iconColor?: string;
  subcategories?: { name: string; slug: string }[];
}

export interface ServicePackage {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  features: string[];
}

export interface ServiceOffering {
  _id: string;
  title: string;
  description: string;
  price: number;
  pricingType: 'hourly' | 'fixed' | 'custom_quote';
  duration?: number;
  durationEstimate?: string;
  images: ImageItem[];
  category?: {
    _id?: string;
    name: string;
    slug: string;
    iconName?: string;
    iconColor?: string;
  };
  subcategory?: string;
  provider?: {
    _id?: string;
    name?: string;
    businessName?: string;
    partnerType?: string;
    bio?: string;
    rating?: number;
    reviewCount?: number;
    profileImage?: string;
    city?: string;
    state?: string;
    isVerified?: boolean;
    phone?: string;
    email?: string;
  };
  serviceLocation?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    serviceRadiusMiles?: number;
  };
  packages?: ServicePackage[];
  distanceMiles?: number | null;
  distanceLabel?: string;
  etaMinutes?: string | null;
  etaLabel?: string;
  isCovered?: boolean;
}

export interface FeaturedProvider {
  _id: string;
  userId?: string;
  name: string;
  businessName: string;
  profileImage?: string;
  trade: string;
  tradeSlug?: string;
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  city: string;
  state: string;
  verified: boolean;
  hourlyRate?: number;
  distanceMiles?: number | null;
  distanceLabel?: string;
  etaMinutes?: string | null;
  etaLabel?: string;
}

export interface ProviderPublicProfile {
  _id: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  profileImage?: string;
  businessName: string;
  partnerType?: string;
  bio?: string;
  website?: string;
  trade?: string;
  tradeSlug?: string;
  specialties?: string[];
  experienceYears?: number;
  licenseNumber?: string;
  insurancePolicyNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  serviceArea?: {
    radiusMiles?: number;
    cities?: string[];
  };
  city?: string;
  state?: string;
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  verified: boolean;
  approvalStatus?: string;
  hourlyRate?: number;
  distanceMiles?: number | null;
  distanceLabel?: string;
  etaMinutes?: string | null;
  etaLabel?: string;
}

export interface MarketplaceProduct {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  salePrice?: number;
  condition?: 'new' | 'old' | 'refurbished' | string;
  images: ImageItem[];
  stock: number;
  lowStockThreshold?: number;
  subcategory?: string;
  category?: {
    _id?: string;
    name: string;
    slug?: string;
    description?: string;
    iconName?: string;
  };
  seller?: {
    _id?: string;
    businessName?: string;
    name?: string;
    city?: string;
    rating?: number;
    reviewsCount?: number;
  };
  fulfillment?: {
    pickup?: boolean;
    localDelivery?: boolean;
    shipping?: boolean;
    deliveryFee?: number;
  };
  rating?: number;
  reviewsCount?: number;
}

const DEFAULT_CATEGORIES: ServiceCategory[] = [
  { _id: 'cat_1', name: 'Plumbing & Water Systems', slug: 'plumbing-water-systems', iconName: 'Droplet', iconColor: '#084e8a' },
  { _id: 'cat_2', name: 'Electrical & Wiring', slug: 'electrical-wiring', iconName: 'Zap', iconColor: '#f59e0b' },
  { _id: 'cat_3', name: 'HVAC & Climate Control', slug: 'hvac-climate-control', iconName: 'Wind', iconColor: '#06b6d4' },
  { _id: 'cat_4', name: 'Carpentry & Woodwork', slug: 'carpentry-woodwork', iconName: 'Hammer', iconColor: '#8b5cf6' },
  { _id: 'cat_5', name: 'Painting & Wall Finishes', slug: 'painting-wall-finishes', iconName: 'Paintbrush', iconColor: '#10b981' },
  { _id: 'cat_6', name: 'Roofing & Gutter Services', slug: 'roofing-gutters', iconName: 'Shield', iconColor: '#475569' },
  { _id: 'cat_7', name: 'Contractors & Remodeling', slug: 'contractors-remodeling', iconName: 'Home', iconColor: '#0f766e' },
];

export interface ProductCategoryItem {
  _id: string;
  name: string;
  slug: string;
  iconName?: string;
  iconColor?: string;
  subcategories?: { name: string; slug: string }[];
}

const DEFAULT_PRODUCT_CATEGORIES: ProductCategoryItem[] = [
  { _id: 'pcat_1', name: 'Plumbing Fixtures & Supplies', slug: 'plumbing-fixtures-supplies', iconName: 'Droplet', iconColor: '#084e8a' },
  { _id: 'pcat_2', name: 'Electrical Supplies & Wiring', slug: 'electrical-supplies-wiring', iconName: 'Zap', iconColor: '#eab308' },
  { _id: 'pcat_3', name: 'Power Tools & Equipment', slug: 'power-tools-equipment', iconName: 'Hammer', iconColor: '#b45309' },
  { _id: 'pcat_4', name: 'HVAC Parts & Air Filtration', slug: 'hvac-parts-filtration', iconName: 'Wind', iconColor: '#0284c7' },
  { _id: 'pcat_5', name: 'Safety Gear & Workwear', slug: 'safety-gear-workwear', iconName: 'Shield', iconColor: '#0f766e' },
];

const DEFAULT_SERVICES: ServiceOffering[] = [
  {
    _id: 'serv_1',
    title: 'Emergency Pipe Leak & Drain Clearing',
    description: 'Fast response residential leak detection, clogged mainline augering, and fixture repairs.',
    price: 95,
    pricingType: 'hourly',
    images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80'],
    category: {
      name: 'Plumbing & Water Systems',
      slug: 'plumbing-water-systems',
    },
    provider: {
      name: 'Marcus Vance',
      businessName: 'Austin Master Plumbing LLC',
      rating: 4.9,
      reviewCount: 38,
      isVerified: true,
      city: 'Austin',
      state: 'TX',
    },
  },
  {
    _id: 'serv_2',
    title: 'Circuit Breaker Upgrade & EV Charger Setup',
    description: 'Level 2 EV charger dedicated circuit installation, electrical safety inspection, and surge protection.',
    price: 180,
    pricingType: 'fixed',
    images: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80'],
    category: {
      name: 'Electrical & Wiring',
      slug: 'electrical-wiring',
    },
    provider: {
      name: 'Elena Rostova',
      businessName: 'Spark Electric Pro',
      rating: 5.0,
      reviewCount: 42,
      isVerified: true,
      city: 'Austin',
      state: 'TX',
    },
  },
  {
    _id: 'serv_3',
    title: 'Seasonal AC Maintenance & Freon Recharge',
    description: 'Complete HVAC condenser coil cleansing, duct inspection, filter swap, and refrigerant diagnostics.',
    price: 85,
    pricingType: 'hourly',
    images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'],
    category: {
      name: 'HVAC & Climate Control',
      slug: 'hvac-climate-control',
    },
    provider: {
      name: 'Derrick Hall',
      businessName: 'Texas Cool Climate Techs',
      rating: 4.8,
      reviewCount: 29,
      isVerified: true,
      city: 'Austin',
      state: 'TX',
    },
  },
];

const DEFAULT_PROVIDERS: FeaturedProvider[] = [
  {
    _id: 'prov_1',
    name: 'Marcus Vance',
    businessName: 'Vance Precision Plumbing LLC',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    trade: 'Master Plumber',
    tradeSlug: 'plumbing-water-systems',
    rating: 4.95,
    reviewsCount: 48,
    completedJobs: 164,
    city: 'Austin',
    state: 'TX',
    verified: true,
    hourlyRate: 95,
  },
  {
    _id: 'prov_2',
    name: 'Elena Rostova',
    businessName: 'Spark Electric Pros LLC',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    trade: 'Licensed Electrician',
    tradeSlug: 'electrical-wiring',
    rating: 5.0,
    reviewsCount: 62,
    completedJobs: 210,
    city: 'Austin',
    state: 'TX',
    verified: true,
    hourlyRate: 110,
  },
  {
    _id: 'prov_3',
    name: 'Derrick Hall',
    businessName: 'Texas Cool Climate Techs',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    trade: 'HVAC Specialist',
    tradeSlug: 'hvac-climate-control',
    rating: 4.9,
    reviewsCount: 39,
    completedJobs: 142,
    city: 'Round Rock',
    state: 'TX',
    verified: true,
    hourlyRate: 85,
  },
  {
    _id: 'prov_4',
    name: 'Carlos Mendez',
    businessName: 'Heritage Finish Carpentry',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    trade: 'Custom Woodworker',
    tradeSlug: 'carpentry-woodwork',
    rating: 4.88,
    reviewsCount: 31,
    completedJobs: 98,
    city: 'Austin',
    state: 'TX',
    verified: true,
    hourlyRate: 90,
  },
];

const DEFAULT_PRODUCTS: MarketplaceProduct[] = [
  {
    _id: 'prod_1',
    name: 'Heavy-Duty 20V Max Cordless Brushless Hammer Drill Kit',
    slug: 'cordless-brushless-hammer-drill-kit',
    description:
      'Professional high-torque brushless hammer drill with 2-speed transmission, 20V lithium battery, rapid charger, and contractor storage bag. Built for concrete, masonry, and heavy timber fastening with maximum endurance.',
    price: 149.99,
    compareAtPrice: 199.99,
    condition: 'new',
    stock: 18,
    sku: 'NX-DRL-20V',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    ],
    category: {
      name: 'Power Tools & Equipment',
      slug: 'power-tools-equipment',
      iconName: 'Hammer',
    },
    seller: {
      _id: 'seller_1',
      businessName: 'Austin Pro Hardware Supply Co.',
      name: 'David Keller',
      city: 'Austin, TX',
      rating: 4.95,
      reviewsCount: 84,
    },
    fulfillment: {
      pickup: true,
      localDelivery: true,
      shipping: true,
      deliveryFee: 0,
    },
    rating: 4.9,
    reviewsCount: 38,
  },
  {
    _id: 'prod_2',
    name: 'Industrial Commercial High-Efficiency HVAC Merv-13 Air Filters (Pack of 6)',
    slug: 'commercial-hvac-merv13-filters',
    description:
      'Hospital-grade electrostatically charged pleats trapping up to 98% of airborne dust, allergens, and micro-contaminants. Extended 90-day filter lifespan with moisture-resistant double-wall frame.',
    price: 64.5,
    compareAtPrice: 82.0,
    condition: 'new',
    stock: 42,
    sku: 'NX-FLT-M13',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    ],
    category: {
      name: 'HVAC Parts & Air Filtration',
      slug: 'hvac-parts-filtration',
      iconName: 'Wind',
    },
    seller: {
      _id: 'seller_2',
      businessName: 'Apex Trade Distributors',
      name: 'Sarah Lin',
      city: 'Austin, TX',
      rating: 4.88,
      reviewsCount: 52,
    },
    fulfillment: {
      pickup: true,
      localDelivery: true,
      shipping: true,
      deliveryFee: 5.99,
    },
    rating: 4.8,
    reviewsCount: 26,
  },
  {
    _id: 'prod_3',
    name: 'Precision Dual-Jaw Plumbing Pipe Wrench Set (10" & 14")',
    slug: 'precision-dual-jaw-pipe-wrench-set',
    description:
      'Forged ductile iron housing with induction-hardened full floating hook jaws. Self-cleaning threads with replaceable spring hook and heel jaws for tight plumbing pipe maintenance.',
    price: 48.0,
    compareAtPrice: 59.99,
    condition: 'new',
    stock: 25,
    sku: 'NX-WRN-14J',
    images: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    ],
    category: {
      name: 'Plumbing & Water Systems',
      slug: 'plumbing-water-systems',
      iconName: 'Droplet',
    },
    seller: {
      _id: 'seller_1',
      businessName: 'Austin Pro Hardware Supply Co.',
      name: 'David Keller',
      city: 'Austin, TX',
      rating: 4.95,
      reviewsCount: 84,
    },
    fulfillment: {
      pickup: true,
      localDelivery: true,
      shipping: true,
      deliveryFee: 0,
    },
    rating: 4.9,
    reviewsCount: 19,
  },
];

export const marketplaceService = {
  /**
   * Fetch active service categories for customer discovery
   */
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      let res: any;
      try {
        res = await apiClient.get('/service-categories', {
          params: { status: 'active', limit: 20 },
        });
      } catch {
        res = await apiClient.get('/admin/service-categories', {
          params: { status: 'active', limit: 20 },
        });
      }
      const data = res?.data || res?.categories;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  /**
   * Fetch active product categories for hardware & supplies
   */
  async getProductCategories(): Promise<ProductCategoryItem[]> {
    try {
      const res: any = await apiClient.get('/product-categories', {
        params: { status: 'active', limit: 30 },
      });
      const data = res?.data || res?.categories;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return DEFAULT_PRODUCT_CATEGORIES;
    } catch {
      return DEFAULT_PRODUCT_CATEGORIES;
    }
  },

  /**
   * Fetch services (featured or filtered with search / category / pricingType / sortBy / proximity)
   */
  async getFeaturedServices(
    limitOrParams:
      | number
      | {
          search?: string;
          category?: string;
          pricingType?: string;
          sortBy?: string;
          lat?: number;
          lng?: number;
          city?: string;
          radius?: number;
          limit?: number;
        } = 6
  ): Promise<ServiceOffering[]> {
    try {
      const params = typeof limitOrParams === 'number' ? { limit: limitOrParams } : limitOrParams;
      const res: any = await apiClient.get('/services', {
        params,
      });
      const data = res?.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      // If filtering or searching or proximity querying, return backend array (even if empty) rather than synthetic defaults
      if (
        typeof limitOrParams === 'object' &&
        (limitOrParams.search ||
          limitOrParams.category ||
          limitOrParams.pricingType ||
          limitOrParams.sortBy ||
          limitOrParams.lat ||
          limitOrParams.city)
      ) {
        return Array.isArray(data) ? data : [];
      }
      return DEFAULT_SERVICES;
    } catch {
      if (
        typeof limitOrParams === 'object' &&
        (limitOrParams.search || limitOrParams.category || limitOrParams.lat || limitOrParams.city)
      ) {
        return [];
      }
      return DEFAULT_SERVICES;
    }
  },

  /**
   * Fetch physical products available in customer marketplace (with search / category / inStock / sortBy)
   */
  async getProducts(
    limitOrParams:
      | number
      | {
          search?: string;
          category?: string;
          inStock?: boolean;
          condition?: string;
          sortBy?: string;
          limit?: number;
        } = 6
  ): Promise<MarketplaceProduct[]> {
    try {
      const params = typeof limitOrParams === 'number' ? { limit: limitOrParams } : limitOrParams;
      const res: any = await apiClient.get('/products', {
        params,
      });
      const data = res?.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      if (typeof limitOrParams === 'object' && (limitOrParams.search || limitOrParams.category)) {
        return Array.isArray(data) ? data : [];
      }
      return DEFAULT_PRODUCTS;
    } catch {
      if (typeof limitOrParams === 'object' && (limitOrParams.search || limitOrParams.category)) {
        return [];
      }
      return DEFAULT_PRODUCTS;
    }
  },

  /**
   * Fetch top-rated local providers spotlight (with proximity sorting)
   */
  async getFeaturedProviders(
    limitOrParams:
      | number
      | {
          lat?: number;
          lng?: number;
          city?: string;
          radius?: number;
          limit?: number;
        } = 6
  ): Promise<FeaturedProvider[]> {
    try {
      const params = typeof limitOrParams === 'number' ? { limit: limitOrParams } : limitOrParams;
      const res: any = await apiClient.get('/providers/featured', {
        params,
      });
      const data = res?.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      if (typeof limitOrParams === 'object' && (limitOrParams.lat || limitOrParams.city)) {
        return Array.isArray(data) ? data : [];
      }
      return DEFAULT_PROVIDERS;
    } catch {
      if (typeof limitOrParams === 'object' && (limitOrParams.lat || limitOrParams.city)) {
        return [];
      }
      return DEFAULT_PROVIDERS;
    }
  },

  /**
   * Fetch single service offering details by ID
   */
  async getServiceById(id: string): Promise<ServiceOffering | null> {
    try {
      const res: any = await apiClient.get(`/services/${id}`);
      const data = res?.data;
      if (data && data._id) {
        return data;
      }
      // Fallback search in default services for mock/offline resilience
      const fallback = DEFAULT_SERVICES.find((s) => s._id === id);
      return fallback || null;
    } catch {
      const fallback = DEFAULT_SERVICES.find((s) => s._id === id);
      return fallback || null;
    }
  },

  /**
   * Fetch single physical product details by ID
   */
  async getProductById(id: string): Promise<MarketplaceProduct | null> {
    try {
      const res: any = await apiClient.get(`/products/${id}`);
      const data = res?.data;
      if (data && data._id) {
        return data;
      }
      // Fallback search in default products for mock/offline resilience
      const fallback = DEFAULT_PRODUCTS.find((p) => p._id === id);
      return fallback || null;
    } catch {
      const fallback = DEFAULT_PRODUCTS.find((p) => p._id === id);
      return fallback || null;
    }
  },

  /**
   * Fetch single provider public profile details by ID
   */
  async getProviderById(id: string): Promise<ProviderPublicProfile | null> {
    try {
      const res: any = await apiClient.get(`/providers/${id}`);
      const data = res?.data;
      if (data && (data._id || data.userId)) {
        return {
          _id: data._id || id,
          userId: data.userId || (typeof data.userId === 'object' ? data.userId?._id : ''),
          name: data.name || data.userId?.name || 'Verified Specialist',
          email: data.email || data.userId?.email || '',
          phone: data.phone || data.userId?.phone || '',
          avatar: data.avatar || data.userId?.avatar || '',
          profileImage: data.avatar || data.userId?.avatar || '',
          businessName: data.businessName || data.name || 'Nexora Verified Specialist',
          partnerType: data.partnerType || 'service_provider',
          bio: data.bio || '',
          website: data.website || '',
          trade: data.primaryCategory?.name || data.primaryCategory || data.trade || 'Licensed Specialist',
          tradeSlug: data.primaryCategory?.slug || data.tradeSlug || '',
          specialties: data.specialties || [],
          experienceYears: data.experienceYears !== undefined ? data.experienceYears : 6,
          licenseNumber: data.licenseNumber || '',
          insurancePolicyNumber: data.insurancePolicyNumber || '',
          address: data.address || {},
          serviceArea: data.serviceArea || {},
          city: data.address?.city || 'Austin',
          state: data.address?.state || 'TX',
          rating: Number(data.rating) || 4.9,
          reviewsCount: Number(data.reviewsCount) || 0,
          completedJobs: Number(data.completedJobs) || 0,
          verified: data.approvalStatus === 'approved' || data.verified === true,
          approvalStatus: data.approvalStatus || 'approved',
          hourlyRate: data.hourlyRate || 85,
        };
      }
      // Fallback search in default providers for mock/offline resilience
      const fallback = DEFAULT_PROVIDERS.find((p) => p._id === id || p.userId === id);
      if (fallback) {
        return {
          ...fallback,
          bio:
            (fallback as any).bio ||
            `${fallback.businessName} provides premium, verified trade craftsmanship across ${fallback.city}, ${fallback.state}. Fully licensed, insured, and background checked for homeowner safety.`,
          specialties: (fallback as any).specialties || [fallback.trade, 'Emergency Diagnostic', 'System Repairs', 'Maintenance'],
          experienceYears: (fallback as any).experienceYears || 8,
          address: { city: fallback.city, state: fallback.state },
          serviceArea: { radiusMiles: 25, cities: [fallback.city, 'Round Rock', 'Cedar Park'] },
        };
      }
      return null;
    } catch {
      const fallback = DEFAULT_PROVIDERS.find((p) => p._id === id || p.userId === id);
      if (fallback) {
        return {
          ...fallback,
          bio:
            (fallback as any).bio ||
            `${fallback.businessName} provides premium, verified trade craftsmanship across ${fallback.city}, ${fallback.state}. Fully licensed, insured, and background checked for homeowner safety.`,
          specialties: (fallback as any).specialties || [fallback.trade, 'Emergency Diagnostic', 'System Repairs', 'Maintenance'],
          experienceYears: (fallback as any).experienceYears || 8,
          address: { city: fallback.city, state: fallback.state },
          serviceArea: { radiusMiles: 25, cities: [fallback.city, 'Round Rock', 'Cedar Park'] },
        };
      }
      return null;
    }
  },

  /**
   * Fetch services published by a specific provider
   */
  async getServicesByProvider(providerId: string): Promise<ServiceOffering[]> {
    try {
      const res: any = await apiClient.get('/services', {
        params: { provider: providerId, limit: 10 },
      });
      const data = res?.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      // Fallback matching in default services
      const filtered = DEFAULT_SERVICES.filter(
        (s) => s.provider?._id === providerId || (s.provider as any)?.userId === providerId
      );
      return filtered.length > 0 ? filtered : DEFAULT_SERVICES.slice(0, 2);
    } catch {
      const filtered = DEFAULT_SERVICES.filter(
        (s) => s.provider?._id === providerId || (s.provider as any)?.userId === providerId
      );
      return filtered.length > 0 ? filtered : DEFAULT_SERVICES.slice(0, 2);
    }
  },
};
