import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_CONFIG = {
  webClientId:
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    '36861188152-ubio4ska6j42gf8l2k7p0530lon6vc79.apps.googleusercontent.com',
};

export interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  error?: string;
}

let isConfigured = false;

function setupNativeGoogleSignIn() {
  if (isConfigured) return true;
  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
      webClientId: GOOGLE_CONFIG.webClientId,
      offlineAccess: false,
    });
    isConfigured = true;
    return true;
  } catch (err) {
    console.warn('Native GoogleSignin not available in current environment:', err);
    return false;
  }
}

/**
 * Initiates Customer Google Sign-In:
 * 1. Attempts Native Google Play Services Account Picker popup first (in-app bottom sheet).
 * 2. Falls back to secure in-app WebBrowser if native Google Play Services is unlinked.
 */
export async function promptGoogleAuth(): Promise<GoogleAuthResult> {
  // 1. Try Native Google Play Services Account Picker
  try {
    const hasNative = setupNativeGoogleSignIn();
    if (hasNative) {
      const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response?.data?.idToken || response?.idToken;

      if (idToken) {
        return { success: true, idToken };
      }
    }
  } catch (nativeErr: any) {
    const { statusCodes } = require('@react-native-google-signin/google-signin');
    if (nativeErr?.code === statusCodes?.SIGN_IN_CANCELLED) {
      return { success: false, error: 'SIGN_IN_CANCELLED' };
    }
    console.warn('Native Google Sign-In fallback to web session:', nativeErr?.message);
  }

  // 2. Fallback: In-app browser auth session
  try {
    const redirectUri = Platform.select({
      ios: 'nexoracustomerapp:/oauthredirect',
      android: 'nexoracustomerapp:/oauthredirect',
      default: typeof window !== 'undefined' ? window.location.origin : '',
    });

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CONFIG.webClientId)}` +
      `&response_type=id_token` +
      `&scope=${encodeURIComponent('openid profile email')}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&nonce=${Math.random().toString(36).substring(2)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const fragment = result.url.split('#')[1] || result.url.split('?')[1];
      const params = new URLSearchParams(fragment);
      const idToken = params.get('id_token');

      if (idToken) {
        return { success: true, idToken };
      }
    }

    return { success: false, error: 'User cancelled authentication' };
  } catch (err: any) {
    console.error('Google Auth prompt error:', err);
    return { success: false, error: err?.message || 'Google Auth Error' };
  }
}

