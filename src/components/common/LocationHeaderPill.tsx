import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MapPin, ChevronDown } from 'lucide-react-native';
import { NexoraColors, Radius } from '@/constants/theme';
import { useLocation } from '@/context/LocationContext';

interface LocationHeaderPillProps {
  inverted?: boolean;
  compact?: boolean;
  style?: any;
}

export const LocationHeaderPill: React.FC<LocationHeaderPillProps> = ({
  inverted = false,
  compact = false,
  style,
}) => {
  const { activeLocation, openLocationModal } = useLocation();

  const displayTitle = activeLocation?.label || 'Home';
  const displaySubtitle =
    activeLocation?.formattedAddress ||
    [activeLocation?.street, activeLocation?.city].filter(Boolean).join(', ') ||
    'Select your address';

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, inverted && styles.compactContainerInverted, style]}
        onPress={openLocationModal}
        activeOpacity={0.8}
      >
        <MapPin size={12} color={inverted ? '#93c5fd' : NexoraColors.primary} />
        <Text style={[styles.compactTitle, inverted && styles.compactTitleInverted]} numberOfLines={1}>
          {displayTitle}
        </Text>
        <ChevronDown size={12} color={inverted ? '#94a3b8' : '#64748b'} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, inverted && styles.containerInverted, style]}
      onPress={openLocationModal}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrap, inverted && styles.iconWrapInverted]}>
        <MapPin size={13} color={inverted ? '#93c5fd' : NexoraColors.primary} />
      </View>
      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, inverted && styles.titleInverted]} numberOfLines={1}>
            {displayTitle}
          </Text>
          <ChevronDown size={12} color={inverted ? '#93c5fd' : '#64748b'} />
        </View>
        <Text style={[styles.subtitle, inverted && styles.subtitleInverted]} numberOfLines={1}>
          {displaySubtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.full,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginRight: 12,
    maxWidth: 270,
  },
  containerInverted: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconWrapInverted: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  titleInverted: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 10.5,
    color: NexoraColors.textSecondary,
    marginTop: 1,
  },
  subtitleInverted: {
    color: '#cbd5e1',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.full,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  compactContainerInverted: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    maxWidth: 90,
  },
  compactTitleInverted: {
    color: '#ffffff',
  },
});
