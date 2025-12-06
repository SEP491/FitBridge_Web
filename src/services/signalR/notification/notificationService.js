import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";
import { HUB_METHODS } from "../message/constants/hubMethods";
import { LIFECYCLE_METHODS } from "../message/constants/lifecycleMethods";

// Simple pub/sub wrapper around a SignalR HubConnection for notifications
export class NotificationService {
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
      console.error("NotificationService start error:", error);
      throw error;
    }
  }

  async stop() {
    try {
      await this.connection.stop();
    } catch (error) {
      console.error("NotificationService stop error:", error);
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

  // Generic hub method invocation
  async invokeHubMethod(methodName, ...args) {
    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error("Hub connection is not connected.");
    }
    return this.connection.invoke(methodName, ...args);
  }
}
