import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Lock,
  Unlock,
  Crown,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  DollarSign,
  X,
  Play,
  BookOpen,
  Users,
  Target,
  FileText,
  Calendar,
  Award,
  TrendingUp,
  Zap,
  MapPin,
  BarChart3,
  ChevronRight,
  Filter,
  List,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import UpsellModal from '@/components/UpsellModal';
import LockedContentOverlay from '@/components/LockedContentOverlay';
import { ApplicationStep } from '@/constants/applicationSteps';

interface MonetizedStepCardProps {
  step: ApplicationStep;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onMarkComplete: (stepId: string) => void;
  onMarkIncomplete: (stepId: string) => void;
  isSaving: boolean;
}

export default function MonetizedStepCard({
  step,
  index,
  isCompleted,
  isCurrent,
  isLocked,
  onMarkComplete,
  onMarkIncomplete,
  isSaving,
}: MonetizedStepCardProps) {
  const { subscription } = useSubscription();
  const { user } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showOneTimeModal, setShowOneTimeModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  const handlePremiumUpgrade = () => {
    if (subscription.tier === 'free') {
      router.push('/subscription');
    } else {
      setShowPremiumModal(true);
    }
  };

  const handleOneTimeService = (service: any) => {
    setSelectedService(service);
    setShowOneTimeModal(true);
  };

  const handlePurchaseService = (service: any) => {
    // Navigate to payment/booking flow
    if (service.id === 'prep-practice-test') {
      router.push('/(tabs)/fitness');
    } else {
      router.push('/subscription');
    }
    setShowOneTimeModal(false);
  };

  const getStepStatus = () => {
    if (isCompleted) return 'completed';
    if (isLocked) return 'locked';
    if (isCurrent) return 'current';
    return 'available';
  };

  const status = getStepStatus();

  return (
    <View style={styles.container}>
      {/* Main Step Card */}
      <View style={[
        styles.stepCard,
        isLocked && styles.lockedStepCard,
        status === 'current' && styles.currentStepCard
      ]}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <View style={styles.stepIcon}>
            {status === 'completed' ? (
              <CheckCircle size={24} color={Colors.success} />
            ) : isLocked ? (
              <Lock size={24} color={Colors.textSecondary} />
            ) : (
              <Text style={styles.stepNumber}>{index + 1}</Text>
            )}
          </View>
          <View style={styles.stepInfo}>
            <Text style={[
              styles.stepTitle,
              isLocked && styles.lockedText
            ]}>
              {step.title}
            </Text>
            <Text style={[
              styles.stepDescription,
              isLocked && styles.lockedText
            ]}>
              {step.description}
            </Text>
            <View style={styles.stepMeta}>
              <View style={styles.stepMetaItem}>
                <Clock size={14} color={Colors.textSecondary} />
                <Text style={styles.stepMetaText}>{step.estimatedTime}</Text>
              </View>
            </View>
          </View>
          {status === 'completed' && (
            <View style={styles.completedBadge}>
              <CheckCircle size={16} color={Colors.success} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        {/* Free Preview Content */}
        {!isLocked && (
          <View style={styles.freePreview}>
            <View style={styles.freePreviewHeader}>
              <BookOpen size={16} color={Colors.primary} />
              <Text style={styles.freePreviewTitle}>Free Preview</Text>
            </View>
            <Text style={styles.freePreviewIntro}>
              {step.monetization.freePreview.intro}
            </Text>
            <View style={styles.freePreviewTips}>
              {step.monetization.freePreview.tips.slice(0, 2).map((tip, tipIndex) => (
                <View key={tipIndex} style={styles.tipItem}>
                  <CheckCircle size={14} color="#10B981" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.freePreviewGuidance}>
              {step.monetization.freePreview.basicGuidance}
            </Text>
          </View>
        )}

        {/* Premium Upgrade CTA */}
        {!isLocked && (
          <TouchableOpacity
            style={[
              styles.premiumUpgradeCard,
              subscription.tier === 'free' && styles.lockedUpgradeCard
            ]}
            onPress={handlePremiumUpgrade}
          >
            <View style={styles.premiumUpgradeContent}>
              <View style={styles.premiumUpgradeIcon}>
                <Crown size={20} color={subscription.tier === 'free' ? Colors.textSecondary : '#F59E0B'} />
                {subscription.tier === 'free' && (
                  <View style={styles.lockOverlay}>
                    <Lock size={12} color={Colors.white} />
                  </View>
                )}
              </View>
              <View style={styles.premiumUpgradeText}>
                <Text style={[
                  styles.premiumUpgradeTitle,
                  subscription.tier === 'free' && styles.lockedText
                ]}>
                  {step.monetization.premiumUpgrade.title}
                </Text>
                <Text style={[
                  styles.premiumUpgradeDescription,
                  subscription.tier === 'free' && styles.lockedText
                ]}>
                  {step.monetization.premiumUpgrade.description}
                </Text>
              </View>
              <ArrowRight size={16} color={subscription.tier === 'free' ? Colors.textSecondary : Colors.primary} />
            </View>
            {subscription.tier === 'free' && (
              <View style={styles.upgradePrompt}>
                <Text style={styles.upgradePromptText}>Upgrade to unlock</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* One-Time Services */}
        {!isLocked && step.monetization.oneTimeServices && step.monetization.oneTimeServices.length > 0 && (
          <View style={styles.oneTimeServices}>
            <Text style={styles.oneTimeServicesTitle}>One-Time Services</Text>
            {step.monetization.oneTimeServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.oneTimeServiceCard}
                onPress={() => handleOneTimeService(service)}
              >
                <View style={styles.oneTimeServiceContent}>
                  <View style={styles.oneTimeServiceHeader}>
                    <Text style={styles.oneTimeServiceTitle}>{service.title}</Text>
                    <Text style={styles.oneTimeServicePrice}>${service.price}</Text>
                  </View>
                  <Text style={styles.oneTimeServiceDescription}>
                    {service.description}
                  </Text>
                  {service.popular && (
                    <View style={styles.popularBadge}>
                      <Star size={12} color={Colors.white} />
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step Actions */}
        {!isLocked && (
          <View style={styles.stepActions}>
            {!isCompleted ? (
              <Button
                title={isSaving ? "Saving..." : "Mark Complete"}
                onPress={() => onMarkComplete(step.id)}
                style={styles.completeButton}
                size="small"
                disabled={isSaving}
              />
            ) : (
              <Button
                title={isSaving ? "Saving..." : "Mark Incomplete"}
                onPress={() => onMarkIncomplete(step.id)}
                variant="outline"
                style={styles.resetButton}
                size="small"
                disabled={isSaving}
              />
            )}
          </View>
        )}

        {/* Locked Content Overlay */}
        {isLocked && (
          <LockedContentOverlay
            feature="general"
            onUpgrade={() => router.push('/subscription')}
          >
            <View />
          </LockedContentOverlay>
        )}
      </View>

      {/* Premium Features Modal */}
      <Modal
        visible={showPremiumModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPremiumModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{step.monetization.premiumUpgrade.title}</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.premiumFeaturesCard}>
              <View style={styles.premiumFeaturesHeader}>
                <Crown size={24} color="#F59E0B" />
                <Text style={styles.premiumFeaturesTitle}>Premium Features</Text>
              </View>
              
              <View style={styles.premiumFeaturesList}>
                {step.monetization.premiumUpgrade.features.map((feature, index) => (
                  <View key={index} style={styles.premiumFeature}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.premiumFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              <Button
                title="Access Premium Features"
                onPress={() => {
                  setShowPremiumModal(false);
                  router.push('/subscription');
                }}
                style={styles.premiumAccessButton}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* One-Time Service Modal */}
      <Modal
        visible={showOneTimeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowOneTimeModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedService?.title}</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedService && (
              <View style={styles.serviceCard}>
                {selectedService.popular && (
                  <View style={styles.popularBadge}>
                    <Star size={12} color={Colors.white} />
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}
                
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceTitle}>{selectedService.title}</Text>
                  <Text style={styles.servicePrice}>${selectedService.price}</Text>
                </View>
                
                <Text style={styles.serviceDescription}>{selectedService.description}</Text>
                
                <View style={styles.serviceFeatures}>
                  {selectedService.features.map((feature: string, index: number) => (
                    <View key={index} style={styles.serviceFeature}>
                      <CheckCircle size={16} color={Colors.success} />
                      <Text style={styles.serviceFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                
                <Button
                  title="Book Service"
                  onPress={() => handlePurchaseService(selectedService)}
                  style={styles.serviceButton}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Upsell Modal */}
      <UpsellModal
        visible={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        trigger="general"
        onSubscribe={() => setShowUpsellModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  stepCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  lockedStepCard: {
    opacity: 0.7,
  },
  currentStepCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  
  // Step Header
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  lockedText: {
    color: Colors.textSecondary,
  },
  stepMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  stepMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },

  // Free Preview
  freePreview: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  freePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  freePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  freePreviewIntro: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  freePreviewTips: {
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  freePreviewGuidance: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // Premium Upgrade
  premiumUpgradeCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  lockedUpgradeCard: {
    backgroundColor: '#F1F5F9',
    borderColor: Colors.border,
  },
  premiumUpgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumUpgradeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumUpgradeText: {
    flex: 1,
  },
  premiumUpgradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  premiumUpgradeDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  upgradePrompt: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  upgradePromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // One-Time Services
  oneTimeServices: {
    marginBottom: 16,
  },
  oneTimeServicesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  oneTimeServiceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  oneTimeServiceContent: {
    position: 'relative',
  },
  oneTimeServiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  oneTimeServiceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  oneTimeServicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  oneTimeServiceDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  popularBadge: {
    position: 'absolute',
    top: -6,
    right: 0,
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },

  // Step Actions
  stepActions: {
    marginTop: 16,
  },
  completeButton: {
    backgroundColor: Colors.primary,
  },
  resetButton: {
    backgroundColor: Colors.gray[100],
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  
  // Premium Features Modal
  premiumFeaturesCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumFeaturesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  premiumFeaturesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  premiumFeaturesList: {
    marginBottom: 24,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  premiumFeatureText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  premiumAccessButton: {
    backgroundColor: Colors.primary,
  },

  // Service Modal
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  serviceFeatures: {
    marginBottom: 20,
  },
  serviceFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  serviceFeatureText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  serviceButton: {
    backgroundColor: Colors.primary,
  },
});


