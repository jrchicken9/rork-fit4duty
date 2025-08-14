import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import CPPService, { CompiledCPPData } from '@/lib/cppService';

export interface UseCPPDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useCPPData(options: UseCPPDataOptions = {}) {
  const { autoRefresh = false, refreshInterval = 30000 } = options; // 30 seconds default
  const { subscription } = useSubscription();
  
  const [data, setData] = useState<CompiledCPPData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      
      const compiledData = await CPPService.compileAllCPPData(subscription.tier);
      setData(compiledData);
      setLastUpdated(new Date());
      
      console.log('📊 CPP data loaded:', {
        percentage: compiledData.progress.percentage,
        completions: compiledData.progress.totalCompletions,
        categories: Object.keys(compiledData.categoryBreakdown).length
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load CPP data';
      setError(errorMessage);
      console.error('❌ Error loading CPP data:', err);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [subscription.tier]);

  const refreshData = useCallback(() => {
    CPPService.clearCache();
    loadData(false);
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  // Subscription tier change
  useEffect(() => {
    if (data) {
      refreshData();
    }
  }, [subscription.tier, refreshData, data]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh: refreshData,
    
    // Convenience getters
    progress: data?.progress || null,
    analytics: data?.analytics || null,
    badges: data?.badges || null,
    recommendations: data?.recommendations || [],
    categoryBreakdown: data?.categoryBreakdown || {},
    upsellTriggers: data?.upsellTriggers || [],
    
    // Quick access methods
    getProgressPercentage: () => data?.progress.percentage || 0,
    getTotalCompletions: () => data?.progress.totalCompletions || 0,
    getVerifiedCompletions: () => data?.progress.verifiedCompletions || 0,
    getCurrentBadge: () => data?.badges.current || null,
    getNextBadge: () => data?.badges.next || null,
    getTopRecommendation: () => data?.recommendations[0] || null,
    
    // Category helpers
    getCategoryProgress: (category: string) => data?.categoryBreakdown[category] || null,
    getCategoryPercentage: (category: string) => data?.categoryBreakdown[category]?.percentage || 0,
    
    // Status checks
    isReady: !isLoading && !error && data !== null,
    hasData: data !== null,
    needsVerification: (data?.progress.verifiedCompletions || 0) < 3,
    canReach100Percent: (data?.progress.verifiedCompletions || 0) >= 3,
  };
}

// Specialized hooks for specific use cases
export function useCPPProgress() {
  const { progress, isLoading, error, refresh } = useCPPData();
  
  return {
    progress,
    isLoading,
    error,
    refresh,
    percentage: progress?.percentage || 0,
    completions: progress?.totalCompletions || 0,
    verifications: progress?.verifiedCompletions || 0,
  };
}

export function useCPPBadges() {
  const { badges, isLoading, error, refresh } = useCPPData();
  
  return {
    badges,
    isLoading,
    error,
    refresh,
    current: badges?.current || null,
    next: badges?.next || null,
    all: badges?.all || [],
    progressToNext: badges?.next?.progressToNext || 0,
  };
}

export function useCPPRecommendations() {
  const { recommendations, isLoading, error, refresh } = useCPPData();
  
  return {
    recommendations,
    isLoading,
    error,
    refresh,
    top: recommendations[0] || null,
    high: recommendations.filter(r => r.priority === 'high'),
    medium: recommendations.filter(r => r.priority === 'medium'),
    low: recommendations.filter(r => r.priority === 'low'),
  };
}

export function useCPPAnalytics() {
  const { analytics, isLoading, error, refresh } = useCPPData({ autoRefresh: true });
  
  return {
    analytics,
    isLoading,
    error,
    refresh,
    totalTimeSpent: analytics?.totalTimeSpent || 0,
    averageSessionTime: analytics?.averageSessionTime || 0,
    completionRate: analytics?.completionRate || 0,
    verificationSuccessRate: analytics?.verificationSuccessRate || 0,
    currentStreak: analytics?.streaks.current || 0,
    longestStreak: analytics?.streaks.longest || 0,
    weeklyProgress: analytics?.weeklyProgress || [],
  };
}