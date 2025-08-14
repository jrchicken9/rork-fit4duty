import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Shield,
  FileText,
  Clock,
  Star,
  Award,
  ChevronRight,
  AlertCircle,
  Info,
  Dumbbell
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useCPP } from '@/context/CPPContext';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

type SetupStep = 'email' | 'profile' | 'documents' | 'complete';

interface SetupData {
  emailVerified: boolean;
  phone: string;
  location: string;
  targetService: string;
  documents: {
    driversLicense: boolean;
    educationCertificates: boolean;
    criminalRecordCheck: boolean;
    firstAidCertification: boolean;
  };
}

const REQUIREMENTS_CHECKLIST = [
  {
    id: 'driversLicense',
    title: 'Valid Driver\'s License',
    description: 'Class G or higher driver\'s license',
    required: true,
  },
  {
    id: 'educationCertificates',
    title: 'Education Certificates',
    description: 'High school diploma or higher education certificates',
    required: true,
  },
  {
    id: 'criminalRecordCheck',
    title: 'Criminal Record Check',
    description: 'Clean criminal record check (CPIC)',
    required: true,
  },
  {
    id: 'firstAidCertification',
    title: 'First Aid Certification',
    description: 'Current first aid and CPR certification',
    required: false,
  },
];

export default function CPPSetupScreen() {
  const { user, updateProfile } = useAuth();
  const { markCompletion, progress } = useCPP();
  
  const [currentStep, setCurrentStep] = useState<SetupStep>('email');
  const [setupData, setSetupData] = useState<SetupData>({
    emailVerified: false,
    phone: '',
    location: '',
    targetService: '',
    documents: {
      driversLicense: false,
      educationCertificates: false,
      criminalRecordCheck: false,
      firstAidCertification: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if email is already verified
    if (user?.email_confirmed_at) {
      setSetupData(prev => ({ ...prev, emailVerified: true }));
    }
    
    // Load existing user data if available
    if (user) {
      setSetupData(prev => ({
        ...prev,
        phone: user.phone || '',
        location: user.location || '',
        targetService: user.target_service || '',
      }));
    }
  }, [user]);

  const handleNext = () => {
    switch (currentStep) {
      case 'email':
        if (setupData.emailVerified) {
          setCurrentStep('profile');
        } else {
          Alert.alert(
            'Email Verification Required',
            'Please verify your email address before continuing. Check your inbox for a verification link.',
            [
              { text: 'Resend Email', onPress: handleResendEmail },
              { text: 'OK' },
            ]
          );
        }
        break;
      case 'profile':
        if (setupData.phone && setupData.location && setupData.targetService) {
          setCurrentStep('documents');
        } else {
          Alert.alert('Missing Information', 'Please fill in all required fields.');
        }
        break;
      case 'documents':
        setCurrentStep('complete');
        break;
      case 'complete':
        handleCompleteSetup();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'profile':
        setCurrentStep('email');
        break;
      case 'documents':
        setCurrentStep('profile');
        break;
      case 'complete':
        setCurrentStep('documents');
        break;
    }
  };

  const handleCompleteLater = () => {
    Alert.alert(
      'Complete Later',
      'You can always complete your CPP setup from your profile. Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Go to Dashboard', 
          onPress: () => router.replace('/(tabs)')
        },
      ]
    );
  };

  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || '',
      });
      
      if (error) throw error;
      
      Alert.alert(
        'Email Sent',
        'Verification email has been sent. Please check your inbox and spam folder.'
      );
    } catch (error) {
      console.error('Error resending email:', error);
      Alert.alert('Error', 'Failed to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSetup = async () => {
    try {
      setIsLoading(true);

      // Update user profile with collected data
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: setupData.phone,
          location: setupData.location,
          target_service: setupData.targetService,
          has_seen_cpp_intro: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Update local auth context
      await updateProfile({
        phone: setupData.phone,
        location: setupData.location,
        target_service: setupData.targetService,
        has_seen_cpp_intro: true,
      });

      // Mark CPP steps as completed
      await markCompletion('profile_completion', 'unverified');
      await markCompletion('email_confirmation', 'unverified');
      await markCompletion('police_service_selection', 'unverified');
      
      // Mark document verification based on checklist
      const completedDocuments = Object.values(setupData.documents).filter(Boolean).length;
      if (completedDocuments >= 3) {
        await markCompletion('document_verification', 'unverified', {
          completedDocuments,
          documents: setupData.documents,
        });
      }

      Alert.alert(
        'Setup Complete!',
        'Your CPP setup is complete. You can now explore the full dashboard and continue building your progress.',
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error completing setup:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDocument = (documentId: keyof SetupData['documents']) => {
    setSetupData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentId]: !prev.documents[documentId],
      },
    }));
  };

  const getStepProgress = () => {
    const steps = ['email', 'profile', 'documents', 'complete'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  const renderEmailStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Mail size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Verify Your Email</Text>
      </View>
      
      <Text style={styles.stepDescription}>
        Please verify your email address to ensure you receive important updates and notifications about your police application process.
      </Text>

      <View style={styles.emailStatus}>
        <View style={styles.emailInfo}>
          <Text style={styles.emailLabel}>Email Address:</Text>
          <Text style={styles.emailValue}>{user?.email}</Text>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: setupData.emailVerified ? Colors.success + '20' : Colors.warning + '20' }
        ]}>
          <Check size={16} color={setupData.emailVerified ? Colors.success : Colors.warning} />
          <Text style={[
            styles.statusText,
            { color: setupData.emailVerified ? Colors.success : Colors.warning }
          ]}>
            {setupData.emailVerified ? 'Verified' : 'Pending Verification'}
          </Text>
        </View>
      </View>

      {!setupData.emailVerified && (
        <View style={styles.verificationHelp}>
          <Info size={16} color={Colors.primary} />
          <Text style={styles.verificationHelpText}>
            Check your email inbox and spam folder for a verification link. Click the link to verify your email address.
          </Text>
        </View>
      )}
    </View>
  );

  const renderProfileStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <User size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Complete Profile Essentials</Text>
      </View>
      
      <Text style={styles.stepDescription}>
        Help us personalize your experience by providing some additional information about yourself and your goals.
      </Text>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <View style={styles.inputContainer}>
            <Phone size={16} color={Colors.textSecondary} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your phone number"
              value={setupData.phone}
              onChangeText={(text) => setSetupData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Location *</Text>
          <View style={styles.inputContainer}>
            <MapPin size={16} color={Colors.textSecondary} />
            <TextInput
              style={styles.textInput}
              placeholder="City, Province"
              value={setupData.location}
              onChangeText={(text) => setSetupData(prev => ({ ...prev, location: text }))}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Target Police Service *</Text>
          <TouchableOpacity
            style={styles.serviceSelector}
            onPress={() => router.push('/application/police-service-selection')}
          >
            <Text style={[
              styles.serviceSelectorText,
              { color: setupData.targetService ? Colors.text : Colors.textSecondary }
            ]}>
              {setupData.targetService || 'Select your target police service'}
            </Text>
            <ChevronRight size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderDocumentsStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <FileText size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Documents & Requirements</Text>
      </View>
      
      <Text style={styles.stepDescription}>
        Mark the documents and requirements you currently have. This helps us track your readiness and provide personalized guidance.
      </Text>

      <View style={styles.checklistSection}>
        {REQUIREMENTS_CHECKLIST.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.checklistItem,
              setupData.documents[item.id as keyof SetupData['documents']] && styles.checklistItemSelected
            ]}
            onPress={() => toggleDocument(item.id as keyof SetupData['documents'])}
            activeOpacity={0.8}
          >
            <View style={[
              styles.checkbox,
              setupData.documents[item.id as keyof SetupData['documents']] && styles.checkboxSelected
            ]}>
              {setupData.documents[item.id as keyof SetupData['documents']] && (
                <Check size={12} color={Colors.white} />
              )}
            </View>
            
            <View style={styles.checklistContent}>
              <View style={styles.checklistHeader}>
                <Text style={styles.checklistTitle}>{item.title}</Text>
                {item.required && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                )}
              </View>
              <Text style={styles.checklistDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.checklistSummary}>
        <Text style={styles.summaryText}>
          {Object.values(setupData.documents).filter(Boolean).length} of {REQUIREMENTS_CHECKLIST.length} items completed
        </Text>
      </View>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Award size={24} color={Colors.success} />
        <Text style={styles.stepTitle}>Setup Complete!</Text>
      </View>
      
      <Text style={styles.stepDescription}>
        Congratulations! You've completed your initial CPP setup. Here's your current progress:
      </Text>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Star size={20} color={Colors.warning} />
          <Text style={styles.progressTitle}>Your CPP Progress</Text>
        </View>
        
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{Math.round(progress.percentage)}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{progress.totalCompletions}</Text>
            <Text style={styles.progressLabel}>Steps Done</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{progress.verifiedCompletions}</Text>
            <Text style={styles.progressLabel}>Verified</Text>
          </View>
        </View>
      </View>

      <View style={styles.nextSteps}>
        <Text style={styles.nextStepsTitle}>What's Next?</Text>
        <View style={styles.nextStepItem}>
          <Shield size={16} color={Colors.primary} />
          <Text style={styles.nextStepText}>Explore the full CPP dashboard</Text>
        </View>
        <View style={styles.nextStepItem}>
          <Dumbbell size={16} color={Colors.success} />
          <Text style={styles.nextStepText}>Start your fitness preparation</Text>
        </View>
        <View style={styles.nextStepItem}>
          <FileText size={16} color={Colors.warning} />
          <Text style={styles.nextStepText}>Complete application steps</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'email':
        return renderEmailStep();
      case 'profile':
        return renderProfileStep();
      case 'documents':
        return renderDocumentsStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={currentStep === 'email' ? handleCompleteLater : handleBack}
        >
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>CPP Setup</Text>
          <Text style={styles.headerSubtitle}>
            Step {['email', 'profile', 'documents', 'complete'].indexOf(currentStep) + 1} of 4
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.completeLaterButton}
          onPress={handleCompleteLater}
        >
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.completeLaterText}>Later</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${getStepProgress()}%` }
          ]} 
        />
      </View>

      {/* Step Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {currentStep !== 'complete' && (
          <TouchableOpacity
            style={[
              styles.nextButton,
              isLoading && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === 'documents' ? 'Complete Setup' : 'Continue'}
                </Text>
                <ArrowRight size={20} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        )}
        
        {currentStep === 'complete' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteSetup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.completeButtonText}>Go to Dashboard</Text>
                <ArrowRight size={20} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
    ...shadows.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
  },
  completeLaterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  completeLaterText: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
  },
  
  // Progress Bar
  progressBar: {
    height: 4,
    backgroundColor: Colors.gray[200],
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  
  // Step Content
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: typography.displaySmall.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  stepDescription: {
    fontSize: typography.bodyLarge.fontSize,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  
  // Email Step
  emailStatus: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.light,
  },
  emailInfo: {
    marginBottom: spacing.md,
  },
  emailLabel: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emailValue: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '500',
    color: Colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '600',
  },
  verificationHelp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: Colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  verificationHelpText: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  
  // Profile Step
  formSection: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.light,
  },
  textInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.bodyLarge.fontSize,
    color: Colors.text,
  },
  serviceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.light,
  },
  serviceSelectorText: {
    fontSize: typography.bodyLarge.fontSize,
  },
  
  // Documents Step
  checklistSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.light,
  },
  checklistItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checklistContent: {
    flex: 1,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  checklistTitle: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  requiredText: {
    fontSize: typography.bodySmall.fontSize,
    color: Colors.error,
    fontWeight: '600',
  },
  checklistDescription: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  checklistSummary: {
    backgroundColor: Colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  
  // Complete Step
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.light,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: typography.displaySmall.fontSize,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressLabel: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  nextSteps: {
    backgroundColor: Colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  nextStepsTitle: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.md,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  nextStepText: {
    fontSize: typography.bodyLarge.fontSize,
    color: Colors.textSecondary,
  },
  
  // Action Section
  actionSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  nextButtonText: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.white,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  completeButtonText: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.white,
  },
});

