import api from './api'

export async function getKpiSummary() {
  const res = await api.get('/content/analytics/summary')
  return res.data
}

export async function getTopPerforming(limit = 5) {
  const res = await api.get(`/content/analytics/top-performing?limit=${limit}`)
  return res.data
}

export async function getPlatformComparison() {
  const res = await api.get('/content/analytics/platform-comparison')
  return res.data
}

export async function listContent({ platform, startDate, endDate, skip = 0, limit = 20 } = {}) {
  const params = new URLSearchParams()
  if (platform) params.set('platform', platform)
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)
  params.set('skip', skip)
  params.set('limit', limit)
  const res = await api.get(`/content/?${params.toString()}`)
  return res.data
}

export async function createContent(payload) {
  const res = await api.post('/content/', payload)
  return res.data
}
