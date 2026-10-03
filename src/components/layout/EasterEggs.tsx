"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { toast, unlock } from "@/lib/achievements";
import { areas, person } from "@/content/profile";

const COLORS = areas.map((l) => l.accent);

/** A burst of spectrum confetti from a point (defaults to the top centre). */
export function confetti(x = window.innerWidth / 2, y = window.innerHeight * 0.25, count = 110) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:120;overflow:hidden";
  document.body.appendChild(host);
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const w = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w * 0.45}px;border-radius:2px;background:${COLORS[i % COLORS.length]}`;
    host.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const v = 180 + Math.random() * 420;
    gsap.to(p, {
      x: Math.cos(angle) * v,
      y: Math.sin(angle) * v * 0.6 + window.innerHeight * (0.55 + Math.random() * 0.4),
      rotation: Math.random() * 900 - 450,
      opacity: 0,
      duration: 1.6 + Math.random() * 1.2,
      ease: "power2.out",
    });
  }
  setTimeout(() => host.remove(), 3200);
}

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/**
 * Site-wide secrets:
 *  - the Konami code toggles spectrum mode
 *  - typing "hire" anywhere copies my email
 *  - a note for whoever opens the console
 */
export function EasterEggs() {
  useEffect(() => {
    let k = 0;
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0;
      if (k === KONAMI.length) {
        k = 0;
        const on = document.documentElement.classList.toggle("spectrum");
        confetti();
        unlock("konami");
        toast(on ? "Spectrum mode on" : "Spectrum mode off", on ? "White light, split five ways. Enter the code again to undo." : "Back to white light.");
      }

      if (key.length === 1) {
        typed = (typed + key).slice(-4);
        if (typed === "hire") {
          typed = "";
          navigator.clipboard?.writeText(person.email).catch(() => {});
          confetti(window.innerWidth / 2, window.innerHeight / 2, 70);
          unlock("headhunter");
          toast("Great idea.", `${person.email} copied to your clipboard`);
        }
      }
    };
    window.addEventListener("keydown", onKey);

    const css = "font: 600 13px/1.5 ui-sans-serif, system-ui; color: #111";
    console.log(
      "%c  △  Saharsh Wadekar  \n%cHello, fellow developer. This site is Next.js + GSAP, hand-built.\nSecrets: an old console code, a terminal that listens, and a card with a back side.\nOr skip ahead: " +
        person.email,
      "font: 700 18px/2 ui-sans-serif, system-ui; color: #fff; background: linear-gradient(90deg,#4db2ff,#b6f24a,#ff6b82,#ffb547,#a68bff); padding: 4px 10px; border-radius: 6px",
      css,
    );

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
