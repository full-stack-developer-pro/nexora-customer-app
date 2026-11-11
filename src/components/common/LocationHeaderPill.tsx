import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MapPin, ChevronDown } from 'lucide-react-native';
import { NexoraColors } from '@/constants/theme';
import { useLocation } from '@/context/LocationContext';

interface LocationHeaderPillProps {
  inverted?: boolean;
}

export const LocationHeaderPill: React.FC<LocationHeaderPillProps> = ({ inverted = false }) => {
  const { activeLocation, openLocationModal } = useLocation();

  // Shorten formatted address for clean header display
  const displayTitle = activeLocation?.label
    ? activeLocation.label
    : 'Location';

  const displaySubtitle = activeLocation?.formattedAddress
    ? activeLocation.formattedAddress
    : 'Select your service area';

  return (
    <TouchableOpacity
      style={[styles.container, inverted && styles.containerInverted]}
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
          <ChevronDown size={12} color={inverted ? '#94a3b8' : '#64748b'} />
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    maxWidth: 220,
  },
  containerInverted: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  iconWrapInverted: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  textCol: {
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  titleInverted: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 10,
    color: NexoraColors.textSecondary,
  },
  subtitleInverted: {
    color: '#cbd5e1',
  },
});

