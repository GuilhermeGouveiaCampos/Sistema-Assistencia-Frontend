import axios from "axios";

// Força tipagem de import.meta.env aqui mesmo
const { VITE_API_BASE, DEV } = (import.meta as unknown as {
  env: { VITE_API_BASE?: string; DEV: boolean };
}).env;

const envBase = VITE_API_BASE?.replace(/\/$/, "");
const baseURL = envBase || (DEV ? "http://localhost:3001" : "");

if (!baseURL) {
  throw new Error("VITE_API_BASE não definida em produção");
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const uid = localStorage.getItem("id");
  if (uid) {
    config.headers = config.headers || {};
    (config.headers as any)["x-user-id"] = uid;
  }
  return config;
});

export default api;
