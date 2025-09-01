import axios from "axios";

export const api = axios.create({ baseURL: "/_api" });
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  // DEBUG: lihat URL & method final
  console.log(
    "[API]",
    config.method?.toUpperCase(),
    config.baseURL + config.url
  );
  return config;
});

// jika butuh akses ke /upload di root
export const rootApi = axios.create({ baseURL: "/_upload" });
rootApi.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
