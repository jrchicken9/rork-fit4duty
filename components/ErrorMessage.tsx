import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';

export type ErrorType = 'error' | 'success' | 'info' | 'warning';

interface ErrorMessageProps {
  message: string;
  type?: ErrorType;
  visible?: boolean;
  style?: any;
}

export default function ErrorMessage({ 
  message, 
  type = 'error', 
  visible = true,
  style 
}: ErrorMessageProps) {
  if (!visible || !message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'info':
        return <Info size={20} color={Colors.primary} />;
      case 'warning':
        return <AlertCircle size={20} color={Colors.warning} />;
      default:
        return <AlertCircle size={20} color={Colors.error} />;
    }
  };

  const getContainerStyle = () => {
    switch (type) {
      case 'success':
        return styles.successContainer;
      case 'info':
        return styles.infoContainer;
      case 'warning':
        return styles.warningContainer;
      default:
        return styles.errorContainer;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'success':
        return styles.successText;
      case 'info':
        return styles.infoText;
      case 'warning':
        return styles.warningText;
      default:
        return styles.errorText;
    }
  };

  return (
    <View style={[styles.container, getContainerStyle(), style]}>
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <Text style={[styles.message, getTextStyle()]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error + '30',
  },
  errorText: {
    color: Colors.error,
  },
  successContainer: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '30',
  },
  successText: {
    color: Colors.success,
  },
  infoContainer: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary + '30',
  },
  infoText: {
    color: Colors.primary,
  },
  warningContainer: {
    backgroundColor: Colors.warning + '10',
    borderColor: Colors.warning + '30',
  },
  warningText: {
    color: Colors.warning,
  },
});
