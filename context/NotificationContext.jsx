"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { notificationsApi } from "../lib/notifications";
import { getSocket, disconnectSocket } from "../lib/socket";

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refreshNotifications: async () => {},
});

export function NotificationProvider({ children }) {
  const { user, isAuthenticated, token } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications and unread count
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const [count, data] = await Promise.all([
        notificationsApi.getUnreadCount(),
        notificationsApi.getNotifications({ page: 0, size: 20 }),
      ]);
      setUnreadCount(typeof count === "number" ? count : 0);
      setNotifications(data?.content || []);
    } catch (err) {
      console.warn("[NotificationContext] Failed to fetch notifications:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Connect socket and listen for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectSocket();
      return;
    }

    let isMounted = true;

    // Load initial data
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [count, data] = await Promise.all([
          notificationsApi.getUnreadCount(),
          notificationsApi.getNotifications({ page: 0, size: 20 }),
        ]);
        if (isMounted) {
          setUnreadCount(typeof count === "number" ? count : 0);
          setNotifications(data?.content || []);
        }
      } catch (err) {
        console.warn("[NotificationContext] Failed to load notifications:", err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    // Socket.IO realtime connection
    const socket = getSocket(token);
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      console.log("[NotificationContext] Realtime notification received:", newNotif);

      setNotifications((prev) => {
        // Prevent duplicates
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });

      setUnreadCount((prev) => prev + 1);

      // Trigger Toast banner
      if (toast && toast.showToast) {
        toast.showToast({
          title: newNotif.title || "New Notification",
          message: newNotif.message || "",
          type: newNotif.type?.includes("REJECT") || newNotif.type?.includes("CANCEL") || newNotif.type?.includes("FAILED")
            ? "error"
            : newNotif.type?.includes("SUCCESS") || newNotif.type?.includes("APPROVED") || newNotif.type?.includes("COMPLETED")
            ? "success"
            : "info",
        });
      }
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      isMounted = false;
      socket.off("notification:new", handleNewNotification);
    };
  }, [isAuthenticated, user, token, toast]);

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await notificationsApi.markAsRead(id);
    } catch (err) {
      console.error("[NotificationContext] Failed to mark notification as read:", err);
      refreshNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);

      await notificationsApi.markAllAsRead();
    } catch (err) {
      console.error("[NotificationContext] Failed to mark all as read:", err);
      refreshNotifications();
    }
  };

  const activeNotifications = isAuthenticated ? notifications : [];
  const activeUnreadCount = isAuthenticated ? unreadCount : 0;

  return (
    <NotificationContext.Provider
      value={{
        notifications: activeNotifications,
        unreadCount: activeUnreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
