// lib/auth.js
import api from "./axios";

export async function register({ username, password, role }) {
  const { data } = await api.post("auth/register", {
    username,
    password,
    role,
  });
  localStorage.setItem("password", password); // (catatan: hanya untuk tes)
  return data;
}

export async function login({ username, password }) {
  const { data } = await api.post("auth/login", { username, password });
  const token = data?.token;
  if (!token) throw new Error("Token not found");
  localStorage.setItem("token", token);
  localStorage.setItem("password", password);
  return token;
}

export async function me() {
  const { data } = await api.get("auth/profile");
  const saved = localStorage.getItem("password");
  if (saved) data.password = saved;
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("password");
}
