import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Trophy, 
  Award, 
  Star, 
  Crown, 
  Shield, 
  Target,
  CheckCircle,
  Lock
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';

interface CPPProgressBadgesProps {
  percentage: number;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  horizontal?: boolean;
}

interface BadgeTier {
  id: string;
  name: string;
  threshold: number;
  icon: React.ComponentType<any>;
  colors: {
    start: string;
    end: string;
    accent: string;
  };
  description: string;
}

const BADGE_TIERS: BadgeTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    threshold: 0,
    icon: Target,
    colors: {
      start: Colors.gray[300],
      end: Colors.gray[400],
      accent: Colors.gray[500],
    },
    description: 'Beginning your journey'
  },
  {
    id: 'committed',
    name: 'Committed',
    threshold: 20,
    icon: CheckCircle,
    colors: {
      start: Colors.info,
      end: '#0EA5E9',
      accent: '#0284C7',
    },
    description: 'Making steady progress'
  },
  {
    id: 'focused',
    name: 'Focused',
    threshold: 40,
    icon: Star,
    colors: {
      start: Colors.primary,
      end: '#3B82F6',
      accent: '#2563EB',
    },
    description: 'Staying on track'
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    threshold: 60,
    icon: Award,
    colors: {
      start: Colors.warning,
      end: '#F59E0B',
      accent: '#D97706',
    },
    description: 'Showing dedication'
  },
  {
    id: 'achiever',
    name: 'Achiever',
    threshold: 80,
    icon: Trophy,
    colors: {
      start: Colors.success,
      end: '#10B981',
      accent: '#059669',
    },
    description: 'Nearly there!'
  },
  {
    id: 'champion',
    name: 'Champion',
    threshold: 95,
    icon: Crown,
    colors: {
      start: Colors.accent,
      end: '#F59E0B',
      accent: '#D97706',
    },
    description: 'Excellence achieved'
  },
  {
    id: 'elite',
    name: 'Elite',
    threshold: 100,
    icon: Shield,
    colors: {
      start: '#8B5CF6',
      end: '#A855F7',
      accent: '#9333EA',
    },
    description: 'Fully prepared'
  }
];

export default function CPPProgressBadges({ 
  percentage, 
  size = 'medium', 
  showLabels = true,
  horizontal = true 
}: CPPProgressBadgesProps) {
  const getCurrentBadge = () => {
    // Find the highest tier the user has achieved
    const achievedTiers = BADGE_TIERS.filter(tier => percentage >= tier.threshold);
    return achievedTiers[achievedTiers.length - 1] || BADGE_TIERS[0];
  };

  const getNextBadge = () => {
    const currentBadge = getCurrentBadge();
    const currentIndex = BADGE_TIERS.findIndex(tier => tier.id === currentBadge.id);
    return BADGE_TIERS[currentIndex + 1] || null;
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'small': return { width: 32, height: 32, iconSize: 16 };
      case 'large': return { width: 64, height: 64, iconSize: 32 };
      default: return { width: 48, height: 48, iconSize: 24 };
    }
  };

  const currentBadge = getCurrentBadge();
  const nextBadge = getNextBadge();
  const badgeSize = getBadgeSize();

  const renderBadge = (badge: BadgeTier, isUnlocked: boolean, isCurrent: boolean = false) => {
    const IconComponent = badge.icon;
    
    return (
      <View key={badge.id} style={[
        styles.badgeContainer,
        { width: badgeSize.width, height: badgeSize.height },
        isCurrent && styles.currentBadge
      ]}>
        {isUnlocked ? (
          <LinearGradient
            colors={[badge.colors.start, badge.colors.end]}
            style={[
              styles.badgeGradient,
              { width: badgeSize.width, height: badgeSize.height, borderRadius: badgeSize.width / 2 }
            ]}
          >
            <IconComponent 
              size={badgeSize.iconSize} 
              color={Colors.white} 
            />
            {isCurrent && (
              <View style={styles.currentBadgeIndicator}>
                <View style={styles.currentBadgeDot} />
              </View>
            )}
          </LinearGradient>
        ) : (
          <View style={[
            styles.lockedBadge,
            { width: badgeSize.width, height: badgeSize.height, borderRadius: badgeSize.width / 2 }
          ]}>
            <Lock size={badgeSize.iconSize * 0.6} color={Colors.gray[400]} />
          </View>
        )}
        
        {showLabels && (
          <View style={styles.badgeLabel}>
            <Text style={[
              styles.badgeName,
              size === 'small' && styles.badgeNameSmall,
              isUnlocked ? { color: badge.colors.accent } : { color: Colors.gray[400] }
            ]}>
              {badge.name}
            </Text>
            {size !== 'small' && (
              <Text style={[
                styles.badgeThreshold,
                isUnlocked ? { color: Colors.textSecondary } : { color: Colors.gray[400] }
              ]}>
                {badge.threshold}%+
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderProgressView = () => {
    if (horizontal) {
      // Show current badge prominently with next badge preview
      return (
        <View style={styles.horizontalContainer}>
          <View style={styles.currentBadgeSection}>
            {renderBadge(currentBadge, true, true)}
            {showLabels && (
              <View style={styles.currentBadgeInfo}>
                <Text style={styles.currentBadgeTitle}>Current Level</Text>
                <Text style={styles.currentBadgeDescription}>{currentBadge.description}</Text>
                <Text style={styles.progressText}>{Math.round(percentage)}% Complete</Text>
              </View>
            )}
          </View>
          
          {nextBadge && (
            <View style={styles.nextBadgeSection}>
              <Text style={styles.nextBadgeLabel}>Next Goal</Text>
              {renderBadge(nextBadge, false)}
              <Text style={styles.nextBadgeProgress}>
                {nextBadge.threshold - Math.round(percentage)}% to go
              </Text>
            </View>
          )}
        </View>
      );
    } else {
      // Show all badges in a grid
      return (
        <View style={styles.gridContainer}>
          {BADGE_TIERS.map(badge => {
            const isUnlocked = percentage >= badge.threshold;
            const isCurrent = badge.id === currentBadge.id;
            return renderBadge(badge, isUnlocked, isCurrent);
          })}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {renderProgressView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  
  // Horizontal layout (current + next)
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  currentBadgeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currentBadgeInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  currentBadgeTitle: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  currentBadgeDescription: {
    ...typography.bodyMedium,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  progressText: {
    ...typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  nextBadgeSection: {
    alignItems: 'center',
    marginLeft: spacing.lg,
  },
  nextBadgeLabel: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  nextBadgeProgress: {
    ...typography.labelSmall,
    color: Colors.warning,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  
  // Grid layout (all badges)
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  
  // Badge styles
  badgeContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  currentBadge: {
    transform: [{ scale: 1.1 }],
  },
  badgeGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
    elevation: 4,
  },
  lockedBadge: {
    backgroundColor: Colors.gray[100],
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentBadgeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.light,
  },
  currentBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  
  // Label styles
  badgeLabel: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  badgeName: {
    ...typography.labelSmall,
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeNameSmall: {
    fontSize: 10,
  },
  badgeThreshold: {
    ...typography.labelSmall,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 1,
  },
});