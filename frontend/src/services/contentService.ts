import api from './api'

export interface ContentItem {
  id: number
  creator_id: number
  content_id: string
  title: string
  platform: string
  content_type: string
  published_at: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  watch_time: number
  reach: number
  engagement_rate: number
  created_at?: string | null
  updated_at?: string | null
}

export interface ContentListResponse {
  items: ContentItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface ContentAnalyticsSummary {
  content_count: number
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_saves: number
  total_reach: number
  total_watch_time: number
  average_engagement_rate: number
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  watch_time: number
  engagement: number
}

export interface ContentTrendPoint {
  date: string
  views: number
  likes: number
  comments: number
  shares: number
  reach: number
  engagement_rate: number
}

export type ContentPayload = {
  title: string
  platform: string
  content_type: string
  published_at: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  watch_time: number
  reach: number
}

export async function getContent(params: Record<string, unknown> = {}): Promise<ContentListResponse> {
  const response = await api.get('/api/content', { params })
  return response.data
}

export async function getContentById(id: number): Promise<ContentItem> {
  const response = await api.get(`/api/content/${id}`)
  return response.data
}

export async function createContent(payload: ContentPayload): Promise<ContentItem> {
  const response = await api.post('/api/content', payload)
  return response.data
}

export async function updateContent(id: number, payload: Partial<ContentPayload>): Promise<ContentItem> {
  const response = await api.put(`/api/content/${id}`, payload)
  return response.data
}

export async function deleteContent(id: number): Promise<{ success: boolean; message: string }> {
  const response = await api.delete(`/api/content/${id}`)
  return response.data
}

export async function getContentAnalyticsSummary(): Promise<ContentAnalyticsSummary> {
  const response = await api.get('/api/content/analytics/summary')
  return response.data
}

export async function getTopPerformingContent(limit = 5): Promise<ContentItem[]> {
  const response = await api.get('/api/content/analytics/top-performing', { params: { limit } })
  return response.data
}

export async function getContentTrends(): Promise<ContentTrendPoint[]> {
  const response = await api.get('/api/content/analytics/trends')
  return response.data
}

export async function compareContent(ids: number[]): Promise<ContentItem[]> {
  const response = await api.get('/api/content/compare', {
    params: { ids },
    paramsSerializer: {
      serialize: (params) => {
        const search = new URLSearchParams()
        const values = (params.ids as number[]) || []
        values.forEach((id) => search.append('ids', String(id)))
        return search.toString()
      },
    },
  })
  return response.data
}

const contentService = {
  list: getContent,
  get: getContentById,
  create: createContent,
  update: updateContent,
  delete: deleteContent,
  summary: getContentAnalyticsSummary,
  topPerforming: getTopPerformingContent,
  trends: getContentTrends,
  compare: compareContent,
}

export default contentService
