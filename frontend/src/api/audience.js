import api from "./axios";

export const getAudience = () => api.get("/audience").then((r) => r.data);
export const getAudienceReport = () => api.get("/analytics/audience").then((r) => r.data);
export const getGrowthReport = () => api.get("/analytics/growth").then((r) => r.data);
export const getAudienceTrends = () => api.get("/analytics/audience-trends").then((r) => r.data);