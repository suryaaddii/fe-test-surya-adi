import api from "./axios";

export async function register({ username, password, role }) {
  const { data } = await api.post("/auth/register", {
    username,
    password,
    role,
  });

  // simpan password ke localStorage supaya bisa ditampilkan di profile
  localStorage.setItem("password", password);

  return data; // 201 created (tanpa token)
}

export async function login({ username, password }) {
  const { data } = await api.post("/auth/login", { username, password });
  const token = data?.token;
  if (!token) throw new Error("Token not found");
  localStorage.setItem("token", token);

  // simpan password juga saat login, agar tetap bisa ditampilkan
  localStorage.setItem("password", password);

  return token;
}

export async function me() {
  const { data } = await api.get("/auth/profile");

  // inject password dari localStorage jika API tidak kirim password
  const savedPassword = localStorage.getItem("password");
  if (savedPassword) {
    data.password = savedPassword;
  }

  return data; // { id, username, role, password }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("password");
}
