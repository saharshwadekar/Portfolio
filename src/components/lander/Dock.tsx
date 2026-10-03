"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { person } from "@/content/profile";
import { navigate } from "@/lib/transition";
import { getLenis } from "@/components/layout/Providers";
import { goSection } from "@/components/layout/Nav";

interface Item {
  id: string;
  label: string;
  /** Squircle gradient, macOS app-icon style. */
  bg: string;
  icon: ReactNode;
  action: () => void;
}

const BASE = 50; // px, resting icon size
const MAX = 78; // px, fully magnified
const RANGE = 150; // px, magnification falloff radius

const G = {
  home: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" fill="currentColor" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" fill="currentColor" />,
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" fill="currentColor" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3 12.5h18" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 12.5h18" stroke="#b45309" strokeWidth="1.4" />
    </>
  ),
  layers: <path d="m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />,
  doc: (
    <path
      d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v5h5M9 13h6M9 17h6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
  ),
  mail: <path d="M4 6h16v12H4Zm0 0 8 7 8-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />,
};

/** A macOS-style dock: magnifying icons, tooltips, running-app dots and launch bounces. */
export function Dock() {
  const pathname = usePathname();
  const resume = person.resume;
  const bar = useRef<HTMLDivElement>(null);
  const pointerX = useRef<number | null>(null);
  const raf = useRef(0);
  const [hover, setHover] = useState<string | null>(null);
  const [active, setActive] = useState<string>("home");
  const [fine, setFine] = useState(false);

  const items: Item[] = [
    {
      id: "home",
      label: "Home",
      bg: "linear-gradient(180deg,#ffffff,#e9e9ee)",
      icon: G.home,
      action: () => {
        if (pathname !== "/") return navigate("/");
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      },
    },
    { id: "work", label: "Case studies", bg: "linear-gradient(180deg,#5fb2ff,#1f6fe5)", icon: G.folder, action: () => goSection("work") },
    { id: "experience", label: "Experience", bg: "linear-gradient(180deg,#ffd166,#f59e0b)", icon: G.briefcase, action: () => goSection("experience") },
    { id: "stack", label: "Stack", bg: "linear-gradient(180deg,#b79cff,#7c3aed)", icon: G.layers, action: () => goSection("stack") },
    { id: "resume", label: "Résumé", bg: "linear-gradient(180deg,#4ade80,#059669)", icon: G.doc, action: () => window.open(resume, "_blank") },
    { id: "mail", label: "Mail", bg: "linear-gradient(180deg,#67d4ff,#0284c7)", icon: G.mail, action: () => (window.location.href = `mailto:${person.email}`) },
  ];

  useEffect(() => {
    setFine(window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // "Running app" dots: which section is on screen, or which page we're on.
  useEffect(() => {
    if (pathname.startsWith("/arcade")) return setActive("home");
    if (pathname.startsWith("/work")) return setActive("work");
    const ids = ["work", "experience", "stack", "contact"];
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.intersectionRatio));
        const best = [...seen.entries()].sort((a, b) => b[1] - a[1])[0];
        setActive(best && best[1] > 0.15 ? (best[0] === "contact" ? "mail" : best[0]) : "home");
      },
      { threshold: [0, 0.15, 0.3, 0.6] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  // Magnification: size each icon by its distance to the pointer, so neighbours make room.
  const frame = useCallback(() => {
    const els = bar.current?.querySelectorAll<HTMLElement>("[data-dock-item]");
    if (!els) return;
    const x = pointerX.current;
    let settling = false;
    els.forEach((el) => {
      const b = el.getBoundingClientRect();
      const target =
        x === null ? BASE : BASE + (MAX - BASE) * Math.max(0, Math.cos(Math.min(Math.abs(x - (b.left + b.width / 2)) / RANGE, 1) * (Math.PI / 2)));
      const cur = parseFloat(el.style.width) || BASE;
      const next = cur + (target - cur) * 0.28;
      if (Math.abs(next - target) > 0.3) settling = true;
      el.style.width = el.style.height = `${Math.abs(next - target) > 0.3 ? next : target}px`;
    });
    if (settling || x !== null) raf.current = requestAnimationFrame(frame);
  }, []);

  const onMove = (e: React.PointerEvent) => {
    if (!fine || e.pointerType !== "mouse") return;
    const start = pointerX.current === null;
    pointerX.current = e.clientX;
    if (start) {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(frame);
    }
  };
  const onLeave = () => {
    pointerX.current = null;
    setHover(null);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(frame);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Launch bounce, like opening an app.
  const launch = (el: HTMLElement, it: Item) => {
    const icon = el.querySelector("[data-icon]");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      gsap
        .timeline()
        .to(icon, { y: -18, duration: 0.22, ease: "power2.out" })
        .to(icon, { y: 0, duration: 0.32, ease: "bounce.out" });
    it.action();
  };

  return (
    <nav aria-label="Dock" className="pointer-events-none fixed inset-x-0 bottom-2 z-[60] flex justify-center px-2 sm:bottom-3">
      <div
        ref={bar}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="dock-glass pointer-events-auto flex items-end gap-1.5 rounded-[22px] px-2 pb-2 pt-2 sm:gap-2 sm:px-2.5"
      >
        {items.map((it, i) => (
          <div key={it.id} className="flex items-end">
            {i === 4 && <span className="mx-1 mb-1 h-10 w-px self-end bg-fg/15 sm:mx-1.5" aria-hidden />}
            <div className="relative flex flex-col items-center">
              <button
                data-dock-item
                onClick={(e) => launch(e.currentTarget, it)}
                onPointerEnter={() => setHover(it.id)}
                onPointerLeave={() => setHover((h) => (h === it.id ? null : h))}
                onFocus={() => setHover(it.id)}
                onBlur={() => setHover(null)}
                aria-label={it.label}
                className="relative block h-11 w-11 outline-none sm:h-[50px] sm:w-[50px]"
                style={fine ? { width: BASE, height: BASE } : undefined}
              >
                <span
                  data-icon
                  className="dock-icon absolute inset-0 grid place-items-center rounded-[23%]"
                  style={{ background: it.bg, color: it.id === "home" ? "#1c1c1e" : "#fff" }}
                >
                  <svg viewBox="0 0 24 24" className="h-[52%] w-[52%] drop-shadow-sm" aria-hidden>
                    {it.icon}
                  </svg>
                </span>
              </button>

              {/* Tooltip */}
              <span
                role="tooltip"
                className={`dock-tip pointer-events-none absolute bottom-full mb-3 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 ${
                  hover === it.id ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                }`}
              >
                {it.label}
              </span>

              {/* Running indicator */}
              <span
                className={`absolute -bottom-1.5 h-1 w-1 rounded-full bg-fg/70 transition-opacity duration-300 ${active === it.id ? "opacity-100" : "opacity-0"}`}
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
