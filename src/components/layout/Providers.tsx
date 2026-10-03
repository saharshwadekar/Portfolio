"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getState, setState, useStore, type Theme } from "@/lib/store";
import { unlock } from "@/lib/achievements";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export function Providers({ children }: { children: React.ReactNode }) {
  const area = useStore((s) => s.area);

  // Gentle smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      syncTouch: false,
      anchors: { offset: -56, duration: 1.2 },
      prevent: (node) => !!node.closest?.("[data-lenis-prevent], input, textarea"),
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // The inline head script already applied the theme; mirror it into the store.
  useEffect(() => {
    setState({ theme: (document.documentElement.dataset.theme as Theme) || "light" });
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    if (area) el.dataset.area = area;
    else delete el.dataset.area;
  }, [area]);

  return <>{children}</>;
}

export function toggleTheme() {
  const next: Theme = getState().theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("sw:theme", next);
  } catch {}
  setState({ theme: next });
  unlock("theme");
}
