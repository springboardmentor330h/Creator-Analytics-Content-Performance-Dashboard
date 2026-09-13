import axios from "axios";
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||"http://127.0.0.1:8000"});
export const getSummary=(platform)=>api.get("/analytics/summary",{params:platform?{platform}:undefined}).then(r=>r.data);
export const getPlatformComparison=()=>api.get("/analytics/platform-comparison").then(r=>r.data);
export const getTopContent=(platform)=>api.get("/analytics/top-content",{params:platform?{platform}:undefined}).then(r=>r.data);
export const getEngagementChart=(platform)=>api.get("/analytics/chart/engagement",{params:platform?{platform}:undefined}).then(r=>r.data);
export const getFollowerChart=()=>api.get("/analytics/chart/followers").then(r=>r.data);
export const getAudience=()=>api.get("/analytics/audience").then(r=>r.data);
export const getRevenue=()=>api.get("/revenue/analytics/summary").then(r=>r.data);
