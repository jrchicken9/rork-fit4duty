import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Sparkles, 
  Target, 
  Dumbbell, 
  Users, 
  User,
  TrendingUp,
  Award,
  Star
} from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useAuth } from '@/context/AuthContext';
import { useDynamicContent } from '@/hooks/useDynamicContent';

interface HeroHeaderProps {
  tab: 'dashboard' | 'application' | 'fitness' | 'community' | 'profile';
  title?: string;
  subtitle?: string;
  showProfile?: boolean;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
}

export default function HeroHeader({ 
  tab, 
  title, 
  subtitle, 
  showProfile = true,
  stats 
}: HeroHeaderProps) {
  const { user } = useAuth();
  const displayName = user?.full_name || "Future Officer";

  // Dynamic content based on tab
  const { content: dynamicTitle } = useDynamicContent(`hero.${tab}.title`, {
    fallback: getDefaultTitle(tab),
    placeholders: { name: displayName }
  });

  const { content: dynamicSubtitle } = useDynamicContent(`hero.${tab}.subtitle`, {
    fallback: getDefaultSubtitle(tab)
  });

  const getGradientColors = (): readonly [string, string] => {
    switch (tab) {
      case 'dashboard':
        return [Colors.tabBackgrounds.dashboard.start, Colors.tabBackgrounds.dashboard.end] as const;
      case 'application':
        return [Colors.tabBackgrounds.application.start, Colors.tabBackgrounds.application.end] as const;
      case 'fitness':
        return [Colors.tabBackgrounds.fitness.start, Colors.tabBackgrounds.fitness.end] as const;
      case 'community':
        return [Colors.tabBackgrounds.community.start, Colors.tabBackgrounds.community.end] as const;
      case 'profile':
        return [Colors.tabBackgrounds.profile.start, Colors.tabBackgrounds.profile.end] as const;
      default:
        return [Colors.tabBackgrounds.dashboard.start, Colors.tabBackgrounds.dashboard.end] as const;
    }
  };

  const getTabIcon = () => {
    const iconSize = 24;
    const iconColor = Colors.primary;
    
    switch (tab) {
      case 'dashboard':
        return <Sparkles size={iconSize} color={iconColor} />;
      case 'application':
        return <Target size={iconSize} color={Colors.accent} />;
      case 'fitness':
        return <Dumbbell size={iconSize} color={Colors.success} />;
      case 'community':
        return <Users size={iconSize} color={Colors.warning} />;
      case 'profile':
        return <User size={iconSize} color={Colors.secondary} />;
      default:
        return <Sparkles size={iconSize} color={iconColor} />;
    }
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Every step forward is progress toward your goal.",
      "Your dedication today shapes your success tomorrow.",
      "Strength comes from consistency and commitment.",
      "You're building the foundation for your future career.",
      "Every challenge is an opportunity to grow stronger."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              {getTabIcon()}
              <Text style={styles.title}>
                {title || dynamicTitle}
              </Text>
            </View>
            <Text style={styles.subtitle}>
              {subtitle || dynamicSubtitle}
            </Text>
          </View>
          
          {showProfile && (
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
          )}
        </View>

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <View style={styles.statsRow}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                {stat.icon && (
                  <View style={styles.statIcon}>
                    {stat.icon}
                  </View>
                )}
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Motivational Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>"{getMotivationalQuote()}"</Text>
          <TrendingUp size={16} color={Colors.primary} style={styles.quoteIcon} />
        </View>
      </View>
    </LinearGradient>
  );
}

function getDefaultTitle(tab: string): string {
  switch (tab) {
    case 'dashboard':
      return 'Welcome back!';
    case 'application':
      return 'Application Progress';
    case 'fitness':
      return 'Fitness Training';
    case 'community':
      return 'Community Hub';
    case 'profile':
      return 'Your Profile';
    default:
      return 'Welcome';
  }
}

function getDefaultSubtitle(tab: string): string {
  switch (tab) {
    case 'dashboard':
      return 'Ready to achieve your police career goals?';
    case 'application':
      return 'Track your application journey step by step';
    case 'fitness':
      return 'Build strength and endurance for success';
    case 'community':
      return 'Connect with fellow applicants and officers';
    case 'profile':
      return 'Manage your account and preferences';
    default:
      return 'Let\'s get started';
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  content: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.displaySmall,
    color: Colors.text,
    marginLeft: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginBottom: spacing.xs,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.headingMedium,
    color: Colors.primary,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '80',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  quoteText: {
    ...typography.bodySmall,
    color: Colors.text,
    fontStyle: 'italic',
    flex: 1,
  },
  quoteIcon: {
    marginLeft: spacing.sm,
  },
});
