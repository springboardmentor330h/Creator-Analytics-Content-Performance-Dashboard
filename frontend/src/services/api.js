import axios from "axios";

const TOKEN_KEY = "creatoriq_access_token";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const loginApi = async (email, password) => {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);
  const response = await api.post("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

export const registerApi = async (fullName, email, password) => {
  const response = await api.post("/auth/register", {
    full_name: fullName,
    email,
    password,
    role: "Creator",
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Analytics APIs
export const getDashboardSummary = async (platform) => {
  const response = await api.get("/analytics/dashboard-summary", {
    params: platform ? { platform } : undefined,
  });
  return response.data;
};

export const getKpiSummary = async () => {
  const response = await api.get("/analytics/summary");
  return response.data;
};

export const getTopContent = async () => {
  const response = await api.get("/analytics/top-content");
  return response.data;
};

export const getPlatformPerformance = async () => {
  const response = await api.get("/analytics/platform-performance");
  return response.data;
};

export const getPlatformComparison = async () => {
  const response = await api.get("/analytics/platform-comparison");
  return response.data;
};

export const getEngagementChart = async (platform) => {
  const response = await api.get("/analytics/chart/engagement", {
    params: platform ? { platform } : undefined,
  });
  return response.data;
};

export const getFollowerGrowthChart = async () => {
  const response = await api.get("/analytics/chart/followers");
  return response.data;
};

export const getContentEngagement = async (contentId) => {
  const response = await api.get(`/analytics/content/${contentId}/engagement`);
  return response.data;
};

// Content APIs
export const getAllContent = async () => {
  const response = await api.get("/content/");
  return response.data;
};

export const getContentById = async (id) => {
  const response = await api.get(`/content/${id}`);
  return response.data;
};

export const createContent = async (contentData) => {
  const response = await api.post("/content/", contentData);
  return response.data;
};

export const updateContent = async (id, contentData) => {
  const response = await api.put(`/content/${id}`, contentData);
  return response.data;
};

export const deleteContent = async (id) => {
  const response = await api.delete(`/content/${id}`);
  return response.data;
};

// Audience APIs
export const getAudienceAnalytics = async () => {
  const response = await api.get("/analytics/audience");
  return response.data;
};

export const getAudienceGrowth = async () => {
  const response = await api.get("/analytics/growth");
  return response.data;
};

export const getAudienceTrends = async () => {
  const response = await api.get("/analytics/audience-trends");
  return response.data;
};

export const getAllAudience = async () => {
  const response = await api.get("/audience");
  return response.data;
};

export const createAudience = async (data) => {
  const response = await api.post("/audience", data);
  return response.data;
};

export const updateAudience = async (id, data) => {
  const response = await api.put(`/audience/${id}`, data);
  return response.data;
};

export const deleteAudience = async (id) => {
  const response = await api.delete(`/audience/${id}`);
  return response.data;
};

// Revenue APIs
export const getTotalRevenue = async () => {
  const response = await api.get("/revenue/analytics/total");
  return response.data;
};

export const getRevenueBySource = async () => {
  const response = await api.get("/revenue/analytics/by-source");
  return response.data;
};

export const getMonthlyRevenue = async () => {
  const response = await api.get("/revenue/analytics/monthly");
  return response.data;
};

export const getRevenueTrend = async () => {
  const response = await api.get("/revenue/analytics/trend");
  return response.data;
};

export const getAllRevenues = async () => {
  const response = await api.get("/revenue/");
  return response.data;
};

export const createRevenue = async (data) => {
  const response = await api.post("/revenue/", data);
  return response.data;
};

export const updateRevenue = async (id, data) => {
  const response = await api.put(`/revenue/${id}`, data);
  return response.data;
};

export const deleteRevenue = async (id) => {
  const response = await api.delete(`/revenue/${id}`);
  return response.data;
};

// Sponsorship APIs
export const getSponsorships = async () => {
  const response = await api.get("/revenue/sponsorships");
  return response.data;
};

export const getSponsorship = async (id) => {
  const response = await api.get(`/revenue/sponsorships/${id}`);
  return response.data;
};

export const createSponsorship = async (data) => {
  const response = await api.post("/revenue/sponsorships", data);
  return response.data;
};

export const updateSponsorship = async (id, data) => {
  const response = await api.put(`/revenue/sponsorships/${id}`, data);
  return response.data;
};

export const deleteSponsorship = async (id) => {
  const response = await api.delete(`/revenue/sponsorships/${id}`);
  return response.data;
};

// Notification APIs
export const getNotifications = async (creatorId) => {
  const response = await api.get(`/notifications/${creatorId}`);
  return response.data;
};

export const markNotificationRead = async (notificationId, creatorId) => {
  const response = await api.put(`/notifications/${notificationId}/read`, null, {
    params: { creator_id: creatorId },
  });
  return response.data;
};

export const deleteNotification = async (notificationId, creatorId) => {
  const response = await api.delete(`/notifications/${notificationId}`, {
    params: { creator_id: creatorId },
  });
  return response.data;
};

export const triggerRevenueAlert = async (creatorId) => {
  const response = await api.post(`/notifications/alerts/revenue/${creatorId}`);
  return response.data;
};

// Report APIs
export const getCreatorReport = async (creatorId) => {
  const response = await api.get(`/reports/${creatorId}`);
  return response.data;
};

export const downloadReportPdf = async (creatorId) => {
  const response = await api.get(`/reports/${creatorId}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};

export const downloadReportExcel = async (creatorId) => {
  const response = await api.get(`/reports/${creatorId}/excel`, {
    responseType: "blob",
  });
  return response.data;
};

// User Profile API
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

// Alias helpers for compatibility with Harsh's function signatures
export const getRevenueSummary = async (creatorId) => {
  return await getTotalRevenue();
};

export const getCreatorRevenue = async (creatorId) => {
  return await getAllRevenues();
};

export default api;
