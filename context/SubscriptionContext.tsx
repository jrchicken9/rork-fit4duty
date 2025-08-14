import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { 
  SubscriptionTier, 
  SUBSCRIPTION_PLANS, 
  ONE_TIME_SERVICES, 
  PROMOTIONAL_OFFERS,
  FeatureAccess 
} from '../constants/monetization';

export type SubscriptionStatus = {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt: Date | null;
  features: FeatureAccess;
  usage: {
    digitalTestsThisMonth: number;
    lastUsageReset: Date;
  };
  purchaseHistory: {
    id: string;
    type: 'subscription' | 'one-time';
    amount: number;
    date: Date;
    serviceId?: string;
  }[];
};

const SUBSCRIPTION_STORAGE_KEY = 'subscription_status';
const USAGE_STORAGE_KEY = 'usage_tracking';

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    tier: 'free',
    isActive: true,
    expiresAt: null,
    features: SUBSCRIPTION_PLANS.free.features,
    usage: {
      digitalTestsThisMonth: 0,
      lastUsageReset: new Date(),
    },
    purchaseHistory: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load subscription status from storage
  useEffect(() => {
    loadSubscriptionStatus();
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      const usageStored = await AsyncStorage.getItem(USAGE_STORAGE_KEY);
      
      if (stored) {
        const parsedSubscription = JSON.parse(stored);
        // Convert dates back to Date objects
        if (parsedSubscription.expiresAt) {
          parsedSubscription.expiresAt = new Date(parsedSubscription.expiresAt);
        }
        if (parsedSubscription.usage?.lastUsageReset) {
          parsedSubscription.usage.lastUsageReset = new Date(parsedSubscription.usage.lastUsageReset);
        }
        if (parsedSubscription.purchaseHistory && Array.isArray(parsedSubscription.purchaseHistory)) {
          parsedSubscription.purchaseHistory = parsedSubscription.purchaseHistory.map((purchase: any) => ({
            ...purchase,
            date: new Date(purchase.date),
          }));
        } else {
          parsedSubscription.purchaseHistory = [];
        }
        
        // Ensure tier is valid
        if (!parsedSubscription.tier || !SUBSCRIPTION_PLANS[parsedSubscription.tier]) {
          parsedSubscription.tier = 'free';
          parsedSubscription.features = SUBSCRIPTION_PLANS.free.features;
        }
        
        // Ensure usage is valid
        if (!parsedSubscription.usage) {
          parsedSubscription.usage = {
            digitalTestsThisMonth: 0,
            lastUsageReset: new Date(),
          };
        }
        
        // Ensure features are valid
        if (!parsedSubscription.features) {
          parsedSubscription.features = SUBSCRIPTION_PLANS[parsedSubscription.tier].features;
        }
        
        setSubscription(parsedSubscription);
      }
      
      if (usageStored) {
        const parsedUsage = JSON.parse(usageStored);
        if (parsedUsage.lastUsageReset) {
          parsedUsage.lastUsageReset = new Date(parsedUsage.lastUsageReset);
        }
        setSubscription(prev => ({
          ...prev,
          usage: parsedUsage,
        }));
      }
      
      // Check if usage needs to be reset (new month)
      checkAndResetUsage();
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSubscriptionStatus = async (status: SubscriptionStatus) => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(status));
      await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(status.usage));
    } catch (error) {
      console.error('Error saving subscription status:', error);
    }
  };

  const checkAndResetUsage = () => {
    if (!subscription.usage || !subscription.usage.lastUsageReset) {
      return;
    }
    
    const now = new Date();
    const lastReset = subscription.usage.lastUsageReset;
    
    // Reset if it's a new month
    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
      const updatedSubscription = {
        ...subscription,
        usage: {
          digitalTestsThisMonth: 0,
          lastUsageReset: now,
        },
      };
      setSubscription(updatedSubscription);
      saveSubscriptionStatus(updatedSubscription);
    }
  };

  const subscribeToPlan = async (tier: SubscriptionTier, usePromotionalOffer = false) => {
    try {
      console.log(`Subscribing to ${tier} plan`);
      
      let expiresAt: Date | null = null;
      let price = SUBSCRIPTION_PLANS[tier].price;
      
      if (tier === 'premium') {
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        
        // Apply promotional offer if available
        if (usePromotionalOffer && !hasUsedPromotionalOffer()) {
          price = PROMOTIONAL_OFFERS.firstMonthDiscount.discountedPrice;
        }
      }

      const newSubscription: SubscriptionStatus = {
        tier,
        isActive: true,
        expiresAt,
        features: SUBSCRIPTION_PLANS[tier].features,
        usage: subscription.usage,
        purchaseHistory: [
          ...(subscription.purchaseHistory || []),
          {
            id: `sub_${Date.now()}`,
            type: 'subscription',
            amount: price,
            date: new Date(),
          },
        ],
      };

      setSubscription(newSubscription);
      await saveSubscriptionStatus(newSubscription);
      
      const offerText = usePromotionalOffer ? ' with promotional discount' : '';
      Alert.alert(
        'Subscription Successful!',
        `You've successfully subscribed to the ${tier} plan${offerText}. Enjoy your premium features!`
      );
      
      return { success: true };
    } catch (error: any) {
      console.error('Subscription error:', error);
      Alert.alert('Subscription Failed', 'There was an error processing your subscription. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const purchaseOneTimeService = async (serviceId: string) => {
    try {
      const service = ONE_TIME_SERVICES.find(s => s.id === serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      let price = service.price;
      
      // Apply subscriber discount if applicable
      if (subscription.tier === 'premium') {
        price = price * (1 - PROMOTIONAL_OFFERS.subscriberDiscount.discountPercentage / 100);
      }

      const newSubscription: SubscriptionStatus = {
        ...subscription,
        purchaseHistory: [
          ...(subscription.purchaseHistory || []),
          {
            id: `service_${Date.now()}`,
            type: 'one-time',
            amount: price,
            date: new Date(),
            serviceId,
          },
        ],
      };

      setSubscription(newSubscription);
      await saveSubscriptionStatus(newSubscription);
      
      const discountText = subscription.tier === 'premium' ? ' (with subscriber discount)' : '';
      Alert.alert(
        'Purchase Successful!',
        `You've successfully purchased ${service.title}${discountText}. We'll contact you with booking details.`
      );
      
      return { success: true };
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert('Purchase Failed', 'There was an error processing your purchase. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const cancelSubscription = async () => {
    try {
      console.log('Cancelling subscription');
      
      const cancelledSubscription: SubscriptionStatus = {
        ...subscription,
        tier: 'free',
        isActive: true,
        expiresAt: null,
        features: SUBSCRIPTION_PLANS.free.features,
      };

      setSubscription(cancelledSubscription);
      await saveSubscriptionStatus(cancelledSubscription);
      
      Alert.alert(
        'Subscription Cancelled',
        'Your subscription has been cancelled. You can continue using the free features.'
      );
      
      return { success: true };
    } catch (error: any) {
      console.error('Cancellation error:', error);
      Alert.alert('Cancellation Failed', 'There was an error cancelling your subscription. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const trackDigitalTestUsage = async () => {
    const currentUsage = subscription.usage || {
      digitalTestsThisMonth: 0,
      lastUsageReset: new Date(),
    };
    
    const updatedUsage = {
      ...currentUsage,
      digitalTestsThisMonth: currentUsage.digitalTestsThisMonth + 1,
    };
    
    const updatedSubscription = {
      ...subscription,
      usage: updatedUsage,
    };
    
    setSubscription(updatedSubscription);
    await saveSubscriptionStatus(updatedSubscription);
  };

  const canAccessDigitalTest = (): boolean => {
    if (!subscription.usage || typeof subscription.usage.digitalTestsThisMonth !== 'number') {
      return true; // Allow access if usage data is missing
    }
    
    if (!subscription.features?.digitalTests?.monthlyLimit) {
      return true; // Allow access if features are missing
    }
    
    const limit = subscription.features.digitalTests.monthlyLimit;
    return limit === -1 || subscription.usage.digitalTestsThisMonth < limit;
  };

  const canAccessTrainingPlan = (weekNumber: number): boolean => {
    if (!subscription.features?.trainingPlans?.unlockedWeeks) {
      return weekNumber <= 2; // Default to free tier limit
    }
    
    const unlockedWeeks = subscription.features.trainingPlans.unlockedWeeks;
    return unlockedWeeks === -1 || weekNumber <= unlockedWeeks;
  };

  const canAccessFeature = (feature: keyof FeatureAccess): boolean => {
    if (!subscription.features) {
      return false; // No features available
    }
    
    switch (feature) {
      case 'digitalTests':
        return canAccessDigitalTest();
      case 'trainingPlans':
        return true; // Check specific week access instead
      case 'interviewPrep':
        return subscription.features.interviewPrep?.sampleQuestions || false;
      case 'community':
        return subscription.features.community?.canPost || false;
      case 'booking':
        return subscription.features.booking?.priorityBooking || false;
      case 'progressTracking':
        return subscription.features.progressTracking?.passProbabilityTracker || false;
      default:
        return false;
    }
  };

  const hasUsedPromotionalOffer = (): boolean => {
    if (!subscription.purchaseHistory || !Array.isArray(subscription.purchaseHistory)) {
      return false;
    }
    return subscription.purchaseHistory.some(purchase => 
      purchase.type === 'subscription' && 
      purchase.amount === PROMOTIONAL_OFFERS.firstMonthDiscount.discountedPrice
    );
  };

  const isSubscriptionExpired = (): boolean => {
    if (!subscription.expiresAt) return false;
    return new Date() > subscription.expiresAt;
  };

  const getDaysUntilExpiry = (): number | null => {
    if (!subscription.expiresAt) return null;
    const now = new Date();
    const diffTime = subscription.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRemainingDigitalTests = (): number => {
    if (!subscription.usage || typeof subscription.usage.digitalTestsThisMonth !== 'number') {
      return 2; // Default to free tier limit
    }
    
    if (!subscription.features?.digitalTests?.monthlyLimit) {
      return 2; // Default to free tier limit
    }
    
    const limit = subscription.features.digitalTests.monthlyLimit;
    if (limit === -1) return -1; // unlimited
    return Math.max(0, limit - subscription.usage.digitalTestsThisMonth);
  };

  return {
    subscription,
    isLoading,
    subscribeToPlan,
    purchaseOneTimeService,
    cancelSubscription,
    trackDigitalTestUsage,
    canAccessDigitalTest,
    canAccessTrainingPlan,
    canAccessFeature,
    hasUsedPromotionalOffer,
    isSubscriptionExpired,
    getDaysUntilExpiry,
    getRemainingDigitalTests,
  };
});