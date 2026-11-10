import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View
} from 'react-native';
import { NexoraColors, Radius, Shadows } from '@/constants/theme';

interface NexoraButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const NexoraButton: React.FC<NexoraButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const isInteractive = !disabled && !loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        variant === 'primary' && Shadows.card,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? NexoraColors.primary : '#ffffff'}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.iconMargin}>{leftIcon}</View> : null}
          <Text
            style={[
              styles.textBase,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.iconMarginRight}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMargin: {
    marginRight: 8,
  },
  iconMarginRight: {
    marginLeft: 8,
  },
  textBase: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Variants
  primary: {
    backgroundColor: NexoraColors.primary,
  },
  text_primary: {
    color: '#ffffff',
  },

  secondary: {
    backgroundColor: NexoraColors.primaryLight,
    borderWidth: 1,
    borderColor: NexoraColors.primaryBorder,
  },
  text_secondary: {
    color: NexoraColors.primary,
  },

  outline: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: NexoraColors.border,
  },
  text_outline: {
    color: NexoraColors.textPrimary,
  },

  accent: {
    backgroundColor: NexoraColors.accent,
  },
  text_accent: {
    color: '#ffffff',
  },

  disabled: {
    opacity: 0.5,
  },

  // Sizes
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    height: 38,
  },
  textSize_sm: {
    fontSize: 13,
  },

  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 48,
  },
  textSize_md: {
    fontSize: 15,
  },

  size_lg: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    height: 54,
  },
  textSize_lg: {
    fontSize: 16,
  },
});

export default NexoraButton;

