import axios from 'axios';

// Clave única de almacenamiento del JWT.
// Supuesto documentado: se usa localStorage por simplicidad del reto.
// Tradeoff: expuesto a XSS; en producción se evaluaría cookie httpOnly.
export const TOKEN_KEY = 'gcv_token';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

// Request: adjunta el Bearer en cada llamada si hay token.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: si el backend responde 401, el token caducó o es inválido → limpiar y volver al login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
