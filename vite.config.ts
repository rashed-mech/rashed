import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Public site address used in the downloadable CV. Netlify sets URL and Vercel sets
// VERCEL_PROJECT_PRODUCTION_URL during a build; VITE_SITE_URL overrides both.
const siteUrl = process.env.VITE_SITE_URL
  || process.env.URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      __SITE_URL__: JSON.stringify(siteUrl),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
