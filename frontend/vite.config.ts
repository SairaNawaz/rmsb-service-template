import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// TODO: update base to match your service's path_prefix (e.g. '/s2', '/hr')
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_SERVICE_BASE || '/svc',
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
});
