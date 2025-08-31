import axios from "axios";

// BASE: https://test-fe.mysellerpintar.com/api
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// ROOT: https://test-fe.mysellerpintar.com
const ROOT_BASE = API_BASE.replace(/\/api\/?$/, "");

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // default JSON untuk non-upload
  if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// ------------------ ROOT API (untuk /upload) ---------------
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
