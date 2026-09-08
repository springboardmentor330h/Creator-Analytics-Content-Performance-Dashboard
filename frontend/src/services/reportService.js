import api from './api'

export async function listNotifications(unreadOnly = false) {
  const res = await api.get(`/notifications/?unread_only=${unreadOnly}`)
  return res.data
}

export async function generateAlerts() {
  const res = await api.post('/notifications/generate')
  return res.data
}

export async function markNotificationRead(id, isRead = true) {
  const res = await api.patch(`/notifications/${id}/read`, { is_read: isRead })
  return res.data
}

export async function deleteNotification(id) {
  await api.delete(`/notifications/${id}`)
}

export async function getCreatorReport() {
  const res = await api.get('/reports/creator')
  return res.data
}

export async function downloadReportPdf() {
  const res = await api.get('/reports/creator/pdf', { responseType: 'blob' })
  return res.data
}

export async function downloadReportExcel() {
  const res = await api.get('/reports/creator/excel', { responseType: 'blob' })
  return res.data
}

export function triggerBrowserDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
