import { request } from "./request";

const notificationService = {
  getNotifications: (params) =>
    request("GET", "/v1/notifications", null, {}, params),

  markAsRead: (notificationId) =>
    request("PUT", `/v1/notifications/${notificationId}/read`, null),

  markAllAsRead: () => request("PUT", "/v1/notifications/read-all", null),

  deleteNotification: (notificationId) =>
    request("DELETE", `/v1/notifications/${notificationId}`),

  deleteAllNotifications: () =>
    request("DELETE", "/v1/notifications/delete-all"),
};

export default notificationService;
