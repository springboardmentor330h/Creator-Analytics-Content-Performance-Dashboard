import api from "./axios";

export const getSponsorships = (creatorId) =>
  api.get("/sponsorship", { params: { creator_id: creatorId } }).then((r) => r.data);
export const createSponsorship = (payload) => api.post("/sponsorship", payload).then((r) => r.data);
export const updateSponsorship = (id, creatorId, payload) =>
  api.put(`/sponsorship/${id}`, payload, { params: { creator_id: creatorId } }).then((r) => r.data);
export const deleteSponsorship = (id, creatorId) =>
  api.delete(`/sponsorship/${id}`, { params: { creator_id: creatorId } }).then((r) => r.data);