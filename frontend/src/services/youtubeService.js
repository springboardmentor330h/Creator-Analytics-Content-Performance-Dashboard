import api from './api'

export async function syncYouTubeChannel(channelId) {
  const res = await api.post('/youtube/sync', { channel_id: channelId })
  return res.data
}
