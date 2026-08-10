import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

const storedToken = localStorage.getItem('creatoriq_token')
if (storedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${storedToken}`
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('creatoriq_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
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

export default api
