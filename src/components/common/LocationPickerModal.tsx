import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import {
  MapPin,
  Crosshair,
  X,
  Home,
  Briefcase,
  Check,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Search,
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { useLocation, CustomerLocation } from '@/context/LocationContext';

const PRESET_CITIES = [
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, zip: '94103', state: 'CA' },
  { name: 'New York, NY', lat: 40.7128, lng: -74.006, zip: '10001', state: 'NY' },
  { name: 'Austin, TX', lat: 30.2672, lng: -97.7431, zip: '78701', state: 'TX' },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, zip: '60601', state: 'IL' },
  { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321, zip: '98101', state: 'WA' },
];

export const LocationPickerModal: React.FC = () => {
  const {
    activeLocation,
    savedAddresses,
    searchRadius,
    setSearchRadius,
    isLocating,
    isLocationModalOpen,
    closeLocationModal,
    requestCurrentLocation,
    setActiveLocation,
    saveAddress,
    deleteAddress,
  } = useLocation();

  const [activeTab, setActiveTab] = useState<'quick' | 'manual'>('quick');

  // Instant Address Search / Autocomplete States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // Manual Form States
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [selectedTag, setSelectedTag] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Debounced Places / Address Autocomplete
  React.useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          searchQuery.trim()
        )}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'NexoraApp/1.0 (customer@nexora.com)' },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSuggestions(data);
          }
        }
      } catch (err) {
        console.warn('Place search error:', err);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = (place: any) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const addr = place.address || {};

    const streetPart =
      [addr.house_number, addr.road || addr.neighbourhood || addr.suburb].filter(Boolean).join(' ') ||
      place.name ||
      '';

    const cityPart = addr.city || addr.town || addr.village || addr.county || '';
    const statePart = addr.state || '';
    const zipPart = addr.postcode || '';
    const countryPart = addr.country || 'United States';

    const loc: CustomerLocation = {
      id: `place_${place.place_id || Date.now()}`,
      label: 'Other',
      formattedAddress: place.display_name,
      street: streetPart,
      city: cityPart,
      state: statePart,
      zipCode: zipPart,
      country: countryPart,
      latitude: lat,
      longitude: lng,
    };

    saveAddress(loc);
    setSearchQuery('');
    setSuggestions([]);
    closeLocationModal();
  };

  const handleUseGPS = async () => {
    const loc = await requestCurrentLocation();
    if (loc) {
      closeLocationModal();
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_CITIES[0]) => {
    const loc: CustomerLocation = {
      id: `preset_${preset.name.replace(/[^a-zA-Z]/g, '')}`,
      label: 'Other',
      formattedAddress: preset.name,
      street: 'Downtown',
      city: preset.name.split(',')[0].trim(),
      state: preset.state,
      zipCode: preset.zip,
      country: 'United States',
      latitude: preset.lat,
      longitude: preset.lng,
    };
    setActiveLocation(loc);
    closeLocationModal();
  };

  const handleSelectSaved = (item: CustomerLocation) => {
    setActiveLocation(item);
    closeLocationModal();
  };

  const handleSaveManualAddress = async () => {
    if (!city.trim() && !street.trim()) return;

    const formatted = [street.trim(), city.trim(), stateCode.trim(), zipCode.trim()]
      .filter(Boolean)
      .join(', ');

    let lat = 30.7046;
    let lng = 76.7179;

    try {
      const geo = await Location.geocodeAsync(`${street.trim()} ${city.trim()} ${stateCode.trim()} ${zipCode.trim()}`);
      if (geo && geo.length > 0) {
        lat = geo[0].latitude;
        lng = geo[0].longitude;
      }
    } catch (e) {
      console.warn('Geocoding error:', e);
    }

    const newLoc: CustomerLocation = {
      id: `manual_${Date.now()}`,
      label: selectedTag,
      formattedAddress: formatted || city.trim(),
      street: street.trim(),
      city: city.trim(),
      state: stateCode.trim(),
      zipCode: zipCode.trim(),
      country: 'United States',
      latitude: lat,
      longitude: lng,
    };

    saveAddress(newLoc);
    setStreet('');
    setCity('');
    setStateCode('');
    setZipCode('');
    setActiveTab('quick');
    closeLocationModal();
  };

  return (
    <Modal
      visible={isLocationModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closeLocationModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeLocationModal}
        />

        <View style={styles.sheetContainer}>
          {/* Top Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Service Location</Text>
              <Text style={styles.headerSubtitle}>
                Select where you need trades and hardware supplies delivered
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={closeLocationModal}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Real-time Address Autocomplete Bar */}
          <View style={styles.autocompleteSearchWrap}>
            <Search size={18} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.autocompleteInput}
              placeholder="Search area, street, society, or city..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {isSearchingPlaces && (
              <ActivityIndicator size="small" color={NexoraColors.primary} style={{ marginLeft: 6 }} />
            )}
            {searchQuery.length > 0 && !isSearchingPlaces && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Autocomplete Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsCard}>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.place_id || item.lat + item.lon}
                  style={styles.suggestionRow}
                  onPress={() => handleSelectSuggestion(item)}
                  activeOpacity={0.75}
                >
                  <View style={styles.suggestionIconCircle}>
                    <MapPin size={16} color={NexoraColors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionMainText} numberOfLines={1}>
                      {item.name || item.display_name.split(',')[0]}
                    </Text>
                    <Text style={styles.suggestionSubText} numberOfLines={1}>
                      {item.display_name}
                    </Text>
                  </View>
                  <ChevronRight size={14} color="#94a3b8" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Mode Switcher */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'quick' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('quick')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activeTab === 'quick' && styles.segmentTextActive]}>
                Saved & GPS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'manual' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('manual')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activeTab === 'manual' && styles.segmentTextActive]}>
                + Add Custom Address
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'quick' ? (
              <>
                {/* 1. Primary GPS Action Button */}
                <TouchableOpacity
                  style={styles.gpsPrimaryCard}
                  onPress={handleUseGPS}
                  disabled={isLocating}
                  activeOpacity={0.85}
                >
                  <View style={styles.gpsIconCircle}>
                    {isLocating ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Crosshair size={22} color="#ffffff" />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.gpsCardTitle}>
                      {isLocating ? 'Detecting your GPS...' : 'Use My Current Location'}
                    </Text>
                    <Text style={styles.gpsCardSubtitle}>
                      Automatically pinpoint address via device GPS
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>

                {/* 2. Search & Dispatch Radius Section */}
                <View style={styles.radiusContainer}>
                  <View style={styles.radiusHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <SlidersHorizontal size={13} color={NexoraColors.primary} />
                      <Text style={styles.sectionTitle}>MAX SERVICE RADIUS</Text>
                    </View>
                    <View style={styles.radiusActiveBadge}>
                      <Text style={styles.radiusActiveBadgeText}>{searchRadius} miles</Text>
                    </View>
                  </View>
                  <Text style={styles.radiusSubtitle}>
                    Only show certified pros and hardware supplies that dispatch to your location
                  </Text>
                  <View style={styles.radiusPillsRow}>
                    {[5, 15, 25, 50].map((r) => {
                      const isSel = searchRadius === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          style={[styles.radiusPill, isSel && styles.radiusPillActive]}
                          onPress={() => setSearchRadius(r)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.radiusPillText, isSel && styles.radiusPillTextActive]}>
                            {r} mi
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 3. Saved Addresses Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>
                  <Text style={styles.sectionBadge}>{savedAddresses.length}</Text>
                </View>

                {savedAddresses.map((addr) => {
                  const isActive =
                    activeLocation?.formattedAddress === addr.formattedAddress ||
                    activeLocation?.id === addr.id;
                  return (
                    <TouchableOpacity
                      key={addr.id || addr.formattedAddress}
                      style={[styles.addressCard, isActive && styles.addressCardActive]}
                      onPress={() => handleSelectSaved(addr)}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.addressIconWrap,
                          isActive && { backgroundColor: '#eef5fc' },
                        ]}
                      >
                        {addr.label === 'Home' ? (
                          <Home size={18} color={isActive ? NexoraColors.primary : '#64748b'} />
                        ) : addr.label === 'Work' ? (
                          <Briefcase size={18} color={isActive ? NexoraColors.primary : '#64748b'} />
                        ) : (
                          <MapPin size={18} color={isActive ? NexoraColors.primary : '#64748b'} />
                        )}
                      </View>

                      <View style={{ flex: 1, marginHorizontal: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.addressLabel}>{addr.label}</Text>
                          {isActive && (
                            <View style={styles.activeTag}>
                              <Text style={styles.activeTagText}>Active</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressLine} numberOfLines={2}>
                          {addr.formattedAddress}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {isActive ? (
                          <View style={styles.checkBubble}>
                            <Check size={14} color="#ffffff" strokeWidth={3} />
                          </View>
                        ) : null}

                        {savedAddresses.length > 1 && (
                          <TouchableOpacity
                            onPress={() => addr.id && deleteAddress(addr.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Trash2 size={16} color="#cbd5e1" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* 3. Popular Service Hubs */}
                <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                  <Text style={styles.sectionTitle}>QUICK SERVICE HUBS</Text>
                  <Sparkles size={13} color="#94a3b8" />
                </View>

                <View style={styles.presetChipsRow}>
                  {PRESET_CITIES.map((cityItem) => (
                    <TouchableOpacity
                      key={cityItem.name}
                      style={styles.presetChip}
                      onPress={() => handleSelectPreset(cityItem)}
                      activeOpacity={0.7}
                    >
                      <MapPin size={12} color={NexoraColors.primary} />
                      <Text style={styles.presetChipText}>{cityItem.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              /* Manual Address Form */
              <View style={styles.manualForm}>
                {/* Tag Selection */}
                <Text style={styles.inputLabel}>ADDRESS TYPE</Text>
                <View style={styles.tagSelectorRow}>
                  {(['Home', 'Work', 'Other'] as const).map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagButton, selectedTag === tag && styles.tagButtonActive]}
                      onPress={() => setSelectedTag(tag)}
                      activeOpacity={0.8}
                    >
                      {tag === 'Home' ? (
                        <Home size={14} color={selectedTag === tag ? '#ffffff' : '#64748b'} />
                      ) : tag === 'Work' ? (
                        <Briefcase size={14} color={selectedTag === tag ? '#ffffff' : '#64748b'} />
                      ) : (
                        <MapPin size={14} color={selectedTag === tag ? '#ffffff' : '#64748b'} />
                      )}
                      <Text
                        style={[
                          styles.tagButtonText,
                          selectedTag === tag && styles.tagButtonTextActive,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Street Address */}
                <Text style={styles.inputLabel}>STREET ADDRESS / APT</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 1204 Market Street, Apt 4B"
                  placeholderTextColor="#94a3b8"
                  value={street}
                  onChangeText={setStreet}
                />

                {/* City & State */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.inputLabel}>CITY</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. San Francisco"
                      placeholderTextColor="#94a3b8"
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>STATE</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. CA"
                      placeholderTextColor="#94a3b8"
                      value={stateCode}
                      onChangeText={setStateCode}
                      autoCapitalize="characters"
                      maxLength={2}
                    />
                  </View>
                </View>

                {/* Postal Code */}
                <Text style={styles.inputLabel}>POSTAL / ZIP CODE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 94103"
                  placeholderTextColor="#94a3b8"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                />

                {/* Save CTA */}
                <TouchableOpacity
                  style={[
                    styles.saveAddressBtn,
                    (!city.trim() && !street.trim()) && { opacity: 0.5 },
                  ]}
                  onPress={handleSaveManualAddress}
                  disabled={!city.trim() && !street.trim()}
                  activeOpacity={0.8}
                >
                  <Plus size={18} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.saveAddressBtnText}>Save & Set as Active Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 15, 25, 0.65)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    maxHeight: '88%',
    ...Shadows.floating,
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: NexoraColors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    marginTop: 3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  segmentBtnActive: {
    backgroundColor: '#ffffff',
    ...Shadows.card,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  segmentTextActive: {
    color: NexoraColors.primary,
    fontWeight: '700',
  },
  bodyScroll: {
    maxHeight: 460,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  gpsPrimaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#084e8a',
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 20,
    ...Shadows.card,
  },
  gpsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  gpsCardSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94a3b8',
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: NexoraColors.primary,
    backgroundColor: '#eef5fc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 10,
  },
  addressCardActive: {
    borderColor: NexoraColors.primary,
    backgroundColor: '#fbfdff',
  },
  addressIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  activeTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  addressLine: {
    fontSize: 12,
    color: NexoraColors.textSecondary,
    marginTop: 2,
  },
  checkBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: NexoraColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  manualForm: {
    paddingTop: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#64748b',
    marginBottom: 6,
    marginTop: 12,
  },
  tagSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  tagButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagButtonActive: {
    backgroundColor: NexoraColors.primary,
    borderColor: NexoraColors.primary,
  },
  tagButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tagButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: NexoraColors.textPrimary,
  },
  saveAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: NexoraColors.primary,
    borderRadius: Radius.xl,
    paddingVertical: 14,
    marginTop: 22,
    ...Shadows.card,
  },
  saveAddressBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  radiusContainer: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.card,
  },
  radiusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  radiusSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  radiusActiveBadge: {
    backgroundColor: '#eef5fc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  radiusActiveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: NexoraColors.primary,
  },
  radiusPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.md,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusPillActive: {
    backgroundColor: NexoraColors.primary,
    borderColor: NexoraColors.primary,
  },
  radiusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  radiusPillTextActive: {
    color: '#ffffff',
  },
  autocompleteSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginHorizontal: 20,
    marginTop: 2,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  autocompleteInput: {
    flex: 1,
    fontSize: 13,
    color: NexoraColors.textPrimary,
    padding: 0,
  },
  suggestionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 20,
    marginBottom: 14,
    maxHeight: 220,
    overflow: 'hidden',
    ...Shadows.card,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  suggestionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eef5fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionMainText: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
  },
  suggestionSubText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
});
