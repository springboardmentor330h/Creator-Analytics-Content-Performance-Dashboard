import api from './api'

export async function getRevenueKpiSummary() {
  const res = await api.get('/revenue/analytics/summary')
  return res.data
}

export async function getMonthlyRevenueTrend() {
  const res = await api.get('/revenue/analytics/monthly-trend')
  return res.data
}

export async function getRevenueByPlatform() {
  const res = await api.get('/revenue/analytics/by-platform')
  return res.data
}

export async function listRevenue(skip = 0, limit = 50) {
  const res = await api.get(`/revenue/?skip=${skip}&limit=${limit}`)
  return res.data
}

export async function createRevenue(payload) {
  const res = await api.post('/revenue/', payload)
  return res.data
}

export async function deleteRevenue(id) {
  await api.delete(`/revenue/${id}`)
}

export async function listSponsorships() {
  const res = await api.get('/sponsorships/')
  return res.data
}

export async function createSponsorship(payload) {
  const res = await api.post('/sponsorships/', payload)
  return res.data
}

export async function updateSponsorshipStatus(id, status) {
  const res = await api.put(`/sponsorships/${id}`, { status })
  return res.data
}

export async function deleteSponsorship(id) {
  await api.delete(`/sponsorships/${id}`)
}
