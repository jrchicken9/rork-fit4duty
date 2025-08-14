import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { 
  Target, 
  CheckCircle, 
  Clock, 
  Star,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  TrendingUp,
  Zap,
  MapPin,
  BarChart3,
  Play,
  ChevronRight,
  Filter,
  List,
  DollarSign,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Crown,
  Lock,
  Unlock,
  ExternalLink,
  Info,
  Calendar,
  Award,
  FileText,
} from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { typography, spacing, borderRadius, shadows } from "@/constants/designSystem";
import MonetizedStepCard from "@/components/MonetizedStepCard";
import Button from "@/components/Button";
import TabSpecificHeader from "@/components/TabSpecificHeader";
import EnhancedCard from "@/components/EnhancedCard";
import AnimatedProgressBar from "@/components/AnimatedProgressBar";
import EmptyState from "@/components/EmptyState";
import { useApplication } from "@/context/ApplicationContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import UpsellModal from "@/components/UpsellModal";
import { trackInterviewPrepAccess } from "@/lib/monetizationAnalytics";
import applicationSteps from "@/constants/applicationSteps";

export default function ApplicationScreen() {
  const {
    getApplicationStepsWithProgress,
    getCompletedStepsCount,
    getProgressPercentage,
    markStepCompleted,
    markStepIncomplete,
    isLoading,
    isSaving,
  } = useApplication();
  const { subscription, canAccessFeature } = useSubscription();
  const { user } = useAuth();

  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [upsellTrigger, setUpsellTrigger] = useState<'digital-test' | 'training-plan' | 'interview-prep' | 'community' | 'general'>('general');

  const stepsWithProgress = getApplicationStepsWithProgress();
  const completedStepsCount = getCompletedStepsCount();
  const progressPercentage = getProgressPercentage();

  const markAsCompleted = (stepId: string) => {
    markStepCompleted(stepId);
  };

  const resetStep = async (stepId: string) => {
    await markStepIncomplete(stepId);
  };

  const isStepLocked = (stepIndex: number): boolean => {
    // First step is always unlocked
    if (stepIndex === 0) return false;
    
    // Premium users have access to all steps (except logical dependencies)
    if (subscription.tier === 'premium') {
      // For premium users, only lock if previous steps are not completed
      for (let i = 0; i < stepIndex; i++) {
        if (!stepsWithProgress[i].completed) {
          return true;
        }
      }
      return false;
    }
    
    // Free users: only first 3 steps are available
    if (stepIndex < 3) {
      // Check if all previous steps are completed
      for (let i = 0; i < stepIndex; i++) {
        if (!stepsWithProgress[i].completed) {
          return true;
        }
      }
      return false;
    }
    
    // Free users: steps after index 2 are locked
    return true;
  };

  const getStepStatus = (step: any, index: number) => {
    if (step.completed) return 'completed';
    if (isStepLocked(index)) return 'locked';
    if (step.current) return 'current';
    return 'available';
  };

  // Monetization handlers
  const handleInterviewPrepAccess = async () => {
    if (canAccessFeature('interviewPrep')) {
      await trackInterviewPrepAccess('application_screen_access');
      // Navigate to interview prep content
      router.push('/application/interview-preparation');
    } else {
      await trackInterviewPrepAccess('application_screen_locked');
      setUpsellTrigger('interview-prep');
      setShowUpsellModal(true);
    }
  };

  const handlePremiumResourceAccess = (stepId: string) => {
    if (subscription.tier === 'premium') {
      // Allow access to premium resources
      router.push(`/application/${stepId}`);
    } else {
      setUpsellTrigger('general');
      setShowUpsellModal(true);
    }
  };
  
  const getStepGradientColors = (status: string): readonly [string, string] => {
    switch (status) {
      case 'completed':
        return [Colors.gradients.success.start, Colors.gradients.success.end] as const;
      case 'current':
        return [Colors.gradients.primary.start, Colors.gradients.primary.end] as const;
      case 'locked':
        return [Colors.gray[400], Colors.gray[500]] as const;
      default:
        return [Colors.gradients.secondary.start, Colors.gradients.secondary.end] as const;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading application progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Enhanced Tab-Specific Header */}
      <TabSpecificHeader
        tab="application"
        stats={[
          {
            label: "Steps Complete",
            value: `${completedStepsCount}/${applicationSteps.length}`,
            icon: <Target size={16} color={Colors.accent} />
          },
          {
            label: "Progress",
            value: `${Math.round(progressPercentage)}%`,
            icon: <TrendingUp size={16} color={Colors.success} />
          },
          {
            label: "Remaining",
            value: applicationSteps.length - completedStepsCount,
            icon: <Clock size={16} color={Colors.warning} />
          }
        ]}
      />

      {/* Progress Overview */}
      <EnhancedCard variant="elevated" style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressIcon}>
            <Target size={24} color={Colors.primary} />
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressText}>
              {completedStepsCount} of {applicationSteps.length} steps completed
            </Text>
          </View>
        </View>
        <AnimatedProgressBar
          progress={progressPercentage}
          variant="gradient"
          showPercentage={true}
          height={12}
        />
        <Text style={styles.progressSubtext}>
          Complete each step to advance through your police application journey
        </Text>
      </EnhancedCard>

      {/* Steps Section */}
      <View style={styles.stepsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Application Steps</Text>
          <Text style={styles.sectionSubtitle}>
            Follow the complete process from prerequisites to final steps
          </Text>
        </View>

        {/* Step Cards */}
        <View style={styles.stepsContainer}>
          {stepsWithProgress.length > 0 ? (
            stepsWithProgress.map((step, index) => {
              const isCompleted = step.completed || false;
              const isCurrent = step.current || false;
              const isLocked = isStepLocked(index);
              
              return (
                <MonetizedStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  isLocked={isLocked}
                  onMarkComplete={markAsCompleted}
                  onMarkIncomplete={resetStep}
                  isSaving={isSaving}
                />
              );
            })
          ) : (
            <EmptyState
              type="application"
              onAction={() => router.push('/application/1')}
            />
          )}
        </View>
      </View>

      {/* Premium Features Section - Only show for free users */}
      {subscription.tier === 'free' && (
        <View style={styles.premiumSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Unlock Premium Features</Text>
              <Text style={styles.sectionSubtitle}>Get expert guidance and tools</Text>
            </View>
            <View style={styles.premiumBadge}>
              <Sparkles size={16} color={Colors.white} />
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          </View>

          {/* Premium Features Grid */}
          <View style={styles.premiumFeaturesGrid}>
            {/* Document Review */}
            <EnhancedCard
              variant="elevated"
              onPress={() => router.push('/subscription')}
              style={styles.premiumFeatureCard}
            >
              <View style={styles.premiumFeatureContent}>
                <View style={styles.premiumFeatureIcon}>
                  <FileText size={28} color={Colors.features.digitalTest} />
                  <View style={styles.lockOverlay}>
                    <Lock size={16} color={Colors.white} />
                  </View>
                </View>
                <Text style={styles.premiumFeatureTitle}>Document Review</Text>
                <Text style={styles.premiumFeatureDescription}>Get your application reviewed by certified instructors</Text>
                <View style={styles.upgradePrompt}>
                  <Text style={styles.upgradePromptText}>Upgrade to unlock</Text>
                </View>
              </View>
            </EnhancedCard>

            {/* Mock Interviews */}
            <EnhancedCard
              variant="elevated"
              onPress={() => router.push('/subscription')}
              style={styles.premiumFeatureCard}
            >
              <View style={styles.premiumFeatureContent}>
                <View style={styles.premiumFeatureIcon}>
                  <Users size={28} color={Colors.features.community} />
                  <View style={styles.lockOverlay}>
                    <Lock size={16} color={Colors.white} />
                  </View>
                </View>
                <Text style={styles.premiumFeatureTitle}>Mock Interviews</Text>
                <Text style={styles.premiumFeatureDescription}>Practice with former police officers</Text>
                <View style={styles.upgradePrompt}>
                  <Text style={styles.upgradePromptText}>Upgrade to unlock</Text>
                </View>
              </View>
            </EnhancedCard>

            {/* Study Guides */}
            <EnhancedCard
              variant="elevated"
              onPress={() => router.push('/subscription')}
              style={styles.premiumFeatureCard}
            >
              <View style={styles.premiumFeatureContent}>
                <View style={styles.premiumFeatureIcon}>
                  <BookOpen size={28} color={Colors.features.interviewPrep} />
                  <View style={styles.lockOverlay}>
                    <Lock size={16} color={Colors.white} />
                  </View>
                </View>
                <Text style={styles.premiumFeatureTitle}>Study Guides</Text>
                <Text style={styles.premiumFeatureDescription}>Complete preparation materials and practice tests</Text>
                <View style={styles.upgradePrompt}>
                  <Text style={styles.upgradePromptText}>Upgrade to unlock</Text>
                </View>
              </View>
            </EnhancedCard>

            {/* Progress Tracking */}
            <TouchableOpacity 
              style={styles.premiumFeatureCard}
              onPress={() => router.push('/subscription')}
            >
              <View style={styles.premiumFeatureContent}>
                <View style={styles.premiumFeatureIcon}>
                  <TrendingUp size={28} color="#8B5CF6" />
                  <View style={styles.lockOverlay}>
                    <Lock size={16} color={Colors.white} />
                  </View>
                </View>
                <Text style={styles.premiumFeatureTitle}>Progress Tracking</Text>
                <Text style={styles.premiumFeatureDescription}>Advanced analytics and insights</Text>
                <View style={styles.upgradePrompt}>
                  <Text style={styles.upgradePromptText}>Upgrade to unlock</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Social Proof Widget */}
          <View style={styles.socialProofWidget}>
            <View style={styles.socialProofHeader}>
              <Users size={20} color={Colors.primary} />
              <Text style={styles.socialProofTitle}>What Members Say</Text>
            </View>
            
            <View style={styles.testimonialCard}>
              <View style={styles.testimonialContent}>
                <Text style={styles.testimonialText}>
                  "The premium study guides and mock interviews were game-changing. I felt so much more confident throughout the entire process!"
                </Text>
                <View style={styles.testimonialAuthor}>
                  <Text style={styles.testimonialName}>- Michael R.</Text>
                  <Text style={styles.testimonialResult}>Hired by Toronto Police</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>89%</Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2.5x</Text>
                <Text style={styles.statLabel}>Faster Prep</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.9★</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>

          {/* Upgrade CTA */}
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
                  <Text style={styles.upgradeCTATitle}>Unlock All Application Tools</Text>
                  <Text style={styles.upgradeCTASubtitle}>Get expert document reviews, mock interviews, study guides, and advanced progress tracking</Text>
                </View>
                <View style={styles.upgradeCTAButton}>
                  <Text style={styles.upgradeCTAButtonText}>Upgrade Now</Text>
                  <ArrowRight size={20} color={Colors.white} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Persistent CTA for free users */}
      {subscription.tier === 'free' && (
        <View style={styles.persistentCTA}>
          <TouchableOpacity 
            style={styles.persistentCTAButton}
            onPress={() => router.push('/subscription')}
          >
            <Text style={styles.persistentCTAText}>Unlock All Application Tools</Text>
            <ArrowRight size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Upsell Modal */}
      <UpsellModal
        visible={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        trigger={upsellTrigger}
        onSubscribe={() => setShowUpsellModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
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
  heroTitle: {
    ...typography.displayMedium,
    color: Colors.white,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.bodyLarge,
    color: Colors.white + 'CC',
  },
  heroIconContainer: {
    marginLeft: spacing.md,
  },
  progressStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.md,
  },
  progressStatCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  progressStatValue: {
    ...typography.headingLarge,
    color: Colors.white,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  progressStatLabel: {
    ...typography.labelSmall,
    color: Colors.white + 'CC',
    textAlign: 'center',
  },
  // Progress Overview Section
  progressOverviewSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  progressOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressOverviewIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  progressOverviewInfo: {
    flex: 1,
  },
  progressOverviewTitle: {
    ...typography.headingLarge,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  progressOverviewSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
  },
  progressPercentageContainer: {
    alignItems: 'center',
  },
  progressPercentageText: {
    ...typography.displaySmall,
    color: Colors.primary,
    fontWeight: '800',
  },
  progressBarSection: {
    marginBottom: spacing.md,
  },
  progressOverviewDescription: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Steps Section
  stepsSectionHeader: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  stepsSectionTitle: {
    ...typography.displaySmall,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  stepsSectionSubtitle: {
    ...typography.bodyLarge,
    color: Colors.textSecondary,
  },
  stepsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  stepCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.medium,
  },
  stepCardCompleted: {
    ...shadows.colored,
  },
  stepCardCurrent: {
    ...shadows.heavy,
  },
  stepCardLocked: {
    opacity: 0.7,
  },
  stepCardGradient: {
    padding: spacing.lg,
  },
  stepCardContent: {
    position: 'relative',
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumberContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumber: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '800',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
  },
  premiumBadgeContainer: {
    position: 'absolute',
    top: -spacing.sm,
    right: -spacing.sm,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    ...shadows.light,
  },
  premiumBadgeText: {
    ...typography.labelSmall,
    color: Colors.accent,
    fontWeight: '700',
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  
  // Progress Card
  progressCard: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressBar: {
    // Handled by AnimatedProgressBar component
  },
  progressFill: {
    // Handled by AnimatedProgressBar component
  },
  progressSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  // Steps Section
  stepsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  stepsContainer: {
    paddingHorizontal: 20,
  },

  // Premium Section
  premiumSection: {
    marginBottom: 32,
  },
  sectionTitleContainer: {
    flex: 1,
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

  // Premium Features Grid
  premiumFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
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

  // Social Proof Widget
  socialProofWidget: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
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

  // Upgrade CTA
  upgradeCTACard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginHorizontal: 20,
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

  // Persistent CTA
  persistentCTA: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  persistentCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  persistentCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});