import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NotificationService } from "../services/signalR/notification/notificationService";

const NotificationSignalRContext = createContext(null);

export const NotificationSignalRProvider = ({ children }) => {
  const [notificationService, setNotificationService] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const baseUrl = import.meta.env.VITE_API_NOTIFICATION_HUB_URL || "";
  useEffect(() => {
    if (!baseUrl) {
      console.warn(
        "NotificationSignalRProvider: VITE_API_NOTIFICATION_HUB_URL is not set"
      );
      return;
    }

    const service = new NotificationService({
      baseUrl,
    });

    setNotificationService(service);

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

    return () => {
      service.stop();
      setNotificationService(null);
      setConnectionStatus("disconnected");
    };
  }, [baseUrl]);

  const value = useMemo(
    () => ({
      notificationService,
      connectionStatus,
    }),
    [notificationService, connectionStatus]
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
