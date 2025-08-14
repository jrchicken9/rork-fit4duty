import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius } from '@/constants/designSystem';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  animated?: boolean;
  duration?: number;
}

export default function AnimatedProgressBar({
  progress,
  height = 8,
  showLabel = false,
  label,
  showPercentage = false,
  variant = 'default',
  animated = true,
  duration = 1000,
}: AnimatedProgressBarProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const progressValue = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progressValue,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progressValue);
    }
  }, [progressValue, animated, duration]);

  const getGradientColors = () => {
    switch (variant) {
      case 'success':
        return [Colors.gradients.success.start, Colors.gradients.success.end];
      case 'warning':
        return [Colors.gradients.warning.start, Colors.gradients.warning.end];
      case 'error':
        return [Colors.gradients.error.start, Colors.gradients.error.end];
      case 'gradient':
        return [Colors.gradients.primary.start, Colors.gradients.primary.end];
      default:
        return [Colors.primary, Colors.secondary];
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return Colors.success + '20';
      case 'warning':
        return Colors.warning + '20';
      case 'error':
        return Colors.error + '20';
      default:
        return Colors.border;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'error':
        return Colors.error;
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      {(showLabel || showPercentage) && (
        <View style={styles.labelRow}>
          {showLabel && label && (
            <Text style={[styles.label, { color: getTextColor() }]}>
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text style={[styles.percentage, { color: getTextColor() }]}>
              {Math.round(progressValue)}%
            </Text>
          )}
        </View>
      )}
      
      <View style={[styles.progressContainer, { height, backgroundColor: getBackgroundColor() }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={getGradientColors()}
            style={[styles.gradient, { height }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  percentage: {
    ...typography.labelMedium,
    fontWeight: '700',
  },
  progressContainer: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  gradient: {
    width: '100%',
    borderRadius: borderRadius.full,
  },
});
