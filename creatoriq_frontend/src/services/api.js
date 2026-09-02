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

export const getAllContent = async () => {
  const response = await api.get("/content/");
  return response.data;
};

export const getYouTubeContentAnalytics = async (videoId) => {
  const response = await api.get(
    `/content-analytics/youtube/${videoId}`
  );

  return response.data;
};

export default api;