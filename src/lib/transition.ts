"use client";

type Navigator = (href: string) => void;
let navigator: Navigator | null = null;

/** Registered by <RouterBridge/>, which owns the Next router. */
export function registerNavigator(fn: Navigator | null) {
  navigator = fn;
}

export function navigate(href: string) {
  if (navigator) navigator(href);
  else window.location.href = href;
}
