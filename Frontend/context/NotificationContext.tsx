import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Notice } from "../services/crawlerAPI";

interface NotificationContextType {
  notificationNotices: Notice[];
  notificationIds: string[];
  isNotification: (id: string) => boolean;
  addNotification: (notice: Notice) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  isAlertOpen: boolean;
  toggleAlert: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATION_STORAGE_KEY = "notificationNotices";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notificationNotices, setNotificationNotices] = useState<Notice[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const toggleAlert = () => {
    setIsAlertOpen(!isAlertOpen);
  };

  // 앱 시작 시 저장된 알림 불러오기
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (saved) {
        setNotificationNotices(JSON.parse(saved));
      }
    } catch (error) {
      console.error("알림 불러오기 오류:", error);
    }
  };

  const saveNotifications = async (notices: Notice[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notices));
    } catch (error) {
      console.error("알림 저장 오류:", error);
    }
  };

  const notificationIds = notificationNotices.map((n) => n.id);

  const isNotification = (id: string) => {
    return notificationIds.includes(id);
  };

  const addNotification = async (notice: Notice) => {
    if (!isNotification(notice.id)) {
      const updated = [notice, ...notificationNotices]; // 최신 알림이 맨 위로
      setNotificationNotices(updated);
      await saveNotifications(updated);
    }
  };

  const removeNotification = async (id: string) => {
    const updated = notificationNotices.filter((n) => n.id !== id);
    setNotificationNotices(updated);
    await saveNotifications(updated);
  };

  const clearAllNotifications = async () => {
    setNotificationNotices([]);
    await saveNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationNotices,
        notificationIds,
        isNotification,
        addNotification,
        removeNotification,
        clearAllNotifications,
        isAlertOpen,
        toggleAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
