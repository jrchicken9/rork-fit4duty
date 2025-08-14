import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  X,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Shield,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ApplePayModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  sessionTitle: string;
  sessionPrice: number;
  sessionDate: string;
  sessionTime: string;
  sessionLocation: string;
  loading?: boolean;
}

export default function ApplePayModal({
  visible,
  onClose,
  onPaymentSuccess,
  onPaymentError,
  sessionTitle,
  sessionPrice,
  sessionDate,
  sessionTime,
  sessionLocation,
  loading = false,
}: ApplePayModalProps) {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'card'>('apple_pay');

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleApplePay = async () => {
    setPaymentLoading(true);
    
    try {
      // Simulate Apple Pay processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      const paymentData = {
        payment_method: 'apple_pay',
        amount: sessionPrice,
        currency: 'USD',
        transaction_id: `txn_${Date.now()}`,
        status: 'succeeded',
        timestamp: new Date().toISOString(),
      };
      
      onPaymentSuccess(paymentData);
    } catch (error) {
      onPaymentError('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCardPayment = async () => {
    setPaymentLoading(true);
    
    try {
      // Simulate card payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful payment
      const paymentData = {
        payment_method: 'card',
        amount: sessionPrice,
        currency: 'USD',
        transaction_id: `txn_${Date.now()}`,
        status: 'succeeded',
        timestamp: new Date().toISOString(),
      };
      
      onPaymentSuccess(paymentData);
    } catch (error) {
      onPaymentError('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'apple_pay') {
      await handleApplePay();
    } else {
      await handleCardPayment();
    }
  };

  if (!visible) return null;

  const { height: screenHeight } = Dimensions.get('window');

  return (
    <View style={styles.overlay}>
      <View style={[styles.container, { maxHeight: screenHeight * 0.9 }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <CreditCard size={24} color={Colors.primary} />
            <Text style={styles.title}>Complete Payment</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Session Summary */}
          <View style={styles.sessionSummary}>
            <Text style={styles.summaryTitle}>Session Details</Text>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Session:</Text>
              <Text style={styles.summaryValue}>{sessionTitle}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.summaryValue}>{formatDate(sessionDate)}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.summaryValue}>{formatTime(sessionTime)}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.summaryValue}>{sessionLocation}</Text>
            </View>
          </View>

          {/* Payment Amount */}
          <View style={styles.paymentAmount}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>{formatPrice(sessionPrice)}</Text>
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethods}>
            <Text style={styles.methodsTitle}>Choose Payment Method</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'apple_pay' && styles.paymentMethodSelected
              ]}
              onPress={() => setPaymentMethod('apple_pay')}
              disabled={paymentLoading}
            >
              <View style={styles.methodContent}>
                <View style={styles.methodIcon}>
                  <Text style={styles.applePayText}>Apple Pay</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>Apple Pay</Text>
                  <Text style={styles.methodDescription}>Pay with Face ID or Touch ID</Text>
                </View>
              </View>
              {paymentMethod === 'apple_pay' && (
                <CheckCircle size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'card' && styles.paymentMethodSelected
              ]}
              onPress={() => setPaymentMethod('card')}
              disabled={paymentLoading}
            >
              <View style={styles.methodContent}>
                <View style={styles.methodIcon}>
                  <CreditCard size={20} color={Colors.textSecondary} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>Credit/Debit Card</Text>
                  <Text style={styles.methodDescription}>Visa, Mastercard, American Express</Text>
                </View>
              </View>
              {paymentMethod === 'card' && (
                <CheckCircle size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Shield size={16} color={Colors.success} />
            <Text style={styles.securityText}>
              Your payment information is secure and encrypted
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={paymentLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.payButton,
              paymentLoading && styles.payButtonDisabled
            ]}
            onPress={handlePayment}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <DollarSign size={20} color={Colors.white} />
            )}
            <Text style={styles.payButtonText}>
              {paymentLoading ? 'Processing...' : `Pay ${formatPrice(sessionPrice)}`}
            </Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? 20 : 16,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    maxHeight: '90%',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  sessionSummary: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    minWidth: 60,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  paymentAmount: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  paymentMethods: {
    marginBottom: 24,
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentMethodSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applePayText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.success + '10',
    borderRadius: 8,
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: Colors.success,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  payButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  payButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
