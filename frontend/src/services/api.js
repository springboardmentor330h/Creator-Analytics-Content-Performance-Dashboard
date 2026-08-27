import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Reports & Comprehensive Analytics
export const getReportSummary = (creatorId) => API.get(`/reports/summary/${creatorId}`);
export const getPdfReportUrl = (creatorId) => `http://127.0.0.1:8000/reports/export/pdf/${creatorId}`;
export const getExcelReportUrl = (creatorId) => `http://127.0.0.1:8000/reports/export/excel/${creatorId}`;

// Notifications
export const getNotifications = (creatorId, unreadOnly = false) => 
  API.get(`/notifications/creator/${creatorId}`, { params: { unread_only: unreadOnly } });
export const markNotificationRead = (notifId) => API.put(`/notifications/${notifId}/read`);
export const createNotification = (data) => API.post('/notifications/', data);
export const deleteNotification = (notifId) => API.delete(`/notifications/${notifId}`);

// Revenue & Sponsorships
export const getRevenues = (creatorId) => API.get(`/revenue/creator/${creatorId}`);
export const getSponsorships = (creatorId) => API.get(`/sponsorships/creator/${creatorId}`);

export default API;