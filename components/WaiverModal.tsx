import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import {
  X,
  Shield,
  User,
  Phone,
  Heart,
  Pill,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

export interface WaiverData {
  signed_name: string;
  signature_data: string;
  agreed_to_terms: boolean;
  emergency_contact: string;
  emergency_phone: string;
  emergency_relationship: string;
  medical_conditions: string;
  medications: string;
  allergies: string;
  injuries: string;
  surgeries: string;
  heart_condition: boolean;
  chest_pain: boolean;
  dizziness: boolean;
  bone_joint_problems: boolean;
  high_blood_pressure: boolean;
  diabetes: boolean;
  asthma: boolean;
  pregnancy: boolean;
  other_medical_issues: string;
  fitness_goals: string;
  current_activity_level: string;
  has_experience: boolean;
  experience_details: string;
  age_confirmation: boolean;
  photo_release: boolean;
  marketing_consent: boolean;
}

interface WaiverModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (waiverData: WaiverData) => Promise<void>;
  loading?: boolean;
  sessionTitle?: string;
  sessionPrice?: number;
}

export default function WaiverModal({
  visible,
  onClose,
  onSubmit,
  loading = false,
  sessionTitle = 'Practice Session',
  sessionPrice = 0,
}: WaiverModalProps) {
  const [waiverData, setWaiverData] = useState<WaiverData>({
    signed_name: '',
    signature_data: '',
    agreed_to_terms: false,
    emergency_contact: '',
    emergency_phone: '',
    emergency_relationship: '',
    medical_conditions: '',
    medications: '',
    allergies: '',
    injuries: '',
    surgeries: '',
    heart_condition: false,
    chest_pain: false,
    dizziness: false,
    bone_joint_problems: false,
    high_blood_pressure: false,
    diabetes: false,
    asthma: false,
    pregnancy: false,
    other_medical_issues: '',
    fitness_goals: '',
    current_activity_level: '',
    has_experience: false,
    experience_details: '',
    age_confirmation: false,
    photo_release: false,
    marketing_consent: false,
  });

  const [errors, setErrors] = useState<Partial<WaiverData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<WaiverData> = {};

    if (!waiverData.signed_name.trim()) {
      newErrors.signed_name = 'Full name is required';
    }

    if (!waiverData.emergency_contact.trim()) {
      newErrors.emergency_contact = 'Emergency contact is required';
    }

    if (!waiverData.emergency_phone.trim()) {
      newErrors.emergency_phone = 'Emergency phone is required';
    }

    if (!waiverData.emergency_relationship.trim()) {
      newErrors.emergency_relationship = 'Relationship is required';
    }

    if (!waiverData.agreed_to_terms) {
      newErrors.agreed_to_terms = true;
    }

    if (!waiverData.age_confirmation) {
      newErrors.age_confirmation = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    try {
      await onSubmit(waiverData);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit waiver. Please try again.');
    }
  };

  const handleClose = () => {
    onClose();
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (!visible) return null;

  const { height: screenHeight } = Dimensions.get('window');

  return (
    <View style={styles.overlay}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={handleClose}
      />
      <View style={styles.modalContainer}>
        <View style={[styles.container, { maxHeight: screenHeight * 0.85 }]}>
          {/* Drag Indicator */}
          <View style={styles.dragIndicator} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Shield size={24} color={Colors.primary} />
              <Text style={styles.title}>Fitness Assessment Waiver</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Debug Test */}
            <View style={{ padding: 20, backgroundColor: 'red', margin: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
                DEBUG: Content is rendering
              </Text>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', marginTop: 10 }}>
                If you can see this, the modal is working!
              </Text>
            </View>
            
            {/* Session Info */}
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>{sessionTitle}</Text>
              <Text style={styles.sessionSubtitle}>
                Complete this waiver to confirm your booking
              </Text>
              {sessionPrice > 0 && (
                <Text style={styles.sessionPrice}>
                  Session Fee: {formatPrice(sessionPrice)}
                </Text>
              )}
            </View>

            {/* Personal Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <User size={16} color={Colors.textSecondary} />
                  <Text style={styles.label}>Full Name (as signature)</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  style={[styles.input, errors.signed_name && styles.inputError]}
                  value={waiverData.signed_name}
                  onChangeText={(text) => {
                    setWaiverData({ ...waiverData, signed_name: text });
                    if (errors.signed_name) {
                      setErrors({ ...errors, signed_name: undefined });
                    }
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textSecondary}
                />
                {errors.signed_name && (
                  <Text style={styles.errorText}>{errors.signed_name}</Text>
                )}
              </View>
            </View>

            {/* Emergency Contact */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <User size={16} color={Colors.textSecondary} />
                  <Text style={styles.label}>Emergency Contact Name</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  style={[styles.input, errors.emergency_contact && styles.inputError]}
                  value={waiverData.emergency_contact}
                  onChangeText={(text) => {
                    setWaiverData({ ...waiverData, emergency_contact: text });
                    if (errors.emergency_contact) {
                      setErrors({ ...errors, emergency_contact: undefined });
                    }
                  }}
                  placeholder="Emergency contact name"
                  placeholderTextColor={Colors.textSecondary}
                />
                {errors.emergency_contact && (
                  <Text style={styles.errorText}>{errors.emergency_contact}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Phone size={16} color={Colors.textSecondary} />
                  <Text style={styles.label}>Emergency Phone</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  style={[styles.input, errors.emergency_phone && styles.inputError]}
                  value={waiverData.emergency_phone}
                  onChangeText={(text) => {
                    setWaiverData({ ...waiverData, emergency_phone: text });
                    if (errors.emergency_phone) {
                      setErrors({ ...errors, emergency_phone: undefined });
                    }
                  }}
                  placeholder="Emergency phone number"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="phone-pad"
                />
                {errors.emergency_phone && (
                  <Text style={styles.errorText}>{errors.emergency_phone}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <User size={16} color={Colors.textSecondary} />
                  <Text style={styles.label}>Relationship to Emergency Contact</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  style={[styles.input, errors.emergency_relationship && styles.inputError]}
                  value={waiverData.emergency_relationship}
                  onChangeText={(text) => {
                    setWaiverData({ ...waiverData, emergency_relationship: text });
                    if (errors.emergency_relationship) {
                      setErrors({ ...errors, emergency_relationship: undefined });
                    }
                  }}
                  placeholder="e.g., Spouse, Parent, Friend"
                  placeholderTextColor={Colors.textSecondary}
                />
                {errors.emergency_relationship && (
                  <Text style={styles.errorText}>{errors.emergency_relationship}</Text>
                )}
              </View>
            </View>

            {/* Medical Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Heart size={16} color={Colors.textSecondary} />
                  <Text style={styles.label}>Medical Conditions</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={waiverData.medical_conditions}
                  onChangeText={(text) => setWaiverData({ ...waiverData, medical_conditions: text })}
                  placeholder="List any medical conditions (optional)"
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Pill size={16} color={Colors.textSecondary} />
                  <Text style={styles.label}>Current Medications</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={waiverData.medications}
                  onChangeText={(text) => setWaiverData({ ...waiverData, medications: text })}
                  placeholder="List any current medications (optional)"
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Legal Agreements */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Legal Agreements</Text>
              
              <View style={styles.checklistItem}>
                <Switch
                  value={waiverData.agreed_to_terms}
                  onValueChange={(value) => setWaiverData({ ...waiverData, agreed_to_terms: value })}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
                <Text style={styles.checklistLabel}>
                  I have read and agree to the terms and conditions of this fitness assessment
                </Text>
              </View>

              <View style={styles.checklistItem}>
                <Switch
                  value={waiverData.age_confirmation}
                  onValueChange={(value) => setWaiverData({ ...waiverData, age_confirmation: value })}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
                <Text style={styles.checklistLabel}>
                  I confirm that I am 18 years of age or older
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!waiverData.agreed_to_terms || !waiverData.age_confirmation || loading) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!waiverData.agreed_to_terms || !waiverData.age_confirmation || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Shield size={20} color={Colors.white} />
              )}
              <Text style={styles.submitButtonText}>
                {loading ? 'Processing...' : 'Continue to Payment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#9CA3AF',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: Colors.white,
    minHeight: 400,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sessionInfo: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0369A1',
    marginBottom: 6,
  },
  sessionSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 10,
  },
  sessionPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    ...Platform.select({
      ios: {
        paddingVertical: 14,
      },
    }),
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    ...Platform.select({
      ios: {
        paddingTop: 14,
      },
    }),
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 6,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  checklistLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 16,
    backgroundColor: Colors.white,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#0369A1',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
