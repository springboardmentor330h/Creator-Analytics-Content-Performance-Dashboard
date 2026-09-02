import api from './api'

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password })
  return res.data // { access_token, token_type }
}

export async function register(name, email, password) {
  const res = await api.post('/auth/register', { name, email, password })
  return res.data
}

export async function getMyProfile() {
  const res = await api.get('/users/me')
  return res.data
}
