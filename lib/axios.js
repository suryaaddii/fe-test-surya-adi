import axios from "axios";

const API_BASE = "/api"; // proxied ke https://test-fe.mysellerpintar.com/api
const ROOT_BASE = "/"; //

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// ---- ROOT API (mis. /upload) ----
export const rootApi = axios.create({
  baseURL: ROOT_BASE,
});

rootApi.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
