import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue, Dimensions } from 'react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface NexoraShimmerProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * High-performance 60 FPS pulsating Shimmer placeholder using native driver
 */
export const NexoraShimmer: React.FC<NexoraShimmerProps> = ({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        styles.shimmerBase,
        {
          width,
          height,
          borderRadius,
          opacity: animatedValue,
        },
        style,
      ]}
    />
  );
};

/**
 * 1. Pixel-accurate Service Card Skeleton for Browse & Search screen (search.tsx)
 */
export const CustomerServiceCardSkeleton: React.FC = () => {
  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceImageRow}>
        <NexoraShimmer width={90} height={90} borderRadius={Radius.md} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <NexoraShimmer width={75} height={16} borderRadius={Radius.full} />
            <NexoraShimmer width={65} height={18} borderRadius={4} />
          </View>
          <NexoraShimmer width="92%" height={16} borderRadius={4} />
          <NexoraShimmer width="70%" height={13} borderRadius={4} />
        </View>
      </View>

      <View style={styles.serviceFooter}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <NexoraShimmer width={30} height={30} borderRadius={15} />
          <View style={{ flex: 1, gap: 4 }}>
            <NexoraShimmer width={120} height={13} borderRadius={4} />
            <NexoraShimmer width={80} height={11} borderRadius={4} />
          </View>
        </View>
        <NexoraShimmer width={88} height={30} borderRadius={Radius.md} />
      </View>
    </View>
  );
};

/**
 * 2. Pixel-accurate Product Card Skeleton for Browse & Search screen (search.tsx)
 */
export const CustomerProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.productCard}>
      <NexoraShimmer width="100%" height={150} borderRadius={0} />
      <View style={{ padding: 14, gap: 8 }}>
        <NexoraShimmer width={100} height={12} borderRadius={4} />
        <NexoraShimmer width="85%" height={16} borderRadius={4} />
        <NexoraShimmer width={110} height={12} borderRadius={4} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          <View style={{ gap: 4 }}>
            <NexoraShimmer width={70} height={18} borderRadius={4} />
            <NexoraShimmer width={60} height={11} borderRadius={4} />
          </View>
          <NexoraShimmer width={80} height={30} borderRadius={Radius.md} />
        </View>
      </View>
    </View>
  );
};

/**
 * 3. Horizontal Slider Service Card Skeleton for Home Screen (index.tsx)
 */
