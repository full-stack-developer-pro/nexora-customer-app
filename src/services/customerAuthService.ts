import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

export interface CustomerUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'customer';
  status: 'approved' | 'pending_approval' | 'suspended';
  authProvider?: 'local' | 'google' | 'apple';
  createdAt?: string;
  addresses?: any[];
}

const STORAGE_KEYS = {
  TOKEN: 'nexora_customer_token',
  USER: 'nexora_customer_user',
};

export const customerAuthService = {
  /**
   * Retrieves locally cached customer session
   */
  getCachedUser: async (): Promise<CustomerUser | null> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Checks if customer JWT token exists
   */
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch {
      return null;
    }
  },

  /**
   * Customer Login via Email/Password
   */
  login: async (email: string, password: string): Promise<{ token: string; user: CustomerUser }> => {
    try {
      const res: any = await apiClient.post('/auth/signin', {
        email: email.trim().toLowerCase(),
        password,
      });

      const token = res?.data?.token || res?.token;
      const user = res?.data?.user || res?.user;

      if (!token || !user) {
        throw new Error(res?.message || 'Login failed. Please check your credentials.');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { token, user };
    } catch (err: any) {
      throw new Error(err.message || 'Login failed. Please check your credentials.');
    }
  },

  /**
   * Customer Registration
   */
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ token: string; user: CustomerUser }> => {
    try {
      const res: any = await apiClient.post('/auth/signup', {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        phone: payload.phone?.trim() || '',
        role: 'customer',
      });

      const token = res?.data?.token || res?.token;
      const user = res?.data?.user || res?.user;

      if (!token || !user) {
        throw new Error(res?.message || 'Registration failed. Please try again.');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { token, user };
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed. Please check your details.');
    }
  },

  /**
   * Customer Google OAuth Login / Signup
   */
  loginWithGoogle: async (idToken: string): Promise<{ token: string; user: CustomerUser }> => {
    try {
      const res: any = await apiClient.post('/auth/google', {
        idToken,
        role: 'customer',
      });

      const token = res?.data?.token || res?.token;
      const user = res?.data?.user || res?.user;

      if (!token || !user) {
        throw new Error(res?.message || 'Google sign-in failed. Please try again.');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { token, user };
    } catch (err: any) {
      throw new Error(err.message || 'Google authentication failed.');
    }
  },

  /**
   * Sync latest user profile from server
   */
  getMe: async (): Promise<CustomerUser | null> => {
    try {
      const res: any = await apiClient.get('/auth/me');
      const user = res?.data?.user || res?.user;
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return user;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Logout customer
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/signout').catch(() => {});
    } finally {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  /**
   * Address Management APIs
   */
  getAddresses: async (): Promise<any[]> => {
    try {
      const res: any = await apiClient.get('/auth/addresses');
      return res?.data || res || [];
    } catch {
      return [];
    }
  },

  addAddress: async (payload: any): Promise<any[]> => {
    try {
      const res: any = await apiClient.post('/auth/addresses', payload);
      return res?.data || res || [];
    } catch (err: any) {
      console.warn('Failed to sync address to backend:', err);
      return [];
    }
  },

  deleteAddress: async (id: string): Promise<any[]> => {
    try {
      const res: any = await apiClient.delete(`/auth/addresses/${id}`);
      return res?.data || res || [];
    } catch (err: any) {
      console.warn('Failed to delete address on backend:', err);
      return [];
    }
  },

  setDefaultAddress: async (id: string): Promise<any[]> => {
    try {
      const res: any = await apiClient.patch(`/auth/addresses/${id}/default`);
      return res?.data || res || [];
    } catch (err: any) {
      console.warn('Failed to set default address on backend:', err);
      return [];
    }
  },
};

export default customerAuthService;

