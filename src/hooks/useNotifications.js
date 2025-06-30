import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/AuthStore';
import { getNotificationCount, getUnreadNotifications } from '../services/notifications';

export const useNotifications = () => {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const count = await getNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user?.id) {
      setUnreadNotifications([]);
      return;
    }

    try {
      const notifications = await getUnreadNotifications();
      setUnreadNotifications(notifications);
      setUnreadCount(notifications.length);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      setUnreadNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id]);

  const refreshNotifications = useCallback(() => {
    fetchUnreadCount();
    fetchUnreadNotifications();
  }, [fetchUnreadCount, fetchUnreadNotifications]);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
    setUnreadNotifications([]);
  }, []);

  useEffect(() => {
    if (user?.id) {
      refreshNotifications();
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(refreshNotifications, 30000);
      
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setUnreadNotifications([]);
    }
  }, [user?.id, refreshNotifications]);

  return {
    unreadCount,
    unreadNotifications,
    loading,
    refreshNotifications,
    decrementUnreadCount,
    resetUnreadCount
  };
};
