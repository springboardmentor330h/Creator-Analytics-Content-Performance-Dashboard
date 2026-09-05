import api from "./axios";

export const getRevenue = (creatorId) => api.get("/revenue", { params: { creator_id: creatorId } }).then((r) => r.data);
export const createRevenue = (payload) => api.post("/revenue", payload).then((r) => r.data);
export const updateRevenue = (id, creatorId, payload) =>
  api.put(`/revenue/${id}`, payload, { params: { creator_id: creatorId } }).then((r) => r.data);
export const deleteRevenue = (id, creatorId) =>
  api.delete(`/revenue/${id}`, { params: { creator_id: creatorId } }).then((r) => r.data);

export const getRevenueSummary = (creatorId) =>
  api.get("/analytics/revenue", { params: { creator_id: creatorId } }).then((r) => r.data);
export const getRevenueTrend = (creatorId) =>
  api.get("/analytics/revenue-trend", { params: { creator_id: creatorId } }).then((r) => r.data);