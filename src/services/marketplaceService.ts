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

export interface ServiceOffering {
  _id: string;
  title: string;
  description: string;
  price: number;
  pricingType: 'hourly' | 'fixed' | 'custom_quote';
  durationEstimate?: string;
  images: ImageItem[];
  category?: {
    name: string;
    slug: string;
    iconName?: string;
    iconColor?: string;
  };
  provider?: {
    _id?: string;
    name?: string;
    businessName?: string;
    rating?: number;
    reviewCount?: number;
    profileImage?: string;
    city?: string;
    state?: string;
    isVerified?: boolean;
  };
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
}

export interface MarketplaceProduct {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  salePrice?: number;
  condition?: 'new' | 'old' | 'refurbished' | string;
  images: ImageItem[];
  stock: number;
  subcategory?: string;
  category?: {
    _id?: string;
    name: string;
    slug?: string;
    iconName?: string;
  };
  seller?: {
    _id?: string;
    businessName?: string;
    name?: string;
    rating?: number;
  };
  fulfillment?: {
    pickup?: boolean;
    localDelivery?: boolean;
    shipping?: boolean;
    deliveryFee?: number;
  };
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
   * Fetch services (featured or filtered with search / category / pricingType / sortBy)
   */
  async getFeaturedServices(
    limitOrParams:
      | number
      | {
          search?: string;
          category?: string;
          pricingType?: string;
          sortBy?: string;
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
      // If filtering or searching, return whatever backend returned (even empty array) rather than synthetic defaults
      if (
        typeof limitOrParams === 'object' &&
        (limitOrParams.search || limitOrParams.category || limitOrParams.pricingType || limitOrParams.sortBy)
      ) {
        return Array.isArray(data) ? data : [];
      }
      return DEFAULT_SERVICES;
    } catch {
      if (typeof limitOrParams === 'object' && (limitOrParams.search || limitOrParams.category)) {
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
      return Array.isArray(res?.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch top-rated local providers spotlight
   */
  async getFeaturedProviders(limit = 6): Promise<FeaturedProvider[]> {
    try {
      const res: any = await apiClient.get('/providers/featured', {
        params: { limit },
      });
      const data = res?.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return DEFAULT_PROVIDERS;
    } catch {
      return DEFAULT_PROVIDERS;
    }
  },
};
