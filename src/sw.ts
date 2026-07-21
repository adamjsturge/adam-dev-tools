/// <reference lib="webworker" />
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { clientsClaim, setCacheNameDetails } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import {
  addPlugins,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
  type PrecacheEntry,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

// Must stay `self`, not globalThis: workbox locates its manifest
// injection point by searching the bundle for "self.__WB_MANIFEST"
declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: (PrecacheEntry | string)[];
};

void self.skipWaiting();
clientsClaim();

// New cache namespace: installs never reuse entries from the old
// generateSW-era precache, which may hold poisoned HTML under chunk URLs
setCacheNameDetails({ prefix: "adam-dev-tools" });

self.addEventListener("activate", (event) => {
  // Drop the old workbox-era precache outright — one clean refetch
  // heals every client that cached fallback HTML mid-deploy
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("workbox-precache"))
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});

// Mid-deploy, a chunk missing from the new build comes back as the SPA
// fallback: index.html with status 200. Workbox only validates the
// status, so that HTML would be precached under the .js URL and served
// on every visit until the next deploy. Rejecting it fails this install
// instead — the current service worker stays active and the browser
// retries the update after the deploy has settled.
addPlugins([
  {
    cacheWillUpdate: ({ request, response }) => {
      const isHtml = response.headers
        .get("content-type")
        ?.includes("text/html");
      // Pathname, not href: workbox appends a __WB_REVISION__ query param
      const { pathname } = new URL(request.url);
      const expectsHtml = pathname.endsWith(".html") || pathname === "/";
      return Promise.resolve(isHtml && !expectsHtml ? null : response);
    },
  },
]);

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

// Background-removal ONNX models (~40MB) fetched on first use; cache
// them so the tool keeps working offline
registerRoute(
  ({ url }) => url.origin === "https://staticimgly.com",
  new CacheFirst({
    cacheName: "imgly-models",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 40,
        maxAgeSeconds: 60 * 60 * 24 * 90,
      }),
    ],
  }),
);
