import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ChevronRight,
  Trash2 
} from 'lucide-react-native';
import { Notification, NotificationPriority } from '@/context/NotificationContext';
import Colors from '@/constants/colors';
import { router } from 'expo-router';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onDelete: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
}

export default function NotificationItem({
  notification,
  onPress,
  onDelete,
  onMarkAsRead,
}: NotificationItemProps) {
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return Colors.error;
      case 'high':
        return Colors.warning;
      case 'medium':
        return Colors.primary;
      case 'low':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle size={16} color={Colors.error} />;
      case 'high':
        return <AlertCircle size={16} color={Colors.warning} />;
      case 'medium':
        return <Info size={16} color={Colors.primary} />;
      case 'low':
        return <Info size={16} color={Colors.textSecondary} />;
      default:
        return <Info size={16} color={Colors.textSecondary} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handlePress = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      router.push(notification.action_url as any);
    } else {
      onPress(notification);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.is_read && styles.unread,
        { borderLeftColor: getPriorityColor(notification.priority) }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {getPriorityIcon(notification.priority)}
            <Text style={[
              styles.title,
              !notification.is_read && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
          </View>
          
          <View style={styles.actions}>
            {!notification.is_read && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onMarkAsRead(notification.id)}
              >
                <CheckCircle size={16} color={Colors.success} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(notification.id)}
            >
              <Trash2 size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[
          styles.message,
          !notification.is_read && styles.unreadMessage
        ]}>
          {notification.message}
        </Text>

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.timeText}>
              {formatTime(notification.created_at)}
            </Text>
          </View>

          {notification.is_actionable && (
            <View style={styles.actionContainer}>
              <Text style={styles.actionText}>
                {notification.action_text || 'View'}
              </Text>
              <ChevronRight size={12} color={Colors.primary} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderLeftWidth: 4,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unread: {
    backgroundColor: Colors.background,
    borderLeftWidth: 6,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  unreadMessage: {
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});
