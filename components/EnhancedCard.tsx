import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { spacing, borderRadius, shadows, componentStyles } from '@/constants/designSystem';

interface EnhancedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'heavy' | 'gradient';
  gradientColors?: string[];
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  animated?: boolean;
}

export default function EnhancedCard({
  children,
  variant = 'default',
  gradientColors,
  onPress,
  style,
  disabled = false,
  animated = true,
}: EnhancedCardProps) {
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return [componentStyles.cardElevated, style];
      case 'heavy':
        return [componentStyles.cardHeavy, style];
      case 'gradient':
        return [componentStyles.card, style];
      default:
        return [componentStyles.card, style];
    }
  };

  const getGradientColors = () => {
    if (gradientColors) return gradientColors;
    
    switch (variant) {
      case 'gradient':
        return [Colors.gradients.primary.start, Colors.gradients.primary.end];
      default:
        return [Colors.card, Colors.card];
    }
  };

  const CardContent = () => (
    <View style={getCardStyle()}>
      {children}
    </View>
  );

  const GradientCardContent = () => (
    <LinearGradient
      colors={getGradientColors()}
      style={[componentStyles.card, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={animated ? 0.8 : 1}
        style={disabled && styles.disabled}
      >
        {variant === 'gradient' ? <GradientCardContent /> : <CardContent />}
      </TouchableOpacity>
    );
  }

  return variant === 'gradient' ? <GradientCardContent /> : <CardContent />;
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
});
