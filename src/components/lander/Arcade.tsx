"use client";

import { useEffect, useState } from "react";
import { games, type GameInfo } from "@/components/game/games";
import { TLink } from "@/components/ui/TLink";
import { XPPill } from "@/components/layout/Achievements";

function readBest(slug: GameInfo["slug"]): string | null {
  try {
    if (slug === "refract") {
      const s = JSON.parse(localStorage.getItem("sw:refract") || "null");
      return s?.cleared?.length ? `${s.cleared.length}/5 levels` : null;
    }
    if (slug === "bug-hunt") {
      const b = localStorage.getItem("sw:bughunt");
      return b ? `${b}% coverage` : null;
    }
    const m = localStorage.getItem("sw:stackmatch");
    return m ? `${m} moves` : null;
  } catch {
    return null;
  }
}

function Preview({ slug, color }: { slug: GameInfo["slug"]; color: string }) {
  if (slug === "refract")
    return (
      <svg viewBox="0 0 240 120" className="h-full w-full" aria-hidden>
        {Array.from({ length: 9 }).map((_, x) =>
          Array.from({ length: 4 }).map((__, y) => <circle key={`${x}${y}`} cx={20 + x * 25} cy={20 + y * 27} r="1" fill="currentColor" opacity=".25" />),
        )}
        <polyline points="20,34 70,34" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <polyline className="arcade-beam" points="70,34 170,34 170,88 220,88" stroke={color} strokeWidth="3" fill="none" strokeLinejoin="round" />
        <circle cx="20" cy="34" r="6" fill="currentColor" />
        <path d="M70 24 l10 17 h-20 z" fill={color} fillOpacity=".25" stroke={color} strokeWidth="1.5" />
        <line x1="160" y1="24" x2="180" y2="44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="160" y1="98" x2="180" y2="78" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="220" cy="88" r="9" fill="none" stroke={color} strokeWidth="2" />
        <circle cx="220" cy="88" r="4" fill={color} />
      </svg>
    );
  if (slug === "bug-hunt")
    return (
      <div className="grid h-full grid-cols-4 gap-1.5 p-1" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`relative rounded-[8px] border ${i === 5 ? "border-[#f43f5e] bg-[#f43f5e]/10" : "border-line bg-bg"}`}>
            <span className="absolute left-1.5 top-1.5 h-1 w-6 rounded-full bg-fg/15" />
            {i === 5 && (
              <svg viewBox="0 0 32 32" className="arcade-bug absolute inset-0 m-auto h-7 w-7">
                <ellipse cx="16" cy="18" rx="7" ry="9" fill="#f43f5e" />
                <circle cx="16" cy="8.5" r="4" fill="currentColor" />
                <path d="M9 14 4 11m19 3 5-3M9 19H3m20 0h6M9 24l-4 3m18-3 4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
            {i === 2 && <span className="absolute bottom-1.5 left-1.5 text-[0.55rem] font-medium text-[#10b981]">✓</span>}
          </div>
        ))}
      </div>
    );
  return (
    <div className="relative h-full" aria-hidden>
      {["Apex", "Built", "Next.js"].map((t, i) => (
        <div
          key={t}
          className="arcade-card absolute top-1/2 flex h-[82%] w-[30%] -translate-y-1/2 flex-col justify-between rounded-[10px] border border-line bg-surface p-2 shadow-soft"
          style={{ left: `${18 + i * 22}%`, rotate: `${(i - 1) * 8}deg`, animationDelay: `${i * 0.2}s` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          <span className="text-xs font-semibold">{i === 1 ? "?" : t}</span>
        </div>
      ))}
    </div>
  );
}

export function Arcade() {
  const [best, setBest] = useState<Record<string, string | null>>({});
  useEffect(() => setBest(Object.fromEntries(games.map((g) => [g.slug, readBest(g.slug)]))), []);

  return (
    <section id="arcade" aria-label="Arcade" className="px-[var(--gutter)] pb-24 pt-8">
      <header data-reveal data-rail-anchor className="mx-auto mb-10 flex max-w-[1200px] flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Optional · three small games I built for this site</p>
          <h2 className="mt-2 type-headline">Side quests</h2>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          Scores and badges save in your browser
          <XPPill />
        </div>
      </header>
      <div className="mx-auto grid max-w-[1200px] gap-5 md:grid-cols-3">
        {games.map((g) => (
          <TLink
            key={g.slug}
            data-reveal
            href={`/arcade/${g.slug}`}
            className="group flex flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-soft transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-auto text-xs text-muted">{g.tag}</span>
            </div>
            <div className="h-40 bg-bg p-4 text-fg">
              <Preview slug={g.slug} color={g.color} />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-semibold">{g.title}</h3>
              <p className="mt-1.5 flex-1 text-sm text-muted">{g.blurb}</p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-muted">{best[g.slug] ? `Best: ${best[g.slug]}` : "Not played yet"}</span>
                <span className="rounded-full px-3 py-1.5 font-medium text-white transition-transform group-hover:translate-x-0.5" style={{ background: g.color }}>
                  Play →
                </span>
              </div>
            </div>
          </TLink>
        ))}
      </div>
    </section>
  );
}
