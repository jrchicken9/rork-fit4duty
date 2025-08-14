import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Award, 
  Shield, 
  CheckCircle, 
  Circle, 
  Clock, 
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Star,
  Zap
} from 'lucide-react-native';
import { useCPP } from '@/context/CPPContext';
import { useSubscription } from '@/context/SubscriptionContext';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { CPP_PROGRESS_MESSAGES } from '@/constants/cpp';

const { width } = Dimensions.get('window');

interface CPPProgressWidgetProps {
  onPress?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

export default function CPPProgressWidget({ 
  onPress, 
  showDetails = true, 
  compact = false 
}: CPPProgressWidgetProps) {
  const { progress, verificationAllowance, getUpsellTriggers } = useCPP();
  const { subscription } = useSubscription();
  
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: progress.percentage,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [progress.percentage]);

  const getProgressMessage = () => {
    if (progress.percentage >= 90) return CPP_PROGRESS_MESSAGES.excellent;
    if (progress.percentage >= 70) return CPP_PROGRESS_MESSAGES.good;
    if (progress.percentage >= 40) return CPP_PROGRESS_MESSAGES.fair;
    return CPP_PROGRESS_MESSAGES.needs_improvement;
  };

  const progressMessage = getProgressMessage();
  const upsellTriggers = getUpsellTriggers();
  const hasHighPriorityUpsell = upsellTriggers.some(trigger => trigger.priority === 'high');

  const getProgressColor = () => {
    if (progress.percentage >= 90) return Colors.success;
    if (progress.percentage >= 70) return Colors.primary;
    if (progress.percentage >= 40) return Colors.warning;
    return Colors.error;
  };

