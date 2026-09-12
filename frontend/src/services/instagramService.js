import api from './api'

export async function seedInstagramSampleData(numPosts = 40) {
  const res = await api.post('/instagram/seed', { num_posts: numPosts })
  return res.data
}
