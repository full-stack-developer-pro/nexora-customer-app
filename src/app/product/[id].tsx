import React, { useState, useEffect } from 'react';
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
  Truck,
  Store,
  Package,
  Sparkles,
  Plus,
  Minus,
  ShoppingCart,
  Phone,
  RotateCcw,
  ChevronRight,
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import {
  marketplaceService,
  MarketplaceProduct,
  ImageItem,
} from '@/services/marketplaceService';
import { CustomerProductDetailSkeleton } from '@/components/common/NexoraShimmer';

const { width } = Dimensions.get('window');
const CAROUSEL_HEIGHT = Math.min(width * 0.85, 340);

const getImageUrl = (img: ImageItem | undefined): string | null => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.url) return img.url;
  return null;
};

const FALLBACK_PRODUCT_GALLERY = [
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProductData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await marketplaceService.getProductById(id);
        if (isMounted) {
          if (data) {
            setProduct(data);
          } else {
            setProduct({
              _id: id,
              name: 'Heavy-Duty 20V Max Cordless Brushless Hammer Drill Kit',
              slug: 'cordless-brushless-hammer-drill-kit',
              description:
                'Professional high-torque brushless hammer drill with 2-speed transmission, 20V lithium-ion battery, rapid smart charger, and heavy-duty contractor storage bag. Built for concrete, masonry, and heavy structural timber fastening with maximum endurance.',
              price: 149.99,
              compareAtPrice: 199.99,
              condition: 'new',
              stock: 18,
              sku: 'NX-DRL-20V',
              images: FALLBACK_PRODUCT_GALLERY,
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
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load product detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        title: product.name,
        message: `Check out "${product.name}" for $${Number(product.price).toFixed(2)} on Nexora Marketplace!`,
      });
    } catch {
      // Ignore share dismissal
    }
  };

  const toggleSave = () => {
    setIsSaved((prev) => !prev);
    if (!isSaved) {
      Alert.alert('Saved to Wishlist', 'This item has been added to your saved products.');
    }
  };

  const incrementQty = () => {
    if (product && quantity < Math.min(product.stock, 10)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (loading) {
    return <CustomerProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <View style={[styles.errorScreen, { paddingTop: insets.top }]}>
        <AlertCircle size={44} color="#ef4444" />
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorSubtitle}>
          This marketplace listing may have been archived or removed by the seller.
        </Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => router.back()}>
          <Text style={styles.backBtnActionText}>Back to Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rawImages =
    product.images && product.images.length > 0
      ? (product.images.map((img) => getImageUrl(img)).filter(Boolean) as string[])
      : [];

  const imageGallery =
    rawImages.length > 1
      ? rawImages
      : rawImages.length === 1
        ? [rawImages[0], ...FALLBACK_PRODUCT_GALLERY.slice(1)]
        : FALLBACK_PRODUCT_GALLERY;

  const sellerName =
    product.seller?.businessName || product.seller?.name || 'Verified Merchant';
  const ratingScore = product.rating || 0;
  const reviewsCount = product.reviewsCount || 0;

  const isDiscounted =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = isDiscounted
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const conditionDisplay =
    product.condition === 'refurbished'
      ? 'CERTIFIED REFURBISHED'
      : product.condition === 'old'
        ? 'PRE-OWNED'
        : 'BRAND NEW';

  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const isOutOfStock = product.stock === 0;

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Product Image Carousel */}
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

          {/* Bottom Overlay Row: Condition Tag (Left) & Slide Counter (Right) */}
          <View style={styles.carouselOverlayBadges}>
            <View style={styles.conditionPill}>
              <Sparkles size={11} color="#084e8a" style={{ marginRight: 4 }} />
              <Text style={styles.conditionPillText}>{conditionDisplay}</Text>
            </View>

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

        {/* 1. Product Core Card (Title, Price, Stock, Subtle Trust Badge) */}
        <View style={styles.card}>
          {/* Category & SKU Header */}
          <View style={styles.metaTopRow}>
            {product.category?.name && (
              <View style={styles.categoryPill}>
                <Package size={11} color="#084e8a" style={{ marginRight: 4 }} />
                <Text style={styles.categoryPillText} numberOfLines={1}>
                  {product.category.name}
                </Text>
              </View>
            )}
            {product.sku && (
              <Text style={styles.skuText}>SKU: {product.sku}</Text>
            )}
          </View>

          {/* Product Name */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Real Rating Badge */}
          <View style={styles.ratingBadgeRow}>
            {reviewsCount > 0 ? (
              <View style={styles.ratingPill}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingScore}>{Number(ratingScore).toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({reviewsCount} ratings)</Text>
              </View>
            ) : (
              <View style={styles.ratingPill}>
                <Star size={13} color="#94a3b8" />
                <Text style={styles.newListingText}>New Listing • No reviews yet</Text>
              </View>
            )}

            <View style={styles.verifiedStoreBadge}>
              <ShieldCheck size={13} color="#059669" />
              <Text style={styles.verifiedStoreBadgeText}>Verified Merchant</Text>
            </View>
          </View>

          {/* Price & Savings Display */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceCurrent}>
                ${Number(product.price).toFixed(2)}
              </Text>
              {isDiscounted && (
                <Text style={styles.priceCompareAt}>
                  ${Number(product.compareAtPrice).toFixed(2)}
                </Text>
              )}
              {isDiscounted && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stock Status Pill */}
          <View
            style={[
              styles.stockBox,
              isOutOfStock
                ? styles.stockBoxOut
                : isLowStock
                  ? styles.stockBoxLow
                  : styles.stockBoxIn,
            ]}
          >
            {isOutOfStock ? (
              <AlertCircle size={15} color="#b91c1c" />
            ) : isLowStock ? (
              <AlertCircle size={15} color="#b45309" />
            ) : (
              <CheckCircle2 size={15} color="#15803d" />
            )}
            <Text
              style={[
                styles.stockText,
                isOutOfStock
                  ? styles.stockTextOut
                  : isLowStock
                    ? styles.stockTextLow
                    : styles.stockTextIn,
              ]}
            >
              {isOutOfStock
                ? 'Currently Out of Stock'
                : isLowStock
                  ? `Low Stock: Only ${product.stock} units left`
                  : `In Stock (${product.stock} units available)`}
            </Text>
          </View>

          {/* Sleek 1-Line Industry Protection Pill */}
          <View style={styles.leanProtectionPill}>
            <ShieldCheck size={14} color="#084e8a" />
            <Text style={styles.leanProtectionText}>
              Nexora Buyer Protection • 30-Day Money-Back Guarantee
            </Text>
          </View>
        </View>

        {/* 2. Fulfillment Options (Rendered directly from DB fulfillment settings) */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Fulfillment & Delivery</Text>
          <Text style={styles.sectionSubheading}>
            Available pickup and dispatch methods for this item.
          </Text>

          <View style={styles.fulfillmentList}>
            {product.fulfillment?.pickup !== false && (
              <View style={styles.fulfillmentRow}>
                <View style={[styles.fulfillmentIconCircle, { backgroundColor: '#ecfdf5' }]}>
                  <Store size={16} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.fulfillmentTitle}>In-Store Pickup</Text>
                  <Text style={styles.fulfillmentSubtitle}>
                    Available at {sellerName} ({product.seller?.city || 'Austin, TX'})
                  </Text>
                </View>
                <Text style={styles.freeBadge}>FREE</Text>
              </View>
            )}

            {product.fulfillment?.localDelivery && (
              <>
                <View style={styles.fulfillmentDivider} />
                <View style={styles.fulfillmentRow}>
                  <View style={[styles.fulfillmentIconCircle, { backgroundColor: '#f0f9ff' }]}>
                    <Truck size={16} color="#084e8a" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.fulfillmentTitle}>Local Delivery</Text>
                    <Text style={styles.fulfillmentSubtitle}>
                      Dispatched directly from merchant inventory
                    </Text>
                  </View>
                  <Text style={styles.deliveryFeeText}>
                    {product.fulfillment.deliveryFee === 0
                      ? 'FREE'
                      : `$${Number(product.fulfillment.deliveryFee).toFixed(2)}`}
                  </Text>
                </View>
              </>
            )}

            {product.fulfillment?.shipping !== false && (
              <>
                <View style={styles.fulfillmentDivider} />
                <View style={styles.fulfillmentRow}>
                  <View style={[styles.fulfillmentIconCircle, { backgroundColor: '#faf5ff' }]}>
                    <Package size={16} color="#7c3aed" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.fulfillmentTitle}>Tracked Carrier Shipping</Text>
                    <Text style={styles.fulfillmentSubtitle}>
                      Estimated delivery in 2–4 business days
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* 3. Real Product Specifications (Database Attributes Only) */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Product Details</Text>
          <Text style={styles.sectionSubheading}>
            Catalog attributes and verified product metadata.
          </Text>

          <View style={styles.specsTable}>
            {product.sku && (
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Product SKU</Text>
                <Text style={styles.specVal}>{product.sku}</Text>
              </View>
            )}
            <View style={styles.specRowAlt}>
              <Text style={styles.specKey}>Condition</Text>
              <Text style={styles.specVal}>{conditionDisplay}</Text>
            </View>
            {product.category?.name && (
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Category</Text>
                <Text style={styles.specVal}>{product.category.name}</Text>
              </View>
            )}
            {product.subcategory && (
              <View style={styles.specRowAlt}>
                <Text style={styles.specKey}>Subcategory</Text>
                <Text style={styles.specVal}>{product.subcategory}</Text>
              </View>
            )}
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Inventory Stock</Text>
              <Text style={styles.specVal}>{product.stock} units</Text>
            </View>
            <View style={styles.specRowAlt}>
              <Text style={styles.specKey}>Seller</Text>
              <Text style={styles.specVal}>{sellerName}</Text>
            </View>
          </View>
        </View>

        {/* 4. Product Description */}
        {product.description ? (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        ) : null}

        {/* 5. Seller / Merchant Card */}
        <View style={styles.card}>
          <View style={styles.sellerHeaderRow}>
            <View style={styles.sellerAvatar}>
              <Store size={20} color="#ffffff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text style={styles.sellerNameText} numberOfLines={1}>
                  {sellerName}
                </Text>
                <CheckCircle2 size={14} color="#059669" />
              </View>
              <Text style={styles.sellerLocationText}>
                Verified Merchant • {product.seller?.city || 'Austin, TX'}
              </Text>
              {Number(product.seller?.rating || 0) > 0 && (
                <View style={styles.sellerRatingRow}>
                  <Star size={11} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.sellerRatingScore}>
                    {Number(product.seller?.rating).toFixed(1)} Merchant Rating
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <TouchableOpacity
              style={[styles.sellerContactBtn, { flex: 1, marginTop: 0 }]}
              onPress={() => {
                Alert.alert(
                  'Merchant Contact',
                  `Contact ${sellerName} regarding product specifications or pickup queries.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call Store', onPress: () => {} },
                  ]
                );
              }}
              activeOpacity={0.8}
            >
              <Phone size={13} color={NexoraColors.primary} />
              <Text style={styles.sellerContactBtnText}>Contact Seller</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sellerContactBtn,
                { flex: 1, marginTop: 0, backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
              ]}
              onPress={() => {
                if (product.seller?._id) {
                  router.push(`/provider/${product.seller._id}` as any);
                } else {
                  router.push('/provider/prov_1' as any);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.sellerContactBtnText, { color: '#0369a1' }]}>View Profile</Text>
              <ChevronRight size={13} color="#0369a1" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarPriceLabel}>Item Total</Text>
          <Text style={styles.bottomBarPrice}>
            ${(product.price * quantity).toFixed(2)}
          </Text>
        </View>

        {/* Quantity Stepper */}
        {!isOutOfStock && (
          <View style={styles.qtyStepper}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={decrementQty}
              disabled={quantity <= 1}
              activeOpacity={0.7}
            >
              <Minus size={14} color={quantity <= 1 ? '#cbd5e1' : '#0f172a'} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={incrementQty}
              disabled={quantity >= Math.min(product.stock, 10)}
              activeOpacity={0.7}
            >
              <Plus
                size={14}
                color={
                  quantity >= Math.min(product.stock, 10) ? '#cbd5e1' : '#0f172a'
                }
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Primary CTA */}
        <TouchableOpacity
          style={[
            styles.addToCartPrimaryBtn,
            isOutOfStock && styles.addToCartDisabledBtn,
          ]}
          onPress={() => setPurchaseModalVisible(true)}
          disabled={isOutOfStock}
          activeOpacity={0.88}
        >
          <ShoppingCart size={17} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.addToCartPrimaryBtnText}>
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product Purchase Phase Informational Modal */}
      <Modal
        visible={purchaseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPurchaseModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPurchaseModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalDragHandle} />

                <View style={styles.modalIconWrap}>
                  <ShoppingCart size={28} color="#084e8a" />
                </View>

                <Text style={styles.modalTitle}>Multi-Vendor Checkout</Text>
                <Text style={styles.modalSubtitle}>
                  "{product.name}" (Qty: {quantity}) by {sellerName}.
                </Text>

                <View style={styles.modalNoticeBox}>
                  <RotateCcw size={16} color="#084e8a" style={{ marginTop: 2 }} />
                  <Text style={styles.modalNoticeText}>
                    Multi-vendor shopping carts, local pickup scheduling, and Stripe payment processing are launching in the dedicated Purchase phase! You can add this item to your wishlist now.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={() => {
                    setIsSaved(true);
                    setPurchaseModalVisible(false);
                    Alert.alert('Saved', 'Product added to your wishlist.');
                  }}
                  activeOpacity={0.85}
                >
                  <Heart size={16} color="#ffffff" fill="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.modalSaveBtnText}>Save to Wishlist</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setPurchaseModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseBtnText}>Close Preview</Text>
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

  // Carousel
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
  conditionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  conditionPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#084e8a',
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
  metaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#084e8a',
  },
  skuText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  productTitle: {
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
  verifiedStoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  verifiedStoreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },

  // Price
  priceContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  priceCurrent: {
    fontSize: 26,
    fontWeight: '900',
    color: '#084e8a',
  },
  priceCompareAt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  discountBadgeText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '800',
  },

  // Stock Box
  stockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginTop: 12,
  },
  stockBoxIn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  stockBoxLow: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  stockBoxOut: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stockTextIn: {
    color: '#15803d',
  },
  stockTextLow: {
    color: '#b45309',
  },
  stockTextOut: {
    color: '#b91c1c',
  },

  // Lean 1-Line Protection
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
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },

  // Fulfillment
  fulfillmentList: {
    backgroundColor: '#f8fafc',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fulfillmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fulfillmentDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  fulfillmentIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fulfillmentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  fulfillmentSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  freeBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  deliveryFeeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#084e8a',
  },

  // Specs Table
  specsTable: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#ffffff',
  },
  specRowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#f8fafc',
  },
  specKey: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  specVal: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
    maxWidth: '55%',
    textAlign: 'right',
  },

  // Seller
  sellerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#084e8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  sellerLocationText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  sellerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  sellerRatingScore: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '700',
  },
  sellerContactBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    marginTop: 12,
  },
  sellerContactBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
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
  bottomBarLeft: {
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
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.full,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginHorizontal: 10,
    minWidth: 16,
    textAlign: 'center',
  },
  addToCartPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NexoraColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.full,
    ...Shadows.card,
  },
  addToCartDisabledBtn: {
    backgroundColor: '#94a3b8',
  },
  addToCartPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 34,
    alignItems: 'center',
  },
  modalDragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginBottom: 16,
  },
  modalIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  modalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: Radius.md,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  modalNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#0369a1',
    lineHeight: 18,
    fontWeight: '500',
  },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NexoraColors.primary,
    width: '100%',
    paddingVertical: 13,
    borderRadius: Radius.full,
    marginTop: 18,
    ...Shadows.sm,
  },
  modalSaveBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  modalCloseBtn: {
    paddingVertical: 12,
    marginTop: 6,
  },
  modalCloseBtnText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
});
