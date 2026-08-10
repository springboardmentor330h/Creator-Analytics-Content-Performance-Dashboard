import api from './api'

export interface SocialConnectionStatus {
  platform: string
  status: string
  last_synced_at: string | null
  updated_at: string | null
}

export const socialService = {
  getStatus: async (): Promise<SocialConnectionStatus[]> => {
    const { data } = await api.get('/api/social/connections')
    return data
  },
  
  getConnectUrl: async (platform: string): Promise<string> => {
    const { data } = await api.get(`/api/social/${platform}/connect`)
    return data.authorization_url
  },
  
  disconnect: async (platform: string): Promise<void> => {
    await api.delete(`/api/social/${platform}`)
  },
  
  sync: async (platform: string): Promise<any> => {
    const { data } = await api.post(`/api/social/${platform}/sync`)
    return data
  }
}
