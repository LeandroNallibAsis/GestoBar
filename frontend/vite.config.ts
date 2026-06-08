import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the frontend application.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
