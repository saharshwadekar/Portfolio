"use client";

import type { ReactNode } from "react";
import { TLink } from "@/components/ui/TLink";
import { Tint } from "@/components/layout/Tint";
import { XPPill } from "@/components/layout/Achievements";
import { games, type GameInfo } from "./games";

/** Shared frame for every arcade game: breadcrumb, title, stats, and the other games. */
export function GameShell({ game, stats, children }: { game: GameInfo; stats?: ReactNode; children: ReactNode }) {
  const others = games.filter((g) => g.slug !== game.slug);
  return (
    <div className="lander min-h-[100svh]">
      <Tint area={game.area} />
      <div className="mx-auto max-w-[1120px] px-[var(--gutter)] pb-28 pt-24">
        <div className="mb-8 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted">
            <TLink href="/" className="hover:text-fg">
              Home
            </TLink>
            <span aria-hidden>/</span>
            <TLink href="/#arcade" className="hover:text-fg">
              Arcade
            </TLink>
            <span aria-hidden>/</span>
            <span className="text-fg">{game.title}</span>
          </nav>
          <XPPill />
        </div>

        <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[60ch]">
            <p className="text-sm text-muted">{game.tag}</p>
            <h1 className="mt-1 type-headline">{game.title}</h1>
            <p className="mt-3 text-base text-muted">{game.blurb}</p>
          </div>
          {stats && <dl className="flex gap-6 text-sm">{stats}</dl>}
        </header>

        {children}

        <section data-reveal aria-label="More games" className="mt-20">
          <h2 className="mb-4 text-sm font-medium text-muted">More in the arcade</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map((g) => (
              <TLink
                key={g.slug}
                href={`/arcade/${g.slug}`}
                className="group flex items-center gap-4 rounded-[18px] border border-line bg-surface p-4 shadow-soft transition-shadow hover:shadow-lift"
              >
                <span className="grid h-12 w-12 flex-none place-items-center rounded-[14px] text-lg font-semibold text-white" style={{ background: g.color }}>
                  {g.title[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{g.title}</span>
                  <span className="block truncate text-sm text-muted">{g.tag}</span>
                </span>
                <span className="text-muted transition-transform group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </TLink>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
