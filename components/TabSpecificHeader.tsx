import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Target, 
  Dumbbell, 
  Users, 
  User,
  TrendingUp,
  Award,
  Star,
  Activity,
  Clock,
  CheckCircle,
  MessageCircle,
  ThumbsUp,
  Calendar,
  BookOpen,
  Zap
} from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useAuth } from '@/context/AuthContext';

interface TabSpecificHeaderProps {
  tab: 'dashboard' | 'application' | 'fitness' | 'community' | 'profile';
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
}

export default function TabSpecificHeader({ tab, stats }: TabSpecificHeaderProps) {
  const { user } = useAuth();
  const displayName = user?.full_name || "Future Officer";

  const renderDashboardHeader = () => (
    <LinearGradient
      colors={[Colors.tabBackgrounds.dashboard.start, Colors.tabBackgrounds.dashboard.end]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.dashboardContent}>
        <View style={styles.dashboardLeft}>
          <View style={styles.greetingSection}>
            <Text style={styles.greetingText}>
              Good {getTimeOfDay()}, {displayName.split(' ')[0]} 👋
            </Text>
            <Text style={styles.greetingSubtitle}>Ready to achieve your police career goals?</Text>
          </View>
          
          {stats && (
            <View style={styles.dashboardStats}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.dashboardStat}>
                  <View style={styles.statIconContainer}>
                    {stat.icon}
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Image
            source={{
              uri: user?.avatar_url || "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=100",
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileBadge}>
            <Star size={8} color={Colors.white} />
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderApplicationHeader = () => (
    <View style={styles.applicationContainer}>
      <View style={styles.applicationContent}>
        <View style={styles.applicationLeft}>
          <View style={styles.applicationIconContainer}>
            <Target size={32} color={Colors.accent} />
            <View style={styles.applicationProgressRing}>
              <Text style={styles.progressText}>75%</Text>
            </View>
          </View>
          <View style={styles.applicationInfo}>
            <Text style={styles.applicationTitle}>Application Progress</Text>
            <Text style={styles.applicationSubtitle}>Step-by-step guide to becoming a police officer</Text>
            {stats && (
              <View style={styles.applicationStats}>
                <View style={styles.applicationStat}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.applicationStatText}>6 of 8 steps complete</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.applicationActionButton}>
          <Text style={styles.actionButtonText}>Continue</Text>
          <TrendingUp size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFitnessHeader = () => (
    <View style={styles.fitnessContainer}>
      <View style={styles.fitnessContent}>
        <View style={styles.fitnessLeft}>
          <View style={styles.fitnessIconContainer}>
            <Dumbbell size={32} color={Colors.success} />
            <Activity size={16} color={Colors.white} style={styles.fitnessOverlay} />
          </View>
          <View style={styles.fitnessInfo}>
            <Text style={styles.fitnessTitle}>Fitness Training</Text>
            <Text style={styles.fitnessSubtitle}>Build strength and endurance for success</Text>
            {stats && (
              <View style={styles.fitnessStats}>
                <View style={styles.fitnessStat}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.fitnessStatText}>Last workout: 2 days ago</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.fitnessActionButton}>
          <Text style={styles.actionButtonText}>Start Training</Text>
          <Zap size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommunityHeader = () => (
    <View style={styles.communityContainer}>
      <View style={styles.communityContent}>
        <View style={styles.communityLeft}>
          <View style={styles.communityIconContainer}>
            <Users size={32} color={Colors.warning} />
            <MessageCircle size={16} color={Colors.white} style={styles.communityOverlay} />
          </View>
          <View style={styles.communityInfo}>
            <Text style={styles.communityTitle}>Community Hub</Text>
            <Text style={styles.communitySubtitle}>Connect with fellow applicants and officers</Text>
            {stats && (
              <View style={styles.communityStats}>
                <View style={styles.communityStat}>
                  <ThumbsUp size={14} color={Colors.textSecondary} />
                  <Text style={styles.communityStatText}>156 active members today</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.communityActionButton}>
          <Text style={styles.actionButtonText}>Join Discussion</Text>
          <MessageCircle size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHeaderContainer}>
      <View style={styles.profileHeaderContent}>
        <View style={styles.profileHeaderLeft}>
          <View style={styles.profileHeaderIconContainer}>
            <User size={32} color={Colors.secondary} />
            <Award size={16} color={Colors.white} style={styles.profileHeaderOverlay} />
          </View>
          <View style={styles.profileHeaderInfo}>
            <Text style={styles.profileHeaderTitle}>Your Profile</Text>
            <Text style={styles.profileHeaderSubtitle}>Manage your account and preferences</Text>
            {stats && (
              <View style={styles.profileHeaderStats}>
                <View style={styles.profileHeaderStat}>
                  <CheckCircle size={14} color={Colors.textSecondary} />
                  <Text style={styles.profileHeaderStatText}>Profile 85% complete</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.profileHeaderActionButton}>
          <Text style={styles.actionButtonText}>Edit Profile</Text>
          <User size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  switch (tab) {
    case 'dashboard':
      return renderDashboardHeader();
    case 'application':
      return renderApplicationHeader();
    case 'fitness':
      return renderFitnessHeader();
    case 'community':
      return renderCommunityHeader();
    case 'profile':
      return renderProfileHeader();
    default:
      return renderDashboardHeader();
  }
}

const styles = StyleSheet.create({
  // Dashboard Styles
  container: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  dashboardContent: {
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dashboardLeft: {
    flex: 1,
  },
  greetingSection: {
    marginBottom: spacing.md,
  },
  greetingText: {
    ...typography.displaySmall,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  greetingSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
  },
  dashboardStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dashboardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '80',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    flex: 1,
  },
  statIconContainer: {
    marginRight: spacing.xs,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    ...typography.headingSmall,
    color: Colors.primary,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
  },
  profileButton: {
    position: 'relative',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Application Styles
  applicationContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  applicationContent: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  applicationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  applicationIconContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  applicationProgressRing: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    ...typography.labelSmall,
    color: Colors.white,
    fontWeight: '700',
  },
  applicationInfo: {
    flex: 1,
  },
  applicationTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  applicationSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  applicationStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicationStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicationStatText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  applicationActionButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },

  // Fitness Styles
  fitnessContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  fitnessContent: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fitnessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fitnessIconContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  fitnessOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  fitnessInfo: {
    flex: 1,
  },
  fitnessTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  fitnessSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  fitnessStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fitnessStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fitnessStatText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  fitnessActionButton: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },

  // Community Styles
  communityContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  communityContent: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  communityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  communityIconContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  communityOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  communityInfo: {
    flex: 1,
  },
  communityTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  communitySubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  communityStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityStatText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  communityActionButton: {
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },

  // Profile Header Styles
  profileHeaderContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  profileHeaderContent: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileHeaderIconContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  profileHeaderOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileHeaderTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  profileHeaderSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  profileHeaderStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileHeaderStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileHeaderStatText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  profileHeaderActionButton: {
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
});



