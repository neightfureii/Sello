import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const env = loadEnv(mode, envDir);
  const backendTarget =
    env.VITE_API_URL?.trim().replace(/\/api\/?$/, "") || "http://localhost:4000";

  return {
    envDir,
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: { "/api": { target: backendTarget, changeOrigin: true } },
    },
  };
});
