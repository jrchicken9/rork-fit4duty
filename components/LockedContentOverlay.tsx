import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Star, Zap } from 'lucide-react-native';
import { useSubscription } from '../context/SubscriptionContext';

interface LockedContentOverlayProps {
  children: React.ReactNode;
  feature: 'digital-test' | 'training-plan' | 'interview-prep' | 'community' | 'general';
  onUpgrade: () => void;
  showPreview?: boolean;
  previewText?: string;
}

const { width, height } = Dimensions.get('window');

export default function LockedContentOverlay({
  children,
  feature,
  onUpgrade,
  showPreview = true,
  previewText,
}: LockedContentOverlayProps) {
  const { subscription } = useSubscription();

  const getFeatureIcon = () => {
    switch (feature) {
      case 'digital-test':
        return <Zap size={24} color="#F59E0B" />;
      case 'training-plan':
        return <Star size={24} color="#F59E0B" />;
      case 'interview-prep':
        return <Star size={24} color="#F59E0B" />;
      case 'community':
        return <Star size={24} color="#F59E0B" />;
      default:
        return <Lock size={24} color="#F59E0B" />;
    }
  };

  const getFeatureTitle = () => {
    switch (feature) {
      case 'digital-test':
        return 'Premium Test Access';
      case 'training-plan':
        return 'Complete Training Plan';
      case 'interview-prep':
        return 'Interview Prep Vault';
      case 'community':
        return 'Premium Community';
      default:
        return 'Premium Feature';
    }
  };

  const getFeatureDescription = () => {
    switch (feature) {
      case 'digital-test':
        return 'Unlock unlimited digital tests with detailed analytics';
      case 'training-plan':
        return 'Access your full personalized training program';
      case 'interview-prep':
        return 'Get sample questions, mock interviews, and guides';
      case 'community':
        return 'Connect with instructors and other candidates';
      default:
        return 'Upgrade to Premium for full access';
    }
  };

  if (subscription.tier === 'premium') {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {children}
      
      <BlurView intensity={showPreview ? 10 : 20} style={styles.overlay}>
        <LinearGradient
          colors={['rgba(17, 24, 39, 0.8)', 'rgba(31, 41, 55, 0.9)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              {getFeatureIcon()}
            </View>
            
            <Text style={styles.title}>{getFeatureTitle()}</Text>
            <Text style={styles.description}>{getFeatureDescription()}</Text>
            
            {previewText && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewText}>{previewText}</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
            
            <Text style={styles.pricingText}>Starting at $19.99/month</Text>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  previewText: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  upgradeButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pricingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
