import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { NexoraColors, Radius } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraInput } from '@/components/common/NexoraInput';
import { NexoraButton } from '@/components/common/NexoraButton';
import { GoogleSignInButton } from '@/components/common/GoogleSignInButton';
import { promptGoogleAuth } from '@/services/googleAuthService';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle, isLoading } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const inputPositions = useRef<Record<string, number>>({});
  const sheetY = useRef(0);
  const activeFieldRef = useRef<string | null>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates.height;
      setKeyboardHeight(h);
      if (activeFieldRef.current && inputPositions.current[activeFieldRef.current] !== undefined) {
        const inputY = inputPositions.current[activeFieldRef.current];
        const targetScroll = Math.max(0, sheetY.current + inputY - 80);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: targetScroll, animated: true });
        }, 80);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      activeFieldRef.current = null;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToField = (key: string) => {
    activeFieldRef.current = key;
    const inputY = inputPositions.current[key];
    if (typeof inputY === 'number' && scrollViewRef.current) {
      const targetScroll = Math.max(0, sheetY.current + inputY - 80);
      scrollViewRef.current.scrollTo({ y: targetScroll, animated: true });
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: targetScroll, animated: true });
      }, 120);
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    const res = await promptGoogleAuth();
    if (res.success && res.idToken) {
      setGoogleLoading(true);
      try {
        await loginWithGoogle(res.idToken);
        router.replace('/(tabs)');
      } catch (err: any) {
        setErrorMessage(err.message || 'Google sign-in failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 0,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      >
        {/* Top Hero Brand Header */}
        <View style={[styles.heroHeader, { paddingTop: Math.max(insets.top, 24) + 28 }]}>
          <View style={styles.ambientGlow} />
          <View style={styles.headerContent}>
            <NexoraLogo size="lg" subtitle="LOCAL SERVICES & MARKETPLACE" inverted={true} />
            <Text style={styles.heroTitle}>Welcome Back</Text>
            <Text style={styles.heroSubtitle}>
              Sign in to book expert technicians, track orders, and discover local marketplace deals.
            </Text>
          </View>
        </View>

        {/* Native Mobile Edge-to-Edge Sheet */}
        <View
          onLayout={(e) => {
            sheetY.current = e.nativeEvent.layout.y;
          }}
          style={[
            styles.mobileSheet,
            { paddingBottom: keyboardHeight > 0 ? 30 : Math.max(insets.bottom, 24) + 24 },
          ]}
        >
          {/* Native Sheet Pull Indicator */}
          <View style={styles.sheetHandleWrap}>
            <View style={styles.sheetHandle} />
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Input Fields */}
          <NexoraInput
            label="Email Address"
            placeholder="e.g. alex@example.com"
            value={email}
            onChangeText={setEmail}
            onLayout={(e) => {
              inputPositions.current.email = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={NexoraColors.primary} />}
          />

          <NexoraInput
            label="Password"
            placeholder="••••••••••••"
            value={password}
            onChangeText={setPassword}
            onLayout={(e) => {
              inputPositions.current.password = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('password')}
            isPassword
            leftIcon={<Lock size={18} color={NexoraColors.primary} />}
          />

          <TouchableOpacity
            style={styles.forgotPasswordWrap}
            onPress={() =>
              Alert.alert(
                'Password Reset',
                'Please contact support or check back soon for password reset self-service.'
              )
            }
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <NexoraButton
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            rightIcon={<ArrowRight size={18} color="#ffffff" />}
            style={styles.submitBtn}
          />

          {/* Social Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-in */}
          <GoogleSignInButton
            onPress={handleGoogleLogin}
            loading={googleLoading}
            disabled={isLoading}
          />

          {/* New Account Prompt */}
          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>Don't have an account yet?</Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.applyBtnPill}
            >
              <Text style={styles.registerLink}>Create Customer Account →</Text>
            </TouchableOpacity>
          </View>

          {/* Security & Verification Footer */}
          <View style={styles.footerNote}>
            <ShieldCheck size={16} color={NexoraColors.statusApproved} />
            <Text style={styles.footerNoteText}>
              Nexora Shield™ Protected & Verified Ecosystem
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: NexoraColors.midnightDark,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: NexoraColors.midnightDark,
  },
  heroHeader: {
    backgroundColor: NexoraColors.midnightDark,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(8, 78, 138, 0.4)',
  },
  headerContent: {
    position: 'relative',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.6,
    marginTop: 18,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
  },
  mobileSheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
  },
  forgotPasswordWrap: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: NexoraColors.primary,
  },
  errorBox: {
    backgroundColor: NexoraColors.statusRejectedBg,
    borderColor: NexoraColors.statusRejectedBorder,
    borderWidth: 1,
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: 14,
  },
  errorText: {
    color: NexoraColors.statusRejected,
    fontSize: 12,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  registerPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    gap: 8,
  },
  registerPromptText: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
    textAlign: 'center',
  },
  applyBtnPill: {
    backgroundColor: NexoraColors.surfaceElevated,
    borderWidth: 1,
    borderColor: NexoraColors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
  },
  footerNoteText: {
    fontSize: 11,
    color: NexoraColors.textMuted,
    fontWeight: '500',
  },
});
