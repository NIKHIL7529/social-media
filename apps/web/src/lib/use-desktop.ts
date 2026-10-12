"use client";

import { useSyncExternalStore } from "react";

const query = "(min-width: 1024px)";
function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function useDesktop() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
