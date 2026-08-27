import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('creatoriq_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function setToken(newToken: string | null) {
  if (newToken) {
    localStorage.setItem('creatoriq_token', newToken)
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`
  } else {
    localStorage.removeItem('creatoriq_token')
    delete api.defaults.headers.common.Authorization
  }
}

// --- Auth ---
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: Record<string, unknown>) =>
    api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
}

// --- Analytics ---
export const analyticsApi = {
  summary: () => api.get('/analytics/summary'),
  engagementChart: () => api.get('/analytics/chart/engagement'),
  followersChart: () => api.get('/analytics/chart/followers'),
  platformComparison: () => api.get('/analytics/platform-comparison'),
  platformPerformance: () => api.get('/analytics/platform-performance'),
  topContent: () => api.get('/analytics/top-content'),
  revenueSummary: () => api.get('/analytics/revenue/summary'),
  revenueBySource: () => api.get('/analytics/revenue/by-source'),
  revenueMonthly: () => api.get('/analytics/revenue/monthly'),
  revenueTrend: () => api.get('/analytics/revenue/trend'),
  sponsorshipsSummary: () => api.get('/analytics/sponsorships/summary'),
  sponsorshipsStatus: () => api.get('/analytics/sponsorships/status'),
}

// --- Audience ---
export const audienceApi = {
  analytics: () => api.get('/analytics/audience'),
  growth: () => api.get('/analytics/growth'),
  trends: () => api.get('/analytics/audience-trends'),
}

// --- Revenue CRUD ---
export const revenueApi = {
  list: (skip = 0, limit = 100) =>
    api.get('/revenue', { params: { skip, limit } }),
  create: (data: Record<string, unknown>) => api.post('/revenue', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/revenue/${id}`, data),
  delete: (id: number) => api.delete(`/revenue/${id}`),
}

// --- Sponsorship CRUD ---
export const sponsorshipApi = {
  list: (skip = 0, limit = 100) =>
    api.get('/sponsorships', { params: { skip, limit } }),
  get: (id: number) => api.get(`/sponsorships/${id}`),
  create: (data: Record<string, unknown>) => api.post('/sponsorships', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/sponsorships/${id}`, data),
  delete: (id: number) => api.delete(`/sponsorships/${id}`),
}

// --- Content ---
export const contentApi = {
  list: (skip = 0, limit = 100) =>
    api.get('/api/content', { params: { skip, limit } }),
  get: (id: number) => api.get(`/api/content/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/content', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/api/content/${id}`, data),
  delete: (id: number) => api.delete(`/api/content/${id}`),
}

// --- Notifications ---
export const notificationApi = {
  list: (params?: { skip?: number; limit?: number; unread_only?: boolean }) =>
    api.get('/notifications', { params }),
  get: (id: number) => api.get(`/notifications/${id}`),
  create: (data: Record<string, unknown>) => api.post('/notifications', data),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id: number) => api.delete(`/notifications/${id}`),
  generateAlerts: () => api.post('/notifications/generate-alerts'),
  unreadCount: () => api.get('/notifications/unread-count'),
}

// --- Reports ---
export const reportApi = {
  summary: () => api.get('/reports/summary'),
  downloadPdf: () =>
    api.get('/reports/export/pdf', { responseType: 'blob' }),
  downloadExcel: () =>
    api.get('/reports/export/excel', { responseType: 'blob' }),
}

export default api
