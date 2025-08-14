import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import {
  Target,
  TrendingUp,
  Timer,
  Calendar,
  Star,
  Info,
  Activity,
  Zap,
  Award,
  MapPin,
  Plus,
  BarChart3,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Users,
  Target as TargetIcon,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Filter,
  List,
  DollarSign,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { usePinTest } from '@/context/PinTestContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import { usePracticeSessions } from '@/context/PracticeSessionsContext';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { RobustBookingService } from '@/lib/robustBookingService';
import UpsellModal from '@/components/UpsellModal';
import LockedContentOverlay from '@/components/LockedContentOverlay';
import TabSpecificHeader from '@/components/TabSpecificHeader';
import EnhancedCard from '@/components/EnhancedCard';
import AnimatedProgressBar from '@/components/AnimatedProgressBar';
import EmptyState from '@/components/EmptyState';
import { trackTrainingPlanView, trackDigitalTestAttempt } from '@/lib/monetizationAnalytics';

type TrainingPlan = {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string[];
  currentWeek: number;
  totalWeeks: number;
  progress: number;
};

type WorkoutLog = {
  id: string;
  date: string;
  type: string;
  duration: number;
  completed: boolean;
  notes?: string;
};

type TestResult = {
  id: string;
  testType: 'PREP' | 'PIN';
  date: string;
  score: number;
  passProbability: number;
  details: any;
};

export default function FitnessScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'bookings'>('overview');
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'approved' | 'pending' | 'rejected' | 'cancelled'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'list'>('overview');
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [upsellTrigger, setUpsellTrigger] = useState<'digital-test' | 'training-plan' | 'interview-prep' | 'community' | 'general'>('general');
  
  const { testResults, formatTime, getPersonalBests } = usePinTest();
  const { subscription, canAccessDigitalTest, canAccessTrainingPlan, trackDigitalTestUsage } = useSubscription();
  const { user } = useAuth();
  const { loadBookings: loadContextBookings } = usePracticeSessions();
  
  const personalBests = getPersonalBests();

  // Mock data for now - these would come from fitness context
  const fitnessProgress = {
    beepTestLevel: 5.2,
    pushPullWeight: 65,
    obstacleCourseTime: 180
  };

  // Mock data - would come from context/database
  const trainingPlans: TrainingPlan[] = [
    {
      id: 'prep-12-week',
      title: 'PREP Test 12-Week Program',
      description: 'Comprehensive training program to prepare for the PREP test',
      duration: '12 weeks',
      difficulty: 'intermediate',
      focus: ['Cardiovascular', 'Strength', 'Agility'],
      currentWeek: 3,
      totalWeeks: 12,
      progress: 25,
    },
    {
      id: 'pin-8-week',
      title: 'PIN Test 8-Week Program',
      description: 'Focused training for the PIN test requirements',
      duration: '8 weeks',
      difficulty: 'advanced',
      focus: ['Strength', 'Endurance', 'Technique'],
      currentWeek: 1,
      totalWeeks: 8,
      progress: 12.5,
    },
  ];

  const workoutLogs: WorkoutLog[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'Cardio Training',
      duration: 45,
      completed: true,
      notes: 'Focused on beep test intervals',
    },
    {
      id: '2',
      date: '2024-01-13',
      type: 'Strength Training',
      duration: 60,
      completed: true,
      notes: 'Push-ups and pull-ups focus',
    },
  ];

  const mockTestResults: TestResult[] = [
    {
      id: '1',
      testType: 'PREP',
      date: '2024-01-10',
      score: 6.2,
      passProbability: 85,
      details: {
        beepTest: 6.2,
        pushPull: 70,
        obstacleCourse: 150,
      },
    },
    {
      id: '2',
      testType: 'PIN',
      date: '2024-01-08',
      score: 8.5,
      passProbability: 92,
      details: {
        pushups: 45,
        situps: 38,
        mileRun: '8:45',
      },
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Load fresh data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const loadBookings = async () => {
    if (!user) return;
    
    setBookingsLoading(true);
    try {
      console.log('🔄 Loading bookings for user:', user.id);
      
      // First try to load from context (which handles database errors gracefully)
      await loadContextBookings();
      
      // Then try to get user bookings with error handling
      try {
        const userBookings = await RobustBookingService.getUserBookings();
        console.log('📊 Bookings loaded:', userBookings?.length || 0);
        setBookings(userBookings || []);
      } catch (bookingError: any) {
        console.warn('⚠️ RobustBookingService failed, using empty array:', bookingError.message);
        setBookings([]);
      }
      
    } catch (error: any) {
      console.error('❌ Error loading bookings:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      // Always set empty array on error to prevent UI crashes
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'bookings') {
      loadBookings();
    }
  }, [user, activeTab]);

  const calculatePassProbability = (fitnessData: any) => {
    // Mock calculation - would be more sophisticated
    let probability = 50;
    
    if (fitnessData.beepTestLevel >= 6.5) probability += 20;
    if (fitnessData.pushPullWeight >= 70) probability += 15;
    if (fitnessData.obstacleCourseTime <= 162) probability += 15;
    
    return Math.min(probability, 95);
  };

  const getCurrentPlan = () => {
    return trainingPlans.find(plan => plan.currentWeek > 0);
  };

  // Monetization handlers
  const handleDigitalTestAccess = async () => {
    if (canAccessDigitalTest()) {
      await trackDigitalTestAttempt('fitness_screen_access');
      await trackDigitalTestUsage();
      router.push('/pin-test');
    } else {
      await trackDigitalTestAttempt('fitness_screen_locked');
      setUpsellTrigger('digital-test');
      setShowUpsellModal(true);
    }
  };

  const handleTrainingPlanAccess = async (weekNumber: number) => {
    if (canAccessTrainingPlan(weekNumber)) {
      await trackTrainingPlanView('fitness_screen_access');
      setSelectedPlan(trainingPlans.find(plan => plan.currentWeek === weekNumber) || null);
      setShowTrainingModal(true);
    } else {
      await trackTrainingPlanView('fitness_screen_locked');
      setUpsellTrigger('training-plan');
      setShowUpsellModal(true);
    }
  };

  // Compact Test Results Widget - Only show if there are results
  const TestResultsWidget = () => {
    if (mockTestResults.length === 0) {
      return null; // Don't show empty widget
    }

    return (
      <View style={styles.testResultsWidget}>
        <View style={styles.widgetHeader}>
          <BarChart3 size={20} color={Colors.primary} />
          <Text style={styles.widgetTitle}>Recent Test Results</Text>
          <TouchableOpacity onPress={() => setActiveTab('overview')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.testResultsList}>
          {mockTestResults.slice(0, 2).map((result) => (
            <View key={result.id} style={styles.testResultItem}>
              <View style={styles.testResultHeader}>
                <View style={styles.testResultType}>
                  <View style={[
                    styles.testResultIcon,
                    result.testType === 'PREP' ? { backgroundColor: '#EBF4FF' } : { backgroundColor: '#FEF2F2' }
                  ]}>
                    {result.testType === 'PREP' ? (
                      <Timer size={16} color="#3B82F6" />
                    ) : (
                      <Target size={16} color="#EF4444" />
                    )}
                  </View>
                  <Text style={styles.testResultTitle}>{result.testType} Test</Text>
                </View>
                <Text style={styles.testResultDate}>
                  {new Date(result.date).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.testResultMetrics}>
                <View style={styles.testResultMetric}>
                  <Text style={styles.testResultMetricValue}>{result.score}</Text>
                  <Text style={styles.testResultMetricLabel}>Score</Text>
                </View>
                <View style={styles.testResultMetric}>
                  <Text style={[
                    styles.testResultMetricValue,
                    result.passProbability >= 80 ? { color: '#10B981' } : 
                    result.passProbability >= 60 ? { color: '#F59E0B' } : { color: '#EF4444' }
                  ]}>
                    {result.passProbability}%
                  </Text>
                  <Text style={styles.testResultMetricLabel}>Pass Rate</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderOverview = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Enhanced Tab-Specific Header */}
      <TabSpecificHeader
        tab="fitness"
        stats={[
          {
            label: "Tests Taken",
            value: testResults.length,
            icon: <Target size={16} color={Colors.success} />
          },
          {
            label: "Best Score",
            value: (getPersonalBests() as any).prep || "N/A",
            icon: <TrendingUp size={16} color={Colors.primary} />
          },
          {
            label: "This Week",
            value: testResults.filter(r => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date((r as any).date) >= weekAgo;
            }).length,
            icon: <Activity size={16} color={Colors.warning} />
          }
        ]}
      />

      {/* Section 1: Free "Try It Now" Area */}
      <View style={styles.freeSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Try It Now</Text>
            <Text style={styles.sectionSubtitle}>Free digital fitness assessment</Text>
          </View>
        </View>

        {/* Digital Test Cards */}
        <View style={styles.digitalTestsGrid}>
          {/* PREP Digital Test */}
          <EnhancedCard
            variant="gradient"
            gradientColors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
            onPress={handleDigitalTestAccess}
            style={styles.digitalTestCard}
          >
            <View style={styles.digitalTestContent}>
              <View style={styles.digitalTestIcon}>
                <Timer size={32} color={Colors.white} />
              </View>
              <Text style={[styles.digitalTestTitle, { color: Colors.white }]}>PREP Test</Text>
              <Text style={[styles.digitalTestDescription, { color: Colors.white + 'CC' }]}>Digital fitness assessment</Text>
              <View style={styles.digitalTestButton}>
                <Text style={[styles.digitalTestButtonText, { color: Colors.white }]}>Start Test</Text>
                <ArrowRight size={16} color={Colors.white} />
              </View>
            </View>
          </EnhancedCard>

          {/* PIN Digital Test */}
          <EnhancedCard
            variant="gradient"
            gradientColors={[Colors.gradients.accent.start, Colors.gradients.accent.end]}
            onPress={handleDigitalTestAccess}
            style={styles.digitalTestCard}
          >
            <View style={styles.digitalTestContent}>
              <View style={styles.digitalTestIcon}>
                <Target size={32} color={Colors.white} />
              </View>
              <Text style={[styles.digitalTestTitle, { color: Colors.white }]}>PIN Test</Text>
              <Text style={[styles.digitalTestDescription, { color: Colors.white + 'CC' }]}>Digital fitness assessment</Text>
              <View style={styles.digitalTestButton}>
                <Text style={[styles.digitalTestButtonText, { color: Colors.white }]}>Start Test</Text>
                <ArrowRight size={16} color={Colors.white} />
              </View>
            </View>
          </EnhancedCard>
        </View>

        {/* Basic Prep Tips - Only show for new users */}
        {mockTestResults.length === 0 && (
          <View style={styles.prepTipsCard}>
            <View style={styles.prepTipsHeader}>
              <BookOpen size={20} color={Colors.primary} />
              <Text style={styles.prepTipsTitle}>Basic Prep Tips</Text>
            </View>
            <View style={styles.prepTipsList}>
              <View style={styles.prepTipItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.prepTipText}>Focus on cardiovascular endurance</Text>
              </View>
              <View style={styles.prepTipItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.prepTipText}>Practice push-ups and pull-ups regularly</Text>
              </View>
              <View style={styles.prepTipItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.prepTipText}>Work on agility and coordination</Text>
              </View>
            </View>
          </View>
        )}

        {/* Compact Test Results Widget */}
        <TestResultsWidget />
      </View>

      {/* Section 2: Premium Unlock */}
      <View style={styles.premiumSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            <Text style={styles.sectionSubtitle}>Unlock your full potential</Text>
          </View>
          <View style={styles.premiumBadge}>
            <Sparkles size={16} color={Colors.white} />
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
        </View>

        {/* Premium Features Grid */}
        <View style={styles.premiumFeaturesGrid}>
          {/* In-Person Practice Sessions */}
          <TouchableOpacity 
            style={[
              styles.premiumFeatureCard,
              subscription.tier === 'free' && styles.lockedFeatureCard
            ]}
            onPress={() => {
              if (subscription.tier === 'free') {
                router.push('/subscription');
              } else {
                router.push('/practice-sessions');
              }
            }}
          >
            <View style={styles.premiumFeatureContent}>
              <View style={styles.premiumFeatureIcon}>
                <MapPin size={28} color={subscription.tier === 'free' ? Colors.textSecondary : '#3B82F6'} />
                {subscription.tier === 'free' && (
                  <View style={styles.lockOverlay}>
                    <Lock size={16} color={Colors.white} />
                  </View>
                )}
              </View>
              <Text style={[
                styles.premiumFeatureTitle,
                subscription.tier === 'free' && styles.lockedText
              ]}>In-Person Practice</Text>
              <Text style={[
                styles.premiumFeatureDescription,
                subscription.tier === 'free' && styles.lockedText
              ]}>Book official test runs with certified instructors</Text>
              {subscription.tier === 'free' && (
                <View style={styles.upgradePrompt}>
                  <Text style={styles.upgradePromptText}>Upgrade to unlock</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Personalized Training Plans */}
          <TouchableOpacity 
            style={[
              styles.premiumFeatureCard,
              subscription.tier === 'free' && styles.lockedFeatureCard
            ]}
            onPress={() => {
              if (subscription.tier === 'free') {
                router.push('/subscription');
              } else {
                setActiveTab('training');
              }
            }}
          >
            <View style={styles.premiumFeatureContent}>
              <View style={styles.premiumFeatureIcon}>
                <Target size={28} color={subscription.tier === 'free' ? Colors.textSecondary : '#10B981'} />
                {subscription.tier === 'free' && (
                  <View style={styles.lockOverlay}>
                    <Lock size={16} color={Colors.white} />
                  </View>
                )}
              </View>
              <Text style={[
                styles.premiumFeatureTitle,
                subscription.tier === 'free' && styles.lockedText
              ]}>Training Plans</Text>
              <Text style={[
                styles.premiumFeatureDescription,
                subscription.tier === 'free' && styles.lockedText
              ]}>Personalized programs tailored to your goals</Text>
              {subscription.tier === 'free' && (
                <View style={styles.upgradePrompt}>
                  <Text style={styles.upgradePromptText}>Upgrade to unlock</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Advanced Analytics */}
          <TouchableOpacity 
            style={[
              styles.premiumFeatureCard,
              subscription.tier === 'free' && styles.lockedFeatureCard
            ]}
            onPress={() => {
              if (subscription.tier === 'free') {
                router.push('/subscription');
              } else {
                setActiveTab('bookings');
              }
            }}
          >
            <View style={styles.premiumFeatureContent}>
              <View style={styles.premiumFeatureIcon}>
                <BarChart3 size={28} color={subscription.tier === 'free' ? Colors.textSecondary : '#F59E0B'} />
                {subscription.tier === 'free' && (
                  <View style={styles.lockOverlay}>
                    <Lock size={16} color={Colors.white} />
                  </View>
                )}
              </View>
              <Text style={[
                styles.premiumFeatureTitle,
                subscription.tier === 'free' && styles.lockedText
              ]}>Advanced Analytics</Text>
              <Text style={[
                styles.premiumFeatureDescription,
                subscription.tier === 'free' && styles.lockedText
              ]}>Detailed progress tracking and insights</Text>
              {subscription.tier === 'free' && (
                <View style={styles.upgradePrompt}>
                  <Text style={styles.upgradePromptText}>Upgrade to unlock</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Progress Preview (Locked) */}
          <TouchableOpacity 
            style={[
              styles.premiumFeatureCard,
              styles.lockedFeatureCard
            ]}
            onPress={() => router.push('/subscription')}
          >
            <View style={styles.premiumFeatureContent}>
              <View style={styles.premiumFeatureIcon}>
                <TrendingUp size={28} color={Colors.textSecondary} />
                <View style={styles.lockOverlay}>
                  <Lock size={16} color={Colors.white} />
                </View>
              </View>
              <Text style={[styles.premiumFeatureTitle, styles.lockedText]}>Progress Tracking</Text>
              <Text style={[styles.premiumFeatureDescription, styles.lockedText]}>Monitor your fitness journey</Text>
              <View style={styles.upgradePrompt}>
                <Text style={styles.upgradePromptText}>Upgrade to unlock</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Upgrade CTA - Only show for free users */}
        {subscription.tier === 'free' && (
          <TouchableOpacity 
            style={styles.upgradeCTACard}
            onPress={() => router.push('/subscription')}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeCTAGradient}
            >
              <View style={styles.upgradeCTAContent}>
                <View style={styles.upgradeCTAText}>
                  <Text style={styles.upgradeCTATitle}>Unlock Premium Features</Text>
                  <Text style={styles.upgradeCTASubtitle}>Get personalized training plans, in-person practice sessions, and advanced analytics</Text>
                </View>
                <View style={styles.upgradeCTAButton}>
                  <Text style={styles.upgradeCTAButtonText}>Upgrade Now</Text>
                  <ArrowRight size={20} color={Colors.white} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Current Progress (if subscriber) - Only show if there's an active plan */}
      {subscription.tier !== 'free' && getCurrentPlan() && (
        <View style={styles.currentProgressSection}>
          <Text style={styles.sectionTitle}>Current Progress</Text>
          <View style={styles.currentPlanCard}>
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{getCurrentPlan()?.title}</Text>
                <Text style={styles.planSubtitle}>Week {getCurrentPlan()?.currentWeek} of {getCurrentPlan()?.totalWeeks}</Text>
              </View>
              <View style={styles.planProgress}>
                <Text style={styles.planProgressText}>{getCurrentPlan()?.progress}%</Text>
              </View>
            </View>
            
            <View style={styles.planProgressBar}>
              <View 
                style={[
                  styles.planProgressFill, 
                  { width: `${getCurrentPlan()?.progress || 0}%` }
                ]} 
              />
            </View>
            
            <TouchableOpacity 
              style={styles.startWorkoutButton}
              onPress={() => router.push('/workout/session/current')}
            >
              <Play size={16} color={Colors.white} />
              <Text style={styles.startWorkoutText}>Start Today's Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderTraining = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.trainingHeader}>
        <Text style={styles.sectionTitle}>Training Plans</Text>
        <TouchableOpacity 
          style={styles.addPlanButton}
          onPress={() => setShowTrainingModal(true)}
        >
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {trainingPlans.map((plan) => (
        <TouchableOpacity 
          key={plan.id}
          style={styles.trainingPlanCard}
          onPress={() => {
            setSelectedPlan(plan);
            setShowTrainingModal(true);
          }}
        >
          <View style={styles.planCardHeader}>
            <View style={styles.planCardInfo}>
              <Text style={styles.planCardTitle}>{plan.title}</Text>
              <Text style={styles.planCardDescription}>{plan.description}</Text>
              <View style={styles.planCardMeta}>
                <View style={styles.planCardMetaItem}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.planCardMetaText}>{plan.duration}</Text>
                </View>
                <View style={styles.planCardMetaItem}>
                  <Target size={14} color={Colors.textSecondary} />
                  <Text style={styles.planCardMetaText}>{plan.difficulty}</Text>
                </View>
              </View>
            </View>
            <View style={styles.planCardProgress}>
              <Text style={styles.planCardProgressText}>{plan.progress}%</Text>
              <View style={styles.planCardProgressBar}>
                <View 
                  style={[
                    styles.planCardProgressFill, 
                    { width: `${plan.progress}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          {plan.currentWeek > 0 && (
            <View style={styles.activePlanBadge}>
              <Text style={styles.activePlanText}>Active • Week {plan.currentWeek}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBookings = () => {
    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
      if (statusFilter === 'all') return true;
      return booking.status === statusFilter;
    });

    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'confirmed':
          return {
            color: '#10b981',
            bgColor: '#d1fae5',
            icon: <CheckCircle2 size={16} color="#10b981" />,
            text: 'Confirmed',
            gradient: ['#10b981', '#059669']
          };
        case 'approved':
          return {
            color: '#3b82f6',
            bgColor: '#dbeafe',
            icon: <Award size={16} color="#3b82f6" />,
            text: 'Approved',
            gradient: ['#3b82f6', '#2563eb']
          };
        case 'pending':
          return {
            color: '#f59e0b',
            bgColor: '#fef3c7',
            icon: <Clock size={16} color="#f59e0b" />,
            text: 'Pending Review',
            gradient: ['#f59e0b', '#d97706']
          };
        case 'rejected':
          return {
            color: '#ef4444',
            bgColor: '#fee2e2',
            icon: <XCircle size={16} color="#ef4444" />,
            text: 'Rejected',
            gradient: ['#ef4444', '#dc2626']
          };
        case 'cancelled':
          return {
            color: '#6b7280',
            bgColor: '#f3f4f6',
            icon: <XCircle size={16} color="#6b7280" />,
            text: 'Cancelled',
            gradient: ['#6b7280', '#4b5563']
          };
        default:
          return {
            color: '#6b7280',
            bgColor: '#f3f4f6',
            icon: <AlertTriangle size={16} color="#6b7280" />,
            text: status,
            gradient: ['#6b7280', '#4b5563']
          };
      }
    };

    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      } catch (error) {
        return 'Date not available';
      }
    };

    const formatTime = (time: string) => {
      if (!time) return 'Time not available';
      try {
        const timeDate = new Date(`2000-01-01T${time}`);
        return timeDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      } catch (error) {
        return 'Time not available';
      }
    };

    const formatPrice = (cents: number) => {
      return `$${(cents / 100).toFixed(2)}`;
    };

    // Motivational Header Widget
    const MotivationalHeader = () => {
      const hasBookings = filteredBookings.length > 0;
      
      if (!hasBookings) {
        return (
          <View style={styles.motivationalHeader}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.motivationalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.motivationalContent}>
                <View style={styles.motivationalIcon}>
                  <Target size={32} color={Colors.white} />
                </View>
                <Text style={styles.motivationalTitle}>Ready to Ace Your Test?</Text>
                <Text style={styles.motivationalSubtitle}>
                  Book your first in-person practice session and get real feedback from certified instructors
                </Text>
                <TouchableOpacity
                  style={styles.motivationalCTA}
                  onPress={() => router.push('/practice-sessions')}
                >
                  <Text style={styles.motivationalCTAText}>Book Your First Session</Text>
                  <ArrowRight size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        );
      }

      return (
        <View style={styles.motivationalHeader}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.motivationalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.motivationalContent}>
              <View style={styles.motivationalIcon}>
                <Star size={32} color={Colors.white} />
              </View>
              <Text style={styles.motivationalTitle}>Great Progress!</Text>
              <Text style={styles.motivationalSubtitle}>
                You have {filteredBookings.length} booking{filteredBookings.length > 1 ? 's' : ''}. Keep building your confidence with more practice sessions.
              </Text>
              <TouchableOpacity
                style={styles.motivationalCTA}
                onPress={() => router.push('/practice-sessions')}
              >
                <Text style={styles.motivationalCTAText}>Book Another Session</Text>
                <ArrowRight size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      );
    };

    // Benefits Widget
    const BenefitsWidget = () => {
      return (
        <View style={styles.benefitsWidget}>
          <Text style={styles.benefitsTitle}>Why In-Person Practice?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <CheckCircle size={20} color="#10B981" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Real Test Environment</Text>
                <Text style={styles.benefitDescription}>Practice in the same conditions as your actual test</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <CheckCircle size={20} color="#10B981" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Expert Feedback</Text>
                <Text style={styles.benefitDescription}>Get personalized tips from certified instructors</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <CheckCircle size={20} color="#10B981" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Build Confidence</Text>
                <Text style={styles.benefitDescription}>Reduce test anxiety with familiar practice</Text>
              </View>
            </View>
          </View>
        </View>
      );
    };

    // Social Proof Widget
    const SocialProofWidget = () => {
      return (
        <View style={styles.socialProofWidget}>
          <View style={styles.socialProofHeader}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.socialProofTitle}>What Members Say</Text>
          </View>
          
          <View style={styles.testimonialCard}>
            <View style={styles.testimonialContent}>
              <Text style={styles.testimonialText}>
                "The in-person practice sessions were game-changing. I felt so much more confident on test day!"
              </Text>
              <View style={styles.testimonialAuthor}>
                <Text style={styles.testimonialName}>- Sarah M.</Text>
                <Text style={styles.testimonialResult}>Passed PREP Test</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>94%</Text>
              <Text style={styles.statLabel}>Pass Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.9★</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
      );
    };

    return (
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadBookings} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.bookingsHeader}>
          <Text style={styles.sectionTitle}>My Bookings</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/practice-sessions')}
            >
              <Plus size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterButtons}>
                {(['all', 'confirmed', 'approved', 'pending', 'rejected', 'cancelled'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      statusFilter === status && styles.filterButtonActive,
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      statusFilter === status && styles.filterButtonTextActive,
                    ]}>
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Bookings List - PRIORITY FIRST */}
        {filteredBookings.length > 0 ? (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              return (
                <View key={booking.id} style={styles.bookingCardContainer}>
                  <LinearGradient
                    colors={statusConfig.gradient as [string, string]}
                    style={styles.bookingCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.bookingCardHeader}>
                      <View style={styles.bookingCardHeaderLeft}>
                        <View style={styles.bookingTypeBadge}>
                          <Text style={styles.bookingTypeText}>
                            {booking.practice_sessions?.test_type?.toUpperCase() || 'TEST'}
                          </Text>
                        </View>
                        <Text style={styles.bookingTitle}>
                          {booking.practice_sessions?.title || 'Practice Session'}
                        </Text>
                      </View>
                      
                      <View style={styles.bookingCardHeaderRight}>
                        <View style={styles.statusBadge}>
                          {statusConfig.icon}
                          <Text style={styles.statusText}>{statusConfig.text}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.bookingCardContent}>
                      <View style={styles.bookingDetailsGrid}>
                        <View style={styles.bookingDetailItem}>
                          <Calendar size={16} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.bookingDetailText}>
                            {formatDate(booking.practice_sessions?.session_date || '')}
                          </Text>
                        </View>
                        
                        <View style={styles.bookingDetailItem}>
                          <Clock size={16} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.bookingDetailText}>
                            {formatTime(booking.practice_sessions?.start_time || '')} - {formatTime(booking.practice_sessions?.end_time || '')}
                          </Text>
                        </View>
                        
                        <View style={styles.bookingDetailItem}>
                          <MapPin size={16} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.bookingDetailText}>
                            {booking.practice_sessions?.location?.name || 'Location TBD'}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() => router.push(`/practice-sessions/${booking.session_id}`)}
                      >
                        <Text style={styles.viewDetailsText}>View Details</Text>
                        <ChevronRight size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <BookOpen size={80} color={Colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Bookings Found</Text>
            <Text style={styles.emptyStateText}>
              {statusFilter === 'all' 
                ? "Ready to start your journey? Book your first practice session and get expert guidance."
                : `You don't have any ${statusFilter} bookings.`
              }
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push('/practice-sessions')}
            >
              <Text style={styles.emptyStateButtonText}>Browse Sessions</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Motivational Content - AFTER Bookings */}
        {filteredBookings.length === 0 && (
          <>
            {/* Motivational Header for New Users */}
            <MotivationalHeader />
            
            {/* Benefits Widget */}
            <BenefitsWidget />
            
            {/* Social Proof Widget */}
            <SocialProofWidget />
          </>
        )}

        {/* Encouragement Section for Existing Users */}
        {filteredBookings.length > 0 && (
          <View style={styles.encouragementSection}>
            <View style={styles.encouragementHeader}>
              <Star size={20} color={Colors.primary} />
              <Text style={styles.encouragementTitle}>Keep Building Your Confidence</Text>
            </View>
            
            <View style={styles.encouragementContent}>
              <Text style={styles.encouragementText}>
                Great progress! Consider booking another session to further improve your test readiness.
              </Text>
              
              <View style={styles.encouragementStats}>
                <View style={styles.encouragementStat}>
                  <Text style={styles.encouragementStatNumber}>94%</Text>
                  <Text style={styles.encouragementStatLabel}>Pass Rate</Text>
                </View>
                <View style={styles.encouragementStat}>
                  <Text style={styles.encouragementStatNumber}>4.9★</Text>
                  <Text style={styles.encouragementStatLabel}>Rating</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Bottom CTA */}
        {filteredBookings.length > 0 && (
          <View style={styles.bottomCTA}>
            <TouchableOpacity
              style={styles.bottomCTAButton}
              onPress={() => router.push('/practice-sessions')}
            >
              <Text style={styles.bottomCTAText}>Book Another Session</Text>
              <ArrowRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
          onPress={() => setActiveTab('overview')}
        >
          <Activity size={20} color={activeTab === 'overview' ? Colors.white : Colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.activeTabButtonText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'training' && styles.activeTabButton]}
          onPress={() => setActiveTab('training')}
        >
          <Target size={20} color={activeTab === 'training' ? Colors.white : Colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === 'training' && styles.activeTabButtonText]}>
            Training
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'bookings' && styles.activeTabButton]}
          onPress={() => setActiveTab('bookings')}
        >
          <Calendar size={20} color={activeTab === 'bookings' ? Colors.white : Colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === 'bookings' && styles.activeTabButtonText]}>
            My Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'training' && renderTraining()}
      {activeTab === 'bookings' && renderBookings()}

      {/* Modals */}
      <UpsellModal
        visible={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        trigger={upsellTrigger}
        onSubscribe={() => setShowUpsellModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },

  // Free Section
  freeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 32,
  },
  
  // Digital Test Cards
  digitalTestsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  digitalTestCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  digitalTestContent: {
    alignItems: 'center',
  },
  digitalTestIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  digitalTestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  digitalTestDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  digitalTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  digitalTestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Prep Tips Card
  prepTipsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  prepTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  prepTipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  prepTipsList: {
    gap: 12,
  },
  prepTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prepTipText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },

  // Premium Section
  premiumSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },

  // Premium Features Grid
  premiumFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  premiumFeatureCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lockedFeatureCard: {
    opacity: 0.7,
  },
  premiumFeatureContent: {
    alignItems: 'center',
  },
  premiumFeatureIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumFeatureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  premiumFeatureDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  lockedText: {
    color: Colors.textSecondary,
  },
  upgradePrompt: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  upgradePromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Upgrade CTA
  upgradeCTACard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  upgradeCTAGradient: {
    padding: 24,
  },
  upgradeCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upgradeCTAText: {
    flex: 1,
    marginRight: 16,
  },
  upgradeCTATitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
  },
  upgradeCTASubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  upgradeCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  upgradeCTAButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  // Current Progress Section (for subscribers)
  currentProgressSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  currentPlanCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
    marginRight: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  planProgress: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planProgressText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  planProgressBar: {
    height: 8,
    backgroundColor: '#E0E7FF',
    borderRadius: 4,
    marginTop: 8,
  },
  planProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    marginTop: 16,
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  // Training Plans Section
  trainingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addPlanButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainingPlanCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planCardInfo: {
    flex: 1,
    marginRight: 16,
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  planCardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  planCardMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  planCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planCardMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  planCardProgress: {
    width: 60,
    height: 8,
    backgroundColor: '#E0E7FF',
    borderRadius: 4,
    marginTop: 8,
  },
  planCardProgressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
  planCardProgressBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  planCardProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  activePlanBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  activePlanText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },

  // Test Results Section
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  resultDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resultScore: {
    alignItems: 'center',
    marginBottom: 12,
  },
  resultScoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
  },
  resultScoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resultProbability: {
    alignItems: 'center',
    marginBottom: 12,
  },
  resultProbabilityValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
  },
  resultProbabilityLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resultDetails: {
    gap: 12,
  },
  resultDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultDetailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  resultDetailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },

  // Compact Test Results Widget
  testResultsWidget: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  testResultsList: {
    gap: 16,
  },
  testResultItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testResultType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  testResultDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  testResultMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  testResultMetric: {
    alignItems: 'center',
  },
  testResultMetricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  testResultMetricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Tab Navigation
  tabNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabButtonText: {
    color: Colors.white,
  },

  // Bookings Header
  bookingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },

  // Bookings List
  bookingsList: {
    paddingHorizontal: 20,
    gap: 20,
  },
  bookingCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  bookingCardGradient: {
    padding: 20,
    borderRadius: 20,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingCardHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  bookingTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  bookingTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  bookingCardHeaderRight: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  bookingCardContent: {
    paddingTop: 12,
  },
  bookingDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  bookingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingDetailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  // Empty Test Results
  emptyTestResults: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTestResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptyTestResultsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Motivational Header
  motivationalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 32,
  },
  motivationalGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  motivationalContent: {
    alignItems: 'center',
  },
  motivationalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  motivationalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationalSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  motivationalCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  motivationalCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  // Benefits Widget
  benefitsWidget: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Social Proof Widget
  socialProofWidget: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  socialProofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  socialProofTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  testimonialCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testimonialContent: {
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  testimonialResult: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Bottom CTA
  bottomCTA: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  bottomCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  bottomCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  // Encouragement Section
  encouragementSection: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  encouragementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  encouragementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  encouragementContent: {
    marginBottom: 16,
  },
  encouragementText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  encouragementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  encouragementStat: {
    alignItems: 'center',
  },
  encouragementStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  encouragementStatLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

});