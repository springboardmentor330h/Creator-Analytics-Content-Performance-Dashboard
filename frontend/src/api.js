// CreatorIQ API Integration - Direct Backend Connection (No Dummy Data)

const API_BASE_URL = 'http://127.0.0.1:8000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('creatoriq_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

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
  getDashboardSummary: async () => {
    return await request('/analytics/summary');
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

  getTopContent: async () => {
    return await request('/analytics/top-content');
  },

  getPlatformPerformance: async () => {
    return await request('/analytics/platform-performance');
  },

  getEngagementChart: async () => {
    return await request('/analytics/chart/engagement');
  },

  getFollowerGrowthChart: async () => {
    return await request('/analytics/chart/followers');
  },

  getPlatformComparison: async () => {
    return await request('/analytics/platform-comparison');
  },

  // Social Media Workflow APIs
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

  // YouTube Integration (Sprint 5)
  syncYouTube: async (channelId) => {
    const query = channelId ? `?channel_id=${encodeURIComponent(channelId)}` : '';
    return await request(`/social/youtube/sync${query}`, {
      method: 'POST'
    });
  },

  syncYouTubeSocial: async (channelId) => {
    const query = channelId ? `?channel_id=${encodeURIComponent(channelId)}` : '';
    return await request(`/social/youtube/sync${query}`, {
      method: 'POST'
    });
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
  }
};

