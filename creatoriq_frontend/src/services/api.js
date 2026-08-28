import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

/** OAuth2 password form login used by your FastAPI /auth/login */
export async function loginRequest(email, password) {
  const body = new URLSearchParams()
  body.append('username', email)
  body.append('password', password)
  const res = await axios.post(`${API_URL}/auth/login`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res.data
}

export async function registerRequest(payload) {
  const res = await api.post('/auth/register', payload)
  return res.data
}

export const analyticsAPI = {
  summary: () => api.get('/analytics/summary'),
  topContent: () => api.get('/analytics/top-content'),
  platformPerformance: () => api.get('/analytics/platform-performance'),
  platformComparison: () => api.get('/analytics/platform-comparison'),
  engagementChart: () => api.get('/analytics/chart/engagement'),
  followersChart: () => api.get('/analytics/chart/followers'),
  contentEngagement: (id) => api.get(`/analytics/content/${id}/engagement`),
}

export const contentAPI = {
  list: () => api.get('/content'),
  get: (id) => api.get(`/content/${id}`),
}

export const audienceAPI = {
  list: () => api.get('/audience'),
  report: () => api.get('/analytics/audience'),
  growth: () => api.get('/analytics/growth'),
  trends: () => api.get('/analytics/audience-trends'),
}

export const revenueAPI = {
  list: () => api.get('/revenue'),
  summary: () => api.get('/revenue/analytics/summary'),
  monthly: () => api.get('/revenue/analytics/monthly'),
  trend: () => api.get('/revenue/analytics/trend'),
}

export const sponsorshipAPI = {
  list: () => api.get('/sponsorships'),
  create: (payload) => api.post('/sponsorships', payload),
}

export const notificationAPI = {
  list: (unreadOnly = false) =>
    api.get('/notifications', { params: { unread_only: unreadOnly } }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
  runAlerts: () => api.post('/notifications/alerts/run'),
}

export const reportsAPI = {
  generate: (reportType = 'full') =>
    api.get('/reports/generate', { params: { report_type: reportType, format: 'json' } }),
  downloadExcel: async (reportType = 'full') => {
    const res = await api.get('/reports/export/excel', {
      params: { report_type: reportType },
      responseType: 'blob',
    })
    return res.data
  },
  downloadPdf: async (reportType = 'full') => {
    const res = await api.get('/reports/export/pdf', {
      params: { report_type: reportType },
      responseType: 'blob',
    })
    return res.data
  },
}

export const socialAPI = {
  platforms: () => api.get('/social/platforms'),
  connect: (platform, account_name) =>
    api.post('/social/connect', { platform, account_name }),
  sync: (platform) => api.post('/social/sync', null, { params: { platform } }),
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export default api
