import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Crown, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Star, 
  Target, 
  Users, 
  BarChart3,
  BookOpen,
  Video,
  FileText,
  MessageCircle,
  TrendingUp,
  Zap,
  Shield,
  Calendar,
  Award
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface PremiumToolsSectionProps {
  isPremium: boolean;
  subscriptionTier: string;
  onUpgrade: () => void;
  onFeaturePress: (feature: string) => void;
}

export default function PremiumToolsSection({ 
  isPremium, 
  subscriptionTier, 
  onUpgrade, 
  onFeaturePress 
}: PremiumToolsSectionProps) {
  const premiumFeatures = [
    {
      id: 'training-plans',
      title: 'Advanced Training Plans',
      description: 'Personalized workout programs with progress tracking',
      icon: Target,
      color: Colors.primary,
      locked: !isPremium
    },
    {
      id: 'mock-interviews',
      title: 'Unlimited Mock Interviews',
      description: 'Practice with AI-powered interview simulations',
      icon: MessageCircle,
      color: Colors.success,
      locked: !isPremium
    },
    {
      id: 'progress-tracking',
      title: 'Advanced Progress Tracking',
      description: 'Detailed analytics and performance insights',
      icon: BarChart3,
      color: Colors.warning,
      locked: !isPremium
    },
    {
      id: 'study-materials',
      title: 'Premium Study Materials',
      description: 'Exclusive guides, videos, and resources',
      icon: BookOpen,
      color: Colors.info,
      locked: !isPremium
    },
    {
      id: 'community-access',
      title: 'Premium Community',
      description: 'Access to exclusive forums and expert advice',
      icon: Users,
      color: Colors.secondary,
      locked: !isPremium
    },
    {
      id: 'priority-support',
      title: 'Priority Support',
      description: '24/7 dedicated customer support',
      icon: Shield,
      color: Colors.error,
      locked: !isPremium
    }
  ];

  const oneTimePurchases = [
    {
      id: 'practice-test',
      title: 'Practice Test Package',
      description: '5 full-length practice tests with detailed feedback',
      price: '$29.99',
      icon: FileText,
      color: Colors.primary
    },
    {
      id: 'application-review',
      title: 'Application Review',
      description: 'Professional review of your police application',
      price: '$49.99',
      icon: CheckCircle,
      color: Colors.success
    },
    {
      id: 'study-guide',
      title: 'Study Guide Bundle',
      description: 'Comprehensive downloadable study materials',
      price: '$19.99',
      icon: BookOpen,
      color: Colors.warning
    }
  ];

  const comparisonData = [
    {
      feature: 'Basic Workout Plans',
      free: true,
      premium: true
    },
    {
      feature: 'Progress Tracking',
      free: true,
      premium: true
    },
    {
      feature: 'Community Access',
      free: true,
      premium: true
    },
    {
      feature: 'Advanced Training Plans',
      free: false,
      premium: true
    },
    {
      feature: 'Mock Interviews',
      free: false,
      premium: true
    },
    {
      feature: 'Premium Study Materials',
      free: false,
      premium: true
    },
    {
      feature: 'Priority Support',
      free: false,
      premium: true
    },
    {
      feature: 'Analytics Dashboard',
      free: false,
      premium: true
    }
  ];

  const FeatureCard = ({ 
    feature, 
    onPress 
  }: { 
    feature: any; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      style={[styles.featureCard, feature.locked && styles.lockedCard]}
      onPress={onPress}
      disabled={feature.locked}
    >
      <View style={styles.featureHeader}>
        <View style={[styles.featureIcon, { backgroundColor: feature.color + '10' }]}>
          <feature.icon size={20} color={feature.color} />
        </View>
        {feature.locked && (
          <View style={styles.lockIcon}>
            <Lock size={16} color={Colors.textSecondary} />
          </View>
        )}
      </View>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>
      {feature.price && (
        <Text style={styles.featurePrice}>{feature.price}</Text>
      )}
    </TouchableOpacity>
  );

  const ComparisonRow = ({ 
    feature, 
    free, 
    premium 
  }: { 
    feature: string; 
    free: boolean; 
    premium: boolean; 
  }) => (
    <View style={styles.comparisonRow}>
      <Text style={styles.comparisonFeature}>{feature}</Text>
      <View style={styles.comparisonChecks}>
        <View style={styles.comparisonCheck}>
          {free ? (
            <CheckCircle size={16} color={Colors.success} />
          ) : (
            <XCircle size={16} color={Colors.textSecondary} />
          )}
        </View>
        <View style={styles.comparisonCheck}>
          {premium ? (
            <CheckCircle size={16} color={Colors.primary} />
          ) : (
            <XCircle size={16} color={Colors.textSecondary} />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Crown size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>Premium Tools & Subscription</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>{subscriptionTier}</Text>
          </View>
        )}
      </View>

      {/* Subscription Benefits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription Benefits</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuresContainer}
        >
          {premiumFeatures.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onPress={() => onFeaturePress(feature.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* One-Time Purchases */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>One-Time Purchases</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuresContainer}
        >
          {oneTimePurchases.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onPress={() => onFeaturePress(feature.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Comparison Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Free vs Premium</Text>
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonHeaderText}>Feature</Text>
            <Text style={styles.comparisonHeaderText}>Free</Text>
            <Text style={styles.comparisonHeaderText}>Premium</Text>
          </View>
          {comparisonData.map((item, index) => (
            <ComparisonRow
              key={index}
              feature={item.feature}
              free={item.free}
              premium={item.premium}
            />
          ))}
        </View>
      </View>

      {/* Upgrade Button */}
      {!isPremium && (
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <Crown size={20} color={Colors.white} />
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      )}

      {/* Current Plan Info */}
      {isPremium && (
        <View style={styles.currentPlanContainer}>
          <View style={styles.currentPlanHeader}>
            <Crown size={20} color={Colors.primary} />
            <Text style={styles.currentPlanTitle}>Current Plan: {subscriptionTier}</Text>
          </View>
          <Text style={styles.currentPlanDescription}>
            You have access to all premium features and tools.
          </Text>
          <TouchableOpacity style={styles.manageButton} onPress={onUpgrade}>
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  premiumBadge: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 12,
    paddingRight: 16,
  },
  featureCard: {
    width: 200,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lockedCard: {
    opacity: 0.6,
    position: 'relative',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  featurePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  comparisonContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  comparisonHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  comparisonFeature: {
    flex: 2,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  comparisonChecks: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  comparisonCheck: {
    flex: 1,
    alignItems: 'center',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  currentPlanContainer: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  currentPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  currentPlanDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  manageButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
});
