import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Servidor de desarrollo en :5173; la API se configura por VITE_API_URL (ver .env.example).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
