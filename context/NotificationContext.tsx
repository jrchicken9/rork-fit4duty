import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export type NotificationType = 
  | 'practice_session_reminder'
  | 'booking_confirmation'
  | 'booking_cancelled'
  | 'waitlist_position'
  | 'session_full'
  | 'session_cancelled'
  | 'payment_required'
  | 'waiver_required'
  | 'general_announcement'
  | 'fitness_reminder'
  | 'test_reminder';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  is_actionable: boolean;
  action_url?: string;
  action_text?: string;
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  type: NotificationType;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title_template: string;
  message_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreference[];
  templates: NotificationTemplate[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    preferences: [],
    templates: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  });

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationsError) throw notificationsError;

      const { data: preferences, error: preferencesError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (preferencesError) throw preferencesError;

      const { data: templates, error: templatesError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true);

      if (templatesError) throw templatesError;

      const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

      setState(prev => ({
        ...prev,
        notifications: notifications || [],
        preferences: preferences || [],
        templates: templates || [],
        unreadCount,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  }, [user]);

  // Create a notification
  const createNotification = useCallback(async (
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = 'medium',
    data: Record<string, any> = {},
    isActionable = false,
    actionUrl?: string,
    actionText?: string,
    scheduledFor?: Date
  ) => {
    if (!user) return null;

    try {
      const { data: result, error } = await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_type: type,
        p_title: title,
        p_message: message,
        p_priority: priority,
        p_data: data,
        p_is_actionable: isActionable,
        p_action_url: actionUrl,
        p_action_text: actionText,
        p_scheduled_for: scheduledFor?.toISOString(),
      });

      if (error) throw error;

      // Reload notifications to get the new one
      await loadNotifications();

      return result;
    } catch (error: any) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }, [user, loadNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
        p_user_id: user.id,
      });

      if (error) throw error;

      if (data) {
        // Update local state
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      }

      return data;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_read', {
        p_user_id: user.id,
      });

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));

      return data || 0;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  }, [user]);

  // Update notification preferences
  const updatePreference = useCallback(async (
    type: NotificationType,
    emailEnabled?: boolean,
    pushEnabled?: boolean,
    inAppEnabled?: boolean
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          type,
          email_enabled: emailEnabled,
          push_enabled: pushEnabled,
          in_app_enabled: inAppEnabled,
        }, { onConflict: 'user_id,type' });

      if (error) throw error;

      // Reload preferences
      await loadNotifications();
    } catch (error: any) {
      console.error('Error updating notification preference:', error);
      throw error;
    }
  }, [user, loadNotifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        unreadCount: prev.notifications.find(n => n.id === notificationId)?.is_read === false
          ? Math.max(0, prev.unreadCount - 1)
          : prev.unreadCount,
      }));
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }, [user]);

  // Get notification template
  const getTemplate = useCallback((type: NotificationType) => {
    return state.templates.find(t => t.type === type);
  }, [state.templates]);

  // Create notification from template
  const createNotificationFromTemplate = useCallback(async (
    type: NotificationType,
    data: Record<string, any> = {},
    priority: NotificationPriority = 'medium',
    isActionable = false,
    actionUrl?: string,
    actionText?: string
  ) => {
    const template = getTemplate(type);
    if (!template) {
      throw new Error(`Template not found for type: ${type}`);
    }

    // Replace placeholders in template
    let title = template.title_template;
    let message = template.message_template;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      title = title.replace(new RegExp(placeholder, 'g'), String(value));
      message = message.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return createNotification(type, title, message, priority, data, isActionable, actionUrl, actionText);
  }, [getTemplate, createNotification]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setState({
        notifications: [],
        preferences: [],
        templates: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
      });
    }
  }, [user, loadNotifications]);

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Reload notifications when changes occur
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadNotifications]);

  return {
    // State
    notifications: state.notifications,
    preferences: state.preferences,
    templates: state.templates,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    loadNotifications,
    createNotification,
    createNotificationFromTemplate,
    markAsRead,
    markAllAsRead,
    updatePreference,
    deleteNotification,
    getTemplate,
  };
});
