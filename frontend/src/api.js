import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("creatoriq_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("creatoriq_token");
      window.dispatchEvent(new Event("creatoriq:logout"));
    }

    return Promise.reject(error);
  }
);

export async function login(email, password) {
  const response = await api.post("/auth/login", null, {
    params: {
      email,
      password,
    },
  });

  localStorage.setItem(
    "creatoriq_token",
    response.data.access_token
  );

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function getSummary(platform = "") {
  const response = await api.get("/analytics/summary", {
    params: platform ? { platform } : {},
  });

  return response.data;
}

export async function getPlatformComparison() {
  const response = await api.get("/analytics/platform-comparison");
  return response.data;
}

export async function getTopContent(platform = "") {
  const response = await api.get("/analytics/top-content", {
    params: platform ? { platform } : {},
  });

  return response.data;
}

export async function getEngagementChart(platform = "") {
  const response = await api.get("/analytics/chart/engagement", {
    params: platform ? { platform } : {},
  });

  return response.data;
}

export async function getFollowerChart() {
  const response = await api.get("/analytics/chart/followers");
  return response.data;
}

export async function getAudience() {
  const response = await api.get("/analytics/audience");
  return response.data;
}

export async function getRevenue() {
  const response = await api.get("/revenue/analytics/summary");
  return response.data;
}

export async function getContent() {
  const response = await api.get("/content");
  return response.data;
}

export async function getNotifications() {
  const response = await api.get("/notifications");
  return response.data;
}

export async function getReportSummary() {
  const response = await api.get("/reports/summary");
  return response.data;
}

export async function downloadReport(type) {
  const response = await api.get(`/reports/${type}`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data]);

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;

  link.download =
    type === "pdf"
      ? "creatoriq-report.pdf"
      : "creatoriq-report.xlsx";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}