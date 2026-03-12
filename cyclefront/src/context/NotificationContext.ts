import { createContext, useContext } from "react";

export interface Notif {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  bookingId?: number;
}

interface NotifCtx {
  notifs: Notif[];
  unread: number;
  fetchNotifs: () => void;
  markRead: () => void;
}

export const NotificationContext = createContext<NotifCtx>({
  notifs: [], unread: 0, fetchNotifs: () => {}, markRead: () => {},
});

export const useNotifications = () => useContext(NotificationContext);
