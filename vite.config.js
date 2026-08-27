import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const apiTarget = env.VITE_API_TARGET;
  const mediaTarget = env.VITE_MEDIA_TARGET;

  if (!apiTarget) {
    console.warn(
      '[vite] VITE_API_TARGET is missing. API calls to /api (including image upload) will fail. Add it to your .env file.',
    );
  }
  if (!mediaTarget) {
    console.warn(
      '[vite] VITE_MEDIA_TARGET is missing. Image previews via /media will not load. Add it to your .env file.',
    );
  }

  return {
    plugins: [
      react({ jsxImportSource: '@emotion/react' }),
      jsconfigPaths()
    ],
    server: {
      open: true,
      port: 3000,
      proxy: {
        ...(apiTarget
          ? {
              '/api': {
                target: apiTarget,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
              },
            }
          : {}),
        // Uploaded media (images) is served by a separate object-storage host
        // (different port than the API), so it needs its own proxy entry —
        // see mediaRefUtils.js `toDisplayImageUrl`.
        ...(mediaTarget
          ? {
              '/media': {
                target: mediaTarget,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/media/, ''),
              },
            }
          : {}),
      },
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
