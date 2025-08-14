import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  TrendingUp, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Users,
  BarChart3,
  Activity
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ContentAnalyticsProps {
  stats: {
    totalItems: number;
    recentlyUpdated: number;
    sections: number;
    emptyContent: number;
    hasHistory: number;
    averageLength: number;
    mostActiveSection: string;
    lastUpdated: string;
  };
  onViewDetails: (type: string) => void;
}

export default function ContentAnalytics({ stats, onViewDetails }: ContentAnalyticsProps) {
  const MetricCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color = Colors.primary,
    onPress 
  }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.metricCard, onPress && styles.metricCardPressable]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.metricIcon, { backgroundColor: color + '10' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
        {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  const InsightCard = ({ 
    icon: Icon, 
    title, 
    description, 
    action, 
    color = Colors.primary 
  }: {
    icon: any;
    title: string;
    description: string;
    action?: string;
    color?: string;
  }) => (
    <View style={styles.insightCard}>
      <View style={[styles.insightIcon, { backgroundColor: color + '10' }]}>
        <Icon size={16} color={color} />
      </View>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightDescription}>{description}</Text>
        {action && (
          <TouchableOpacity style={styles.insightAction}>
            <Text style={[styles.insightActionText, { color }]}>{action}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BarChart3 size={20} color={Colors.primary} />
        <Text style={styles.headerTitle}>Content Analytics</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          icon={FileText}
          title="Total Content"
          value={stats.totalItems}
          subtitle="items"
          onPress={() => onViewDetails('total')}
        />
        <MetricCard
          icon={Clock}
          title="Recently Updated"
          value={stats.recentlyUpdated}
          subtitle="last 7 days"
          color={Colors.success}
          onPress={() => onViewDetails('recent')}
        />
        <MetricCard
          icon={Users}
          title="Sections"
          value={stats.sections}
          subtitle="active"
          color={Colors.warning}
          onPress={() => onViewDetails('sections')}
        />
        <MetricCard
          icon={Activity}
          title="Avg Length"
          value={`${Math.round(stats.averageLength)} chars`}
          subtitle="per item"
          color={Colors.info}
        />
      </View>

      {/* Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>Insights & Recommendations</Text>
        
        {stats.emptyContent > 0 && (
          <InsightCard
            icon={AlertCircle}
            title="Empty Content Detected"
            description={`${stats.emptyContent} items have little or no content. Consider reviewing and updating them.`}
            action="Review Empty Content"
            color={Colors.warning}
          />
        )}
        
        {stats.hasHistory > 0 && (
          <InsightCard
            icon={CheckCircle}
            title="Content History Available"
            description={`${stats.hasHistory} items have version history. You can revert changes if needed.`}
            action="View History"
            color={Colors.success}
          />
        )}
        
        <InsightCard
          icon={TrendingUp}
          title="Most Active Section"
          description={`"${stats.mostActiveSection}" has the most content updates. Consider focusing on other sections.`}
          action="View Section"
          color={Colors.primary}
        />
        
        <InsightCard
          icon={Clock}
          title="Last Update"
          description={`Content was last updated ${stats.lastUpdated}. Keep content fresh for better user experience.`}
          color={Colors.info}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricCardPressable: {
    borderColor: Colors.primary + '30',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  insightsSection: {
    gap: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  insightAction: {
    alignSelf: 'flex-start',
  },
  insightActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
