import { NexoraColors } from '@/constants/theme';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface NexoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  inverted?: boolean;
}

export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle = 'LOCAL SERVICES & MARKETPLACE',
  inverted = true,
}) => {
  const badgeDimensions = {
    sm: { width: 34, height: 34, borderRadius: 8, fontSize: 16 },
    md: { width: 46, height: 46, borderRadius: 12, fontSize: 22 },
    lg: { width: 60, height: 60, borderRadius: 16, fontSize: 28 },
    xl: { width: 84, height: 84, borderRadius: 22, fontSize: 36 },
  }[size];

  return (
    <View style={[styles.container, size === 'sm' && { gap: 8 }]}>
      {/* Brand Icon Image */}
      <View
        style={[
          styles.badge,
          {
            width: badgeDimensions.width,
            height: badgeDimensions.height,
            borderRadius: badgeDimensions.borderRadius,
          },
        ]}
      >
        <Image
          source={require('@/assets/images/nexora-logo.png')}
          style={{
            width: badgeDimensions.width,
            height: badgeDimensions.height,
            borderRadius: badgeDimensions.borderRadius,
          }}
          resizeMode="cover"
        />
      </View>

      {/* Brand Text */}
      {showText && (
        <View style={styles.textWrap}>
          <Text
            style={[
              styles.brandTitle,
              { color: inverted ? '#ffffff' : NexoraColors.textPrimary },
              size === 'sm' && { fontSize: 16, letterSpacing: 0.8 },
              size === 'lg' && { fontSize: 24 },
              size === 'xl' && { fontSize: 28 },
            ]}
          >
            NEXORA<Text style={styles.brandAccent}>.</Text>
          </Text>
          {subtitle && subtitle.trim().length > 0 ? (
            <Text
              style={[
                styles.brandSubtitle,
                { color: inverted ? '#93c5fd' : NexoraColors.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  textWrap: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandAccent: {
    color: NexoraColors.accent,
  },
  brandSubtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});

export default NexoraLogo;

