"use client";

import { useSyncExternalStore } from "react";
import type { AreaId } from "@/content/profile";

export type Theme = "dark" | "light";

interface State {
  /** The accent tint for the current page; null is the neutral default. */
  area: AreaId | null;
  theme: Theme;
}

let state: State = { area: null, theme: "light" };
const listeners = new Set<() => void>();

export function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}
