import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const apiTarget = env.VITE_API_TARGET;

  return {
    plugins: [
      react({ jsxImportSource: '@emotion/react' }),
      jsconfigPaths()
    ],
    server: {
      open: true,
      port: 3000,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'build'
    },
    resolve: {
      alias: {
        '@': '/src',
        'app/store': '/src/app/store',
        'app/shared-components': '/src/app/shared-components',
        'app/configs': '/src/app/configs',
        '@mock-api': '/src/@mock-api'
      }
    }
  };
});