export const HomeServiceSlideSkeleton: React.FC = () => {
  const cardWidth = width * 0.8;
  return (
    <View style={[styles.homeSlideCard, { width: cardWidth }]}>
      <NexoraShimmer width="100%" height={140} borderRadius={0} />
      <View style={{ padding: 14, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <NexoraShimmer width={80} height={16} borderRadius={Radius.full} />
          <NexoraShimmer width={70} height={16} borderRadius={4} />
        </View>
        <NexoraShimmer width="90%" height={16} borderRadius={4} />
        <NexoraShimmer width="65%" height={13} borderRadius={4} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <NexoraShimmer width={28} height={28} borderRadius={14} />
            <NexoraShimmer width={90} height={12} borderRadius={4} />
          </View>
          <NexoraShimmer width={72} height={28} borderRadius={Radius.md} />
        </View>
      </View>
    </View>
  );
};

/**
 * 4. Horizontal Slider Provider Card Skeleton for Home Screen (index.tsx)
 */
export const HomeProviderSlideSkeleton: React.FC = () => {
  const cardWidth = width * 0.64;
  return (
    <View style={[styles.homeSlideCard, { width: cardWidth, padding: 14 }]}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <NexoraShimmer width={70} height={70} borderRadius={35} />
        <NexoraShimmer width={110} height={15} borderRadius={4} />
        <NexoraShimmer width={80} height={12} borderRadius={4} />
        <NexoraShimmer width={60} height={14} borderRadius={Radius.full} style={{ marginTop: 4 }} />
      </View>
      <NexoraShimmer width="100%" height={32} borderRadius={Radius.md} style={{ marginTop: 12 }} />
    </View>
  );
};

/**
 * 5. Horizontal Slider Product Card Skeleton for Home Screen (index.tsx)
 */
export const HomeProductSlideSkeleton: React.FC = () => {
  const cardWidth = width * 0.52;
  return (
    <View style={[styles.homeSlideCard, { width: cardWidth }]}>
      <NexoraShimmer width="100%" height={110} borderRadius={0} />
      <View style={{ padding: 10, gap: 6 }}>
        <NexoraShimmer width={75} height={10} borderRadius={3} />
        <NexoraShimmer width="90%" height={14} borderRadius={4} />
        <NexoraShimmer width={70} height={11} borderRadius={3} />
        <NexoraShimmer width={60} height={16} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
};

/**
 * 6. Pixel-accurate Service Detail Screen Skeleton (service/[id].tsx)
 */
export const CustomerServiceDetailSkeleton: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      {/* Hero photo shimmer */}
      <View style={{ width: '100%', height: Math.min(width * 0.78, 320), backgroundColor: '#cbd5e1' }}>
        <NexoraShimmer width="100%" height="100%" borderRadius={0} />
      </View>

      {/* Main title & price card shimmer */}
      <View
        style={{
          backgroundColor: '#ffffff',
          marginHorizontal: 16,
          marginTop: 14,
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          gap: 12,
        }}
      >
        <NexoraShimmer width="90%" height={24} borderRadius={6} />
        <NexoraShimmer width="60%" height={18} borderRadius={4} />

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <NexoraShimmer width={110} height={22} borderRadius={Radius.sm} />
          <NexoraShimmer width={100} height={22} borderRadius={Radius.sm} />
        </View>

        {/* Pricing box shimmer */}
        <View
          style={{
            height: 60,
            backgroundColor: '#f8fafc',
            borderRadius: Radius.md,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <View style={{ gap: 6 }}>
            <NexoraShimmer width={120} height={10} borderRadius={3} />
            <NexoraShimmer width={80} height={20} borderRadius={4} />
          </View>
          <NexoraShimmer width={100} height={24} borderRadius={Radius.full} />
        </View>

        {/* Description lines shimmer */}
        <View style={{ gap: 8, marginTop: 8 }}>
          <NexoraShimmer width={140} height={16} borderRadius={4} />
          <NexoraShimmer width="100%" height={12} borderRadius={3} />
          <NexoraShimmer width="95%" height={12} borderRadius={3} />
          <NexoraShimmer width="75%" height={12} borderRadius={3} />
        </View>
      </View>

      {/* Provider snapshot shimmer */}
      <View
        style={{
          backgroundColor: '#ffffff',
          marginHorizontal: 16,
          marginTop: 14,
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <NexoraShimmer width={50} height={50} borderRadius={25} />
          <View style={{ flex: 1, gap: 6 }}>
            <NexoraShimmer width={150} height={16} borderRadius={4} />
            <NexoraShimmer width={110} height={12} borderRadius={4} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <NexoraShimmer width="31%" height={36} borderRadius={Radius.sm} />
          <NexoraShimmer width="31%" height={36} borderRadius={Radius.sm} />
          <NexoraShimmer width="31%" height={36} borderRadius={Radius.sm} />
        </View>
      </View>
    </View>
  );
};

/**
 * 7. Pixel-accurate Product Detail Screen Skeleton (product/[id].tsx)
 */
export const CustomerProductDetailSkeleton: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      {/* Product Hero photo shimmer */}
      <View style={{ width: '100%', height: Math.min(width * 0.85, 340), backgroundColor: '#cbd5e1' }}>
        <NexoraShimmer width="100%" height="100%" borderRadius={0} />
      </View>

      {/* Main title & price card shimmer */}
      <View
        style={{
          backgroundColor: '#ffffff',
          marginHorizontal: 16,
          marginTop: 14,
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <NexoraShimmer width={120} height={18} borderRadius={Radius.full} />
          <NexoraShimmer width={85} height={18} borderRadius={Radius.full} />
        </View>

        <NexoraShimmer width="92%" height={24} borderRadius={6} />
        <NexoraShimmer width="65%" height={18} borderRadius={4} />

        {/* Pricing & Discount shimmer */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
          <NexoraShimmer width={100} height={28} borderRadius={6} />
          <NexoraShimmer width={60} height={16} borderRadius={4} />
          <NexoraShimmer width={70} height={20} borderRadius={Radius.sm} />
        </View>

        {/* Stock & Delivery row shimmer */}
        <View
          style={{
            height: 52,
            backgroundColor: '#f8fafc',
            borderRadius: Radius.md,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <NexoraShimmer width={130} height={16} borderRadius={4} />
          <NexoraShimmer width={90} height={16} borderRadius={4} />
        </View>

        {/* Description shimmer lines */}
        <View style={{ gap: 8, marginTop: 8 }}>
          <NexoraShimmer width={150} height={16} borderRadius={4} />
          <NexoraShimmer width="100%" height={12} borderRadius={3} />
          <NexoraShimmer width="92%" height={12} borderRadius={3} />
          <NexoraShimmer width="78%" height={12} borderRadius={3} />
        </View>
      </View>

      {/* Seller & Store card shimmer */}
      <View
        style={{
          backgroundColor: '#ffffff',
          marginHorizontal: 16,
          marginTop: 14,
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <NexoraShimmer width={46} height={46} borderRadius={23} />
          <View style={{ flex: 1, gap: 6 }}>
            <NexoraShimmer width={160} height={16} borderRadius={4} />
            <NexoraShimmer width={100} height={12} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * 8. Pixel-accurate Provider Public Profile Skeleton (provider/[id].tsx)
 */
export const CustomerProviderDetailSkeleton: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9', paddingTop: 48 }}>
      {/* Header bar shimmer */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 14,
        }}
      >
        <NexoraShimmer width={40} height={40} borderRadius={20} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <NexoraShimmer width={40} height={40} borderRadius={20} />
          <NexoraShimmer width={40} height={40} borderRadius={20} />
        </View>
      </View>

      {/* Provider Hero Card shimmer */}
      <View
        style={{
          backgroundColor: '#ffffff',
          marginHorizontal: 16,
          marginTop: 6,
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <NexoraShimmer width={68} height={68} borderRadius={34} />
          <View style={{ flex: 1, gap: 6 }}>
            <NexoraShimmer width={180} height={20} borderRadius={4} />
            <NexoraShimmer width={130} height={14} borderRadius={4} />
            <NexoraShimmer width={100} height={14} borderRadius={4} />
          </View>
        </View>

        {/* Badges row shimmer */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <NexoraShimmer width={110} height={24} borderRadius={Radius.full} />
          <NexoraShimmer width={95} height={24} borderRadius={Radius.full} />
          <NexoraShimmer width={85} height={24} borderRadius={Radius.full} />
        </View>

        {/* 3 Metric Stat Cards */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
          <View style={{ flex: 1, height: 76, backgroundColor: '#f8fafc', borderRadius: Radius.md, padding: 8, alignItems: 'center', gap: 5 }}>
            <NexoraShimmer width={28} height={28} borderRadius={14} />
            <NexoraShimmer width={42} height={14} borderRadius={3} />
            <NexoraShimmer width={50} height={10} borderRadius={3} />
          </View>
          <View style={{ flex: 1, height: 76, backgroundColor: '#f8fafc', borderRadius: Radius.md, padding: 8, alignItems: 'center', gap: 5 }}>
            <NexoraShimmer width={28} height={28} borderRadius={14} />
            <NexoraShimmer width={42} height={14} borderRadius={3} />
            <NexoraShimmer width={50} height={10} borderRadius={3} />
          </View>
          <View style={{ flex: 1, height: 76, backgroundColor: '#f8fafc', borderRadius: Radius.md, padding: 8, alignItems: 'center', gap: 5 }}>
            <NexoraShimmer width={28} height={28} borderRadius={14} />
            <NexoraShimmer width={42} height={14} borderRadius={3} />
            <NexoraShimmer width={50} height={10} borderRadius={3} />
          </View>
        </View>

        {/* Action buttons row shimmer */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <NexoraShimmer width="48%" height={44} borderRadius={Radius.md} />
          <NexoraShimmer width="48%" height={44} borderRadius={Radius.md} />
        </View>
      </View>

      {/* About & Bio shimmer card */}
      <View
        style={{
          backgroundColor: '#ffffff',
          marginHorizontal: 16,
          marginTop: 14,
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          gap: 10,
        }}
      >
        <NexoraShimmer width={130} height={18} borderRadius={4} />
        <NexoraShimmer width="100%" height={12} borderRadius={3} />
        <NexoraShimmer width="94%" height={12} borderRadius={3} />
        <NexoraShimmer width="76%" height={12} borderRadius={3} />
      </View>

      {/* Services offered shimmer card */}
      <View
        style={{
          backgroundColor: '#ffffff',
          marginHorizontal: 16,
          marginTop: 14,
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          gap: 12,
        }}
      >
        <NexoraShimmer width={160} height={18} borderRadius={4} />
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <NexoraShimmer width={64} height={64} borderRadius={10} />
          <View style={{ flex: 1, gap: 6 }}>
            <NexoraShimmer width="80%" height={16} borderRadius={4} />
            <NexoraShimmer width="50%" height={12} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerBase: {
    backgroundColor: '#cbd5e1',
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
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NexoraColors.border,
    ...Shadows.card,
  },
  homeSlideCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NexoraColors.border,
    marginRight: 14,
    ...Shadows.card,
  },
});

