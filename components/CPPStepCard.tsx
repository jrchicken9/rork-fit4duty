import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Shield, 
  Lock, 
  ChevronRight,
  AlertCircle,
  Star,
  Zap,
  User,
  FileText,
  Dumbbell,
  Award,
  Clock3,
  Target,
  Info
} from 'lucide-react-native';
import { useCPP } from '@/context/CPPContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { CPP_STEPS, CPP_CATEGORIES } from '@/constants/cpp';
import { CPPCompletionStatus } from '@/types/cpp';
import { router } from 'expo-router';

interface CPPStepCardProps {
  stepId: string;
  onPress?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function CPPStepCard({ 
  stepId, 
  onPress, 
  showActions = true, 
  compact = false 
}: CPPStepCardProps) {
  const { getStepProgress, markCompletion, verificationAllowance } = useCPP();
  const { subscription } = useSubscription();
  const { user } = useAuth();
  
  const step = CPP_STEPS.find(s => s.id === stepId);
  const completion = getStepProgress(stepId);
  
  if (!step || !completion) {
    return null;
  }

  const category = CPP_CATEGORIES[step.category];
  const isPremiumRequired = step.upgradeRequired && subscription.tier === 'free';
  const canVerify = step.requiresVerification && verificationAllowance.remainingThisMonth > 0;
  const isCompleted = completion.status === 'verified' || completion.status === 'unverified';
  const isVerified = completion.status === 'verified';

  const getStatusIcon = () => {
    switch (completion.status) {
      case 'verified':
        return <Shield size={20} color={Colors.success} />;
      case 'unverified':
        return <CheckCircle size={20} color={Colors.primary} />;
      case 'in_progress':
        return <Clock size={20} color={Colors.warning} />;
      default:
        return <Circle size={20} color={Colors.gray[400]} />;
    }
  };

  const getStatusColor = () => {
    switch (completion.status) {
      case 'verified':
        return Colors.success;
      case 'unverified':
        return Colors.primary;
      case 'in_progress':
        return Colors.warning;
      default:
        return Colors.gray[400];
    }
  };

  const getCategoryIcon = () => {
    switch (step.category) {
      case 'profile':
        return <User size={16} color={category.color} />;
      case 'application':
        return <FileText size={16} color={category.color} />;
      case 'fitness':
        return <Dumbbell size={16} color={category.color} />;
      case 'verification':
        return <Award size={16} color={category.color} />;
      default:
        return <Target size={16} color={category.color} />;
    }
  };

  const handleMarkCompletion = (status: CPPCompletionStatus) => {
    if (status === 'verified' && !canVerify) {
      Alert.alert(
        'Verification Limit Reached',
        'You\'ve used all your monthly verifications. Upgrade to Premium or wait until next month.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') },
        ]
      );
      return;
    }

    if (isPremiumRequired && subscription.tier === 'free') {
      Alert.alert(
        'Premium Required',
        step.upsellMessage || 'This step requires a Premium subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') },
        ]
      );
      return;
    }

    markCompletion(stepId, status);
  };

  const handleAction = () => {
    if (onPress) {
      onPress();
      return;
    }

    // Default actions based on step type
    switch (step.verificationType) {
      case 'in_person_prep_test':
      case 'in_person_pin_test':
        router.push('/practice-sessions');
        break;
      case 'ai_monitored_test':
      case 'human_verified_test':
        router.push(`/application/${stepId}`);
        break;
      case 'profile_completion':
        router.push('/(tabs)/profile');
        break;
      case 'police_service_selection':
        router.push('/application/police-service-selection');
        break;
      default:
        router.push(`/application/${stepId}`);
    }
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, { borderColor: getStatusColor() }]} 
        onPress={handleAction}
        activeOpacity={0.8}
      >
        <View style={styles.compactHeader}>
          <View style={styles.compactTitleRow}>
            {getStatusIcon()}
            <Text style={[styles.compactTitle, { color: getStatusColor() }]}>
              {step.title}
            </Text>
          </View>
          <View style={styles.compactCategory}>
            {getCategoryIcon()}
            <Text style={styles.compactCategoryText}>{category.name}</Text>
          </View>
        </View>
        
        <Text style={styles.compactDescription} numberOfLines={2}>
          {step.description}
        </Text>
        
        <View style={styles.compactFooter}>
          <View style={styles.compactMeta}>
            <Clock3 size={12} color={Colors.textSecondary} />
            <Text style={styles.compactMetaText}>{step.estimatedTime}</Text>
          </View>
          <View style={styles.compactWeight}>
            <Star size={12} color={Colors.warning} />
            <Text style={styles.compactWeightText}>{step.weight} pts</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { borderColor: getStatusColor() }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          {getStatusIcon()}
          <View style={styles.titleContent}>
            <Text style={[styles.title, { color: getStatusColor() }]}>
              {step.title}
            </Text>
            <View style={styles.categoryRow}>
              {getCategoryIcon()}
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.weightSection}>
          <Star size={16} color={Colors.warning} />
          <Text style={styles.weightText}>{step.weight}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{step.description}</Text>

      {/* Meta Information */}
      <View style={styles.metaSection}>
        <View style={styles.metaItem}>
          <Clock3 size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{step.estimatedTime}</Text>
        </View>
        
        {step.requiresVerification && (
          <View style={styles.metaItem}>
            <Shield size={14} color={Colors.success} />
            <Text style={styles.metaText}>
              {isVerified ? 'Verified' : 'Requires Verification'}
            </Text>
          </View>
        )}
        
        {step.isRequired && (
          <View style={styles.metaItem}>
            <AlertCircle size={14} color={Colors.error} />
            <Text style={styles.metaText}>Required</Text>
          </View>
        )}
      </View>

      {/* Tips */}
      {step.tips.length > 0 && (
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          {step.tips.slice(0, 2).map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Upsell Message */}
      {isPremiumRequired && (
        <View style={styles.upsellSection}>
          <Lock size={16} color={Colors.warning} />
          <Text style={styles.upsellText}>{step.upsellMessage}</Text>
        </View>
      )}

      {/* Actions */}
      {showActions && (
        <View style={styles.actionsSection}>
          {!isCompleted ? (
            <View style={styles.actionButtons}>
              {step.requiresVerification && canVerify && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.verifyButton]}
                  onPress={() => handleMarkCompletion('verified')}
                >
                  <Shield size={16} color={Colors.white} />
                  <Text style={styles.verifyButtonText}>Mark Verified</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleMarkCompletion('unverified')}
              >
                <CheckCircle size={16} color={Colors.white} />
                <Text style={styles.completeButtonText}>Mark Complete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={handleAction}
              >
                <Zap size={16} color={Colors.primary} />
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.completedActions}>
              <View style={styles.completedStatus}>
                <Text style={styles.completedText}>
                  {isVerified ? 'Verified' : 'Completed'}
                </Text>
                {completion.completedAt && (
                  <Text style={styles.completedDate}>
                    {new Date(completion.completedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={handleAction}
              >
                <Text style={styles.reviewButtonText}>Review</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.light,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flex: 1,
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  weightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  weightText: {
    fontSize: typography.sizes.sm,
    fontWeight: 'bold',
    color: Colors.warning,
  },
  
  // Description
  description: {
    fontSize: typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  
  // Meta Section
  metaSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  
  // Tips Section
  tipsSection: {
    marginBottom: spacing.md,
  },
  tipsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  tipBullet: {
    fontSize: typography.sizes.sm,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  
  // Upsell Section
  upsellSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: Colors.warning + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  upsellText: {
    fontSize: typography.sizes.sm,
    color: Colors.warning,
    flex: 1,
  },
  
  // Actions Section
  actionsSection: {
    marginTop: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flex: 1,
    justifyContent: 'center',
  },
  verifyButton: {
    backgroundColor: Colors.success,
  },
  verifyButtonText: {
    color: Colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: Colors.primary,
  },
  completeButtonText: {
    color: Colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  startButtonText: {
    color: Colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  
  // Completed Actions
  completedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedStatus: {
    flex: 1,
  },
  completedText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: Colors.success,
  },
  completedDate: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  reviewButtonText: {
    color: Colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  
  // Compact Styles
  compactContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    ...shadows.light,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  compactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  compactTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  compactCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactCategoryText: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
  },
  compactDescription: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactMetaText: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
  },
  compactWeight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactWeightText: {
    fontSize: typography.sizes.xs,
    color: Colors.warning,
    fontWeight: '600',
  },
});

