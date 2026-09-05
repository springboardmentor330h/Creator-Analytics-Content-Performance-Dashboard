import api from "./axios";

export const getContent = () => api.get("/content").then((r) => r.data);
export const getContentById = (id) => api.get(`/content/${id}`).then((r) => r.data);
export const createContent = (payload) => api.post("/content", payload).then((r) => r.data);
export const updateContent = (id, payload) => api.put(`/content/${id}`, payload).then((r) => r.data);
export const deleteContent = (id) => api.delete(`/content/${id}`).then((r) => r.data);

export const getSummary = () => api.get("/analytics/summary").then((r) => r.data);
export const getTopContent = () => api.get("/analytics/top-content").then((r) => r.data);
export const getPlatformComparison = () => api.get("/analytics/platform-comparison").then((r) => r.data);
export const getEngagementChart = () => api.get("/analytics/chart/engagement").then((r) => r.data);
export const getFollowersChart = (creatorId) =>
  api.get("/analytics/chart/followers", { params: { creator_id: creatorId } }).then((r) => r.data);