import api from './api'

export interface SocialConnectionStatus {
  id?: number
  user_id?: number
  platform: string
  status: string
  platform_user_id?: string | null
  platform_username?: string | null
  display_name?: string | null
  account_name?: string | null
  connection_mode?: 'live' | 'manual' | string | null
  profile_url?: string | null
  scopes?: string | null
  last_synced_at: string | null
  updated_at: string | null
}

export interface CreatorConnectionSummary {
  platform: string
  status: string
  account_name?: string | null
  last_synced_at?: string | null
  connection_mode?: 'live' | 'manual' | string | null
}

export interface PlatformSyncResult {
  platform: string
  status: string
  account?: string | null
  records_synced: number
  last_synced_at?: string | null
  message?: string | null
}

export const socialService = {
  getStatus: async (): Promise<SocialConnectionStatus[]> => {
    const { data } = await api.get('/api/social/connections')
    return data
  },

  getConnectionsSummary: async (): Promise<CreatorConnectionSummary[]> => {
    const { data } = await api.get('/social/connections')
    return data
  },
  
  getConnectUrl: async (platform: string): Promise<string> => {
    const { data } = await api.get(`/api/social/${platform}/connect`)
    return data.authorization_url
  },

  updateAccount: async (
    platform: string,
    payload: { display_name?: string; platform_username?: string; profile_url?: string }
  ): Promise<SocialConnectionStatus> => {
    const { data } = await api.put(`/api/social/${platform}`, payload)
    return data
  },
  
  disconnect: async (platform: string): Promise<void> => {
    await api.delete(`/api/social/${platform}`)
  },
  
  sync: async (platform: string): Promise<PlatformSyncResult> => {
    const p = platform.toLowerCase().trim()
    if (p === 'youtube') {
      return socialService.syncYoutube({ max_results: 10 })
    }
    if (p === 'instagram') {
      return socialService.syncInstagram()
    }
    if (p === 'tiktok') {
      return socialService.syncTiktok()
    }
    if (p === 'facebook') {
      return socialService.syncFacebook()
    }
    if (p === 'linkedin') {
      return socialService.syncLinkedin()
    }
    if (p === 'x' || p === 'twitter') {
      return socialService.syncX()
    }

    const { data } = await api.post(`/social/${platform}/sync`)
    return data
  },

  syncYoutube: async (payload?: { 
    channel_id?: string; 
    query?: string; 
    max_results?: number;
    api_key?: string;
    account_name?: string;
  }): Promise<PlatformSyncResult> => {
    const { data } = await api.post('/social/youtube/sync', payload || {})
    return data
  },

  connectPlatformAccount: async (platform: string, account_name: string): Promise<{ message: string }> => {
    const { data } = await api.post('/social/connect', { platform, account_name })
    return data
  },

  syncInstagram: async (payload?: { account_id?: string; max_results?: number }): Promise<PlatformSyncResult> => {
    const { data } = await api.post('/social/instagram/sync', payload || {})
    return data
  },

  syncTiktok: async (): Promise<PlatformSyncResult> => {
    const { data } = await api.post('/social/tiktok/sync')
    return data
  },

  syncFacebook: async (): Promise<PlatformSyncResult> => {
    const { data } = await api.post('/social/facebook/sync')
    return data
  },

  syncLinkedin: async (): Promise<PlatformSyncResult> => {
    const { data } = await api.post('/social/linkedin/sync')
    return data
  },

  syncX: async (): Promise<PlatformSyncResult> => {
    const { data } = await api.post('/social/x/sync')
    return data
  },

  getYoutubeLiveAnalytics: async (): Promise<YouTubeLiveAnalyticsData> => {
    const { data } = await api.get('/api/social/youtube/live-analytics')
    return data
  },
}

export interface YouTubeLiveAnalyticsData {
  status: string
  platform: string
  connection_mode?: string
  channel: {
    channel_id: string
    title: string
    custom_url: string
    thumbnail_url?: string | null
    subscribers: number
    total_views: number
    video_count: number
    profile_url?: string
  }
  metrics: {
    total_views: number
    subscribers: number
    video_count: number
    recent_views: number
    recent_likes: number
    recent_comments: number
    average_engagement_rate: number
  }
  recent_videos: Array<{
    video_id: string
    title: string
    thumbnail_url?: string | null
    published_at: string
    views: number
    likes: number
    comments: number
    engagement_rate: number
    video_url?: string
  }>
  fetched_at: string
  is_live: boolean
}

