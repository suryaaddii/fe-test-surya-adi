// src/lib/axios.js
import axios from "axios";

// Semua request lewat proxy Next: /api/proxy/*
export const api = axios.create({ baseURL: "/api/proxy" });

api.interceptors.request.use((config) => {
  // PENTING: kalau url diawali '/', axios akan abaikan baseURL → buang leading slash
  if (typeof config.url === "string" && config.url.startsWith("/")) {
    config.url = config.url.replace(/^\/+/, "");
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // default Content-Type untuk non-FormData
  if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  // Debug: lihat URL final
  console.log(
    "[API] ",
    (config.method || "GET").toUpperCase(),
    (config.baseURL || "") + (config.url || "")
  );
  return config;
});

export default api;
