import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { useSubscription } from './SubscriptionContext';
import { supabase } from '@/lib/supabase';
import { 
  CPPProgress, 
  CPPCompletion, 
  CPPCompletionStatus, 
  CPPVerificationType,
  CPPVerificationAllowance 
} from '@/types/cpp';
import { 
  CPP_STEPS, 
  CPP_WEIGHTS, 
  VERIFICATION_ALLOWANCE,
  CPP_UPSELL_TRIGGERS 
} from '@/constants/cpp';

const CPP_STORAGE_KEY = 'cpp_progress';
const CPP_COMPLETIONS_KEY = 'cpp_completions';

export const [CPPProvider, useCPP] = createContextHook(() => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  
  const [progress, setProgress] = useState<CPPProgress>({
    totalScore: 0,
    maxPossibleScore: 0,
    percentage: 0,
    verifiedCompletions: 0,
    unverifiedCompletions: 0,
    totalCompletions: 0,
    remainingVerifiedAllowance: 0,
    monthlyVerifiedAllowance: 0,
    nextResetDate: new Date(),
    completions: [],
    lastUpdated: new Date(),
  });

  const [verificationAllowance, setVerificationAllowance] = useState<CPPVerificationAllowance>({
    monthlyLimit: 0,
    usedThisMonth: 0,
    remainingThisMonth: 0,
    nextResetDate: new Date(),
    canPurchaseMore: false,
    additionalPurchasePrice: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load CPP data on mount and user change
  useEffect(() => {
    if (user) {
      loadCPPData();
    }
  }, [user]);

  // Update verification allowance when subscription changes
  useEffect(() => {
    updateVerificationAllowance();
  }, [subscription]);

  const loadCPPData = async () => {
    try {
      setIsLoading(true);
      
      // Load from local storage first
      const storedProgress = await AsyncStorage.getItem(CPP_STORAGE_KEY);
      const storedCompletions = await AsyncStorage.getItem(CPP_COMPLETIONS_KEY);
      
      let completions: CPPCompletion[] = [];
      if (storedCompletions) {
        completions = JSON.parse(storedCompletions).map((comp: any) => ({
          ...comp,
          verifiedAt: comp.verifiedAt ? new Date(comp.verifiedAt) : undefined,
          completedAt: comp.completedAt ? new Date(comp.completedAt) : undefined,
        }));
      }

      // Initialize completions for all steps if none exist
      if (completions.length === 0) {
        completions = CPP_STEPS.map(step => ({
          id: step.id,
          type: step.verificationType,
          status: 'not_started' as CPPCompletionStatus,
          title: step.title,
          description: step.description,
          category: step.category,
          weight: step.weight,
        }));
      }

      // Calculate progress
      const calculatedProgress = calculateProgress(completions);
      
      setProgress(calculatedProgress);
      
      // Save to local storage
      await AsyncStorage.setItem(CPP_COMPLETIONS_KEY, JSON.stringify(completions));
      await AsyncStorage.setItem(CPP_STORAGE_KEY, JSON.stringify(calculatedProgress));
      
    } catch (error) {
      console.error('Error loading CPP data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (completions: CPPCompletion[]): CPPProgress => {
    let totalScore = 0;
    let verifiedCompletions = 0;
    let unverifiedCompletions = 0;
    let maxPossibleScore = 0;

    completions.forEach(completion => {
      const step = CPP_STEPS.find(s => s.id === completion.id);
      if (!step) return;

      maxPossibleScore += step.weight * CPP_WEIGHTS.VERIFIED_MULTIPLIER;

      if (completion.status === 'verified') {
        totalScore += step.weight * CPP_WEIGHTS.VERIFIED_MULTIPLIER;
        verifiedCompletions++;
      } else if (completion.status === 'unverified') {
        totalScore += step.weight * CPP_WEIGHTS.UNVERIFIED_MULTIPLIER;
        unverifiedCompletions++;
      }
    });

    // Apply the rule that you can't reach 100% without enough verified completions
    let percentage = (totalScore / maxPossibleScore) * 100;
    
    if (verifiedCompletions < CPP_WEIGHTS.MIN_VERIFIED_FOR_100_PERCENT) {
      percentage = Math.min(percentage, CPP_WEIGHTS.MAX_PERCENTAGE_WITHOUT_VERIFIED);
    }

    return {
      totalScore,
      maxPossibleScore,
      percentage: Math.round(percentage * 100) / 100,
      verifiedCompletions,
      unverifiedCompletions,
      totalCompletions: verifiedCompletions + unverifiedCompletions,
      remainingVerifiedAllowance: verificationAllowance.remainingThisMonth,
      monthlyVerifiedAllowance: verificationAllowance.monthlyLimit,
      nextResetDate: verificationAllowance.nextResetDate,
      completions,
      lastUpdated: new Date(),
    };
  };

  const updateVerificationAllowance = useCallback(() => {
    const tier = subscription.tier;
    const allowance = VERIFICATION_ALLOWANCE[tier];
    
    // Calculate next reset date (first day of next month)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Check if we need to reset monthly usage
    const lastReset = progress.lastUpdated;
    const shouldReset = lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();
    
    const usedThisMonth = shouldReset ? 0 : progress.verifiedCompletions;
    const remainingThisMonth = Math.max(0, allowance.monthlyLimit - usedThisMonth);

    setVerificationAllowance({
      monthlyLimit: allowance.monthlyLimit,
      usedThisMonth,
      remainingThisMonth,
      nextResetDate: nextMonth,
      canPurchaseMore: allowance.canPurchaseMore,
      additionalPurchasePrice: allowance.additionalPurchasePrice,
    });
  }, [subscription, progress]);

  const markCompletion = async (
    stepId: string, 
    status: CPPCompletionStatus, 
    metadata?: any
  ) => {
    try {
      const step = CPP_STEPS.find(s => s.id === stepId);
      if (!step) {
        throw new Error('Invalid step ID');
      }

      // Check verification allowance for verified completions
      if (status === 'verified' && step.requiresVerification) {
        if (verificationAllowance.remainingThisMonth <= 0) {
          Alert.alert(
            'Verification Limit Reached',
            'You\'ve used all your monthly verifications. Upgrade to Premium or wait until next month.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Upgrade', onPress: () => {/* Navigate to subscription */} },
            ]
          );
          return;
        }
      }

      // Update completion
      const updatedCompletions = progress.completions.map(comp => {
        if (comp.id === stepId) {
          return {
            ...comp,
            status,
            completedAt: status !== 'not_started' ? new Date() : undefined,
            verifiedAt: status === 'verified' ? new Date() : undefined,
            metadata: status !== 'not_started' ? metadata : undefined,
          };
        }
        return comp;
      });

      // Recalculate progress
      const newProgress = calculateProgress(updatedCompletions);
      setProgress(newProgress);

      // Save to storage
      await AsyncStorage.setItem(CPP_COMPLETIONS_KEY, JSON.stringify(updatedCompletions));
      await AsyncStorage.setItem(CPP_STORAGE_KEY, JSON.stringify(newProgress));

      // Update verification allowance if needed
      if (status === 'verified' && step.requiresVerification) {
        updateVerificationAllowance();
      }

      // Show success message
      const statusText = status === 'verified' ? 'verified' : 
                        status === 'unverified' ? 'completed' : 
                        status === 'in_progress' ? 'started' : 'reset';
      Alert.alert('Success', `Step "${step.title}" has been ${statusText}.`);

    } catch (error) {
      console.error('Error marking completion:', error);
      Alert.alert('Error', 'Failed to update completion status.');
    }
  };

  const getStepProgress = (stepId: string) => {
    return progress.completions.find(comp => comp.id === stepId);
  };

  const getCategoryProgress = (category: string) => {
    const categoryCompletions = progress.completions.filter(comp => comp.category === category);
    const totalSteps = CPP_STEPS.filter(step => step.category === category).length;
    const completedSteps = categoryCompletions.filter(comp => 
      comp.status === 'verified' || comp.status === 'unverified'
    ).length;
    
    return {
      completed: completedSteps,
      total: totalSteps,
      percentage: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
    };
  };

  const getUpsellTriggers = () => {
    return CPP_UPSELL_TRIGGERS.filter(trigger => {
      const { conditions } = trigger;
      
      if (conditions.minPercentage && progress.percentage < conditions.minPercentage) {
        return false;
      }
      
      if (conditions.maxVerifiedCompletions && progress.verifiedCompletions > conditions.maxVerifiedCompletions) {
        return false;
      }
      
      if (conditions.requiresSubscription && subscription.tier === 'free') {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const resetProgress = async () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your CPP progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const resetCompletions = CPP_STEPS.map(step => ({
                id: step.id,
                type: step.verificationType,
                status: 'not_started' as CPPCompletionStatus,
                title: step.title,
                description: step.description,
                category: step.category,
                weight: step.weight,
              }));

              const resetProgress = calculateProgress(resetCompletions);
              setProgress(resetProgress);

              await AsyncStorage.setItem(CPP_COMPLETIONS_KEY, JSON.stringify(resetCompletions));
              await AsyncStorage.setItem(CPP_STORAGE_KEY, JSON.stringify(resetProgress));

              Alert.alert('Success', 'Your CPP progress has been reset.');
            } catch (error) {
              console.error('Error resetting progress:', error);
              Alert.alert('Error', 'Failed to reset progress.');
            }
          },
        },
      ]
    );
  };

  const purchaseAdditionalVerification = async () => {
    // This would integrate with your payment system
    Alert.alert(
      'Purchase Additional Verification',
      `Purchase an additional verification for $${verificationAllowance.additionalPurchasePrice}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              // Here you would integrate with your payment system
              // For now, we'll just update the allowance
              setVerificationAllowance(prev => ({
                ...prev,
                remainingThisMonth: prev.remainingThisMonth + 1,
              }));
              
              Alert.alert('Success', 'Additional verification purchased successfully!');
            } catch (error) {
              console.error('Error purchasing verification:', error);
              Alert.alert('Error', 'Failed to purchase verification.');
            }
          },
        },
      ]
    );
  };

  return {
    progress,
    verificationAllowance,
    isLoading,
    markCompletion,
    getStepProgress,
    getCategoryProgress,
    getUpsellTriggers,
    resetProgress,
    purchaseAdditionalVerification,
    updateVerificationAllowance,
  };
});

