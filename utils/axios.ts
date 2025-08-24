// src/axios.ts
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3001';

axios.interceptors.request.use((config) => {
  const uid = localStorage.getItem('id'); // seu id do usuário logado
  if (uid) {
    config.headers = config.headers || {};
    (config.headers as any)['x-user-id'] = uid;
  }
  return config;
});

export default axios;
