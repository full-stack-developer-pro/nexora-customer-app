import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import customerAuthService from '@/services/customerAuthService';

export interface CustomerLocation {
  id?: string;
  label: 'Home' | 'Work' | 'Other' | 'Current Location';
  formattedAddress: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

interface LocationContextType {
  activeLocation: CustomerLocation | null;
  savedAddresses: CustomerLocation[];
  searchRadius: number;
  isLocating: boolean;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  requestCurrentLocation: () => Promise<CustomerLocation | null>;
  setActiveLocation: (loc: CustomerLocation) => Promise<void>;
  setSearchRadius: (radius: number) => Promise<void>;
  saveAddress: (loc: CustomerLocation) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

const STORAGE_ACTIVE_LOCATION_KEY = '@nexora_customer_active_location';
const STORAGE_SAVED_ADDRESSES_KEY = '@nexora_customer_saved_addresses';
const STORAGE_SEARCH_RADIUS_KEY = '@nexora_customer_search_radius';

// Helper to verify 24-char hex MongoDB ObjectId
const isMongoId = (id?: string): boolean => Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));

// Default starter location for preview when user hasn't specified
export const DEFAULT_FALLBACK_LOCATION: CustomerLocation = {
  id: 'default_loc_1',
  label: 'Home',
  formattedAddress: '742 Evergreen Terrace, Springfield',
  street: '742 Evergreen Terrace',
  city: 'Springfield',
  state: 'OR',
  zipCode: '97477',
  country: 'United States',
  latitude: 44.0462,
  longitude: -123.022,
  isDefault: true,
};

