import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  Zap,
  ChevronRight,
  RefreshCw,
  Activity
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useCPPData, useCPPProgress, useCPPBadges, useCPPAnalytics } from '@/hooks/useCPPData';
import CPPProgressBadges from '@/components/CPPProgressBadges';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorMessage from '@/components/ErrorMessage';

const { width } = Dimensions.get('window');

interface CPPDashboardProps {
  onStepPress?: (stepId: string) => void;
  onCategoryPress?: (category: string) => void;
  onRecommendationPress?: (recommendationId: string) => void;
}

export default function CPPDashboard({ 
  onStepPress, 
  onCategoryPress, 
  onRecommendationPress 
}: CPPDashboardProps) {
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, error, refresh, isReady } = useCPPData();
  const { percentage, completions, verifications } = useCPPProgress();
  const { next: nextBadge, progressToNext } = useCPPBadges();
  const { 
    totalTimeSpent, 
    averageSessionTime, 
    completionRate, 
    currentStreak,
    weeklyProgress 
  } = useCPPAnalytics();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (isLoading && !data) {
    return <LoadingScreen title="Compiling CPP Data" subtitle="Please wait while we analyze your progress..." />;
  }

  if (error && !data) {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage message={error} type="error" />
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isReady || !data) {
    return (
      <View style={styles.emptyState}>
        <AlertCircle size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyStateText}>No CPP data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderProgressOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Progress Overview</Text>
      
      <LinearGradient
        colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
        style={styles.progressCard}
      >
        <View style={styles.progressHeader}>
          <View style={styles.progressStats}>
            <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
          <View style={styles.progressBadgeContainer}>
            <CPPProgressBadges 
              percentage={percentage} 
              size="small" 
              showLabels={false}
              horizontal={true}
            />
          </View>
        </View>
        
        <View style={styles.progressDetails}>
          <View style={styles.progressDetailItem}>
            <CheckCircle size={16} color={Colors.white} />
            <Text style={styles.progressDetailText}>{completions} Completed</Text>
          </View>
          <View style={styles.progressDetailItem}>
            <Award size={16} color={Colors.white} />
            <Text style={styles.progressDetailText}>{verifications} Verified</Text>
          </View>
          <View style={styles.progressDetailItem}>
            <Zap size={16} color={Colors.white} />
            <Text style={styles.progressDetailText}>{currentStreak} Day Streak</Text>
          </View>
        </View>
        
        {data.progressMessage && (
          <View style={styles.progressMessage}>
            <Text style={styles.progressMessageText}>{data.progressMessage.message}</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderCategoryBreakdown = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Category Progress</Text>
        <TouchableOpacity onPress={() => onCategoryPress?.('all')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoryGrid}>
        {Object.entries(data.categoryBreakdown).map(([key, category]) => (
          <TouchableOpacity 
            key={key} 
            style={styles.categoryCard}
            onPress={() => onCategoryPress?.(key)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
              <View style={[styles.categoryIconInner, { backgroundColor: category.color }]}>
                <Text style={styles.categoryIconText}>
                  {category.icon === 'User' ? '👤' : 
                   category.icon === 'FileText' ? '📄' : 
                   category.icon === 'Dumbbell' ? '💪' : 
                   category.icon === 'Shield' ? '🛡️' : '📊'}
                </Text>
              </View>
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryProgress}>
              {category.completed}/{category.total}
            </Text>
            <View style={styles.categoryProgressBar}>
              <View 
                style={[
                  styles.categoryProgressFill, 
                  { 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color 
                  }
                ]} 
              />
            </View>
            <Text style={styles.categoryPercentage}>{Math.round(category.percentage)}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <TouchableOpacity onPress={refresh}>
          <RefreshCw size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      {data.recommendations.slice(0, 3).map((recommendation, index) => (
        <TouchableOpacity 
          key={recommendation.id}
          style={[
            styles.recommendationCard,
            recommendation.priority === 'high' && styles.highPriorityCard
          ]}
          onPress={() => onRecommendationPress?.(recommendation.id)}
        >
          <View style={styles.recommendationHeader}>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(recommendation.priority) + '20' }
            ]}>
              <Text style={[
                styles.priorityText,
                { color: getPriorityColor(recommendation.priority) }
              ]}>
                {recommendation.priority.toUpperCase()}
              </Text>
            </View>
            <ChevronRight size={16} color={Colors.textSecondary} />
          </View>
          <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
          <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Analytics</Text>
      
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Clock size={20} color={Colors.primary} />
          <Text style={styles.analyticsValue}>{totalTimeSpent}m</Text>
          <Text style={styles.analyticsLabel}>Total Time</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <Activity size={20} color={Colors.success} />
          <Text style={styles.analyticsValue}>{averageSessionTime}m</Text>
          <Text style={styles.analyticsLabel}>Avg Session</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <BarChart3 size={20} color={Colors.warning} />
          <Text style={styles.analyticsValue}>{Math.round(completionRate)}%</Text>
          <Text style={styles.analyticsLabel}>Completion Rate</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <TrendingUp size={20} color={Colors.info} />
          <Text style={styles.analyticsValue}>{currentStreak}</Text>
          <Text style={styles.analyticsLabel}>Current Streak</Text>
        </View>
      </View>
      
      {weeklyProgress.length > 0 && (
        <View style={styles.weeklyProgressContainer}>
          <Text style={styles.weeklyProgressTitle}>Weekly Activity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.weeklyProgressChart}>
              {weeklyProgress.slice(-7).map((week, index) => (
                <View key={week.week} style={styles.weeklyProgressBar}>
                  <View 
                    style={[
                      styles.weeklyProgressFill,
                      { 
                        height: Math.max(4, (week.completions / 5) * 40),
                        backgroundColor: Colors.primary 
                      }
                    ]} 
                  />
                  <Text style={styles.weeklyProgressLabel}>W{index + 1}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderBadgeProgress = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Achievement Progress</Text>
      
      <View style={styles.badgeProgressContainer}>
        <CPPProgressBadges 
          percentage={percentage} 
          size="medium" 
          showLabels={true}
          horizontal={true}
        />
        
        {nextBadge && (
          <View style={styles.nextBadgeInfo}>
            <Text style={styles.nextBadgeText}>
              {progressToNext.toFixed(1)}% to {nextBadge.name}
            </Text>
            <View style={styles.nextBadgeProgressBar}>
              <View 
                style={[
                  styles.nextBadgeProgressFill,
                  { width: `${Math.max(5, 100 - progressToNext)}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {renderProgressOverview()}
      {renderCategoryBreakdown()}
      {renderRecommendations()}
      {renderBadgeProgress()}
      {renderAnalytics()}
      
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high': return Colors.error;
    case 'medium': return Colors.warning;
    case 'low': return Colors.info;
    default: return Colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Section styles
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    fontWeight: '700',
  },
  viewAllText: {
    ...typography.labelMedium,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // Progress Overview
  progressCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressStats: {
    alignItems: 'flex-start',
  },
  progressPercentage: {
    ...typography.displayLarge,
    color: Colors.white,
    fontWeight: '800',
    lineHeight: 48,
  },
  progressLabel: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
  },
  progressBadgeContainer: {
    alignItems: 'flex-end',
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  progressDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressDetailText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  progressMessage: {
    backgroundColor: Colors.white + '20',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  progressMessageText: {
    ...typography.bodyMedium,
    color: Colors.white,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Category Breakdown
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: (width - spacing.md * 3) / 2,
    ...shadows.light,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIconInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: {
    fontSize: 16,
  },
  categoryName: {
    ...typography.labelMedium,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  categoryProgress: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  categoryProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryPercentage: {
    ...typography.labelSmall,
    color: Colors.text,
    fontWeight: '700',
  },
  
  // Recommendations
  recommendationCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.light,
  },
  highPriorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  priorityText: {
    ...typography.labelSmall,
    fontWeight: '700',
    fontSize: 10,
  },
  recommendationTitle: {
    ...typography.bodyLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  recommendationDescription: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
  },
  
  // Analytics
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  analyticsCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    width: (width - spacing.md * 2 - spacing.sm) / 2,
    ...shadows.light,
  },
  analyticsValue: {
    ...typography.headingMedium,
    color: Colors.text,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  analyticsLabel: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  // Weekly Progress
  weeklyProgressContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.light,
  },
  weeklyProgressTitle: {
    ...typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  weeklyProgressChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  weeklyProgressBar: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  weeklyProgressFill: {
    width: 20,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  weeklyProgressLabel: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  
  // Badge Progress
  badgeProgressContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.light,
  },
  nextBadgeInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBadgeText: {
    ...typography.bodyMedium,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  nextBadgeProgressBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
  },
  nextBadgeProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  
  // Bottom spacer
  bottomSpacer: {
    height: 100,
  },
});