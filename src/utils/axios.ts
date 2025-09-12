// src/services/api.ts (ou src/utils/axios.ts)
import axios from "axios";

// Preferência: VITE_API_BASE_URL  → fallback: VITE_API_BASE → VITE_API_URL
const {
  VITE_API_BASE_URL,
  VITE_API_BASE,
  VITE_API_URL,
  DEV,
} = (import.meta as any).env;

const normalize = (s?: string) =>
  (s ?? "").toString().replace(/\/+$/, ""); // remove barras finais

const baseFromEnv =
  normalize(VITE_API_BASE_URL) ||
  normalize(VITE_API_BASE) ||
  normalize(VITE_API_URL) ||
  "";

const baseURL = baseFromEnv || (DEV ? "http://localhost:3001" : "");

// Falha explícita em produção se faltar baseURL
if (!baseURL) {
  throw new Error("VITE_API_BASE_URL não definida em produção");
}

const api = axios.create({
  // Ex.: https://sistema-assistencia-backend-production.up.railway.app  (sem /api)
  baseURL,
  timeout: 20000,
  withCredentials: false,
});

// Anexa x-user-id se existir no localStorage
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
