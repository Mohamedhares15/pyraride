import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      "next/navigation": path.resolve(import.meta.dirname, "src/shims/next-navigation.ts"),
      "next/link": path.resolve(import.meta.dirname, "src/shims/next-link.tsx"),
      "next/image": path.resolve(import.meta.dirname, "src/shims/next-image.tsx"),
      "next/dynamic": path.resolve(import.meta.dirname, "src/shims/next-dynamic.ts"),
      "next/script": path.resolve(import.meta.dirname, "src/shims/next-script.tsx"),
      "next/web-vitals": path.resolve(import.meta.dirname, "src/shims/next-web-vitals.ts"),
      "next-auth/react": path.resolve(import.meta.dirname, "src/shims/next-auth-react.ts"),
      "//__next_nav_stub__": path.resolve(import.meta.dirname, "src/shims/next-navigation.ts"),
      "//__next_dynamic_stub__": path.resolve(import.meta.dirname, "src/shims/next-dynamic.ts"),
      "//__next_script_stub__": path.resolve(import.meta.dirname, "src/shims/next-script.tsx"),
      "//__next_vitals_stub__": path.resolve(import.meta.dirname, "src/shims/next-web-vitals.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
