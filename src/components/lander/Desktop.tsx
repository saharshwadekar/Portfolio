"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { intro, person } from "@/content/profile";
import { getLenis } from "@/components/layout/Providers";
import { ClockWidget, CalendarWidget, IdWidget, TerminalWidget } from "./widgets";

/** A desktop folder icon, tinted with any colour. */
export function FolderIcon({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 50" className={className} aria-hidden>
      <path d="M4 8a4 4 0 0 1 4-4h14.5a4 4 0 0 1 3.1 1.5L29 10h27a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" fill={color} opacity=".55" />
      <path d="M4 16a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" fill={color} />
      <path d="M4 16a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v2H4Z" fill="#fff" opacity=".25" />
    </svg>
  );
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { duration: 1.3, offset: -56, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: "smooth" });
}

/** Desktop shortcuts: each folder jumps to a section or opens a file. */
const ICONS: { label: string; color: string; action: () => void }[] = [
  { label: "Case studies", color: "#4DB2FF", action: () => scrollToId("work") },
  { label: "Experience", color: "#FFB547", action: () => scrollToId("experience") },
  { label: "Stack", color: "#A68BFF", action: () => scrollToId("stack") },
  { label: "Résumé.pdf", color: "#34C759", action: () => window.open(person.resume, "_blank") },
  { label: "GitHub", color: "#FF6B82", action: () => window.open(person.links.github, "_blank", "noopener") },
];

export function Desktop() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline();
      tl.from("[data-widget], [data-icon]", { opacity: 0, y: 18, scale: 0.96, stagger: 0.05, duration: 0.9, ease: "expo.out" }, 0.1).from(
        "[data-headline] > *",
        { opacity: 0, y: 24, stagger: 0.08, duration: 1.1, ease: "expo.out" },
        0.2,
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Introduction" className="relative min-h-[100svh] px-[var(--gutter)] pb-28 pt-16 lg:pt-20">
      <div className="grid gap-8 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[316px_1fr_104px] lg:gap-6">
        {/* Widgets */}
        <div className="order-2 flex flex-wrap content-start justify-center gap-4 lg:order-1 lg:justify-start">
          <ClockWidget />
          <CalendarWidget />
          <IdWidget />
          <TerminalWidget />
        </div>

        {/* Headline */}
        <div data-headline className="order-1 flex flex-col items-center justify-center pt-10 text-center lg:order-2 lg:pt-0">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs text-muted shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />
            {person.role} · {person.location} · Open to roles
          </p>
          <h1 className="max-w-[16ch] type-hero">
            I&apos;m Saharsh.
            <br />I build software for <span className="underline decoration-line decoration-[3px] underline-offset-[0.14em]">3,000+ people</span> a day.
          </h1>
          <p className="mt-6 max-w-[52ch] type-subhead text-muted">{intro.summary}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => scrollToId("work")} className="rounded-full bg-fg px-5 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-85">
              Read the case studies
            </button>
            <a href={person.resume} target="_blank" rel="noreferrer" className="rounded-full bg-surface px-5 py-3 text-sm font-medium shadow-soft transition-shadow hover:shadow-lift">
              Résumé (PDF) ↗
            </a>
          </div>
          <ul aria-label="Highlights" className="mt-10 grid w-full max-w-[640px] gap-px overflow-hidden rounded-[18px] border border-line bg-line text-left sm:grid-cols-3">
            {intro.proof.map((p) => (
              <li key={p.value} className="bg-surface px-4 py-3.5">
                <p className="text-lg font-semibold leading-tight">{p.value}</p>
                <p className="mt-1 text-xs leading-snug text-muted">{p.label}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop shortcuts */}
        <nav aria-label="Shortcuts" className="order-3 flex flex-wrap justify-center gap-2 lg:flex-col lg:items-center lg:justify-start lg:gap-3">
          {ICONS.map((it) => (
            <button
              key={it.label}
              data-icon
              onClick={it.action}
              className="group flex w-[92px] flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-fg/5"
            >
              <FolderIcon color={it.color} className="h-12 w-14 transition-transform duration-500 group-hover:-translate-y-0.5" />
              <span className="text-center text-xs leading-tight">{it.label}</span>
            </button>
          ))}
        </nav>
      </div>

    </section>
  );
}
