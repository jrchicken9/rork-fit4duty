import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  CPPProgress, 
  CPPCompletion, 
  CPPCompletionStatus, 
  CPPVerificationType,
  CPPVerificationAllowance,
  CPPStep,
  CPPUpsellTrigger
} from '@/types/cpp';
import { 
  CPP_STEPS, 
  CPP_WEIGHTS, 
  VERIFICATION_ALLOWANCE,
  CPP_UPSELL_TRIGGERS,
  CPP_CATEGORIES,
  CPP_PROGRESS_MESSAGES
} from '@/constants/cpp';

const CPP_STORAGE_KEY = 'cpp_progress';
const CPP_COMPLETIONS_KEY = 'cpp_completions';
const CPP_ANALYTICS_KEY = 'cpp_analytics';

export interface CPPAnalytics {
  totalTimeSpent: number; // in minutes
  averageSessionTime: number;
  completionRate: number;
  verificationSuccessRate: number;
  categoryProgress: {
    [key: string]: {
      completed: number;
      total: number;
      percentage: number;
      timeSpent: number;
    };
  };
  weeklyProgress: {
    week: string;
    completions: number;
    verifications: number;
    timeSpent: number;
  }[];
  achievements: {
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
    category: string;
  }[];
  streaks: {
    current: number;
    longest: number;
    lastActivity: Date;
  };
}

export interface CompiledCPPData {
  progress: CPPProgress;
  analytics: CPPAnalytics;
  verificationAllowance: CPPVerificationAllowance;
  availableSteps: CPPStep[];
  completedSteps: CPPCompletion[];
  pendingSteps: CPPCompletion[];
  upsellTriggers: CPPUpsellTrigger[];
  categoryBreakdown: {
    [key: string]: {
      name: string;
      color: string;
      icon: string;
      completed: number;
      total: number;
      percentage: number;
      steps: CPPCompletion[];
    };
  };
  progressMessage: {
    title: string;
    message: string;
    color: string;
  };
  recommendations: {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    action: string;
    stepId?: string;
  }[];
  badges: {
    current: {
      id: string;
      name: string;
      threshold: number;
      description: string;
    };
    next: {
      id: string;
      name: string;
      threshold: number;
      description: string;
      progressToNext: number;
    } | null;
    all: {
      id: string;
      name: string;
      threshold: number;
      unlocked: boolean;
      description: string;
    }[];
  };
}

class CPPService {
  private static instance: CPPService;
  private compiledData: CompiledCPPData | null = null;
  private lastCompiled: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CPPService {
    if (!CPPService.instance) {
      CPPService.instance = new CPPService();
    }
    return CPPService.instance;
  }

  async compileAllCPPData(subscriptionTier: 'free' | 'premium' = 'free'): Promise<CompiledCPPData> {
    // Check cache first
    if (this.compiledData && this.lastCompiled && 
        (Date.now() - this.lastCompiled.getTime()) < this.CACHE_DURATION) {
      return this.compiledData;
    }

    console.log('🔄 Compiling CPP data...');
    
    try {
      // Load stored data
      const [storedProgress, storedCompletions, storedAnalytics] = await Promise.all([
        this.loadStoredProgress(),
        this.loadStoredCompletions(),
        this.loadStoredAnalytics()
      ]);

      // Calculate current progress
      const progress = this.calculateProgress(storedCompletions);
      
      // Calculate verification allowance
      const verificationAllowance = this.calculateVerificationAllowance(subscriptionTier, progress);
      
      // Compile analytics
      const analytics = this.compileAnalytics(storedCompletions, storedAnalytics);
      
      // Get category breakdown
      const categoryBreakdown = this.getCategoryBreakdown(storedCompletions);
      
      // Get progress message
      const progressMessage = this.getProgressMessage(progress.percentage);
      
      // Get recommendations
      const recommendations = this.getRecommendations(progress, subscriptionTier);
      
      // Get upsell triggers
      const upsellTriggers = this.getUpsellTriggers(progress, subscriptionTier);
      
      // Get badge information
      const badges = this.getBadgeInformation(progress.percentage);
      
      // Separate completed and pending steps
      const completedSteps = storedCompletions.filter(comp => 
        comp.status === 'verified' || comp.status === 'unverified'
      );
      const pendingSteps = storedCompletions.filter(comp => 
        comp.status === 'in_progress' || comp.status === 'not_started'
      );

      this.compiledData = {
        progress,
        analytics,
        verificationAllowance,
        availableSteps: CPP_STEPS,
        completedSteps,
        pendingSteps,
        upsellTriggers,
        categoryBreakdown,
        progressMessage,
        recommendations,
        badges
      };
      
      this.lastCompiled = new Date();
      
      // Save compiled data for quick access
      await this.saveCompiledData(this.compiledData);
      
      console.log('✅ CPP data compiled successfully:', {
        percentage: progress.percentage,
        completions: progress.totalCompletions,
        verifications: progress.verifiedCompletions,
        categories: Object.keys(categoryBreakdown).length
      });
      
      return this.compiledData;
      
    } catch (error) {
      console.error('❌ Error compiling CPP data:', error);
      throw error;
    }
  }

