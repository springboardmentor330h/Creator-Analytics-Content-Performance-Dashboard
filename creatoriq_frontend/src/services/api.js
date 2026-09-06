import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("creatoriq_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getCreatorRevenue = async (creatorId) => {
  const response = await api.get(`/revenue/creator/${creatorId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const getRevenueSummary = async (creatorId) => {
  const response = await api.get(
    `/revenue/analytics/summary?creator_id=${creatorId}`
  );

  return response.data;
};

export const getRevenueBySource = async (creatorId) => {
  const response = await api.get(
    `/revenue/analytics/by-source?creator_id=${creatorId}`
  );

  return response.data;
};

export const getMonthlyRevenue = async (creatorId) => {
  const response = await api.get(
    `/revenue/analytics/monthly?creator_id=${creatorId}`
  );

  return response.data;
};

export const getRevenueTrend = async (creatorId) => {
  const response = await api.get(
    `/revenue/analytics/trend?creator_id=${creatorId}`
  );

  return response.data;
};

export const getAllContent = async (creatorId) => {
  const response = await api.get("/content/", {
    params: creatorId ? { creator_id: creatorId } : undefined,
  });
  return response.data;
};

export const getYouTubeContentAnalytics = async (videoId) => {
  const response = await api.get(
    `/content-analytics/youtube/${videoId}`
  );

  return response.data;
};

export const getPlatformComparison = async (creatorId) => {
  const response = await api.get(
    `/analytics/platform-comparison?creator_id=${creatorId}`
  );

  return response.data;
};

export const getPlatformPerformance = async (creatorId) => {
  const response = await api.get(
    `/analytics/platform-performance?creator_id=${creatorId}`
  );

  return response.data;
};

export default api;
