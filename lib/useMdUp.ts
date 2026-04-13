"use client";

import { useSyncExternalStore } from "react";

const MD_QUERY = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MD_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(MD_QUERY).matches;
}

/** `true` when viewport is `md` (768px) or wider. SSR snapshot is `false`. */
export function useMdUp(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
