// src/services/api.ts
import axios from "axios";

// Use a API do Vite direto (sem cast maluco)
const { VITE_API_BASE, VITE_API_URL, DEV } = import.meta.env;

// 1) Preferimos VITE_API_BASE (sem /api). 2) Caímos para VITE_API_URL (caso exista).
// 3) Em dev, padrão localhost. Em prod, se nada vier, disparamos erro explícito.
const pick = (v?: string) => (v ? v.replace(/\/+$/, "") : ""); // tira barra no fim
const envBase = pick(VITE_API_BASE) || pick(VITE_API_URL);

const baseURL =
  envBase ||
  (DEV ? "http://localhost:3001" : ""); // em produção, vazio => erro mais abaixo

if (!baseURL) {
  // Em produção isso força você a configurar a variável corretamente
  throw new Error(
    "API base URL não configurada. Defina VITE_API_BASE em produção."
  );
}

const api = axios.create({
  baseURL,            // ex.: https://...railway.app  (SEM /api)
  timeout: 20000,
  withCredentials: false,
});

// header opcional
api.interceptors.request.use((config) => {
  const uid = localStorage.getItem("id");
  if (uid) {
    config.headers = config.headers || {};
    (config.headers as any)["x-user-id"] = uid;
  }
  return config;
});

// logs úteis em runtime
console.log("[Axios] baseURL =", api.defaults.baseURL);
console.log("[ENV] VITE_API_BASE =", VITE_API_BASE, "DEV =", DEV);

export default api;
