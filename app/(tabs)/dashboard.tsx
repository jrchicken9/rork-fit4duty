import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { 
  ChevronRight, 
  Activity,
  Target,
  Dumbbell,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  Award,
  Zap,
  Trophy,
  Play
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { typography, spacing, borderRadius, shadows, componentStyles } from "@/constants/designSystem";
import ProgressCard from "@/components/ProgressCard";
import StatsOverview from "@/components/StatsOverview";
import ApplicationProgress from "@/components/ApplicationProgress";
import WorkoutCard from "@/components/WorkoutCard";
import TabSpecificHeader from "@/components/TabSpecificHeader";
import EnhancedCard from "@/components/EnhancedCard";
import AnimatedProgressBar from "@/components/AnimatedProgressBar";
import { useAuth } from "@/context/AuthContext";
import { useApplication } from "@/context/ApplicationContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { supabase } from "@/lib/supabase";
import UpsellModal from "@/components/UpsellModal";
import OneTimeServicesModal from "@/components/OneTimeServicesModal";
import { trackDigitalTestAttempt, trackTrainingPlanView } from "@/lib/monetizationAnalytics";
import { useDynamicContent } from "@/hooks/useDynamicContent";

import workouts from "@/constants/workouts";

type UpcomingBooking = {
  id: string;
  session_title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'confirmed' | 'rejected';
  test_type: 'PREP' | 'PIN';
  location_name: string;
};

type PrerequisiteStatus = {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
  category: 'official' | 'unwritten';
};

export default function DashboardScreen() {
  const { user: authUser } = useAuth();
  const { getProgressPercentage, getApplicationStepsWithProgress, getCompletedStepsCount } = useApplication();
  const { subscription, canAccessDigitalTest, canAccessTrainingPlan, getRemainingDigitalTests } = useSubscription();
  
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStatus[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [upsellTrigger, setUpsellTrigger] = useState<'digital-test' | 'training-plan' | 'interview-prep' | 'community' | 'general'>('general');
  
  // Mock data for now - these would come from fitness context
  const fitnessProgress = {
    beepTestLevel: 5.2,
    pushPullWeight: 65,
    obstacleCourseTime: 180
  };
  const workoutLogs: any[] = [];
  
  // Use auth user name
  const displayName = authUser?.full_name || "Future Officer";

  // Dynamic content
  const { content: heroGreeting } = useDynamicContent('dashboard.hero.greeting', {
    fallback: 'Hello, {name} 👋',
    placeholders: { name: displayName }
  });
  
  const { content: heroSubtitle } = useDynamicContent('dashboard.hero.subtitle', {
    fallback: 'Ready to achieve your police career goals?'
  });

  const recentWorkouts = workouts.slice(0, 1); // Show only one workout to reduce redundancy
  const applicationSteps = getApplicationStepsWithProgress();
  const applicationProgress = getProgressPercentage();
  const completedSteps = getCompletedStepsCount();
  
  // Calculate fitness stats
  const thisWeekWorkouts = workoutLogs.filter(log => {
    const logDate = new Date(log.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo && log.completed;
  }).length;
  
  const currentStreak = calculateCurrentStreak(workoutLogs);
  const weeklyGoal = 5; // Default weekly goal

  // Load upcoming bookings
  const loadUpcomingBookings = async () => {
    if (!authUser?.id) return;
    
    try {
      setLoadingBookings(true);
      console.log('🔄 Loading upcoming bookings for user:', authUser.id);
      
      // First, let's try a simpler query to see if the tables exist
      const { data: testData, error: testError } = await supabase
        .from('bookings')
        .select('id, status, user_id')
        .limit(1);
      
      if (testError) {
        console.error('❌ Bookings table test failed:', testError);
        // If bookings table doesn't exist, just set empty array
        setUpcomingBookings([]);
        return;
      }
      
      console.log('✅ Bookings table exists, proceeding with full query');
      
      // Now try the full query with proper error handling
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          session_id,
          practice_sessions(
            id,
            title,
            session_date,
            start_time,
            end_time,
            test_type,
            location_id,
            locations(
              id,
              name
            )
          )
        `)
        .eq('user_id', authUser.id)
        .in('status', ['pending', 'approved', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('❌ Error in bookings query:', error);
        // Don't throw, just log and set empty array
        setUpcomingBookings([]);
        return;
      }

      console.log('📊 Raw bookings data:', data);
      
      if (!data || data.length === 0) {
        console.log('📝 No bookings found for user');
        setUpcomingBookings([]);
        return;
      }

      // Filter and format bookings with better error handling
      const formattedBookings: UpcomingBooking[] = data
        .filter((booking: any) => {
          // Only include bookings with valid session data and future dates
          if (!booking.practice_sessions) {
            console.warn('⚠️ Booking missing session data:', booking.id);
            return false;
          }
          
          const sessionDate = booking.practice_sessions.session_date;
          if (!sessionDate) {
            console.warn('⚠️ Session missing date:', booking.practice_sessions.id);
            return false;
          }
          
          // Check if session is in the future
          const today = new Date().toISOString().split('T')[0];
          return sessionDate >= today;
        })
        .map((booking: any) => {
          const session = booking.practice_sessions;
          return {
            id: booking.id,
            session_title: session.title || 'Practice Session',
            session_date: session.session_date,
            start_time: session.start_time || '09:00',
            end_time: session.end_time || '10:00',
            status: booking.status,
            test_type: session.test_type || 'PREP',
            location_name: session.locations?.name || 'Location TBD',
          };
        })
        .slice(0, 2); // Limit to 2 most recent

      console.log('✅ Formatted bookings:', formattedBookings.length);
      setUpcomingBookings(formattedBookings);
      
    } catch (error: any) {
      console.error('❌ Error loading upcoming bookings:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      // Always set empty array on error to prevent UI crashes
      setUpcomingBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Load prerequisites status - simplified to show only incomplete ones
  const loadPrerequisites = () => {
    const officialPrereqs: PrerequisiteStatus[] = [
      { id: 'age-18', title: 'Be at least 18 years old', completed: true, required: true, category: 'official' },
      { id: 'citizenship', title: 'Canadian citizen or permanent resident', completed: true, required: true, category: 'official' },
      { id: 'drivers-license', title: 'Valid driver\'s license', completed: true, required: true, category: 'official' },
      { id: 'education', title: 'High school diploma or equivalent', completed: true, required: true, category: 'official' },
      { id: 'criminal-record', title: 'Clean criminal record', completed: true, required: true, category: 'official' },
    ];

    const unwrittenPrereqs: PrerequisiteStatus[] = [
      { id: 'physical-fitness', title: 'Meet physical fitness standards', completed: fitnessProgress.beepTestLevel >= 6.5, required: true, category: 'unwritten' },
      { id: 'mental-readiness', title: 'Mental and emotional readiness', completed: true, required: true, category: 'unwritten' },
      { id: 'financial-stability', title: 'Financial stability for training', completed: true, required: true, category: 'unwritten' },
      { id: 'support-system', title: 'Support system in place', completed: true, required: true, category: 'unwritten' },
      { id: 'time-commitment', title: 'Time commitment for training', completed: true, required: true, category: 'unwritten' },
    ];

    setPrerequisites([...officialPrereqs, ...unwrittenPrereqs]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadUpcomingBookings(),
      loadPrerequisites(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadUpcomingBookings();
    loadPrerequisites();
  }, [authUser?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'approved':
        return <CheckCircle size={16} color={Colors.warning} />;
      case 'pending':
        return <Clock size={16} color={Colors.primary} />;
      case 'rejected':
        return <XCircle size={16} color={Colors.error} />;
      default:
        return <Clock size={16} color={Colors.textSecondary} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'approved':
        return Colors.warning;
      case 'pending':
        return Colors.primary;
      case 'rejected':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const incompletePrerequisites = prerequisites.filter(p => !p.completed && p.required);
  const completedPrerequisites = prerequisites.filter(p => p.completed);

  // Only show prerequisites section if there are incomplete requirements
  const shouldShowPrerequisites = incompletePrerequisites.length > 0;

  // Monetization handlers
  const handleDigitalTestAccess = async () => {
    if (canAccessDigitalTest()) {
      await trackDigitalTestAttempt('dashboard_quick_access');
      router.push('/pin-test');
    } else {
      await trackDigitalTestAttempt('dashboard_locked_access');
      setUpsellTrigger('digital-test');
      setShowUpsellModal(true);
    }
  };

  const handleTrainingPlanAccess = async (weekNumber: number) => {
    if (canAccessTrainingPlan(weekNumber)) {
      await trackTrainingPlanView('dashboard_quick_access');
      router.push('/fitness');
    } else {
      await trackTrainingPlanView('dashboard_locked_access');
      setUpsellTrigger('training-plan');
      setShowUpsellModal(true);
    }
  };

  const handleServicesAccess = () => {
    setShowServicesModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Premium Background Gradient */}
      <LinearGradient
        colors={[Colors.gradients.surface.start, Colors.gradients.surface.end]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
      {/* Premium Hero Section */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroGreeting}>{heroGreeting}</Text>
                <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
              </View>
              <View style={styles.heroIcon}>
                <Trophy size={32} color={Colors.accent} />
              </View>
            </View>
            
            {/* Premium Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Target size={20} color={Colors.white} />
                <Text style={styles.statValue}>{completedSteps}/{applicationSteps.length}</Text>
                <Text style={styles.statLabel}>Steps Complete</Text>
              </View>
              <View style={styles.statCard}>
                <Activity size={20} color={Colors.white} />
                <Text style={styles.statValue}>{thisWeekWorkouts}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={20} color={Colors.white} />
                <Text style={styles.statValue}>{currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions - Premium Style */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={handleDigitalTestAccess}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.gradients.premium.start, Colors.gradients.premium.end]}
              style={styles.quickActionGradient}
            >
              <Zap size={24} color={Colors.white} />
              <Text style={styles.quickActionTitle}>Digital Test</Text>
              <Text style={styles.quickActionSubtitle}>Practice PIN/PREP</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/fitness')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.gradients.success.start, Colors.gradients.success.end]}
              style={styles.quickActionGradient}
            >
              <Dumbbell size={24} color={Colors.white} />
              <Text style={styles.quickActionTitle}>Training</Text>
              <Text style={styles.quickActionSubtitle}>Start workout</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/practice-sessions')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.gradients.warning.start, Colors.gradients.warning.end]}
              style={styles.quickActionGradient}
            >
              <Calendar size={24} color={Colors.white} />
              <Text style={styles.quickActionTitle}>Book Session</Text>
              <Text style={styles.quickActionSubtitle}>In-person test</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/community')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.gradients.secondary.start, Colors.gradients.secondary.end]}
              style={styles.quickActionGradient}
            >
              <Users size={24} color={Colors.white} />
              <Text style={styles.quickActionTitle}>Community</Text>
              <Text style={styles.quickActionSubtitle}>Connect & share</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Application Progress - Premium Card */}
      <View style={styles.progressSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Application Progress</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/application')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <EnhancedCard variant="premium">
          <View style={styles.progressHeader}>
            <View style={styles.progressIconContainer}>
              <Target size={24} color={Colors.primary} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Overall Progress</Text>
              <Text style={styles.progressPercentage}>{Math.round(applicationProgress)}% Complete</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${applicationProgress}%` }]} />
            </View>
          </View>
          
          <View style={styles.progressSteps}>
            {applicationSteps.slice(0, 3).map((step, index) => (
              <View key={step.id} style={styles.progressStep}>
                <View style={[
                  styles.stepIndicator,
                  { backgroundColor: step.completed ? Colors.success : Colors.border }
                ]}>
                  {step.completed ? (
                    <CheckCircle size={12} color={Colors.white} />
                  ) : (
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  )}
                </View>
                <Text style={[
                  styles.stepTitle,
                  { color: step.completed ? Colors.text : Colors.textSecondary }
                ]}>{step.title}</Text>
              </View>
            ))}
          </View>
        </EnhancedCard>
      </View>
      
      {/* Prerequisites - Only show if incomplete */}
      {shouldShowPrerequisites && (
        <View style={styles.prerequisitesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Missing Requirements</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/application')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <EnhancedCard variant="elevated">
            <View style={styles.warningHeader}>
              <AlertCircle size={20} color={Colors.warning} />
              <Text style={styles.warningTitle}>Action Required</Text>
            </View>
            <Text style={styles.warningSubtitle}>
              Complete these requirements to unlock application steps
            </Text>
            
            {incompletePrerequisites.slice(0, 3).map((prereq) => (
              <TouchableOpacity 
                key={prereq.id} 
                style={styles.requirementItem}
                onPress={() => {
                  if (prereq.id === 'physical-fitness') {
                    router.push('/fitness');
                  } else {
                    router.push('/application');
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.requirementIcon}>
                  <AlertCircle size={16} color={Colors.warning} />
                </View>
                <Text style={styles.requirementText}>{prereq.title}</Text>
                <ChevronRight size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
            
            {incompletePrerequisites.length > 3 && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => router.push('/application')}
              >
                <Text style={styles.viewMoreText}>
                  +{incompletePrerequisites.length - 3} more requirements
                </Text>
              </TouchableOpacity>
            )}
          </EnhancedCard>
        </View>
      )}

      {/* Upcoming Bookings - Premium Style */}
      {upcomingBookings.length > 0 && (
        <View style={styles.bookingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/practice-sessions')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {upcomingBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => router.push(`/practice-sessions/${booking.id}`)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.white, Colors.backgroundSecondary]}
                style={styles.bookingGradient}
              >
                <View style={styles.bookingContent}>
                  <View style={styles.bookingIconContainer}>
                    <Calendar size={24} color={Colors.primary} />
                  </View>
                  
                  <View style={styles.bookingDetails}>
                    <Text style={styles.bookingTitle}>{booking.session_title}</Text>
                    <Text style={styles.bookingDateTime}>
                      {new Date(booking.session_date).toLocaleDateString()} at {booking.start_time}
                    </Text>
                    <Text style={styles.bookingLocation}>{booking.location_name}</Text>
                    
                    <View style={styles.bookingFooter}>
                      <View style={[
                        styles.bookingBadge,
                        { backgroundColor: Colors.primary + '15' }
                      ]}>
                        <Text style={[styles.bookingBadgeText, { color: Colors.primary }]}>
                          {booking.test_type} Test
                        </Text>
                      </View>
                      
                      <View style={styles.bookingStatus}>
                        {getStatusIcon(booking.status)}
                        <Text style={[styles.bookingStatusText, { color: getStatusColor(booking.status) }]}>
                          {getStatusText(booking.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Fitness Progress - Only show if not meeting requirements */}
      {fitnessProgress.beepTestLevel < 6.5 && (
        <View style={styles.fitnessSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fitness Progress</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/fitness')}
            >
              <Text style={styles.viewAllText}>View Details</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.fitnessCard}
            onPress={() => router.push('/fitness')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.gradients.success.start, Colors.gradients.success.end]}
              style={styles.fitnessGradient}
            >
              <View style={styles.fitnessContent}>
                <View style={styles.fitnessHeader}>
                  <Activity size={28} color={Colors.white} />
                  <View style={styles.fitnessInfo}>
                    <Text style={styles.fitnessTitle}>Beep Test Level</Text>
                    <Text style={styles.fitnessSubtitle}>PREP requirement: 6.5</Text>
                  </View>
                </View>
                
                <View style={styles.fitnessProgress}>
                  <Text style={styles.fitnessValue}>{fitnessProgress.beepTestLevel.toFixed(1)}</Text>
                  <View style={styles.fitnessProgressBar}>
                    <View style={styles.fitnessProgressBackground}>
                      <View style={[
                        styles.fitnessProgressFill,
                        { width: `${Math.min((fitnessProgress.beepTestLevel / 6.5) * 100, 100)}%` }
                      ]} />
                    </View>
                    <Text style={styles.fitnessProgressText}>
                      {Math.round((fitnessProgress.beepTestLevel / 6.5) * 100)}% to goal
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}





      {/* Today's Workout - Premium Style */}
      {recentWorkouts.length > 0 && (
        <View style={styles.workoutSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Workout</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/fitness')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.workoutCard}
            onPress={() => router.push(`/workout/${recentWorkouts[0].id}`)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.gradients.warning.start, Colors.gradients.warning.end]}
              style={styles.workoutGradient}
            >
              <View style={styles.workoutContent}>
                <View style={styles.workoutHeader}>
                  <Play size={24} color={Colors.white} />
                  <Text style={styles.workoutTitle}>{recentWorkouts[0].title}</Text>
                </View>
                <Text style={styles.workoutDescription}>{recentWorkouts[0].description}</Text>
                <View style={styles.workoutFooter}>
                  <Text style={styles.workoutDuration}>{recentWorkouts[0].duration} min</Text>
                  <Text style={styles.workoutDifficulty}>Beginner</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Premium Features Section */}
      {subscription.tier === 'free' && (
        <View style={styles.premiumSection}>
          <EnhancedCard variant="heavy">
            <View style={styles.premiumHeader}>
              <Star size={24} color={Colors.warning} />
              <Text style={styles.premiumTitle}>Unlock Premium Features</Text>
            </View>
            <Text style={styles.premiumSubtitle}>
              Get unlimited access to all features and accelerate your preparation
            </Text>
            
            <View style={styles.premiumFeatures}>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureText}>• Unlimited digital tests with detailed analytics</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureText}>• Complete training plans with personalization</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureText}>• Interview prep vault with mock sessions</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Text style={styles.premiumFeatureText}>• Priority booking and subscriber discounts</Text>
              </View>
            </View>

            <View style={styles.premiumActions}>
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => {
                  setUpsellTrigger('general');
                  setShowUpsellModal(true);
                }}
              >
                <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.servicesButton}
                onPress={handleServicesAccess}
              >
                <Text style={styles.servicesButtonText}>Book Services</Text>
              </TouchableOpacity>
            </View>
          </EnhancedCard>
        </View>
      )}

      {/* Digital Tests Usage Info */}
      {subscription.tier === 'free' && (
        <View style={styles.usageSection}>
          <EnhancedCard variant="elevated">
            <Text style={styles.usageTitle}>Digital Tests Remaining</Text>
            <Text style={styles.usageCount}>
              {getRemainingDigitalTests()} of 2 this month
            </Text>
            <TouchableOpacity
              style={styles.usageButton}
              onPress={handleDigitalTestAccess}
            >
              <Text style={styles.usageButtonText}>Take a Test</Text>
            </TouchableOpacity>
          </EnhancedCard>
        </View>
      )}

      {/* Motivational Section for New Users */}
      {completedSteps === 0 && upcomingBookings.length === 0 && (
        <View style={styles.motivationalSection}>
          <EnhancedCard variant="gradient" gradientColors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}>
            <View style={styles.motivationalCard}>
              <Star size={32} color={Colors.white} />
              <Text style={[styles.motivationalTitle, { color: Colors.white }]}>Start Your Journey</Text>
              <Text style={[styles.motivationalText, { color: Colors.white + 'CC' }]}>
                Begin by completing your profile and exploring our fitness training programs.
              </Text>
              <TouchableOpacity
                style={styles.motivationalButton}
                onPress={() => router.push('/profile-completion')}
              >
                <Text style={styles.motivationalButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </EnhancedCard>
        </View>
      )}

      {/* Modals */}
      <UpsellModal
        visible={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        trigger={upsellTrigger}
        onSubscribe={() => setShowUpsellModal(false)}
      />

      <OneTimeServicesModal
        visible={showServicesModal}
        onClose={() => setShowServicesModal(false)}
      />

      </ScrollView>
    </View>
  );
}



const calculateCurrentStreak = (workoutLogs: any[]): number => {
  if (workoutLogs.length === 0) return 0;
  
  const sortedLogs = workoutLogs
    .filter(log => log.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedLogs.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date);
    logDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  // Hero Section Styles
  heroSection: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.md,
  },
  heroGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.lg,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroGreeting: {
    ...typography.displayMedium,
    color: Colors.white,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.bodyLarge,
    color: Colors.white + 'CC',
  },
  heroIcon: {
    marginLeft: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  statValue: {
    ...typography.headingLarge,
    color: Colors.white,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.labelSmall,
    color: Colors.white + 'CC',
    textAlign: 'center',
  },
  // Section Styles
  sectionTitle: {
    ...typography.headingLarge,
    color: Colors.text,
    fontWeight: '800',
  },
  // Quick Actions Styles
  quickActionGradient: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: 100,
    justifyContent: 'center',
  },
  quickActionTitle: {
    ...typography.labelLarge,
    color: Colors.white,
    marginTop: spacing.sm,
    fontWeight: '700',
  },
  quickActionSubtitle: {
    ...typography.labelSmall,
    color: Colors.white + 'CC',
    marginTop: spacing.xs,
  },
  // Progress Styles
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  progressPercentage: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    marginBottom: spacing.lg,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.sm,
  },
  progressSteps: {
    gap: spacing.md,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepNumber: {
    ...typography.labelSmall,
    color: Colors.white,
    fontWeight: '700',
  },
  stepTitle: {
    ...typography.bodyMedium,
    flex: 1,
  },
  // Warning Styles
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  warningTitle: {
    ...typography.headingSmall,
    color: Colors.warning,
    marginLeft: spacing.sm,
  },
  warningSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '50',
  },
  requirementIcon: {
    marginRight: spacing.sm,
  },
  requirementText: {
    ...typography.bodyMedium,
    color: Colors.text,
    flex: 1,
  },
  // Booking Styles
  bookingGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.light,
  },
  bookingContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bookingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  bookingDetails: {
    flex: 1,
  },
  bookingDateTime: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  // Fitness Styles
  fitnessSection: {
    marginBottom: spacing.lg,
  },
  fitnessCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  fitnessGradient: {
    padding: spacing.lg,
  },
  fitnessContent: {
    alignItems: 'center',
  },
  fitnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  fitnessInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  fitnessTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    marginBottom: spacing.xs,
  },
  fitnessSubtitle: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
  },
  fitnessProgress: {
    alignItems: 'center',
    width: '100%',
  },
  fitnessValue: {
    ...typography.displayLarge,
    color: Colors.white,
    marginBottom: spacing.md,
  },
  fitnessProgressBar: {
    width: '100%',
    alignItems: 'center',
  },
  fitnessProgressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.white + '30',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  fitnessProgressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.sm,
  },
  fitnessProgressText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
  },
  // Workout Styles
  workoutSection: {
    marginBottom: spacing.lg,
  },
  workoutCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  workoutGradient: {
    padding: spacing.lg,
  },
  workoutContent: {
    alignItems: 'flex-start',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  workoutTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    marginLeft: spacing.sm,
    flex: 1,
  },
  workoutDescription: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
    marginBottom: spacing.md,
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  workoutDuration: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  workoutDifficulty: {
    ...typography.labelMedium,
    color: Colors.white + 'CC',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressCards: {
    gap: 12,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    textAlign: "center",
  },
  workoutsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  ctaSection: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  ctaDescription: {
    fontSize: 14,
    color: Colors.white + "CC",
    textAlign: "center",
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: Colors.white,
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  premiumInfo: {
    flex: 1,
    marginLeft: 12,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  premiumSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  manageButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  manageButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  upgradeBanner: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  upgradeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  upgradeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  upgradeText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 22,
  },
  upgradeSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },

  heroStats: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
  },
  heroStat: {
    alignItems: "center",
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.white,
    lineHeight: 24,
  },
  heroStatLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  profileButton: {
    marginLeft: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  topMetricSection: {
    marginBottom: 20,
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  modernSectionTitle: {
    ...typography.headingMedium,
    fontWeight: "800",
    color: Colors.text,
  },
  ctaIcon: {
    marginBottom: 12,
  },
  prerequisitesSection: {
    marginBottom: 24,
  },
  prerequisitesGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  prerequisiteCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  prerequisiteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  prerequisiteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
  },
  prerequisiteCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  prerequisiteProgress: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  prerequisiteProgressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  missingRequirements: {
    marginTop: spacing.sm,
  },
  missingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  missingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.warning,
    marginLeft: 8,
  },
  missingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  missingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  missingItemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  viewMoreButton: {
    alignSelf: "center",
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  bookingsSection: {
    marginBottom: 24,
  },
  bookingCard: {
    marginBottom: spacing.sm,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  bookingDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  bookingLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bookingStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  bookingBadge: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  bookingBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  motivationalSection: {
    marginTop: spacing.lg,
  },
  motivationalCard: {
    alignItems: "center",
  },
  motivationalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  motivationalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  motivationalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  // Premium Features Styles
  premiumSection: {
    marginBottom: 24,
  },
  premiumCard: {
    // Styles handled by EnhancedCard
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginLeft: 8,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  premiumFeatures: {
    marginBottom: 20,
  },
  premiumFeature: {
    marginBottom: 8,
  },
  premiumFeatureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  premiumActions: {
    flexDirection: "row",
    gap: 12,
  },
  premiumButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  premiumButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  servicesButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  servicesButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  // Usage Section Styles
  usageSection: {
    marginBottom: 24,
  },
  usageCard: {
    alignItems: "center",
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  usageCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  usageButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  usageButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});