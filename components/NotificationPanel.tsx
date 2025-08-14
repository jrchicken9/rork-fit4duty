import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  X,
  CheckCircle,
  Filter,
  Trash2,
  Settings,
  Bell,
  BellOff,
} from 'lucide-react-native';
import { useNotifications, Notification } from '@/context/NotificationContext';
import NotificationItem from './NotificationItem';
import Colors from '@/constants/colors';

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationPanel({
  visible,
  onClose,
}: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'read':
        return notification.is_read;
      default:
        return true;
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Read',
          onPress: async () => {
            await markAllAsRead();
          },
        },
      ]
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(notificationId),
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    // Handle notification press - could open details or navigate
    console.log('Notification pressed:', notification);
  };

  const getFilterButtonStyle = (filterType: FilterType) => ({
    ...styles.filterButton,
    ...(filter === filterType && styles.filterButtonActive),
  });

  const getFilterButtonTextStyle = (filterType: FilterType) => ({
    ...styles.filterButtonText,
    ...(filter === filterType && styles.filterButtonTextActive),
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleMarkAllAsRead}
              >
                <CheckCircle size={20} color={Colors.primary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={getFilterButtonStyle('all')}
            onPress={() => setFilter('all')}
          >
            <Text style={getFilterButtonTextStyle('all')}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('unread')}
            onPress={() => setFilter('unread')}
          >
            <Text style={getFilterButtonTextStyle('unread')}>
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('read')}
            onPress={() => setFilter('read')}
          >
            <Text style={getFilterButtonTextStyle('read')}>Read</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              {filter === 'all' ? (
                <>
                  <BellOff size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No notifications yet</Text>
                  <Text style={styles.emptyMessage}>
                    You'll see notifications about your practice sessions, bookings, and updates here.
                  </Text>
                </>
              ) : (
                <>
                  <CheckCircle size={48} color={Colors.success} />
                  <Text style={styles.emptyTitle}>
                    {filter === 'unread' ? 'No unread notifications' : 'No read notifications'}
                  </Text>
                  <Text style={styles.emptyMessage}>
                    {filter === 'unread' 
                      ? 'All caught up! Check back later for new notifications.'
                      : 'No read notifications to show.'
                    }
                  </Text>
                </>
              )}
            </View>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={handleNotificationPress}
                onDelete={handleDeleteNotification}
                onMarkAsRead={markAsRead}
              />
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
