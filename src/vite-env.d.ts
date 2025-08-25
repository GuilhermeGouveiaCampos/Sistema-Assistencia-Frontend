/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string; // sem /api
  readonly VITE_API_URL?: string;  // opcional (com ou sem /api)
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
