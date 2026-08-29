import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Reports & Comprehensive Analytics
export const getReportSummary = (creatorId) => API.get(`/reports/summary/${creatorId}`);
export const getPdfReportUrl = (creatorId) => `${API_BASE_URL}/reports/export/pdf/${creatorId}`;
export const getExcelReportUrl = (creatorId) => `${API_BASE_URL}/reports/export/excel/${creatorId}`;

// Notifications
export const getNotifications = (creatorId, unreadOnly = false) => 
  API.get(`/notifications/creator/${creatorId}`, { params: { unread_only: unreadOnly } });
export const markNotificationRead = (notifId) => API.put(`/notifications/${notifId}/read`);
export const createNotification = (data) => API.post('/notifications/', data);
export const deleteNotification = (notifId) => API.delete(`/notifications/${notifId}`);

// Revenue & Sponsorships
export const getRevenues = (creatorId) => API.get(`/revenue/creator/${creatorId}`);
export const getSponsorships = (creatorId) => API.get(`/sponsorships/creator/${creatorId}`);

// User management
export const getUsers = () => API.get('/users/');
export const getCurrentUser = () => API.get('/users/me');

export default API;