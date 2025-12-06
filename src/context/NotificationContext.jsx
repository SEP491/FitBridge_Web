import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  HUB_METHODS,
  CLIENT_METHODS,
} from "../services/signalR/message/constants/hubMethods";
import { LIFECYCLE_METHODS } from "../services/signalR/message/constants/lifecycleMethods";
import notificationApiService from "../services/notificationService";
import { useNotificationSignalR } from "./NotificationSignalRContext";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { notificationService, connectionStatus } = useNotificationSignalR();
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  const [inAppNotification, setInAppNotification] = useState(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await notificationApiService.getNotifications();
      console.log("Fetch notifications response:", response);

      const { items, total } = response.data || response;

      // Sort notifications by timestamp (latest first)
      const sortedItems = (items || []).sort((a, b) => {
        return (
          new Date(b.timestamp || b.createdAt) -
          new Date(a.timestamp || a.createdAt)
        );
      });

      setNotifications(sortedItems);

      // Calculate unread count
      const unread = sortedItems.filter((n) => !n.isRead).length;
      setUnreadCount(unread);

      console.log(
        `Notifications fetched successfully: ${
          total || sortedItems.length
        } total, ${unread} unread`
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationApiService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      console.log(`Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApiService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      console.log("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await notificationApiService.deleteNotification(notificationId);
        const deletedNotification = notifications.find(
          (n) => n.id === notificationId
        );
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        console.log(`Notification ${notificationId} deleted`);
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    },
    [notifications]
  );

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationApiService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      console.log("All notifications deleted");
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    }
  }, []);

  useEffect(() => {
    if (!notificationService) return;

    // Handler for receiving notifications
    const handleNotificationReceived = (notification) => {
      console.log(
        "🔔 Notification SignalR: Real-time notification received!",
        notification
      );

      // Only show in-app notification if app is in foreground
      setInAppNotification(notification);
      fetchNotifications();

      notificationService
        .invokeHubMethod(HUB_METHODS.CONFIRM_HANDSHAKE)
        .then(() => {
          console.log("✅ Confirmed notification receipt to server");
        })
        .catch((error) => {
          console.error("❌ Failed to confirm notification receipt:", error);
        });
    };

    // Handler for disconnection
    const handleDisconnected = () => {
      console.log("Notification SignalR: Disconnected");
      setIsSignalRConnected(false);
    };

    // Handler for reconnection
    const handleReconnected = () => {
      console.log("Notification SignalR: Reconnected");
      setIsSignalRConnected(true);
      fetchNotifications();
    };

    // Register event listeners
    notificationService.onEvent(
      CLIENT_METHODS.NOTIFICATION_RECEIVED,
      handleNotificationReceived
    );
    notificationService.onEvent(
      LIFECYCLE_METHODS.ON_CLOSED,
      handleDisconnected
    );
    notificationService.onEvent(
      LIFECYCLE_METHODS.ON_RECONNECTED,
      handleReconnected
    );

    // Check connection state and setup accordingly
    if (connectionStatus === "connected") {
      console.log("Notification SignalR: Connection already connected");
      setIsSignalRConnected(true);
      fetchNotifications();
    }

    return () => {
      if (notificationService) {
        notificationService.offEvent(
          CLIENT_METHODS.NOTIFICATION_RECEIVED,
          handleNotificationReceived
        );
        notificationService.offEvent(
          LIFECYCLE_METHODS.ON_CLOSED,
          handleDisconnected
        );
        notificationService.offEvent(
          LIFECYCLE_METHODS.ON_RECONNECTED,
          handleReconnected
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationService, connectionStatus]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      refreshing,
      isSignalRConnected,
      inAppNotification,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
      setInAppNotification,
    }),
    [
      notifications,
      unreadCount,
      refreshing,
      isSignalRConnected,
      inAppNotification,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
