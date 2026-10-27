import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Site is served from its own domain (https://shalom.bookingrobot.eu), so base is '/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
});
