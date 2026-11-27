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
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed && parsed.role && (parsed.role as any) !== 'customer') {
        // Automatically purge any stale or illegal cross-role provider session
        await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
        return null;
      }
      return parsed;
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
        expectedRole: 'customer',
        appType: 'customer',
      });

      const token = res?.data?.token || res?.token;
      const user = res?.data?.user || res?.user;

      if (!token || !user) {
        throw new Error(res?.message || 'Login failed. Please check your credentials.');
      }

      if (user.role && (user.role as any) !== 'customer') {
        throw new Error(
          'This account is registered as a Service Provider. Please sign in using the Nexora Provider App.'
        );
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
        expectedRole: 'customer',
        appType: 'customer',
      });

      const token = res?.data?.token || res?.token;
      const user = res?.data?.user || res?.user;

      if (!token || !user) {
        throw new Error(res?.message || 'Google sign-in failed. Please try again.');
      }

      if (user.role && (user.role as any) !== 'customer') {
        throw new Error(
          'This account is registered as a Service Provider. Please sign in using the Nexora Provider App.'
        );
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
        if (user.role && (user.role as any) !== 'customer') {
          // Immediately purge non-customer session
          await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
          return null;
        }
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return user;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Update current customer basic profile
   */
  updateProfile: async (payload: { name?: string; phone?: string; avatar?: string }): Promise<CustomerUser> => {
    try {
      const res: any = await apiClient.put('/auth/profile', payload);
      const user = res?.data?.user || res?.user;
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return user;
      }
      throw new Error(res?.message || 'Failed to update profile');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update profile');
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
    } catch {
      return [];
    }
  },

  setDefaultAddress: async (id: string): Promise<any[]> => {
    try {
      const res: any = await apiClient.patch(`/auth/addresses/${id}/default`);
      return res?.data || res || [];
    } catch {
      return [];
    }
  },

  /**
   * Request 6-digit OTP code to reset password
   */
  requestPasswordReset: async (
    email: string
  ): Promise<{ success: boolean; message: string; devOtp?: string }> => {
    try {
      const res: any = await apiClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      return {
        success: true,
        message: res?.message || 'Verification code sent to your email.',
        devOtp: res?.data?.devOtp,
      };
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to send password reset code.');
    }
  },

  /**
   * Verify OTP and set new password
   */
  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res: any = await apiClient.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });
      return {
        success: true,
        message: res?.message || 'Password reset successfully.',
      };
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to reset password. Please check the code.');
    }
  },
};

export default customerAuthService;

