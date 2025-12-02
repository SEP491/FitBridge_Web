import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";
import { HUB_METHODS } from "./constants/hubMethods";
import { LIFECYCLE_METHODS } from "./constants/lifecycleMethods";

// Simple pub/sub wrapper around a SignalR HubConnection
export class MessagingService {
  constructor({ baseUrl, accessToken }) {
    this.baseUrl = baseUrl;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(baseUrl, {
        accessTokenFactory: () =>
          accessToken || Cookies.get("accessToken") || "",
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.serverTimeoutInMilliseconds = 90000;
    this.connection.keepAliveIntervalInMilliseconds = 30000;

    this.handlers = {};

    this.connection.onreconnecting((error) => {
      this.emit(LIFECYCLE_METHODS.ON_RECONNECTING, error);
    });

    this.connection.onreconnected(() => {
      this.emit(LIFECYCLE_METHODS.ON_RECONNECTED);
    });

    this.connection.onclose((error) => {
      this.emit(LIFECYCLE_METHODS.ON_CLOSED, error);
    });
  }

  async start() {
    if (
      this.connection.state === signalR.HubConnectionState.Connected ||
      this.connection.state === signalR.HubConnectionState.Connecting
    ) {
      return;
    }

    try {
      await this.connection.start();
    } catch (error) {
      console.error("MessagingService start error:", error);
      throw error;
    }
  }

  async stop() {
    try {
      await this.connection.stop();
    } catch (error) {
      console.error("MessagingService stop error:", error);
    }
  }

  // Generic event API
  onEvent(eventName, handler) {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = new Set();
      this.connection.on(eventName, (payload) => {
        this.emit(eventName, payload);
      });
    }
    this.handlers[eventName].add(handler);
  }

  offEvent(eventName, handler) {
    if (!this.handlers[eventName]) return;
    this.handlers[eventName].delete(handler);
  }

  emit(eventName, payload) {
    const set = this.handlers[eventName];
    if (!set) return;
    set.forEach((handler) => handler(payload));
  }

  // Convenience hub invocations
  async joinGroup(groupId) {
    console.log("🔵 [messagingService] joinGroup called", { groupId });
    try {
      const result = await this.connection.invoke(HUB_METHODS.JOIN_GROUP, groupId);
      console.log("✅ [messagingService] joinGroup success", { groupId, result });
      return result;
    } catch (error) {
      console.error("❌ [messagingService] joinGroup error", { groupId, error });
      throw error;
    }
  }

  async leaveGroup(groupId) {
    console.log("🔴 [messagingService] leaveGroup called", { groupId });
    try {
      const result = await this.connection.invoke(HUB_METHODS.LEAVE_GROUP, groupId);
      console.log("✅ [messagingService] leaveGroup success", { groupId, result });
      return result;
    } catch (error) {
      console.error("❌ [messagingService] leaveGroup error", { groupId, error });
      throw error;
    }
  }

  async sendTyping(groupId) {
    return this.connection.invoke(HUB_METHODS.USER_TYPING, { groupId });
  }

  // Adjust method name/payload to match your backend for sending messages
  async sendMessage(payload) {
    return this.connection.invoke(HUB_METHODS.SEND_MESSAGE, payload);
  }

  // Generic hub method invocation
  async invokeHubMethod(methodName, ...args) {
    if (
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      throw new Error("Hub connection is not connected.");
    }
    return this.connection.invoke(methodName, ...args);
  }
}
