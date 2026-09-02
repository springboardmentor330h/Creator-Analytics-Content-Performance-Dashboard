import api from './api'

export async function getAudienceKpiSummary() {
  const res = await api.get('/audience/analytics/summary')
  return res.data
}

export async function getAgeBreakdown() {
  const res = await api.get('/audience/demographics/age-breakdown')
  return res.data
}

export async function getGenderBreakdown() {
  const res = await api.get('/audience/demographics/gender-breakdown')
  return res.data
}

export async function getGeographicBreakdown() {
  const res = await api.get('/audience/demographics/geographic-breakdown')
  return res.data
}

export async function getGrowthTrend(platform, days) {
  const params = new URLSearchParams()
  if (platform) params.set('platform', platform)
  if (days) params.set('days', days)
  const res = await api.get(`/audience/growth/trend?${params.toString()}`)
  return res.data
}
