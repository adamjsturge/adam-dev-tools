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
      // Custom worker (src/sw.ts) instead of the generated one: it
      // refuses to precache SPA-fallback HTML served under asset URLs,
      // which otherwise poisons clients that update mid-deploy
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
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
  server: {
    proxy: {
      // Cloudflare answers this path in production; proxy to the deployed
      // site so the My IP tool also works in local dev
      "/cdn-cgi/trace": {
        target: "https://tools.sturge.dev",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
  },
});
