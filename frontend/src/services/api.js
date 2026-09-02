/**
 * Central axios instance.
 *
 * WHY one shared instance instead of calling axios directly everywhere?
 * - We attach the JWT automatically to every request here, once.
 * - If the token is invalid/expired, every request gets the same
 *   "log the user out" handling, instead of repeating that logic
 *   in every component that makes an API call.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// Runs before every request: attach the JWT if we have one.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('creatoriq_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Runs after every response: if the token is rejected, force logout.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('creatoriq_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
