import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { 
  Award, 
  ArrowRight, 
  Clock
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useCPP } from '@/context/CPPContext';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SNOOZE_KEY = 'cpp_onboarding_snooze';
const SNOOZE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CPPOnboardingRibbonProps {
  onDismiss?: () => void;
}

export default function CPPOnboardingRibbon({ onDismiss }: CPPOnboardingRibbonProps) {
  const { user } = useAuth();
  const { progress } = useCPP();
  
  const [isVisible, setIsVisible] = useState(false);

  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    checkOnboardingStatus();
  }, [user, progress]);

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const checkOnboardingStatus = async () => {
    try {
      // Check if user has seen CPP intro
      if (!user?.has_seen_cpp_intro) {
        setIsVisible(true);
        return;
      }

      // Check if snoozed
      const snoozeData = await AsyncStorage.getItem(SNOOZE_KEY);
      if (snoozeData) {
        const { timestamp } = JSON.parse(snoozeData);
        const now = Date.now();
        if (now - timestamp < SNOOZE_DURATION) {
          setIsVisible(false);
          return;
        } else {
          // Snooze expired, remove it
          await AsyncStorage.removeItem(SNOOZE_KEY);
        }
      }

      // Check if onboarding is incomplete (low progress)
      if (progress.percentage < 20) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleContinueSetup = () => {
    setIsVisible(false);
    if (!user?.has_seen_cpp_intro) {
      router.push('/cpp-preview');
    } else {
      router.push('/cpp-setup');
    }
  };

  const handleSnooze = async () => {
    try {
      const snoozeData = {
        timestamp: Date.now(),
        userId: user?.id,
      };
      await AsyncStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozeData));
      setIsVisible(false);
    } catch (error) {
      console.error('Error snoozing onboarding ribbon:', error);
    }
  };



  if (!isVisible) {
    return null;
  }

  const isNewUser = !user?.has_seen_cpp_intro;
  const progressPercentage = Math.round(progress.percentage);

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.ribbon}>
        <View style={styles.ribbonContent}>
          <View style={styles.iconSection}>
            <Award size={20} color={Colors.white} />
          </View>
          
          <View style={styles.textSection}>
            <Text style={styles.title}>
              {isNewUser ? 'Welcome to Fit4Duty!' : 'Complete Your CPP Setup'}
            </Text>
            <Text style={styles.description}>
              {isNewUser 
                ? 'Start your journey to becoming a police officer with our Certified Preparation Progress system.'
                : `You're ${progressPercentage}% complete. Finish your setup to unlock your full potential.`
              }
            </Text>
          </View>
          
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinueSetup}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                {isNewUser ? 'Get Started' : 'Continue'}
              </Text>
              <ArrowRight size={16} color={Colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.snoozeButton}
              onPress={handleSnooze}
              activeOpacity={0.8}
            >
              <Clock size={14} color={Colors.white + 'CC'} />
              <Text style={styles.snoozeButtonText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
        

      </View>
      
      {/* Progress indicator for existing users */}
      {!isNewUser && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progressPercentage}% Complete</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  ribbon: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.medium,
  },
  ribbonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconSection: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.white + 'CC',
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  actionSection: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: Colors.white + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.white + '40',
  },
  continueButtonText: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '600',
    color: Colors.white,
  },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  snoozeButtonText: {
    fontSize: typography.bodySmall.fontSize,
    color: Colors.white + 'CC',
  },

  progressSection: {
    backgroundColor: Colors.primary + 'DD',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.white + '20',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.bodySmall.fontSize,
    color: Colors.white + 'CC',
    fontWeight: '500',
  },
});

