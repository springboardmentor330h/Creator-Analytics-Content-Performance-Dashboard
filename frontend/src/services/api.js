import axios from "axios";

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to every request if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
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

// Auth Service Functions
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  if (response.data && response.data.access_token) {
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify({ email: email || "monika@example.com", full_name: "Monika Chowdary" }));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    logoutUser();
  }
};

// Dashboard
export const getDashboardReport = async (platform) => {
  const params = platform && platform !== "All" ? { platform } : {};
  const response = await api.get("/reports", { params });
  return response.data;
};

// Content Analytics - GET /reports/content
export const getContentReport = async (platform) => {
  const params = platform && platform !== "All" ? { platform } : {};
  const response = await api.get("/reports/content", { params });
  return response.data;
};

export const getContentList = async (platform) => {
  const params = platform && platform !== "All" ? { platform } : {};
  const response = await api.get("/content", { params });
  return response.data;
};

export const createContent = async (data) => {
  const response = await api.post("/content", data);
  return response.data;
};

// Audience Analytics
export const getAudienceReport = async (platform) => {
  const params = platform && platform !== "All" ? { platform } : {};
  const response = await api.get("/reports/audience", { params });
  return response.data;
};

// Revenue
export const getRevenueReport = async (platform) => {
  const params = platform && platform !== "All" ? { platform } : {};
  const response = await api.get("/reports/revenue", { params });
  return response.data;
};

export const getRevenueList = async (platform) => {
  const params = platform && platform !== "All" ? { platform } : {};
  const response = await api.get("/revenue", { params });
  return response.data;
};

export const createRevenue = async (data) => {
  const response = await api.post("/revenue", data);
  return response.data;
};

// Sponsorships
export const getSponsorshipsList = async (platform) => {
  const params = platform && platform !== "All" ? { platform } : {};
  const response = await api.get("/sponsorships", { params });
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
export const getGrowthReport = async (platform) => {
  const params = platform && platform !== "All" ? { platform } : {};
  const response = await api.get("/reports/growth", { params });
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
