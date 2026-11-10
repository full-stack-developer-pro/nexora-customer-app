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
import { User, Mail, Phone, Lock, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { NexoraColors, Radius } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraInput } from '@/components/common/NexoraInput';
import { NexoraButton } from '@/components/common/NexoraButton';
import { GoogleSignInButton } from '@/components/common/GoogleSignInButton';
import { promptGoogleAuth } from '@/services/googleAuthService';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, loginWithGoogle, isLoading } = useAuth();
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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid email is required';
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message || 'Unable to create account. Please try again.');
    }
  };

  const handleGoogleSignup = async () => {
    const res = await promptGoogleAuth();
    if (res.success && res.idToken) {
      setGoogleLoading(true);
      try {
        await loginWithGoogle(res.idToken);
        router.replace('/(tabs)');
      } catch (err: any) {
        Alert.alert('Google Sign Up Error', err.message || 'Google sign-up failed.');
      } finally {
        setGoogleLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
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
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 26 }]}>
          <View style={styles.headerNav}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={20} color="#ffffff" />
            </TouchableOpacity>
            <NexoraLogo size="sm" showText={false} />
          </View>

          <Text style={styles.badgeLabel}>CUSTOMER REGISTRATION</Text>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Book certified service technicians, schedule deliveries, and track orders seamlessly.
          </Text>
        </View>

        {/* Native Mobile Sheet */}
        <View
          onLayout={(e) => {
            sheetY.current = e.nativeEvent.layout.y;
          }}
          style={[
            styles.mobileSheet,
            { paddingBottom: keyboardHeight > 0 ? 40 : Math.max(insets.bottom, 24) + 32 },
          ]}
        >
          <View style={styles.sheetHandleWrap}>
            <View style={styles.sheetHandle} />
          </View>

          <Text style={styles.sectionHeading}>Personal Details</Text>

          <NexoraInput
            label="Full Name"
            placeholder="e.g. Sarah Jenkins"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            onLayout={(e) => {
              inputPositions.current.name = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('name')}
            error={errors.name}
            leftIcon={<User size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraInput
            label="Email Address"
            placeholder="sarah@example.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            onLayout={(e) => {
              inputPositions.current.email = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraInput
            label="Phone Number (Optional)"
            placeholder="+1 (555) 012-3456"
            value={phone}
            onChangeText={setPhone}
            onLayout={(e) => {
              inputPositions.current.phone = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('phone')}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraInput
            label="Create Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            onLayout={(e) => {
              inputPositions.current.password = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('password')}
            error={errors.password}
            isPassword={true}
            leftIcon={<Lock size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            onLayout={(e) => {
              inputPositions.current.confirmPassword = e.nativeEvent.layout.y;
            }}
            onFocus={() => scrollToField('confirmPassword')}
            error={errors.confirmPassword}
            isPassword={true}
            leftIcon={<Lock size={18} color={NexoraColors.textSecondary} />}
          />

          <NexoraButton
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            rightIcon={<ArrowRight size={18} color="#ffffff" />}
            style={styles.submitBtn}
          />

          {/* Social Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign Up */}
          <GoogleSignInButton
            title="Sign Up with Google"
            onPress={handleGoogleSignup}
            loading={googleLoading}
          />

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
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
  header: {
    backgroundColor: NexoraColors.midnightDark,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 28,
    paddingHorizontal: 22,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93c5fd',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  mobileSheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: NexoraColors.textPrimary,
    marginBottom: 14,
  },
  submitBtn: {
    marginTop: 10,
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
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginPromptText: {
    fontSize: 13,
    color: NexoraColors.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: NexoraColors.primary,
  },
});

