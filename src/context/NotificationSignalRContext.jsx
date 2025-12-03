import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { NotificationService } from "../services/signalR/notification/notificationService";
import Cookies from "js-cookie";

const NotificationSignalRContext = createContext(null);

export const NotificationSignalRProvider = ({ children }) => {
  const [notificationService, setNotificationService] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const baseUrl = import.meta.env.VITE_API_NOTIFICATION_HUB_URL || "";

  const initializeConnection = useCallback(async () => {
    if (!baseUrl) {
      console.warn(
        "NotificationSignalRProvider: VITE_API_NOTIFICATION_HUB_URL is not set"
      );
      return;
    }

    // Check if user is authenticated
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      console.log(
        "NotificationSignalRProvider: No access token, skipping connection"
      );
      return;
    }

    setNotificationService((prevService) => {
      // If service already exists and connected, don't recreate
      if (prevService) {
        return prevService;
      }

      const service = new NotificationService({
        baseUrl,
      });

      const startConnection = async () => {
        try {
          setConnectionStatus("connecting");
          await service.start();
          setConnectionStatus("connected");
        } catch (error) {
          console.error("NotificationSignalRProvider: connection error", error);
          setConnectionStatus("disconnected");
        }
      };

      // Lifecycle listeners
      service.onEvent("OnReconnecting", () => {
        setConnectionStatus("reconnecting");
      });
      service.onEvent("OnReconnected", () => {
        setConnectionStatus("connected");
      });
      service.onEvent("OnClosed", () => {
        setConnectionStatus("disconnected");
      });

      startConnection();

      return service;
    });
  }, [baseUrl]);

  // Initial connection attempt
  useEffect(() => {
    initializeConnection();
  }, [initializeConnection]);

  // Polling to check for accessToken changes (for auto-reconnect on login)
  useEffect(() => {
    if (!baseUrl) return;

    const checkAccessToken = () => {
      const accessToken = Cookies.get("accessToken");

      // If token exists but no connection, try to connect
      if (
        accessToken &&
        !notificationService &&
        connectionStatus === "disconnected"
      ) {
        console.log(
          "NotificationSignalRProvider: Access token detected, initializing connection..."
        );
        initializeConnection();
      }

      // If token removed but service exists, stop connection
      if (!accessToken && notificationService) {
        console.log(
          "NotificationSignalRProvider: Access token removed, stopping connection..."
        );
        notificationService.stop();
        setNotificationService(null);
        setConnectionStatus("disconnected");
      }
    };

    // Check immediately
    checkAccessToken();

    // Poll every 2 seconds
    const interval = setInterval(checkAccessToken, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [baseUrl, notificationService, connectionStatus, initializeConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (notificationService) {
        notificationService.stop();
        setNotificationService(null);
        setConnectionStatus("disconnected");
      }
    };
  }, [notificationService]);

  const value = useMemo(
    () => ({
      notificationService,
      connectionStatus,
      reconnect: initializeConnection,
    }),
    [notificationService, connectionStatus, initializeConnection]
  );

  return (
    <NotificationSignalRContext.Provider value={value}>
      {children}
    </NotificationSignalRContext.Provider>
  );
};

export const useNotificationSignalR = () => {
  const ctx = useContext(NotificationSignalRContext);
  if (!ctx) {
    throw new Error(
      "useNotificationSignalR must be used within a NotificationSignalRProvider"
    );
  }
  return ctx;
};
