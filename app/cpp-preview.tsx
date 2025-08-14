import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Award, 
  Shield, 
  CheckCircle, 
  User, 
  Dumbbell, 
  FileText,
  ArrowRight,
  Clock,
  Star,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useCPP } from '@/context/CPPContext';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function CPPPreviewScreen() {
  const { user, updateProfile } = useAuth();
  const { progress } = useCPP();

  const handleStartCPPSetup = () => {
    router.push('/cpp-setup');
  };

  const handleCompleteLater = async () => {
    try {
      // Update user profile to mark CPP intro as seen
      const { error } = await supabase
        .from('profiles')
        .update({ 
          has_seen_cpp_intro: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Update local auth context
      await updateProfile({ has_seen_cpp_intro: true });

      // Navigate to dashboard
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error updating CPP intro status:', error);
      // Still navigate to dashboard even if update fails
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Award size={32} color={Colors.primary} />
            <Text style={styles.logoText}>PolicePrep</Text>
          </View>
          <Text style={styles.welcomeText}>
            Welcome, {user?.first_name || 'there'}! 👋
          </Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[Colors.primary, Colors.primary + 'DD']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Your Pathway to Successful Hiring
              </Text>
              <Text style={styles.heroSubtitle}>
                Meet your Certified Preparation Progress (CPP) - the comprehensive system that tracks your readiness for the police application process.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Progress Preview */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your CPP Progress</Text>
          <View style={styles.progressRing}>
            <View style={styles.progressCircle}>
              <View style={styles.progressCenter}>
                <Text style={styles.progressPercentage}>0%</Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>
            <View style={styles.progressLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.legendText}>Verified (2x weight)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.gray[400] }]} />
                <Text style={styles.legendText}>Unverified (1x weight)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Three Pillars */}
        <View style={styles.pillarsSection}>
          <Text style={styles.sectionTitle}>Three Pillars of Success</Text>
          
          <View style={styles.pillarsGrid}>
            {/* Profile & Requirements */}
            <View style={styles.pillarCard}>
              <View style={styles.pillarIcon}>
                <User size={24} color={Colors.primary} />
              </View>
              <Text style={styles.pillarTitle}>Profile & Requirements</Text>
              <Text style={styles.pillarDescription}>
                Complete your profile, verify documents, and select your target police services. Build a strong foundation for your application.
              </Text>
              <View style={styles.pillarFeatures}>
                <View style={styles.featureItem}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.featureText}>Profile completion</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.featureText}>Document verification</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.featureText}>Service selection</Text>
                </View>
              </View>
            </View>

            {/* Fitness Readiness */}
            <View style={styles.pillarCard}>
              <View style={styles.pillarIcon}>
                <Dumbbell size={24} color={Colors.success} />
              </View>
              <Text style={styles.pillarTitle}>Fitness Readiness</Text>
              <Text style={styles.pillarDescription}>
                Build your physical fitness through assessments, training plans, and practice tests. Prepare for the demanding physical requirements.
              </Text>
              <View style={styles.pillarFeatures}>
                <View style={styles.featureItem}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.featureText}>Fitness assessments</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.featureText}>PREP test practice</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.featureText}>Training plans</Text>
                </View>
              </View>
            </View>

            {/* Application Readiness */}
            <View style={styles.pillarCard}>
              <View style={styles.pillarIcon}>
                <FileText size={24} color={Colors.warning} />
              </View>
              <Text style={styles.pillarTitle}>Application Readiness</Text>
              <Text style={styles.pillarDescription}>
                Master the application process through prerequisites review, interview preparation, and official test readiness. Stand out from the competition.
              </Text>
              <View style={styles.pillarFeatures}>
                <View style={styles.featureItem}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.featureText}>Prerequisites review</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.featureText}>Interview prep</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.featureText}>Test preparation</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Verification Explanation */}
        <View style={styles.verificationSection}>
          <Text style={styles.sectionTitle}>Verified vs Unverified</Text>
          <View style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <Shield size={20} color={Colors.warning} />
              <Text style={styles.verificationTitle}>How Verification Works</Text>
            </View>
            <Text style={styles.verificationDescription}>
              <Text style={styles.boldText}>Verified completions</Text> are observed or confirmed by certified instructors or AI monitoring, giving them double the weight in your CPP score.
            </Text>
            <Text style={styles.verificationDescription}>
              <Text style={styles.boldText}>Unverified completions</Text> are self-reported and still valuable, but carry standard weight. Premium users get monthly verification allowances.
            </Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why CPP Matters</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitItem}>
              <Target size={20} color={Colors.primary} />
              <Text style={styles.benefitTitle}>Clear Pathway</Text>
              <Text style={styles.benefitText}>Know exactly what you need to complete for success</Text>
            </View>
            <View style={styles.benefitItem}>
              <TrendingUp size={20} color={Colors.success} />
              <Text style={styles.benefitTitle}>Track Progress</Text>
              <Text style={styles.benefitText}>See your improvement over time with detailed metrics</Text>
            </View>
            <View style={styles.benefitItem}>
              <Star size={20} color={Colors.warning} />
              <Text style={styles.benefitTitle}>Stand Out</Text>
              <Text style={styles.benefitText}>Verified completions show your commitment to excellence</Text>
            </View>
            <View style={styles.benefitItem}>
              <Zap size={20} color={Colors.error} />
              <Text style={styles.benefitTitle}>Stay Motivated</Text>
              <Text style={styles.benefitText}>Visual progress keeps you engaged and focused</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStartCPPSetup}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>Start CPP Setup</Text>
          <ArrowRight size={20} color={Colors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleCompleteLater}
          activeOpacity={0.8}
        >
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.secondaryButtonText}>Do this later</Text>
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    paddingBottom: 120, // Space for action buttons
  },
  
  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: Colors.white,
    ...shadows.light,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  logoText: {
    fontSize: typography.displaySmall.fontSize,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  welcomeText: {
    fontSize: typography.headingMedium.fontSize,
    color: Colors.textSecondary,
  },
  
  // Hero Section
  heroSection: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.medium,
  },
  heroGradient: {
    padding: spacing.xl,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: typography.displaySmall.fontSize,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: typography.bodyLarge.fontSize,
    color: Colors.white + 'CC',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Progress Section
  progressSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  progressRing: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressCenter: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: typography.displaySmall.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
  },
  progressLabel: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressLegend: {
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
  },
  
  // Pillars Section
  pillarsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  pillarsGrid: {
    gap: spacing.lg,
  },
  pillarCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.light,
  },
  pillarIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pillarTitle: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  pillarDescription: {
    fontSize: typography.bodyLarge.fontSize,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  pillarFeatures: {
    gap: spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
  },
  
  // Verification Section
  verificationSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  verificationCard: {
    backgroundColor: Colors.warning + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  verificationTitle: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.warning,
  },
  verificationDescription: {
    fontSize: typography.bodyLarge.fontSize,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  boldText: {
    fontWeight: '600',
    color: Colors.text,
  },
  
  // Benefits Section
  benefitsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  benefitItem: {
    flex: 1,
    minWidth: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.light,
  },
  benefitTitle: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Action Section
  actionSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...shadows.medium,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.medium,
  },
  primaryButtonText: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: typography.bodyLarge.fontSize,
    color: Colors.textSecondary,
  },
  
  // Bottom Spacer
  bottomSpacer: {
    height: 20,
  },
});

