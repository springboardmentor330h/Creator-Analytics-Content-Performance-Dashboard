// CreatorIQ API Integration - Vite Dev Server Proxy (Zero-CORS Preflight Delay)

const API_BASE_URL = typeof window !== 'undefined' && window.location.origin.includes(':5173')
  ? '/api-backend'
  : 'http://127.0.0.1:8000';

let autoAuthPromise = null;

// Singleton Auto-Authentication Promise to prevent concurrent request stampedes
async function ensureDemoSession() {
  const existingToken = localStorage.getItem('creatoriq_token');
  if (existingToken) return existingToken;

  if (autoAuthPromise) {
    return await autoAuthPromise;
  }

  autoAuthPromise = (async () => {
    try {
      const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@creatoriq.com', password: 'password123' })
      });

      if (loginRes.ok) {
        const data = await loginRes.json();
        localStorage.setItem('creatoriq_token', data.access_token);
        localStorage.setItem('creatoriq_user', JSON.stringify(data.user || { email: 'demo@creatoriq.com' }));
        return data.access_token;
      }

      // If demo account doesn't exist yet, register it
      const regRes = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: 'Demo Creator',
          email: 'demo@creatoriq.com',
          password: 'password123',
          role: 'creator'
        })
      });

      if (regRes.ok) {
        const regData = await regRes.json();
        localStorage.setItem('creatoriq_token', regData.access_token);
        localStorage.setItem('creatoriq_user', JSON.stringify(regData.user || { email: 'demo@creatoriq.com' }));
        return regData.access_token;
      }
    } catch (e) {
      console.warn('Auto-auth notice:', e.message);
    } finally {
      autoAuthPromise = null;
    }
    return null;
  })();

  return await autoAuthPromise;
}

