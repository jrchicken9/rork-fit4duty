import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  BookOpen,
  Settings,
  Shield,
  Bell,
  ExternalLink,
  ChevronRight
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface HelpSupportSectionProps {
  onContactSupport: () => void;
  onViewFAQ: () => void;
  onPrivacySettings: () => void;
  onNotificationSettings: () => void;
  onExportData: () => void;
}

export default function HelpSupportSection({
  onContactSupport,
  onViewFAQ,
  onPrivacySettings,
  onNotificationSettings,
  onExportData
}: HelpSupportSectionProps) {
  const helpTopics = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn how to use the app effectively',
      icon: BookOpen,
      color: Colors.primary
    },
    {
      id: 'workouts',
      title: 'Workouts & Training',
      description: 'Understanding workout plans and progress',
      icon: FileText,
      color: Colors.success
    },
    {
      id: 'application',
      title: 'Application Process',
      description: 'Guide to police application requirements',
      icon: Settings,
      color: Colors.warning
    },
    {
      id: 'subscription',
      title: 'Subscription & Billing',
      description: 'Manage your subscription and payments',
      icon: Shield,
      color: Colors.info
    }
  ];

  const supportOptions = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'support@policeprep.com',
      icon: Mail,
      color: Colors.primary,
      action: onContactSupport
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: '+1 (555) 123-4567',
      icon: Phone,
      color: Colors.success,
      action: onContactSupport
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Available 9 AM - 6 PM EST',
      icon: MessageCircle,
      color: Colors.warning,
      action: onContactSupport
    }
  ];

  const settingsOptions = [
    {
      id: 'notifications',
      title: 'Notification Settings',
      description: 'Manage push and email notifications',
      icon: Bell,
      action: onNotificationSettings
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      description: 'Control your data and privacy',
      icon: Shield,
      action: onPrivacySettings
    },
    {
      id: 'export',
      title: 'Export My Data',
      description: 'Download your personal data',
      icon: ExternalLink,
      action: onExportData
    }
  ];

  const HelpCard = ({ 
    item, 
    onPress 
  }: { 
    item: any; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity style={styles.helpCard} onPress={onPress}>
      <View style={[styles.helpIcon, { backgroundColor: item.color + '10' }]}>
        <item.icon size={20} color={item.color} />
      </View>
      <View style={styles.helpContent}>
        <Text style={styles.helpTitle}>{item.title}</Text>
        <Text style={styles.helpDescription}>{item.description}</Text>
      </View>
      <ChevronRight size={16} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const SupportOption = ({ 
    option 
  }: { 
    option: any; 
  }) => (
    <TouchableOpacity style={styles.supportOption} onPress={option.action}>
      <View style={[styles.supportIcon, { backgroundColor: option.color + '10' }]}>
        <option.icon size={20} color={option.color} />
      </View>
      <View style={styles.supportContent}>
        <Text style={styles.supportTitle}>{option.title}</Text>
        <Text style={styles.supportDescription}>{option.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const SettingsOption = ({ 
    option 
  }: { 
    option: any; 
  }) => (
    <TouchableOpacity style={styles.settingsOption} onPress={option.action}>
      <View style={styles.settingsIcon}>
        <option.icon size={20} color={Colors.textSecondary} />
      </View>
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>{option.title}</Text>
        <Text style={styles.settingsDescription}>{option.description}</Text>
      </View>
      <ChevronRight size={16} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <HelpCircle size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      {/* Quick Contact */}
      <TouchableOpacity style={styles.quickContactCard} onPress={onContactSupport}>
        <View style={styles.quickContactContent}>
          <View style={[styles.quickContactIcon, { backgroundColor: Colors.primary + '10' }]}>
            <MessageCircle size={20} color={Colors.primary} />
          </View>
          <View style={styles.quickContactText}>
            <Text style={styles.quickContactTitle}>Need Help?</Text>
            <Text style={styles.quickContactSubtitle}>Contact our support team</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Help Topics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help Topics</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.helpTopicsContainer}
        >
          {helpTopics.map((topic) => (
            <TouchableOpacity key={topic.id} style={styles.helpTopicCard}>
              <View style={[styles.helpTopicIcon, { backgroundColor: topic.color + '10' }]}>
                <topic.icon size={24} color={topic.color} />
              </View>
              <Text style={styles.helpTopicTitle}>{topic.title}</Text>
              <Text style={styles.helpTopicDescription}>{topic.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Support Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.supportOptionsContainer}>
          {supportOptions.map((option) => (
            <SupportOption key={option.id} option={option} />
          ))}
        </View>
      </View>

      {/* FAQ Link */}
      <TouchableOpacity style={styles.faqCard} onPress={onViewFAQ}>
        <View style={styles.faqContent}>
          <View style={[styles.faqIcon, { backgroundColor: Colors.warning + '10' }]}>
            <HelpCircle size={20} color={Colors.warning} />
          </View>
          <View style={styles.faqText}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            <Text style={styles.faqSubtitle}>Find answers to common questions</Text>
          </View>
          <ChevronRight size={16} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Settings & Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings & Privacy</Text>
        <View style={styles.settingsContainer}>
          {settingsOptions.map((option) => (
            <SettingsOption key={option.id} option={option} />
          ))}
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfoContainer}>
        <Text style={styles.appInfoTitle}>About Police Prep</Text>
        <Text style={styles.appInfoDescription}>
          Helping aspiring police officers in Ontario prepare for their careers through comprehensive training, guidance, and community support.
        </Text>
        <View style={styles.appInfoDetails}>
          <Text style={styles.appInfoDetail}>Version 1.0.0</Text>
          <Text style={styles.appInfoDetail}>© 2024 Police Prep</Text>
        </View>
      </View>
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
  quickContactCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  quickContactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickContactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickContactText: {
    flex: 1,
  },
  quickContactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  quickContactSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  helpTopicsContainer: {
    gap: 12,
    paddingRight: 16,
  },
  helpTopicCard: {
    width: 160,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  helpTopicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpTopicTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  helpTopicDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  supportOptionsContainer: {
    gap: 12,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  faqCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqText: {
    flex: 1,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  faqSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingsContainer: {
    gap: 8,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingsDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  appInfoContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  appInfoDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  appInfoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appInfoDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
