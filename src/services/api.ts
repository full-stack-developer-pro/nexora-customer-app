import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production Render backend or local network fallback
export const API_BASE_URL = 'https://nexora-backend-16q8.onrender.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout to allow Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Automatically inject JWT token from AsyncStorage
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('nexora_customer_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore token read error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to unwrap data and handle unauthorized
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('nexora_customer_token');
      await AsyncStorage.removeItem('nexora_customer_user');
    }

    let message = error.response?.data?.message;

    if (!message) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        message = 'Server is waking up from sleep. Please wait a moment and try again.';
      } else if (error.message === 'Network Error') {
        message = 'Unable to connect to server. Please check your internet connection and try again.';
      } else {
        message = error.message || 'An unexpected network error occurred. Please try again.';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
