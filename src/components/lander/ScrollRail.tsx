"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";

export interface RailSection {
  id: string;
  label: string;
  color: string;
  icon: ReactNode;
}

const ic = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
);

export const RAIL: RailSection[] = [
  { id: "work", label: "Case studies", color: "#3b82f6", icon: ic(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />) },
  {
    id: "experience",
    label: "Experience",
    color: "#f59e0b",
    icon: ic(
      <>
        <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
        <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3 12.5h18" />
      </>,
    ),
  },
  { id: "stack", label: "Stack", color: "#8b5cf6", icon: ic(<path d="m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />) },
  { id: "more", label: "More on GitHub", color: "#64748b", icon: ic(<path d="m8 8-4 4 4 4m8-8 4 4-4 4M14 5l-4 14" />) },
  { id: "recognition", label: "Recognition", color: "#10b981", icon: ic(<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19l1-5.8L3.5 9.2l5.9-.9Z" />) },
  {
    id: "arcade",
    label: "Side quests",
    color: "#f59e0b",
    icon: ic(
      <>
        <rect x="3" y="7" width="18" height="11" rx="5.5" />
        <path d="M8 10.5v4M6 12.5h4" />
        <circle cx="16" cy="12.5" r=".6" fill="currentColor" />
      </>,
    ),
  },
  { id: "contact", label: "Contact", color: "#0ea5e9", icon: ic(<path d="M4 6h16v12H4Zm0 0 8 7 8-7" />) },
];

/** Layout offset of el inside root, ignoring transforms (so reveal animations don't skew it). */
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

interface Node extends RailSection {
  y: number;
}

/**
 * A scroll timeline in the spirit of the classic GitHub homepage: a thin rail
 * that draws itself as you read, with a glowing tip and an icon node per
 * section that lights up (in that section's colour) as you reach it.
 * On narrower screens it collapses to a slim reading-progress bar.
 */
export function ScrollRail({ container }: { container: RefObject<HTMLDivElement | null> }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [active, setActive] = useState(-1);
  const fill = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const activeRef = useRef(-1);

  // Measure where each section's heading sits inside the container.
  const measure = useCallback(() => {
    const root = container.current;
    if (!root) return;
    const next: Node[] = [];
    for (const s of RAIL) {
      const sec = document.getElementById(s.id);
      const anchor = sec?.querySelector<HTMLElement>("[data-rail-anchor]") ?? sec;
      if (!anchor) continue;
      next.push({ ...s, y: Math.round(offsetWithin(anchor, root) + 22) });
    }
    setNodes(next);
  }, [container]);

  useLayoutEffect(() => {
    measure();
    const root = container.current;
    const ro = new ResizeObserver(() => measure());
    if (root) ro.observe(root);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    const late = window.setTimeout(measure, 800);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(late);
    };
  }, [container, measure]);

  // Draw the rail from the scroll position (read on every frame the page scrolls).
  useEffect(() => {
    if (!nodes.length) return;
    const first = nodes[0].y;
    const last = nodes[nodes.length - 1].y;
    let raf = 0;
    const update = () => {
      raf = 0;
      const root = container.current;
      if (!root) return;
      const rootTop = root.getBoundingClientRect().top;
      const focus = window.innerHeight * 0.45 - rootTop; // reading line, in container coords
      const h = Math.max(0, Math.min(last - first, focus - first));
      if (fill.current) fill.current.style.height = `${h}px`;

      let idx = -1;
      nodes.forEach((n, i) => {
        if (focus >= n.y - 2) idx = i;
      });
      const color = idx >= 0 ? nodes[idx].color : nodes[0].color;
      if (tip.current) {
        tip.current.style.transform = `translate(-50%, ${first + h - 6}px)`;
        tip.current.style.opacity = h > 2 && h < last - first - 2 ? "1" : "0";
        tip.current.style.background = color;
        tip.current.style.boxShadow = `0 0 0 4px ${color}33, 0 0 22px 4px ${color}88`;
      }
      if (bar.current) {
        const doc = document.documentElement;
        const p = window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight);
        bar.current.style.transform = `scaleX(${p})`;
        bar.current.style.background = color;
      }
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [nodes, container]);

  if (!nodes.length) return null;
  const first = nodes[0].y;
  const last = nodes[nodes.length - 1].y;
  // Colour bands: each section's colour blends into the next just before its node.
  const stops = nodes
    .map((n, i) => {
      const y = n.y - first;
      const prev = i === 0 ? 0 : Math.max(nodes[i - 1].y - first, y - 160);
      return i === 0 ? `${n.color} 0px` : `${nodes[i - 1].color} ${prev}px, ${n.color} ${y}px`;
    })
    .join(", ");

  return (
    <>
      {/* Desktop rail */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 hidden w-10 -translate-x-1/2 xl:block"
        style={{ left: "max(48px, calc((100% + 96px - 1200px) / 2 - 56px))" }}
      >
        <div className="absolute left-1/2 w-px -translate-x-1/2 bg-line" style={{ top: first, height: last - first }} />
        <div
          ref={fill}
          className="absolute left-1/2 w-[2px] -translate-x-1/2 rounded-full"
          style={{ top: first, height: 0, backgroundImage: `linear-gradient(180deg, ${stops})`, backgroundSize: `2px ${last - first}px`, backgroundRepeat: "no-repeat" }}
        />
        <div ref={tip} className="absolute left-1/2 top-0 h-3 w-3 rounded-full opacity-0 transition-opacity duration-300" />
        {nodes.map((n, i) => {
          const on = i <= active;
          const current = i === active;
          return (
            <div key={n.id} className="absolute left-1/2" style={{ top: n.y - 20 }}>
              <div
                className="grid h-10 w-10 place-items-center rounded-full border transition-all duration-500"
                style={{
                  background: on ? n.color : "var(--surface)",
                  borderColor: on ? "transparent" : "var(--line)",
                  color: on ? "#fff" : "var(--muted)",
                  transform: `translateX(-50%) scale(${current ? 1.12 : 1})`,
                  boxShadow: current ? `0 0 0 6px ${n.color}22, 0 8px 24px -6px ${n.color}aa` : "var(--shadow-soft)",
                }}
              >
                {n.icon}
              </div>
            </div>
          );
        })}
      </div>

      {/* Narrow screens: slim reading progress under the menu bar */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-12 z-[69] h-[2px] xl:hidden">
        <div ref={bar} className="h-full origin-left" style={{ transform: "scaleX(0)" }} />
      </div>
    </>
  );
}
