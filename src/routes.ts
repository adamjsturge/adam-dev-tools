import { ComponentType, lazy } from "react";

type RouteLoader = () => Promise<{ default: ComponentType }>;

const RELOAD_FLAG = "chunk_reload";

// Recovers from a deploy replacing hashed chunks under an open tab: the
// stale import 404s, so reload once to pick up the new build.
export const lazyRoute = (path: keyof typeof routeLoaders) =>
  lazy(() =>
    routeLoaders[path]().then(
      (module) => {
        sessionStorage.removeItem(RELOAD_FLAG);
        return module;
      },
      (error) => {
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          globalThis.location.reload();
        }
        throw error;
      },
    ),
  );

export const routeLoaders = {
  "/background-removal": () => import("./pages/BackgroundRemoval"),
  "/base64/decode": () => import("./pages/Base64/Decode"),
  "/base64/encode": () => import("./pages/Base64/Encode"),
  "/bracket-maker": () => import("./pages/BracketMaker"),
  "/card-assumption": () => import("./pages/CardAssumption"),
  "/case-converter": () => import("./pages/CaseConverter"),
  "/color-background-removal": () => import("./pages/ColorBackgroundRemoval"),
  "/compare": () => import("./pages/Compare"),
  "/deck-draw-odds": () => import("./pages/DeckDrawOdds"),
  "/deck-price": () => import("./pages/DeckPrice"),
  "/deckbuilder-links": () => import("./pages/DeckbuilderLinks"),
  "/ev-charging": () => import("./pages/EVCharging"),
  "/extra-line-removal": () => import("./pages/ExtraLineRemoval"),
  "/hash": () => import("./pages/HashGenerator"),
  "/html-entities/decode": () => import("./pages/HTMLEntities/Decode"),
  "/html-entities/encode": () => import("./pages/HTMLEntities/Encode"),
  "/json": () => import("./pages/JSONFormatter"),
  "/jwt": () => import("./pages/JWT"),
  "/multi-deck-converter": () => import("./pages/MultiDeckConverter"),
  "/opacifier": () => import("./pages/ColorOpacity"),
  "/qr-code": () => import("./pages/QRCode/Generator"),
  "/qr-code/scan": () => import("./pages/QRCode/Scanner"),
  "/sim-code-converter": () => import("./pages/SimCodeConverter"),
  "/textbin": () => import("./pages/TextBin"),
  "/timestamp": () => import("./pages/Timestamp"),
  "/unzip": () => import("./pages/Unzip"),
  "/url/decode": () => import("./pages/URL/Decode"),
  "/url/encode": () => import("./pages/URL/Encode"),
  "/uuid": () => import("./pages/UUIDGenerator"),
  "/webp": () => import("./pages/WebP"),
  "/word-counter": () => import("./pages/WordCounter"),
} satisfies Record<string, RouteLoader>;

export const preloadRoute = (href: string) => {
  const path = href.split(/[?#]/)[0];
  const loader = (routeLoaders as Record<string, RouteLoader | undefined>)[
    path
  ];
  // Swallow failures — navigation retries the same import anyway
  loader?.().catch(() => {});
};

const whenIdle = (callback: () => void) => {
  if ("requestIdleCallback" in globalThis) {
    globalThis.requestIdleCallback(callback, { timeout: 3000 });
  } else {
    setTimeout(callback, 300);
  }
};

let hasStartedPrefetch = false;

// Routable but delisted tools whose chunks are too heavy to speculatively
// download for every visitor; they load on actual navigation instead.
const PREFETCH_SKIP = new Set<string>(["/background-removal"]);

export const prefetchAllRoutes = () => {
  if (hasStartedPrefetch) return;
  hasStartedPrefetch = true;

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (connection?.saveData || connection?.effectiveType?.includes("2g")) {
    return;
  }

  const loaders: RouteLoader[] = [];
  for (const [path, loader] of Object.entries<RouteLoader>(routeLoaders)) {
    if (!PREFETCH_SKIP.has(path)) {
      loaders.push(loader);
    }
  }
  let index = 0;
  const loadNext = () => {
    if (index >= loaders.length) return;
    loaders[index++]()
      .finally(() => whenIdle(loadNext))
      .catch(() => {});
  };

  if (document.readyState === "complete") {
    whenIdle(loadNext);
  } else {
    window.addEventListener("load", () => whenIdle(loadNext), { once: true });
  }
};
