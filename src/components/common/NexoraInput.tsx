import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { NexoraColors, Radius } from '@/constants/theme';
import { Eye, EyeOff } from 'lucide-react-native';

interface NexoraInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  onLayout?: (e: any) => void;
}

export const NexoraInput: React.FC<NexoraInputProps> = ({
  label,
  required = false,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  onLayout,
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    inputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    inputProps.onBlur?.(e);
  };

  const isRequired = required || label.endsWith('*');
  const cleanLabel = label.endsWith('*') ? label.slice(0, -1).trimEnd() : label;

  return (
    <View style={[styles.container, containerStyle]} onLayout={onLayout}>
      <Text style={styles.label}>
        {cleanLabel}
        {isRequired ? <Text style={styles.requiredAsterisk}> *</Text> : null}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconWrap}>{leftIcon}</View> : null}

        <TextInput
          style={styles.input}
          placeholderTextColor={NexoraColors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          {...inputProps}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.rightIconWrap}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={18} color={NexoraColors.textSecondary} />
            ) : (
              <Eye size={18} color={NexoraColors.textSecondary} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconWrap}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: NexoraColors.textPrimary,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: NexoraColors.statusRejected,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: NexoraColors.border,
    borderRadius: Radius.md,
    height: 48,
    paddingHorizontal: 12,
  },
  inputFocused: {
    borderColor: NexoraColors.primary,
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: NexoraColors.statusRejected,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: NexoraColors.textPrimary,
    height: '100%',
    paddingVertical: 0,
  },
  leftIconWrap: {
    marginRight: 10,
  },
  rightIconWrap: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: NexoraColors.statusRejected,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default NexoraInput;