async function request(endpoint, options = {}, isRetry = false) {
  let token = localStorage.getItem('creatoriq_token');
  
  if (!token && !isRetry) {
    token = await ensureDemoSession();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Handle 401 Unauthorized cleanly with max 1 retry
  if (response.status === 401 && !isRetry) {
    localStorage.removeItem('creatoriq_token');
    const newToken = await ensureDemoSession();
    if (newToken) {
      return await request(endpoint, options, true);
    }
  }

  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch (e) {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}

async function requestBlob(endpoint, filename, options = {}, isRetry = false) {
  let token = localStorage.getItem('creatoriq_token');
  if (!token && !isRetry) {
    token = await ensureDemoSession();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401 && !isRetry) {
    localStorage.removeItem('creatoriq_token');
    const newToken = await ensureDemoSession();
    if (newToken) {
      return await requestBlob(endpoint, filename, options, true);
    }
  }

  if (!response.ok) {
    let errorDetail = 'File Export Failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch (e) {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  return true;
}

export const api = {
  // Auth APIs
  login: async (email, password) => {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (fullName, email, password, role = 'creator') => {
    return await request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password, role })
    });
  },

  // Dashboard & Analytics APIs
  getDashboardSummary: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/summary${query}`);
  },

  getReachBreakdown: async () => {
    return await request('/analytics/reach-breakdown');
  },

  getAudienceReport: async () => {
    return await request('/analytics/audience');
  },

  getGrowthReport: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/growth${query}`);
  },

  getAudienceTrends: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/audience-trends${query}`);
  },

  getTopContent: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/top-content${query}`);
  },

  getPlatformPerformance: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/analytics/platform-performance${query}`);
  },

  getEngagementChart: async () => {
    return await request('/analytics/chart/engagement');
  },

  getFollowerGrowthChart: async () => {
    return await request('/analytics/chart/followers');
  },

  getPlatformComparison: async () => {
    return await request('/social/platforms/comparison');
  },

  // Social Media Workflow APIs
  getSavedAccounts: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/social/platforms/saved-accounts${query}`);
  },

  saveSocialAccount: async (platform, handle, accountName) => {
    const pQuery = `platform=${encodeURIComponent(platform)}&handle=${encodeURIComponent(handle)}`;
    const nQuery = accountName ? `&account_name=${encodeURIComponent(accountName)}` : '';
    return await request(`/social/platforms/saved-accounts?${pQuery}${nQuery}`, {
      method: 'POST'
    });
  },

  deleteSavedAccount: async (accountId) => {
    return await request(`/social/platforms/saved-accounts/${accountId}`, {
      method: 'DELETE'
    });
  },

  autoSyncAccounts: async () => {
    return await request('/social/platforms/auto-sync', {
      method: 'POST'
    });
  },

  connectSocialPlatform: async (platform, accountName) => {
    return await request('/social/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, account_name: accountName })
    });
  },

  getConnectedSocialPlatforms: async () => {
    return await request('/social/platforms');
  },

  syncSocialPlatform: async (platform) => {
    return await request('/social/sync', {
      method: 'POST',
      body: JSON.stringify({ platform })
    });
  },

  // YouTube & Instagram Multi-Platform Integration
  syncYouTube: async (channelId) => {
    const query = channelId ? `?channel_id=${encodeURIComponent(channelId)}` : '';
    return await request(`/social/youtube/sync${query}`, {
      method: 'POST'
    });
  },

  syncInstagram: async (handle) => {
    const query = handle ? `?account_id=${encodeURIComponent(handle)}` : '';
    return await request(`/social/platforms/Instagram/sync${query}`, {
      method: 'POST'
    });
  },

  syncPlatform: async (platform, accountId) => {
    const query = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    return await request(`/social/platforms/${encodeURIComponent(platform)}/sync${query}`, {
      method: 'POST'
    });
  },

  getPlatformComparison: async () => {
    return await request('/social/platforms/comparison');
  },

  // Audience CRUD
  getAudience: async () => {
    return await request('/audience');
  },

  createAudience: async (payload) => {
    return await request('/audience', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateAudience: async (id, payload) => {
    return await request(`/audience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteAudience: async (id) => {
    return await request(`/audience/${id}`, {
      method: 'DELETE'
    });
  },

  // Content CRUD
  getContent: async (platform) => {
    const query = platform && platform !== 'All' ? `?platform=${encodeURIComponent(platform)}` : '';
    return await request(`/content${query}`);
  },

  createContent: async (payload) => {
    return await request('/content', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateContent: async (id, payload) => {
    return await request(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteContent: async (id) => {
    return await request(`/content/${id}`, {
      method: 'DELETE'
    });
  },

  // Sprint 6: Revenue Management & Analytics APIs
  getRevenue: async (source) => {
    const query = source && source !== 'All' ? `?source=${encodeURIComponent(source)}` : '';
    return await request(`/revenue${query}`);
  },

  createRevenue: async (payload) => {
    return await request('/revenue', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateRevenue: async (id, payload) => {
    return await request(`/revenue/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteRevenue: async (id) => {
    return await request(`/revenue/${id}`, {
      method: 'DELETE'
    });
  },

  getRevenueSummary: async () => {
    return await request('/revenue/analytics/summary');
  },

  getRevenueBySource: async () => {
    return await request('/revenue/analytics/by-source');
  },

  getMonthlyRevenue: async () => {
    return await request('/revenue/analytics/monthly');
  },

  getRevenueTrends: async (days = 30) => {
    return await request(`/revenue/analytics/trends?days=${days}`);
  },

  // Sprint 6: Sponsorship Management APIs
  getSponsorships: async (status, paymentStatus) => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (paymentStatus && paymentStatus !== 'All') params.append('payment_status', paymentStatus);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/sponsorships${queryString}`);
  },

  createSponsorship: async (payload) => {
    return await request('/sponsorships', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateSponsorship: async (id, payload) => {
    return await request(`/sponsorships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteSponsorship: async (id) => {
    return await request(`/sponsorships/${id}`, {
      method: 'DELETE'
    });
  },

  // Sprint 7: Notification & Alert APIs
  getNotifications: async (unreadOnly = false, type = null) => {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unread_only', 'true');
    if (type && type !== 'All') params.append('type', type.toLowerCase());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/notifications${queryString}`);
  },

  getUnreadNotificationCount: async () => {
    return await request('/notifications/unread-count');
  },

  markNotificationAsRead: async (id) => {
    return await request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  markAllNotificationsAsRead: async () => {
    return await request('/notifications/read-all', {
      method: 'PUT'
    });
  },

  triggerAlertCheck: async () => {
    return await request('/notifications/check-alerts', {
      method: 'POST'
    });
  },

  deleteNotification: async (id) => {
    return await request(`/notifications/${id}`, {
      method: 'DELETE'
    });
  },

  // Sprint 7: Reporting Service & Export APIs
  getReportTypes: async () => {
    return await request('/reports/types');
  },

  generateReport: async (reportType = 'executive_summary', dateRange = '30_days', save = true) => {
    return await request(`/reports/generate?save=${save}`, {
      method: 'POST',
      body: JSON.stringify({ report_type: reportType, date_range: dateRange })
    });
  },

  getSavedReports: async () => {
    return await request('/reports');
  },

  getReportById: async (id) => {
    return await request(`/reports/${id}`);
  },

  downloadReportPdf: async (reportType = 'executive_summary', dateRange = '30_days') => {
    const filename = `CreatorIQ_${reportType}_${Date.now()}.pdf`;
    return await requestBlob('/reports/export/pdf', filename, {
      method: 'POST',
      body: JSON.stringify({ report_type: reportType, date_range: dateRange })
    });
  },

  downloadReportExcel: async (reportType = 'executive_summary', dateRange = '30_days') => {
    const filename = `CreatorIQ_${reportType}_${Date.now()}.xlsx`;
    return await requestBlob('/reports/export/excel', filename, {
      method: 'POST',
      body: JSON.stringify({ report_type: reportType, date_range: dateRange })
    });
  },

  downloadSavedReportPdf: async (id) => {
    const filename = `CreatorIQ_Report_${id}.pdf`;
    return await requestBlob(`/reports/${id}/pdf`, filename, { method: 'GET' });
  },

  downloadSavedReportExcel: async (id) => {
    const filename = `CreatorIQ_Report_${id}.xlsx`;
    return await requestBlob(`/reports/${id}/excel`, filename, { method: 'GET' });
  },

  deleteReport: async (id) => {
    return await request(`/reports/${id}`, {
      method: 'DELETE'
    });
  }
};
