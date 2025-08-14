import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Award, 
  Filter, 
  Search, 
  Settings, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  Dumbbell,
  Shield,
  Star,
  TrendingUp,
  Target,
  Info
} from 'lucide-react-native';
import { useCPP } from '@/context/CPPContext';
import { useSubscription } from '@/context/SubscriptionContext';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import CPPProgressWidget from '@/components/CPPProgressWidget';
import CPPStepCard from '@/components/CPPStepCard';
import { CPP_STEPS, CPP_CATEGORIES } from '@/constants/cpp';
import { router } from 'expo-router';

type FilterType = 'all' | 'profile' | 'application' | 'fitness' | 'verification';
type SortType = 'weight' | 'category' | 'status' | 'name';

export default function CPPScreen() {
  const { 
    progress, 
    getCategoryProgress, 
    getUpsellTriggers, 
    resetProgress,
    purchaseAdditionalVerification,
    isLoading 
  } = useCPP();
  const { subscription } = useSubscription();
  
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('weight');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['profile']));
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const upsellTriggers = getUpsellTriggers();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getFilteredAndSortedSteps = () => {
    let filteredSteps = CPP_STEPS;
    
    // Apply filter
    if (selectedFilter !== 'all') {
      filteredSteps = filteredSteps.filter(step => step.category === selectedFilter);
    }
    
    // Apply sorting
    filteredSteps.sort((a, b) => {
      switch (sortBy) {
        case 'weight':
          return b.weight - a.weight;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'status':
          const aStatus = progress.completions.find(c => c.id === a.id)?.status || 'not_started';
          const bStatus = progress.completions.find(c => c.id === b.id)?.status || 'not_started';
          const statusOrder = { verified: 3, unverified: 2, in_progress: 1, not_started: 0 };
          return statusOrder[bStatus] - statusOrder[aStatus];
        default:
          return 0;
      }
    });
    
    return filteredSteps;
  };

  const getStepsByCategory = () => {
    const steps = getFilteredAndSortedSteps();
    const grouped: Record<string, typeof steps> = {};
    
    steps.forEach(step => {
      if (!grouped[step.category]) {
        grouped[step.category] = [];
      }
      grouped[step.category].push(step);
    });
    
    return grouped;
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset CPP Progress',
      'Are you sure you want to reset all your Certified Preparation Progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetProgress,
        },
      ]
    );
  };

  const handlePurchaseVerification = () => {
    Alert.alert(
      'Purchase Additional Verification',
      `Purchase an additional verification for $${subscription.tier === 'premium' ? '19.99' : '0'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: purchaseAdditionalVerification,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <Award size={28} color={Colors.primary} />
              <Text style={styles.title}>Certified Preparation Progress</Text>
            </View>
            <Text style={styles.subtitle}>
              Track your readiness for the police application process
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/cpp/settings')}
            >
              <Settings size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Progress Widget */}
        <CPPProgressWidget 
          onPress={() => router.push('/cpp/details')}
          showDetails={true}
        />

        {/* Upsell Triggers */}
        {upsellTriggers.length > 0 && (
          <View style={styles.upsellSection}>
            {upsellTriggers.slice(0, 2).map((trigger, index) => (
              <TouchableOpacity
                key={trigger.id}
                style={[
                  styles.upsellCard,
                  { 
                    backgroundColor: trigger.priority === 'high' ? Colors.error + '20' : Colors.warning + '20',
                    borderColor: trigger.priority === 'high' ? Colors.error : Colors.warning,
                  }
                ]}
                onPress={() => {
                  switch (trigger.action) {
                    case 'subscribe':
                      router.push('/subscription');
                      break;
                    case 'purchase_verification':
                      handlePurchaseVerification();
                      break;
                    case 'book_session':
                      router.push('/practice-sessions');
                      break;
                  }
                }}
              >
                <View style={styles.upsellHeader}>
                  <Target size={16} color={trigger.priority === 'high' ? Colors.error : Colors.warning} />
                  <Text style={[
                    styles.upsellTitle,
                    { color: trigger.priority === 'high' ? Colors.error : Colors.warning }
                  ]}>
                    {trigger.title}
                  </Text>
                </View>
                <Text style={styles.upsellMessage}>{trigger.message}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersSection}>
            <Text style={styles.filtersTitle}>Filter & Sort</Text>
            
            {/* Category Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Category:</Text>
              <View style={styles.filterOptions}>
                {(['all', 'profile', 'application', 'fitness', 'verification'] as FilterType[]).map(filter => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterOption,
                      selectedFilter === filter && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedFilter === filter && styles.filterOptionTextActive
                    ]}>
                      {filter === 'all' ? 'All' : CPP_CATEGORIES[filter]?.name || filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Sort by:</Text>
              <View style={styles.filterOptions}>
                {(['weight', 'category', 'status', 'name'] as SortType[]).map(sort => (
                  <TouchableOpacity
                    key={sort}
                    style={[
                      styles.filterOption,
                      sortBy === sort && styles.filterOptionActive
                    ]}
                    onPress={() => setSortBy(sort)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      sortBy === sort && styles.filterOptionTextActive
                    ]}>
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Category Progress Overview */}
        <View style={styles.categoryOverview}>
          <Text style={styles.sectionTitle}>Progress by Category</Text>
          <View style={styles.categoryGrid}>
            {Object.entries(CPP_CATEGORIES).map(([key, category]) => {
              const categoryProgress = getCategoryProgress(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.categoryCard}
                  onPress={() => toggleCategory(key)}
                >
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryIcon}>
                      {React.createElement(
                        key === 'profile' ? User :
                        key === 'application' ? FileText :
                        key === 'fitness' ? Dumbbell :
                        Shield, 
                        { size: 20, color: category.color }
                      )}
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryProgress}>
                        {categoryProgress.completed}/{categoryProgress.total} completed
                      </Text>
                    </View>
                    {expandedCategories.has(key) ? 
                      <ChevronUp size={16} color={Colors.textSecondary} /> :
                      <ChevronDown size={16} color={Colors.textSecondary} />
                    }
                  </View>
                  <View style={styles.categoryProgressBar}>
                    <View 
                      style={[
                        styles.categoryProgressFill,
                        { 
                          width: `${categoryProgress.percentage}%`,
                          backgroundColor: category.color,
                        }
                      ]} 
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Steps by Category */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>CPP Steps</Text>
          {Object.entries(getStepsByCategory()).map(([category, steps]) => {
            const categoryInfo = CPP_CATEGORIES[category];
            const isExpanded = expandedCategories.has(category);
            
            return (
              <View key={category} style={styles.categorySection}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(category)}
                >
                  <View style={styles.categoryTitleSection}>
                    <View style={styles.categoryIcon}>
                      {React.createElement(
                        category === 'profile' ? User :
                        category === 'application' ? FileText :
                        category === 'fitness' ? Dumbbell :
                        Shield, 
                        { size: 20, color: categoryInfo.color }
                      )}
                    </View>
                    <Text style={[styles.categoryTitle, { color: categoryInfo.color }]}>
                      {categoryInfo.name}
                    </Text>
                  </View>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryStatText}>
                      {steps.filter(s => {
                        const completion = progress.completions.find(c => c.id === s.id);
                        return completion?.status === 'verified' || completion?.status === 'unverified';
                      }).length}/{steps.length}
                    </Text>
                    {isExpanded ? 
                      <ChevronUp size={16} color={Colors.textSecondary} /> :
                      <ChevronDown size={16} color={Colors.textSecondary} />
                    }
                  </View>
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.stepsList}>
                    {steps.map(step => (
                      <CPPStepCard
                        key={step.id}
                        stepId={step.id}
                        showActions={true}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/practice-sessions')}
            >
              <Dumbbell size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Book Practice Test</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/subscription')}
            >
              <Star size={20} color={Colors.warning} />
              <Text style={styles.actionButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/application')}
            >
              <FileText size={20} color={Colors.success} />
              <Text style={styles.actionButtonText}>Application Steps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
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
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.light,
  },
  
  // Upsell Section
  upsellSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  upsellCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  upsellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  upsellTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  upsellMessage: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  
  // Filters Section
  filtersSection: {
    backgroundColor: Colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.light,
  },
  filtersTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.md,
  },
  filterGroup: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  filterOptionTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  
  // Category Overview
  categoryOverview: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    paddingHorizontal: spacing.lg,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.light,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryProgress: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  // Steps Section
  stepsSection: {
    marginBottom: spacing.lg,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryStatText: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  stepsList: {
    marginTop: spacing.sm,
  },
  
  // Quick Actions
  quickActions: {
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: Colors.white,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.light,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  
  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});