  const getProgressGradient = () => {
    if (progress.percentage >= 90) return [Colors.success, Colors.success + 'DD'];
    if (progress.percentage >= 70) return [Colors.primary, Colors.primary + 'DD'];
    if (progress.percentage >= 40) return [Colors.warning, Colors.warning + 'DD'];
    return [Colors.error, Colors.error + 'DD'];
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, { borderColor: getProgressColor() }]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.compactHeader}>
          <View style={styles.compactTitleRow}>
            <Award size={16} color={getProgressColor()} />
            <Text style={[styles.compactTitle, { color: getProgressColor() }]}>
              CPP Progress
            </Text>
          </View>
          <Text style={styles.compactPercentage}>
            {Math.round(progress.percentage)}%
          </Text>
        </View>
        
        <View style={styles.compactProgressBar}>
          <Animated.View 
            style={[
              styles.compactProgressFill,
              { 
                width: progressAnim,
                backgroundColor: getProgressColor(),
              }
            ]} 
          />
        </View>
        
        <View style={styles.compactStats}>
          <View style={styles.compactStat}>
            <Shield size={12} color={Colors.success} />
            <Text style={styles.compactStatText}>{progress.verifiedCompletions}</Text>
          </View>
          <View style={styles.compactStat}>
            <CheckCircle size={12} color={Colors.primary} />
            <Text style={styles.compactStatText}>{progress.unverifiedCompletions}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={getProgressGradient()}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity 
          style={styles.content} 
          onPress={onPress}
          activeOpacity={0.9}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Award size={24} color={Colors.white} />
              <Text style={styles.title}>Certified Preparation Progress</Text>
            </View>
            {onPress && (
              <ChevronRight size={20} color={Colors.white + 'CC'} />
            )}
          </View>

          {/* Progress Circle */}
          <View style={styles.progressSection}>
            <View style={styles.progressCircle}>
              <Animated.View 
                style={[
                  styles.progressCircleFill,
                  { 
                    transform: [{ rotate: `${progressAnim * 3.6}deg` }],
                    borderColor: Colors.white,
                  }
                ]} 
              />
              <View style={styles.progressCenter}>
                <Text style={styles.progressPercentage}>
                  {Math.round(progress.percentage)}%
                </Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Shield size={16} color={Colors.white + 'CC'} />
              <Text style={styles.statNumber}>{progress.verifiedCompletions}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statItem}>
              <CheckCircle size={16} color={Colors.white + 'CC'} />
              <Text style={styles.statNumber}>{progress.unverifiedCompletions}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={16} color={Colors.white + 'CC'} />
              <Text style={styles.statNumber}>{progress.totalCompletions}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Progress Message */}
          <View style={styles.messageSection}>
            <Text style={styles.messageTitle}>{progressMessage.title}</Text>
            <Text style={styles.messageText}>{progressMessage.message}</Text>
          </View>

          {/* Verification Allowance */}
          {subscription.tier === 'premium' && (
            <View style={styles.allowanceSection}>
              <View style={styles.allowanceHeader}>
                <Shield size={16} color={Colors.white + 'CC'} />
                <Text style={styles.allowanceTitle}>Monthly Verifications</Text>
              </View>
              <View style={styles.allowanceProgress}>
                <View style={styles.allowanceBar}>
                  <View 
                    style={[
                      styles.allowanceFill,
                      { 
                        width: `${(verificationAllowance.usedThisMonth / verificationAllowance.monthlyLimit) * 100}%`,
                        backgroundColor: verificationAllowance.remainingThisMonth > 0 ? Colors.white : Colors.error,
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.allowanceText}>
                  {verificationAllowance.remainingThisMonth} of {verificationAllowance.monthlyLimit} remaining
                </Text>
              </View>
            </View>
          )}

          {/* Upsell Alert */}
          {hasHighPriorityUpsell && (
            <View style={styles.upsellAlert}>
              <AlertCircle size={16} color={Colors.white} />
              <Text style={styles.upsellText}>
                {upsellTriggers.find(t => t.priority === 'high')?.message}
              </Text>
            </View>
          )}

          {/* Details Toggle */}
          {showDetails && (
            <View style={styles.detailsToggle}>
              <Text style={styles.detailsText}>Tap to view details</Text>
              <ChevronRight size={16} color={Colors.white + 'CC'} />
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.medium,
  },
  gradientBackground: {
    borderRadius: borderRadius.xl,
  },
  content: {
    padding: spacing.lg,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.white,
  },
  
  // Progress Section
  progressSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircleFill: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: Colors.white,
    borderRightColor: Colors.white,
  },
  progressCenter: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.white,
  },
  progressLabel: {
    fontSize: typography.sizes.sm,
    color: Colors.white + 'CC',
    marginTop: 2,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: Colors.white + 'CC',
  },
  
  // Message Section
  messageSection: {
    marginBottom: spacing.md,
  },
  messageTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: typography.sizes.sm,
    color: Colors.white + 'CC',
    lineHeight: 20,
  },
  
  // Allowance Section
  allowanceSection: {
    marginBottom: spacing.md,
  },
  allowanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  allowanceTitle: {
    fontSize: typography.sizes.sm,
    color: Colors.white + 'CC',
  },
  allowanceProgress: {
    gap: spacing.xs,
  },
  allowanceBar: {
    height: 6,
    backgroundColor: Colors.white + '20',
    borderRadius: 3,
    overflow: 'hidden',
  },
  allowanceFill: {
    height: '100%',
    borderRadius: 3,
  },
  allowanceText: {
    fontSize: typography.sizes.xs,
    color: Colors.white + 'CC',
  },
  
  // Upsell Alert
  upsellAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: Colors.white + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  upsellText: {
    fontSize: typography.sizes.sm,
    color: Colors.white,
    flex: 1,
  },
  
  // Details Toggle
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  detailsText: {
    fontSize: typography.sizes.sm,
    color: Colors.white + 'CC',
  },
  
  // Compact Styles
  compactContainer: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.light,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  compactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  compactPercentage: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  compactProgressBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactStatText: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
  },
});

