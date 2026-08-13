import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

const BACKEND_PORT = process.env.PORT || 5005;

let expressBackendProcess: any = null;

function expressBackendPlugin() {
  return {
    name: 'express-backend-plugin',
    configureServer() {
      if (!expressBackendProcess) {
        console.log(`[Vite Plugin] Spawning backend Express server on port ${BACKEND_PORT}...`);
        expressBackendProcess = spawn('npx', ['tsx', 'server/server.ts'], {
          stdio: 'inherit',
          shell: true,
          env: { ...process.env, PORT: String(BACKEND_PORT) }
        });
      }
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 8100,
      allowedHosts: true as any,
      proxy: {
        '/api': {
          target: `http://localhost:${BACKEND_PORT}`,
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
