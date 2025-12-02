import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { MessagingService } from "../services/signalR/message/messagingService";
import Cookies from "js-cookie";

const MessagingStateContext = createContext(null);

export const MessagingStateProvider = ({ children }) => {
  const [messagingService, setMessagingService] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const baseUrl = import.meta.env.VITE_API_CHAT_MESSAGE_URL || "";

  const initializeConnection = useCallback(async () => {
    if (!baseUrl) {
      console.warn(
        "MessagingStateProvider: VITE_API_CHAT_MESSAGE_URL is not set"
      );
      return;
    }

    // Check if user is authenticated
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      console.log(
        "MessagingStateProvider: No access token, skipping connection"
      );
      return;
    }

    setMessagingService((prevService) => {
      // If service already exists and connected, don't recreate
      if (prevService) {
        return prevService;
      }

      const service = new MessagingService({
        baseUrl,
      });

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
        !messagingService &&
        connectionStatus === "disconnected"
      ) {
        console.log(
          "MessagingStateProvider: Access token detected, initializing connection..."
        );
        initializeConnection();
      }

      // If token removed but service exists, stop connection
      if (!accessToken && messagingService) {
        console.log(
          "MessagingStateProvider: Access token removed, stopping connection..."
        );
        messagingService.stop();
        setMessagingService(null);
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
  }, [baseUrl, messagingService, connectionStatus, initializeConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (messagingService) {
        messagingService.stop();
        setMessagingService(null);
        setConnectionStatus("disconnected");
      }
    };
  }, [messagingService]);

  const value = useMemo(
    () => ({
      messagingService,
      connectionStatus,
      reconnect: initializeConnection,
    }),
    [messagingService, connectionStatus, initializeConnection]
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
