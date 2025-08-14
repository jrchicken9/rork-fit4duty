import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { router } from "expo-router";
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
  Award
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { typography, spacing, borderRadius, shadows } from "@/constants/designSystem";
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Enhanced Tab-Specific Header */}
      <TabSpecificHeader
        tab="dashboard"
        stats={[
          {
            label: "Steps Complete",
            value: `${completedSteps}/${applicationSteps.length}`,
            icon: <Target size={16} color={Colors.primary} />
          },
          {
            label: "This Week",
            value: thisWeekWorkouts,
            icon: <Activity size={16} color={Colors.success} />
          },
          {
            label: "Current Streak",
            value: currentStreak,
            icon: <TrendingUp size={16} color={Colors.warning} />
          }
        ]}
      />

      {/* Stats Overview - Simplified */}
      <StatsOverview
        totalWorkouts={thisWeekWorkouts}
        weeklyGoal={weeklyGoal}
        currentStreak={currentStreak}
        applicationProgress={applicationProgress}
      />

      {/* Prerequisites Progress - Only show if incomplete */}
      {shouldShowPrerequisites && (
        <View style={styles.prerequisitesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.modernSectionTitle}>Complete Requirements</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/application')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <EnhancedCard variant="elevated">
            <View style={styles.missingHeader}>
              <AlertCircle size={16} color={Colors.warning} />
              <Text style={styles.missingTitle}>Missing Requirements</Text>
            </View>
            <Text style={styles.missingSubtitle}>
              Complete these to unlock application steps
            </Text>
            {incompletePrerequisites.slice(0, 3).map((prereq) => (
              <TouchableOpacity 
                key={prereq.id} 
                style={styles.missingItem}
                onPress={() => {
                  if (prereq.id === 'physical-fitness') {
                    router.push('/fitness');
                  } else {
                    router.push('/application');
                  }
                }}
              >
                <Text style={styles.missingItemText}>• {prereq.title}</Text>
                <ChevronRight size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
            {incompletePrerequisites.length > 3 && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => router.push('/application')}
              >
                <Text style={styles.viewMoreText}>
                  View {incompletePrerequisites.length - 3} more requirements
                </Text>
              </TouchableOpacity>
            )}
          </EnhancedCard>
        </View>
      )}

      {/* Upcoming Bookings - Only show if there are bookings */}
      {upcomingBookings.length > 0 && (
        <View style={styles.bookingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.modernSectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/practice-sessions/bookings')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {upcomingBookings.map((booking) => (
            <EnhancedCard
              key={booking.id}
              variant="elevated"
              onPress={() => router.push(`/practice-sessions/${booking.id}`)}
              style={styles.bookingCard}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingTitle}>{booking.session_title}</Text>
                  <Text style={styles.bookingDate}>
                    {new Date(booking.session_date).toLocaleDateString()} • {booking.start_time}
                  </Text>
                  <Text style={styles.bookingLocation}>{booking.location_name}</Text>
                </View>
                <View style={styles.bookingStatus}>
                  {getStatusIcon(booking.status)}
                  <Text style={[styles.bookingStatusText, { color: getStatusColor(booking.status) }]}>
                    {getStatusText(booking.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.bookingBadge}>
                <Text style={styles.bookingBadgeText}>{booking.test_type} Test</Text>
              </View>
            </EnhancedCard>
          ))}
        </View>
      )}

      {/* Top Fitness Metric - Only show if not meeting requirements */}
      {fitnessProgress.beepTestLevel < 6.5 && (
        <View style={styles.topMetricSection}>
          <ProgressCard
            title="Beep Test Level"
            subtitle="PREP requirement: 6.5"
            value={fitnessProgress.beepTestLevel.toFixed(1)}
            change={10}
            progress={(fitnessProgress.beepTestLevel / 6.5) * 100}
            icon={<Activity size={20} color={Colors.primary} />}
            testId="beep-test-progress"
            variant="large"
            onPress={() => router.push("/fitness")}
          />
        </View>
      )}

      {/* Application Progress - Simplified */}
      <ApplicationProgress
        steps={applicationSteps.slice(0, 3).map(step => ({
          id: step.id,
          title: step.title,
          completed: step.completed,
          current: step.current,
        }))}
        completedSteps={completedSteps}
        totalSteps={applicationSteps.length}
      />

      {/* Quick Actions - Streamlined */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.modernSectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <EnhancedCard
            variant="gradient"
            gradientColors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
            onPress={() => router.push("/fitness")}
            style={styles.quickActionCard}
          >
            <Dumbbell size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Start Training</Text>
          </EnhancedCard>
          <EnhancedCard
            variant="gradient"
            gradientColors={[Colors.gradients.secondary.start, Colors.gradients.secondary.end]}
            onPress={() => router.push("/application")}
            style={styles.quickActionCard}
          >
            <Target size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Application</Text>
          </EnhancedCard>
          <EnhancedCard
            variant="gradient"
            gradientColors={[Colors.gradients.success.start, Colors.gradients.success.end]}
            onPress={() => router.push("/practice-sessions")}
            style={styles.quickActionCard}
          >
            <Calendar size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Book Session</Text>
          </EnhancedCard>
          <EnhancedCard
            variant="gradient"
            gradientColors={[Colors.gradients.warning.start, Colors.gradients.warning.end]}
            onPress={() => router.push("/(tabs)/community")}
            style={styles.quickActionCard}
          >
            <Users size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Community</Text>
          </EnhancedCard>
        </View>
      </View>

      {/* Today's Workout - Only show if there's a workout */}
      {recentWorkouts.length > 0 && (
        <View style={styles.workoutsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.modernSectionTitle}>Today&apos;s Workout</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push("/fitness")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <WorkoutCard workout={recentWorkouts[0]} />
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
  contentContainer: {
    padding: spacing.md,
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
  heroHeader: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerInfo: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 28,
  },
  heroSubtitle: {
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