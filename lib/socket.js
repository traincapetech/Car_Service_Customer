import { io } from "socket.io-client";
import { getAccessToken } from "./tokens";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:9092";

let socketInstance = null;

/**
 * Get or initialize the singleton Socket.IO connection.
 * Authenticates using access token in handshake params.
 */
export function getSocket(token = null) {
  const authToken = token || getAccessToken();

  if (!authToken) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  // Reuse active connected socket
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  try {
    socketInstance = io(SOCKET_URL, {
      auth: { token: authToken },
      query: { token: authToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      console.log("[SocketIO] Connected to realtime gateway with ID:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("[SocketIO] Connection error:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[SocketIO] Disconnected:", reason);
    });

    return socketInstance;
  } catch (error) {
    console.error("[SocketIO] Failed to initialize socket client:", error);
    return null;
  }
}

/**
 * Disconnect and destroy the current socket instance (e.g. on logout).
 */
export function disconnectSocket() {
  if (socketInstance) {
    try {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    } catch (e) {
      console.warn("[SocketIO] Error during disconnection:", e);
    }
    socketInstance = null;
  }
}

/**
 * Helper to subscribe to realtime events with automatic cleanup.
 */
export function subscribeToRealtimeEvent(event, callback) {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.on(event, callback);
  return () => {
    if (socket) {
      socket.off(event, callback);
    }
  };
}
