import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./app.css";

// When an updated service worker takes control mid-session, the old
// build's lazy chunks are gone from its cache; reload once so the tab
// swaps to the new build instead of failing chunk loads. Guarded so the
// very first install (no previous controller) doesn't trigger it.
if ("serviceWorker" in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController) globalThis.location.reload();
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
