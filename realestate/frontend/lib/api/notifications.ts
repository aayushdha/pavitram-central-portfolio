import { apiClient } from "./client";
import { AppNotification } from "./domain-types";

export const notificationsApi = {
  list: () => apiClient.get<{ notifications: AppNotification[]; unreadCount: number }>("/notifications"),
  markRead: (id: string) =>
    apiClient.patch<{ notification: AppNotification }>(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch<{ message: string }>("/notifications/read-all"),
};
