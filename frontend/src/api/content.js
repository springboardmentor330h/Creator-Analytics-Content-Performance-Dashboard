import api from "./axios";

export const getContent = () => api.get("/content").then((r) => r.data);
export const getContentById = (id) => api.get(`/content/${id}`).then((r) => r.data);
export const createContent = (payload) => api.post("/content", payload).then((r) => r.data);
export const updateContent = (id, payload) => api.put(`/content/${id}`, payload).then((r) => r.data);
export const deleteContent = (id) => api.delete(`/content/${id}`).then((r) => r.data);

export const getSummary = (platform) =>
  api.get("/analytics/summary", { params: platform ? { platform } : {} }).then((r) => r.data);
export const getTopContent = (platform) =>
  api.get("/analytics/top-content", { params: platform ? { platform } : {} }).then((r) => r.data);
export const getPlatformComparison = () => api.get("/analytics/platform-comparison").then((r) => r.data);
export const getEngagementChart = (platform) =>
  api.get("/analytics/chart/engagement", { params: platform ? { platform } : {} }).then((r) => r.data);
export const getFollowersChart = (creatorId) =>
  api.get("/analytics/chart/followers", { params: { creator_id: creatorId } }).then((r) => r.data);
export const getAvailablePlatforms = () => api.get("/analytics/platforms").then((r) => r.data);