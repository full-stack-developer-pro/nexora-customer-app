import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import { NexoraInput } from '@/components/common/NexoraInput';
import { NexoraButton } from '@/components/common/NexoraButton';
import { customerAuthService } from '@/services/customerAuthService';

export default function CustomerForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  // Step 1: Request 6-digit verification code
  const handleRequestCode = async () => {
    setErrorMessage('');
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await customerAuthService.requestPasswordReset(email.trim());
      setSuccessInfo(res.message);
      if (res.devOtp) {
        setOtp(res.devOtp);
      }
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and save new password
  const handleResetPassword = async () => {
    setErrorMessage('');
    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      await customerAuthService.resetPassword(email.trim(), otp.trim(), newPassword);
      Alert.alert(
        'Password Reset Successful! 🎉',
        'Your password has been updated. You can now sign in with your new credentials.',
        [
          {
            text: 'Sign In Now',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 24) + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Link */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (step === 2 ? setStep(1) : router.back())}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="#ffffff" />
          <Text style={styles.backButtonText}>
            {step === 2 ? 'Change Email' : 'Back to Login'}
          </Text>
        </TouchableOpacity>

        {/* Hero Header */}
        <View style={styles.heroSection}>
          <NexoraLogo size="sm" showText={false} />
          <Text style={styles.title}>
            {step === 1 ? 'Reset Your Password' : 'Enter Verification Code'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Enter your registered email address to receive a secure 6-digit reset code.'
              : `We sent a 6-digit verification code to ${email}.`}
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formCard}>
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successInfo && step === 2 ? (
            <View style={styles.infoBox}>
              <CheckCircle2 size={16} color="#059669" />
              <Text style={styles.infoText}>{successInfo}</Text>
            </View>
          ) : null}

          {step === 1 ? (
            <>
              <NexoraInput
                label="Email Address"
                placeholder="e.g. user@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={NexoraColors.primary} />}
              />

              <NexoraButton
                title="Send 6-Digit Code"
                onPress={handleRequestCode}
                loading={loading}
                style={styles.submitBtn}
              />
            </>
          ) : (
            <>
              <NexoraInput
                label="6-Digit Verification Code"
                placeholder="e.g. 849201"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                leftIcon={<KeyRound size={18} color={NexoraColors.primary} />}
              />

              <NexoraInput
                label="New Password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
                leftIcon={<Lock size={18} color={NexoraColors.primary} />}
              />

              <NexoraInput
                label="Confirm New Password"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                leftIcon={<Lock size={18} color={NexoraColors.primary} />}
              />

              <NexoraButton
                title="Set New Password & Sign In"
                onPress={handleResetPassword}
                loading={loading}
                style={styles.submitBtn}
              />

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleRequestCode}
                disabled={loading}
              >
                <Text style={styles.resendBtnText}>Didn't get code? Tap to Resend</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Security Assurance */}
          <View style={styles.securityRow}>
            <ShieldCheck size={16} color={NexoraColors.statusApproved} />
            <Text style={styles.securityText}>
              Encrypted end-to-end credential verification
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
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  heroSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 14,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    ...Shadows.card,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    color: '#065f46',
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 10,
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  resendBtnText: {
    color: NexoraColors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  securityText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
});
