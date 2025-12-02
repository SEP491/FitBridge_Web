import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MessagingService } from "../services/signalR/message/messagingService";

const MessagingStateContext = createContext(null);

export const MessagingStateProvider = ({ children }) => {
  const [messagingService, setMessagingService] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const baseUrl = import.meta.env.VITE_API_CHAT_MESSAGE_URL || "";
  useEffect(() => {
    if (!baseUrl) {
      console.warn("MessagingStateProvider: VITE_API_BASE_URL is not set");
      return;
    }

    const service = new MessagingService({
      baseUrl,
    });

    setMessagingService(service);

    const startConnection = async () => {
      try {
        setConnectionStatus("connecting");
        await service.start();
        setConnectionStatus("connected");
      } catch (error) {
        console.error("MessagingStateProvider: connection error", error);
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
      setMessagingService(null);
      setConnectionStatus("disconnected");
    };
  }, [baseUrl]);

  const value = useMemo(
    () => ({
      messagingService,
      connectionStatus,
    }),
    [messagingService, connectionStatus]
  );

  return (
    <MessagingStateContext.Provider value={value}>
      {children}
    </MessagingStateContext.Provider>
  );
};

export const useMessagingState = () => {
  const ctx = useContext(MessagingStateContext);
  if (!ctx) {
    throw new Error(
      "useMessagingState must be used within MessagingStateProvider"
    );
  }
  return ctx;
};
