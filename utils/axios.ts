import axios from "axios";

// Lê VITE_API_BASE (sem /api) e, se não tiver, tenta VITE_API_URL (comentei a seguir)
const { VITE_API_BASE, VITE_API_URL, DEV } = (import.meta as any).env;

// Se vier VITE_API_URL com /api, removo barras finais para evitar duplicação depois
const baseFromEnv =
  (VITE_API_BASE && String(VITE_API_BASE).replace(/\/+$/, "")) ||
  (VITE_API_URL && String(VITE_API_URL).replace(/\/+$/, "")) ||
  "";

const baseURL = baseFromEnv || (DEV ? "http://localhost:3001" : "");

// Falha explícita em prod se faltar baseURL
if (!baseURL) {
  throw new Error("VITE_API_BASE não definida em produção");
}

const api = axios.create({
  baseURL,                 // ex.: https://...railway.app   (sem /api)
  timeout: 20000,
  withCredentials: false,  // você usa Authorization header; não precisa cookies
});

// Header opcional
api.interceptors.request.use((config) => {
  const uid = localStorage.getItem("id");
  if (uid) {
    config.headers = config.headers || {};
    (config.headers as any)["x-user-id"] = uid;
  }
  return config;
});

console.log("[Axios] baseURL =", api.defaults.baseURL);
export default api;