const LocationContext = createContext<LocationContextType | null>(null);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLocation, setActiveLocationState] = useState<CustomerLocation | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<CustomerLocation[]>([]);
  const [searchRadius, setSearchRadiusState] = useState<number>(25);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Load cached location & saved addresses on startup, then sync with backend
  useEffect(() => {
    const loadCachedLocation = async () => {
      try {
        const [savedActive, savedList, savedRadius] = await Promise.all([
          AsyncStorage.getItem(STORAGE_ACTIVE_LOCATION_KEY),
          AsyncStorage.getItem(STORAGE_SAVED_ADDRESSES_KEY),
          AsyncStorage.getItem(STORAGE_SEARCH_RADIUS_KEY),
        ]);

        if (savedRadius) {
          const parsed = parseInt(savedRadius, 10);
          if (!isNaN(parsed) && parsed > 0) setSearchRadiusState(parsed);
        }

        if (savedActive) {
          try {
            setActiveLocationState(JSON.parse(savedActive));
          } catch {
            setActiveLocationState(null);
          }
        } else {
          setActiveLocationState(null);
        }

        if (savedList) {
          try {
            setSavedAddresses(JSON.parse(savedList));
          } catch {
            setSavedAddresses([]);
          }
        } else {
          setSavedAddresses([]);
        }

        // Try syncing from backend if user is signed in
        const token = await customerAuthService.getToken();
        if (token) {
          customerAuthService
            .getAddresses()
            .then((serverAddresses) => {
              if (Array.isArray(serverAddresses) && serverAddresses.length > 0) {
                const mapped: CustomerLocation[] = serverAddresses.map((a: any) => ({
                  id: a._id,
                  label: a.label || 'Home',
                  formattedAddress: a.formattedAddress,
                  street: a.street,
                  city: a.city,
                  state: a.state,
                  zipCode: a.zipCode,
                  country: a.country,
                  latitude: a.latitude,
                  longitude: a.longitude,
                  isDefault: a.isDefault,
                }));
                setSavedAddresses(mapped);
                AsyncStorage.setItem(STORAGE_SAVED_ADDRESSES_KEY, JSON.stringify(mapped)).catch(() => {});

                // If default found on server, set as active
                const defaultAddr = mapped.find((m) => m.isDefault);
                if (defaultAddr) {
                  setActiveLocationState(defaultAddr);
                  AsyncStorage.setItem(STORAGE_ACTIVE_LOCATION_KEY, JSON.stringify(defaultAddr)).catch(() => {});
                }
              }
            })
            .catch(() => {});
        }

        // Check if permission already granted
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.granted) {
          setPermissionStatus('granted');
        } else if (perm.status === 'denied') {
          setPermissionStatus('denied');
        }
      } catch (err) {
        console.warn('Error loading cached location:', err);
        setActiveLocationState(null);
      }
    };

    loadCachedLocation();
  }, []);

  // Request live device GPS location
  const requestCurrentLocation = async (): Promise<CustomerLocation | null> => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionStatus('denied');
        Alert.alert(
          'Location Permission Required',
          'Please grant location access in device settings so Nexora can connect you with local vetted pros and hardware in your area.',
          [{ text: 'OK' }]
        );
        return null;
      }

      setPermissionStatus('granted');

      // Get accurate GPS coordinates
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;

      // Reverse geocode to readable address
      let formatted = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      let street = '';
      let city = '';
      let state = '';
      let zipCode = '';
      let country = '';

      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          const item = reverse[0];
          const parts: string[] = [];
          if (item.streetNumber || item.street) {
            street = [item.streetNumber, item.street].filter(Boolean).join(' ');
            parts.push(street);
          } else if (item.name) {
            street = item.name;
            parts.push(item.name);
          }

          if (item.city || item.subregion) {
            city = item.city || item.subregion || '';
            parts.push(city);
          }
          if (item.region) {
            state = item.region;
            parts.push(state);
          }
          if (item.postalCode) {
            zipCode = item.postalCode;
          }
          if (item.country) {
            country = item.country;
          }

          if (parts.length > 0) {
            formatted = parts.join(', ');
          }
        }
      } catch (e) {
        console.warn('Reverse geocoding error:', e);
      }

      const newLocation: CustomerLocation = {
        id: `loc_${Date.now()}`,
        label: 'Current Location',
        formattedAddress: formatted,
        street,
        city,
        state,
        zipCode,
        country,
        latitude,
        longitude,
      };

      await setActiveLocation(newLocation);
      return newLocation;
    } catch (err: any) {
      console.warn('Failed to retrieve location:', err);
      Alert.alert('GPS Location Error', err?.message || 'Unable to detect current GPS position. You can enter your address manually.');
      return null;
    } finally {
      setIsLocating(false);
    }
  };

  // Set active location & persist
  const setActiveLocation = async (loc: CustomerLocation): Promise<void> => {
    setActiveLocationState(loc);
    try {
      await AsyncStorage.setItem(STORAGE_ACTIVE_LOCATION_KEY, JSON.stringify(loc));
      const token = await customerAuthService.getToken();
      if (token && isMongoId(loc.id)) {
        customerAuthService.setDefaultAddress(loc.id!).catch(() => {});
      }
    } catch (e) {
      console.warn('Error saving active location:', e);
    }
  };

  // Set search radius & persist
  const setSearchRadius = async (radius: number): Promise<void> => {
    setSearchRadiusState(radius);
    try {
      await AsyncStorage.setItem(STORAGE_SEARCH_RADIUS_KEY, String(radius));
    } catch (e) {
      console.warn('Error saving search radius:', e);
    }
  };

  // Save an address to saved list and sync with backend
  const saveAddress = async (loc: CustomerLocation): Promise<void> => {
    const updated = [
      loc,
      ...savedAddresses.filter((a) => a.id !== loc.id && a.formattedAddress !== loc.formattedAddress),
    ];
    setSavedAddresses(updated);
    setActiveLocationState(loc);
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_SAVED_ADDRESSES_KEY, JSON.stringify(updated)),
        AsyncStorage.setItem(STORAGE_ACTIVE_LOCATION_KEY, JSON.stringify(loc)),
      ]);

      const token = await customerAuthService.getToken();
      if (token) {
        const serverAddresses = await customerAuthService.addAddress({
          label: loc.label,
          formattedAddress: loc.formattedAddress,
          street: loc.street,
          city: loc.city,
          state: loc.state,
          zipCode: loc.zipCode,
          country: loc.country,
          latitude: loc.latitude,
          longitude: loc.longitude,
          isDefault: true,
        });
        if (Array.isArray(serverAddresses) && serverAddresses.length > 0) {
          const mapped: CustomerLocation[] = serverAddresses.map((a: any) => ({
            id: a._id,
            label: a.label || 'Home',
            formattedAddress: a.formattedAddress,
            street: a.street,
            city: a.city,
            state: a.state,
            zipCode: a.zipCode,
            country: a.country,
            latitude: a.latitude,
            longitude: a.longitude,
            isDefault: a.isDefault,
          }));
          setSavedAddresses(mapped);
          AsyncStorage.setItem(STORAGE_SAVED_ADDRESSES_KEY, JSON.stringify(mapped)).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Error saving address:', e);
    }
  };

  // Delete an address
  const deleteAddress = async (id: string): Promise<void> => {
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);
    try {
      await AsyncStorage.setItem(STORAGE_SAVED_ADDRESSES_KEY, JSON.stringify(updated));
      const token = await customerAuthService.getToken();
      if (token && isMongoId(id)) {
        customerAuthService.deleteAddress(id).catch(() => {});
      }
    } catch (e) {
      console.warn('Error deleting address:', e);
    }
  };

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  return (
    <LocationContext.Provider
      value={{
        activeLocation,
        savedAddresses,
        searchRadius,
        isLocating,
        permissionStatus,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
        requestCurrentLocation,
        setActiveLocation,
        setSearchRadius,
        saveAddress,
        deleteAddress,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

