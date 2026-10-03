"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useStore } from "@/lib/store";
import { navigate } from "@/lib/transition";
import { unlock } from "@/lib/achievements";
import { person } from "@/content/profile";
import { Clock } from "@/components/ui/Clock";
import { toggleTheme, getLenis } from "./Providers";

const links = [
  { id: "work", label: "Case studies" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
];

export function Monogram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 28" className={className} aria-hidden>
      <path d="M16 2 L30 26 H2 Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 2 L30 26" stroke="var(--accent)" strokeWidth="1.8" />
    </svg>
  );
}

/** Scroll to a lander section, or go to the lander first. */
export function goSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { duration: 1.3, offset: -56, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: "smooth" });
    return;
  }
  navigate(`/#${id}`);
}

function Popover({ open, children, className = "" }: { open: boolean; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      gsap.set(el, { display: "block" });
      gsap.fromTo(el, { opacity: 0, y: -6, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power3.out" });
    } else gsap.to(el, { opacity: 0, duration: 0.15, onComplete: () => void gsap.set(el, { display: "none" }) });
  }, [open]);
  return (
    <div ref={ref} className={`absolute top-10 hidden rounded-[14px] border border-line bg-surface p-1.5 shadow-lift ${className}`} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

const itemCls = "flex w-full items-center justify-between gap-6 rounded-[9px] px-3 py-2 text-left text-sm transition-colors hover:bg-fg/5";

export function Nav() {
  const theme = useStore((s) => s.theme);
  const [menu, setMenu] = useState<null | "logo" | "mobile">(null);
  const [about, setAbout] = useState(false);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setAbout(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (id: string) => {
    setMenu(null);
    goSection(id);
  };

  return (
    <>
      <header ref={bar} className="fixed inset-x-0 top-0 z-[70] border-b border-line bg-surface/75 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1920px] items-center justify-between gap-4 px-[var(--gutter)]">
          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setMenu((m) => (m === "logo" ? null : "logo"))}
              aria-expanded={menu === "logo"}
              aria-label="Site menu"
              className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-fg/5"
            >
              <Monogram className="h-5 w-6" />
            </button>
            <button onClick={() => navigate("/")} className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold">{person.name}</span>
              <span className="block text-xs text-muted">{person.role}</span>
            </button>
            <Popover open={menu === "logo"} className="left-0 w-60">
              <button
                className={itemCls}
                onClick={() => {
                  setMenu(null);
                  setAbout(true);
                  unlock("about");
                }}
              >
                About this portfolio
              </button>
              <div className="my-1 h-px bg-line" />
              <button
                className={itemCls}
                onClick={() => {
                  setMenu(null);
                  navigate("/");
                }}
              >
                Home
              </button>
              <button
                className={itemCls}
                onClick={() => {
                  setMenu(null);
                  toggleTheme();
                }}
              >
                {theme === "dark" ? "Light" : "Dark"} appearance
              </button>
              <a className={itemCls} href={person.resume} target="_blank" rel="noreferrer">
                Résumé (PDF)
              </a>
              <a className={itemCls} href={`mailto:${person.email}`}>
                Email Saharsh…
              </a>
            </Popover>
          </div>

          <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <button key={l.id} onClick={() => go(l.id)} className="rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-fg/5 hover:text-fg">
                {l.label}
              </button>
            ))}
          </nav>

          <div className="relative flex items-center gap-1">
            <Clock className="hidden px-2 text-sm text-muted lg:block" />
            <button
              onClick={toggleTheme}
              className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-fg/5"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-700" style={{ transform: `rotate(${theme === "dark" ? 0 : 180}deg)` }} aria-hidden>
                <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10 2.5 A7.5 7.5 0 0 1 10 17.5 Z" fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={() => setMenu((m) => (m === "mobile" ? null : "mobile"))}
              aria-expanded={menu === "mobile"}
              aria-label="Sections"
              className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-fg/5 md:hidden"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <Popover open={menu === "mobile"} className="right-0 w-52 md:hidden">
              {links.map((l) => (
                <button key={l.id} className={itemCls} onClick={() => go(l.id)}>
                  {l.label}
                </button>
              ))}
            </Popover>
          </div>
        </div>
      </header>

      {about && <AboutWindow onClose={() => setAbout(false)} />}
    </>
  );
}

/** Easter egg: an "About This Mac"-style spec sheet. */
function AboutWindow({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, scale: 0.94, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.6)" });
  }, []);
  const specs: [string, string][] = [
    ["Chip", "Coffee-powered, Pune-based"],
    ["Memory", "9.35 CGPA, highest in department"],
    ["Storage", "250+ Apex classes at 90%+ coverage"],
    ["Display", "React Native · Next.js · .NET · Apex"],
    ["Uptime", "3,000+ users a day since 2025"],
    ["Serial", "IEEE InGARSS 2025"],
  ];
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/25 p-4 backdrop-blur-[2px]" onClick={onClose} role="presentation">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="About this portfolio"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] overflow-hidden rounded-[18px] border border-line bg-surface shadow-lift"
      >
        <div className="flex items-center gap-1.5 px-4 pt-3">
          <button onClick={onClose} aria-label="Close" className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex flex-col items-center px-7 pb-7 pt-4 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-[22px] bg-bg">
            <Monogram className="h-11 w-12" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">SaharshOS</h2>
          <p className="text-xs text-muted">Version 2026 · Portfolio edition</p>
          <dl className="mt-5 w-full space-y-1.5 text-left text-sm">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[72px_1fr] gap-3">
                <dt className="text-right font-medium">{k}</dt>
                <dd className="text-muted">{v}</dd>
              </div>
            ))}
          </dl>
          <a href={`mailto:${person.email}`} className="mt-6 rounded-full border border-line px-4 py-1.5 text-xs transition-colors hover:border-fg">
            More info…
          </a>
        </div>
      </div>
    </div>
  );
}
