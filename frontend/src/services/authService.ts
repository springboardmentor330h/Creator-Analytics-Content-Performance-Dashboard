import api, { setToken } from './api'

export interface ProfileResponse {
  id: number
  full_name: string
  email: string
  role: string
  status?: string
  agency_id?: number | null
  bio?: string | null
  avatar_url?: string | null
  youtube_url?: string | null
  instagram_url?: string | null
  tiktok_url?: string | null
  facebook_url?: string | null
  twitter_url?: string | null
  linkedin_url?: string | null
  website_url?: string | null
}

interface LoginResponse {
  access_token: string
}

const authService = {
  setToken,
  clearToken: () => setToken(null),
  login: async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password })
    return response.data
  },
  register: async (
    full_name: string,
    email: string,
    password: string,
    role: string,
    accept_terms: boolean
  ) => {
    await api.post('/auth/register', { full_name, email, password, role, accept_terms })
  },
  profile: async () => {
    const response = await api.get<ProfileResponse>('/auth/profile')
    return response.data
  },
  updateProfile: async (payload: Partial<ProfileResponse>) => {
    const response = await api.put<ProfileResponse>('/auth/profile', payload)
    return response.data
  },
  updateAccountSettings: async (payload: {
    email?: string
    current_password?: string
    new_password?: string
  }) => {
    const response = await api.put<ProfileResponse>('/auth/account-settings', payload)
    return response.data
  },
}

export default authService
