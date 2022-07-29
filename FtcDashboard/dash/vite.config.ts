import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/dash/',
  plugins: [reactRefresh(), svgr()],
  server: {
    port: 8000,
    hmr: {
      host: 'localhost',
    },
  },
});
