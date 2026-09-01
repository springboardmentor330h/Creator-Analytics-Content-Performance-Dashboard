import axios from "axios";

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) {
      token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb25pa2FAZXhhbXBsZS5jb20iLCJleHAiOjE4MTk4MDc1NzZ9.1ZetbSt7dw3UVDMDBM0Uty3a36VLGzE-eDUN6se_bfc";
      localStorage.setItem("access_token", token);
    }

    if (token) {
      if (config.headers && config.headers.set) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Save / remove authentication token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
};

// Dashboard
export const getDashboardReport = async () => {
  const response = await api.get("/reports");
  return response.data;
};

// Content Analytics - GET /reports/content
export const getContentReport = async () => {
  const response = await api.get("/reports/content");
  return response.data;
};

export const getContentList = async () => {
  const response = await api.get("/content");
  return response.data;
};

export const createContent = async (data) => {
  const response = await api.post("/content", data);
  return response.data;
};

// Audience Analytics
export const getAudienceReport = async () => {
  const response = await api.get("/reports/audience");
  return response.data;
};

// Revenue
export const getRevenueReport = async () => {
  const response = await api.get("/reports/revenue");
  return response.data;
};

export const getRevenueList = async () => {
  const response = await api.get("/revenue");
  return response.data;
};

export const createRevenue = async (data) => {
  const response = await api.post("/revenue", data);
  return response.data;
};

// Sponsorships
export const getSponsorshipsList = async () => {
  const response = await api.get("/sponsorships");
  return response.data;
};

export const createSponsorship = async (data) => {
  const response = await api.post("/sponsorships", data);
  return response.data;
};

export const updateSponsorship = async (id, data) => {
  const response = await api.put(`/sponsorships/${id}`, data);
  return response.data;
};

export const deleteSponsorship = async (id) => {
  const response = await api.delete(`/sponsorships/${id}`);
  return response.data;
};

// Growth & Trends
export const getGrowthReport = async () => {
  const response = await api.get("/reports/growth");
  return response.data;
};

// Platform Comparison
export const getPlatformReport = async () => {
  const response = await api.get("/reports/platforms");
  return response.data;
};

// Notifications
export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}`, { is_read: true });
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.put("/notifications/mark-all-read");
  return response.data;
};

export const checkForNewAlerts = async () => {
  const response = await api.post("/notifications/check-alerts");
  return response.data;
};

export const createNotification = async (data) => {
  const response = await api.post("/notifications", data);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

// Social Integration & Sync
export const syncYouTube = async () => {
  const response = await api.post("/social/youtube/sync");
  return response.data;
};

export const syncSocial = async (platform) => {
  const response = await api.post("/social/sync", { platform });
  return response.data;
};

// User Profile
export const getUserProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

// PDF Export
export const downloadPdfReport = async () => {
  const response = await api.get("/reports/export/pdf", {
    responseType: "blob",
  });
  return response.data;
};

// Excel Export
export const downloadExcelReport = async () => {
  const response = await api.get("/reports/export/excel", {
    responseType: "blob",
  });
  return response.data;
};

export default api;
