// eslint-disable-next-line import/no-unresolved
import tailwindcss from "@tailwindcss/vite";
// eslint-disable-next-line import/no-unresolved
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        // The background-removal runtime (~880 KB of ONNX/imgly JS) is
        // pay-per-use: excluded from the precache manifest and fetched
        // over the network only when /background-removal is visited.
        globIgnores: ["**/ort*.js", "**/imgly-*.js"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            // Background-removal ONNX models (~40MB) fetched on first
            // use; cache them so the tool keeps working offline
            urlPattern: /^https:\/\/staticimgly\.com\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "imgly-models",
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: "Dev Tools",
        short_name: "Dev Tools",
        description:
          "Free browser-based developer tools: Base64, URL encoding, QR codes, JWT debugging, WebP conversion, text utilities, and more. Everything runs locally — no servers, no tracking.",
        theme_color: "#1e1e2e",
        background_color: "#1e1e2e",
        display: "standalone",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Give the background-removal runtime a stable chunk name so
          // globIgnores above can target it — without this the @imgly
          // library builds as a generic index-<hash>.js chunk.
          if (id.includes("@imgly") || id.includes("onnxruntime")) {
            return "imgly";
          }
        },
      },
    },
  },
});