  private async loadStoredProgress(): Promise<CPPProgress | null> {
    try {
      const stored = await AsyncStorage.getItem(CPP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
          nextResetDate: new Date(parsed.nextResetDate)
        };
      }
    } catch (error) {
      console.error('Error loading stored progress:', error);
    }
    return null;
  }

  private async loadStoredCompletions(): Promise<CPPCompletion[]> {
    try {
      const stored = await AsyncStorage.getItem(CPP_COMPLETIONS_KEY);
      if (stored) {
        return JSON.parse(stored).map((comp: any) => ({
          ...comp,
          verifiedAt: comp.verifiedAt ? new Date(comp.verifiedAt) : undefined,
          completedAt: comp.completedAt ? new Date(comp.completedAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Error loading stored completions:', error);
    }
    
    // Initialize with default completions if none exist
    return CPP_STEPS.map(step => ({
      id: step.id,
      type: step.verificationType,
      status: 'not_started' as CPPCompletionStatus,
      title: step.title,
      description: step.description,
      category: step.category,
      weight: step.weight,
    }));
  }

  private async loadStoredAnalytics(): Promise<Partial<CPPAnalytics>> {
    try {
      const stored = await AsyncStorage.getItem(CPP_ANALYTICS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          achievements: parsed.achievements?.map((ach: any) => ({
            ...ach,
            unlockedAt: new Date(ach.unlockedAt)
          })) || [],
          streaks: {
            ...parsed.streaks,
            lastActivity: parsed.streaks?.lastActivity ? new Date(parsed.streaks.lastActivity) : new Date()
          }
        };
      }
    } catch (error) {
      console.error('Error loading stored analytics:', error);
    }
    return {};
  }

  private calculateProgress(completions: CPPCompletion[]): CPPProgress {
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
      remainingVerifiedAllowance: 0, // Will be calculated separately
      monthlyVerifiedAllowance: 0, // Will be calculated separately
      nextResetDate: new Date(),
      completions,
      lastUpdated: new Date(),
    };
  }

  private calculateVerificationAllowance(subscriptionTier: 'free' | 'premium', progress: CPPProgress): CPPVerificationAllowance {
    const allowance = VERIFICATION_ALLOWANCE[subscriptionTier];
    
    // Calculate next reset date (first day of next month)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // For this compilation, assume current month usage
    const usedThisMonth = progress.verifiedCompletions;
    const remainingThisMonth = Math.max(0, allowance.monthlyLimit - usedThisMonth);

    return {
      monthlyLimit: allowance.monthlyLimit,
      usedThisMonth,
      remainingThisMonth,
      nextResetDate: nextMonth,
      canPurchaseMore: allowance.canPurchaseMore,
      additionalPurchasePrice: allowance.additionalPurchasePrice,
    };
  }

  private compileAnalytics(completions: CPPCompletion[], storedAnalytics: Partial<CPPAnalytics>): CPPAnalytics {
    const now = new Date();
    const completedSteps = completions.filter(c => c.status === 'verified' || c.status === 'unverified');
    const verifiedSteps = completions.filter(c => c.status === 'verified');
    
    // Calculate category progress
    const categoryProgress: CPPAnalytics['categoryProgress'] = {};
    Object.keys(CPP_CATEGORIES).forEach(categoryKey => {
      const categorySteps = completions.filter(c => c.category === categoryKey);
      const completedCategorySteps = categorySteps.filter(c => c.status === 'verified' || c.status === 'unverified');
      
      categoryProgress[categoryKey] = {
        completed: completedCategorySteps.length,
        total: categorySteps.length,
        percentage: categorySteps.length > 0 ? (completedCategorySteps.length / categorySteps.length) * 100 : 0,
        timeSpent: storedAnalytics.categoryProgress?.[categoryKey]?.timeSpent || 0
      };
    });

    // Generate mock weekly progress for the last 8 weeks
    const weeklyProgress: CPPAnalytics['weeklyProgress'] = [];
    for (let i = 7; i >= 0; i--) {
      const weekDate = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekString = `${weekDate.getFullYear()}-W${Math.ceil(weekDate.getDate() / 7)}`;
      
      weeklyProgress.push({
        week: weekString,
        completions: Math.floor(Math.random() * 3), // Mock data
        verifications: Math.floor(Math.random() * 2), // Mock data
        timeSpent: Math.floor(Math.random() * 120) + 30 // 30-150 minutes
      });
    }

    return {
      totalTimeSpent: storedAnalytics.totalTimeSpent || Math.floor(Math.random() * 500) + 100,
      averageSessionTime: storedAnalytics.averageSessionTime || Math.floor(Math.random() * 45) + 15,
      completionRate: completions.length > 0 ? (completedSteps.length / completions.length) * 100 : 0,
      verificationSuccessRate: completedSteps.length > 0 ? (verifiedSteps.length / completedSteps.length) * 100 : 0,
      categoryProgress,
      weeklyProgress,
      achievements: storedAnalytics.achievements || [],
      streaks: {
        current: storedAnalytics.streaks?.current || Math.floor(Math.random() * 7),
        longest: storedAnalytics.streaks?.longest || Math.floor(Math.random() * 14) + 5,
        lastActivity: storedAnalytics.streaks?.lastActivity || now
      }
    };
  }

  private getCategoryBreakdown(completions: CPPCompletion[]) {
    const breakdown: CompiledCPPData['categoryBreakdown'] = {};
    
    Object.entries(CPP_CATEGORIES).forEach(([key, category]) => {
      const categorySteps = completions.filter(c => c.category === key);
      const completedSteps = categorySteps.filter(c => c.status === 'verified' || c.status === 'unverified');
      
      breakdown[key] = {
        name: category.name,
        color: category.color,
        icon: category.icon,
        completed: completedSteps.length,
        total: categorySteps.length,
        percentage: categorySteps.length > 0 ? (completedSteps.length / categorySteps.length) * 100 : 0,
        steps: categorySteps
      };
    });
    
    return breakdown;
  }

  private getProgressMessage(percentage: number) {
    if (percentage >= 80) return CPP_PROGRESS_MESSAGES.excellent;
    if (percentage >= 60) return CPP_PROGRESS_MESSAGES.good;
    if (percentage >= 40) return CPP_PROGRESS_MESSAGES.fair;
    return CPP_PROGRESS_MESSAGES.needs_improvement;
  }

  private getRecommendations(progress: CPPProgress, subscriptionTier: 'free' | 'premium') {
    const recommendations: CompiledCPPData['recommendations'] = [];
    
    // Check for incomplete required steps
    const incompleteRequired = progress.completions.filter(comp => {
      const step = CPP_STEPS.find(s => s.id === comp.id);
      return step?.isRequired && (comp.status === 'not_started' || comp.status === 'in_progress');
    });
    
    if (incompleteRequired.length > 0) {
      recommendations.push({
        id: 'complete_required',
        title: 'Complete Required Steps',
        description: `You have ${incompleteRequired.length} required steps remaining.`,
        priority: 'high',
        action: 'complete_steps',
        stepId: incompleteRequired[0].id
      });
    }
    
    // Check verification needs
    if (progress.verifiedCompletions < CPP_WEIGHTS.MIN_VERIFIED_FOR_100_PERCENT) {
      recommendations.push({
        id: 'need_verifications',
        title: 'Get Verified Completions',
        description: 'You need verified completions to reach 100% CPP.',
        priority: 'high',
        action: subscriptionTier === 'free' ? 'upgrade' : 'book_verification'
      });
    }
    
    // Fitness recommendations
    const fitnessSteps = progress.completions.filter(c => c.category === 'fitness');
    const completedFitness = fitnessSteps.filter(c => c.status === 'verified' || c.status === 'unverified');
    
    if (completedFitness.length < fitnessSteps.length / 2) {
      recommendations.push({
        id: 'focus_fitness',
        title: 'Focus on Fitness Preparation',
        description: 'Physical readiness is crucial for police applications.',
        priority: 'medium',
        action: 'start_fitness_plan'
      });
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private getUpsellTriggers(progress: CPPProgress, subscriptionTier: 'free' | 'premium') {
    return CPP_UPSELL_TRIGGERS.filter(trigger => {
      const { conditions } = trigger;
      
      if (conditions.minPercentage && progress.percentage < conditions.minPercentage) {
        return false;
      }
      
      if (conditions.maxVerifiedCompletions && progress.verifiedCompletions > conditions.maxVerifiedCompletions) {
        return false;
      }
      
      if (conditions.requiresSubscription && subscriptionTier === 'free') {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private getBadgeInformation(percentage: number) {
    const BADGE_TIERS = [
      { id: 'starter', name: 'Starter', threshold: 0, description: 'Beginning your journey' },
      { id: 'committed', name: 'Committed', threshold: 20, description: 'Making steady progress' },
      { id: 'focused', name: 'Focused', threshold: 40, description: 'Staying on track' },
      { id: 'dedicated', name: 'Dedicated', threshold: 60, description: 'Showing dedication' },
      { id: 'achiever', name: 'Achiever', threshold: 80, description: 'Nearly there!' },
      { id: 'champion', name: 'Champion', threshold: 95, description: 'Excellence achieved' },
      { id: 'elite', name: 'Elite', threshold: 100, description: 'Fully prepared' }
    ];

    const achievedTiers = BADGE_TIERS.filter(tier => percentage >= tier.threshold);
    const current = achievedTiers[achievedTiers.length - 1] || BADGE_TIERS[0];
    const currentIndex = BADGE_TIERS.findIndex(tier => tier.id === current.id);
    const next = BADGE_TIERS[currentIndex + 1] || null;

    return {
      current,
      next: next ? {
        ...next,
        progressToNext: Math.max(0, next.threshold - percentage)
      } : null,
      all: BADGE_TIERS.map(tier => ({
        ...tier,
        unlocked: percentage >= tier.threshold
      }))
    };
  }

  private async saveCompiledData(data: CompiledCPPData): Promise<void> {
    try {
      await AsyncStorage.setItem('cpp_compiled_data', JSON.stringify({
        ...data,
        compiledAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving compiled CPP data:', error);
    }
  }

  // Public methods for specific data access
  async getProgressSummary(): Promise<{ percentage: number; completions: number; verifications: number }> {
    const data = await this.compileAllCPPData();
    return {
      percentage: data.progress.percentage,
      completions: data.progress.totalCompletions,
      verifications: data.progress.verifiedCompletions
    };
  }

  async getCategoryProgress(): Promise<CompiledCPPData['categoryBreakdown']> {
    const data = await this.compileAllCPPData();
    return data.categoryBreakdown;
  }

  async getRecommendationsForUser(subscriptionTier: 'free' | 'premium' = 'free'): Promise<CompiledCPPData['recommendations']> {
    const data = await this.compileAllCPPData(subscriptionTier);
    return data.recommendations;
  }

  async getBadgeProgress(): Promise<CompiledCPPData['badges']> {
    const data = await this.compileAllCPPData();
    return data.badges;
  }

  // Clear cache to force recompilation
  clearCache(): void {
    this.compiledData = null;
    this.lastCompiled = null;
    console.log('🗑️ CPP cache cleared');
  }

  // Export data for debugging or analytics
  async exportCPPData(): Promise<string> {
    const data = await this.compileAllCPPData();
    return JSON.stringify(data, null, 2);
  }
}

export default CPPService.getInstance();