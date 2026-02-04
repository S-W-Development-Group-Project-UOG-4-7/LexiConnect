import api from "../../../services/api";

const NOTIFICATIONS_ENDPOINT = "/api/notifications/my";

export async function listNotifications(params = {}) {
  const { data } = await api.get(NOTIFICATIONS_ENDPOINT, { params });
  return data;
}

export async function getUnreadCount() {
  const { data } = await api.get("/api/notifications/unread-count");
  return data;
}

export async function markNotificationRead(notificationId) {
  const { data } = await api.post(
    `/api/notifications/${notificationId}/read`
  );
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.post("/api/notifications/mark-all-read");
  return data;
}
