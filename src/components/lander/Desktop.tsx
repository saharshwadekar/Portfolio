"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { intro, person } from "@/content/profile";
import { getLenis } from "@/components/layout/Providers";


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

export function Desktop() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-intro]", {
      opacity: 0, y: 16, stagger: 0.08, duration: 0.7, ease: "power2.out",
    });
  }, { scope: root });

  return (
    <section ref={root} aria-label="Introduction" className="portfolio-intro">
      <div className="intro-topline" data-intro>
        <span>{person.role} · {person.location}</span>
        <span className="availability"><span />Open to opportunities</span>
      </div>
      <p className="intro-name" data-intro>Hi, I’m Saharsh.</p>
      <h1 data-intro>I build software for<br /><span>3,000+ people</span> a day.</h1>
      <div className="intro-bottom" data-intro>
        <p>{intro.summary}</p>
        <div className="intro-actions">
          <a href="#work" className="portfolio-button primary">View selected work</a>
          <a href={person.resume} target="_blank" rel="noreferrer" className="portfolio-button">Résumé PDF</a>
        </div>
      </div>
      <div className="intro-footnote" data-intro>
        <span>Web, mobile & everything behind them.</span>
        <span>React Native / Next.js / .NET / Salesforce</span>
      </div>
    </section>
  );
}
