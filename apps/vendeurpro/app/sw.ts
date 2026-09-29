/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/** Les CGU Google Maps interdisent de mettre les tuiles en cache. */
const googleMapsNetworkOnly: RuntimeCaching = {
  matcher: ({ url }) =>
    url.hostname === "maps.googleapis.com" ||
    url.hostname.endsWith(".googleapis.com") ||
    url.hostname.endsWith(".gstatic.com") ||
    url.hostname.endsWith(".google.com") ||
    url.hostname === "google.com",
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [googleMapsNetworkOnly, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/hors-ligne",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
