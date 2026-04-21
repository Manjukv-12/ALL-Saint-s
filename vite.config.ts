import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    env.VITE_API_PROXY_TARGET || "https://csiallsaintstcr.com";
  // Local PHP: use 127.0.0.1 (not "localhost") so Node’s outgoing proxy connection matches
  // php -S 127.0.0.1:8080. Multipart POSTs through Vite were failing with 500 text/plain when
  // target stack did not match the PHP listen address.
  const localApiTarget =
    env.VITE_API_LOCAL_PROXY_TARGET || "http://127.0.0.1:8080";

  return {
  base: "./",
  server: {
    // IPv4 loopback (stable with local PHP on 127.0.0.1:8080).
    host: "127.0.0.1",
    strictPort: true,
    // Keep Vite off 8080 so PHP built-in server can use localhost:8080 for the API.
    port: Number(env.VITE_DEV_PORT) || 5173,
    // Dev: /api → local PHP; /backend-php → production (optional fallback).
    // Optional: VITE_API_PROXY_TARGET in .env (e.g. https://csiallsaintstcr.com).
    proxy: {
      "/api": {
        target: localApiTarget,
        changeOrigin: true,
        secure: false,
        timeout: 120_000,
        proxyTimeout: 120_000,
      },
      "/backend-php": {
        target: proxyTarget,
        changeOrigin: true,
        secure: true,
      },
    },
    // No HMR WebSocket — dev uses manual refresh; API traffic is HTTP to PHP (proxy / VITE_API_URL).
    hmr: false,
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  },
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
};
});
