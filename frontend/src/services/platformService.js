import api from './api'

export async function getCrossPlatformSummary() {
  const res = await api.get('/platforms/summary')
  return res.data
}

export async function getPlatformComparison() {
  const res = await api.get('/platforms/comparison')
  return res.data
}

export async function getGrowthComparison() {
  const res = await api.get('/platforms/growth-comparison')
  return res.data
}

export async function getEngagementComparisonAcrossPlatforms() {
  const res = await api.get('/platforms/engagement-comparison')
  return res.data
}
