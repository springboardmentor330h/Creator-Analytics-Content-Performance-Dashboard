import api from "./axios";

export const getNotifications = (creatorId, unreadOnly = false) =>
  api
    .get("/notifications", { params: { creator_id: creatorId, unread_only: unreadOnly } })
    .then((r) => r.data);

export const markNotificationRead = (id, creatorId) =>
  api.put(`/notifications/${id}/read`, null, { params: { creator_id: creatorId } }).then((r) => r.data);

export const checkAlerts = (creatorId) =>
  api.post("/notifications/check-alerts", null, { params: { creator_id: creatorId } }).then((r) => r.data);