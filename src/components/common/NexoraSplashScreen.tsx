import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NexoraColors } from '@/constants/theme';

interface NexoraSplashScreenProps {
  onFinish?: () => void;
}

export const NexoraSplashScreen: React.FC<NexoraSplashScreenProps> = ({ onFinish }) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const useNative = Platform.OS !== 'web';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.9,
          duration: 1200,
          useNativeDriver: useNative,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: useNative,
        }),
      ])
    ).start();

    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: useNative,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: useNative,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: useNative,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, [useNative]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Dynamic Ambient Background Glow Layers */}
      <Animated.View
        style={[
          styles.glowCircleOuter,
          {
            opacity: glowAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.glowCircleInner,
          {
            opacity: glowAnim,
          },
        ]}
      />

      {/* Center Logo Branding */}
      <Animated.View
        style={[
          styles.contentBox,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoBadge}>
          <Image
            source={require('@/assets/images/nexora-logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.brandTitle}>
          NEXORA<Text style={styles.brandDot}>.</Text>
        </Text>
        <Text style={styles.brandSubtitle}>SERVICES & MARKETPLACE</Text>
        <Text style={styles.ecosystemTag}>Book Pros • Shop Local • Fast Delivery</Text>

        {/* Minimal Progress Line */}
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </Animated.View>

      {/* Bottom Security Note */}
      <View style={[styles.bottomBar, { bottom: Math.max(insets.bottom, 20) + 16 }]}>
        <Text style={styles.versionText}>Nexora Customer App v1.0</Text>
        <Text style={styles.copyrightText}>Encrypted & Verified Ecosystem</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#041427',
    zIndex: 99999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircleOuter: {
    position: 'absolute',
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: 'rgba(8, 78, 138, 0.18)',
    alignSelf: 'center',
  },
  glowCircleInner: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignSelf: 'center',
  },
  contentBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 20,
  },
  logoImage: {
    width: 96,
    height: 96,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  brandDot: {
    color: NexoraColors.accent,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#93c5fd',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  ecosystemTag: {
    fontSize: 12.5,
    color: '#94a3b8',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 28,
  },
  progressBarTrack: {
    width: 150,
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 2,
  },
  bottomBar: {
    position: 'absolute',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  copyrightText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 3,
    letterSpacing: 0.3,
  },
});

export default NexoraSplashScreen;
