import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Bell, BellOff } from 'lucide-react-native';
import { useNotifications } from '@/context/NotificationContext';
import Colors from '@/constants/colors';

interface NotificationBellProps {
  onPress: () => void;
  size?: number;
  showBadge?: boolean;
}

export default function NotificationBell({ 
  onPress, 
  size = 24, 
  showBadge = true 
}: NotificationBellProps) {
  const { unreadCount, isLoading } = useNotifications();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={styles.iconContainer}>
        {unreadCount > 0 ? (
          <Bell size={size} color={Colors.primary} />
        ) : (
          <BellOff size={size} color={Colors.textSecondary} />
        )}
        
        {showBadge && unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
