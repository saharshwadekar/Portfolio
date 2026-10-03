"use client";

import { useEffect, useRef, useState } from "react";
import { unlock } from "@/lib/achievements";
import { areaById, type AreaId } from "@/content/profile";
import { confetti } from "@/components/layout/EasterEggs";
import { GameShell, Stat } from "./GameShell";
import { gameBySlug } from "./games";

// Each pair is a technology and something real I built with it.
const PAIRS: { id: string; tech: string; built: string; area: AreaId; story: string }[] = [
  {
    id: "apex",
    tech: "Apex",
    built: "Incentive engine",
    area: "salesforce",
    story: "I wrote the Apex incentive and gamification logic for four FMCG and consumer brands.",
  },
  {
    id: "rn",
    tech: "React Native",
    built: "Selfie check-in",
    area: "mobile",
    story: "Selfie check-ins and offline GPS tracking, used by 3,000+ field reps every day.",
  },
  {
    id: "net",
    tech: ".NET",
    built: "Tax & SKU logic",
    area: "backend",
    story: "Item, SKU and tax logic in Xmatix's .NET domain layer, live for three or more enterprise clients.",
  },
  {
    id: "mule",
    tech: "MuleSoft",
    built: "ERP sync",
    area: "backend",
    story: "REST/SOAP and MuleSoft integrations keep Salesforce in sync with external ERP systems.",
  },
  {
    id: "lwc",
    tech: "LWC",
    built: "Branded invoices",
    area: "salesforce",
    story: "A dynamic Lightning Web Component invoice generator that matches the client's brand.",
  },
  {
    id: "next",
    tech: "Next.js",
    built: "Schema-driven UI",
    area: "frontend",
    story: "Metadata-driven Next.js widgets for Xmatix: Bank Reconciliation, the Product Configurator, Item 360 and more.",
  },
];

interface Card {
  key: string;
  pair: string;
  face: "tech" | "built";
}

function deck(): Card[] {
  const cards: Card[] = PAIRS.flatMap((p) => [
    { key: `${p.id}-t`, pair: p.id, face: "tech" as const },
    { key: `${p.id}-b`, pair: p.id, face: "built" as const },
  ]);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

const SAVE = "sw:stackmatch";

export function StackMatch() {
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [last, setLast] = useState<string | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const lock = useRef(false);
  const done = matched.size === PAIRS.length;

  // Shuffle on the client only, so server and client markup agree.
  useEffect(() => {
    setCards(deck());
    try {
      const b = localStorage.getItem(SAVE);
      if (b) setBest(Number(b));
    } catch {}
  }, []);

  useEffect(() => {
    if (!startedAt || done) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [startedAt, done]);

  useEffect(() => {
    if (!done) return;
    confetti();
    unlock("memory");
    if (moves <= 10) unlock("memory-fast");
    setBest((b) => {
      const n = b === null ? moves : Math.min(b, moves);
      try {
        localStorage.setItem(SAVE, String(n));
      } catch {}
      return n;
    });
  }, [done, moves]);

  const flip = (i: number) => {
    if (lock.current || open.includes(i) || matched.has(cards[i].pair)) return;
    if (!startedAt) setStartedAt(Date.now());
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((n) => cards[n]);
    if (a.pair === b.pair) {
      setMatched((m) => new Set(m).add(a.pair));
      setLast(a.pair);
      setOpen([]);
    } else {
      lock.current = true;
      setTimeout(() => {
        setOpen([]);
        lock.current = false;
      }, 850);
    }
  };

  const restart = () => {
    setCards(deck());
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setLast(null);
    setStartedAt(null);
    setElapsed(0);
  };

  const lastPair = PAIRS.find((p) => p.id === last);

  return (
    <GameShell
      game={gameBySlug["stack-match"]}
      stats={
        <>
          <Stat label="Moves" value={moves} />
          <Stat label="Pairs" value={`${matched.size}/${PAIRS.length}`} />
          <Stat label="Time" value={`${Math.floor(elapsed / 1000)}s`} />
          <Stat label="Best" value={best === null ? "—" : `${best} moves`} />
        </>
      }
    >
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6" role="group" aria-label="Memory cards">
        {cards.map((c, i) => {
          const p = PAIRS.find((x) => x.id === c.pair)!;
          const up = open.includes(i) || matched.has(c.pair);
          const isMatched = matched.has(c.pair);
          const color = areaById[p.area].accent;
          return (
            <button
              key={c.key}
              onClick={() => flip(i)}
              aria-label={up ? (c.face === "tech" ? p.tech : p.built) : "Hidden card"}
              aria-pressed={up}
              className="memory-card aspect-[3/4] [perspective:800px]"
            >
              <span className={`memory-inner ${up ? "is-up" : ""}`}>
                <span className="memory-face memory-back rounded-[16px] border border-line bg-surface shadow-soft">
                  <svg viewBox="0 0 32 28" className="h-7 w-8 text-faint" aria-hidden>
                    <path d="M16 3 L29 25 H3 Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </span>
                <span
                  className="memory-face memory-front rounded-[16px] border p-3 shadow-soft"
                  style={{ borderColor: isMatched ? color : "var(--line)", background: isMatched ? `color-mix(in oklab, ${color} 16%, var(--surface))` : "var(--surface)" }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  {c.face === "tech" ? (
                    <span className="text-lg font-semibold">{p.tech}</span>
                  ) : (
                    <span className="text-sm leading-snug text-muted">
                      Built
                      <span className="block text-base font-medium text-fg">{p.built}</span>
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex min-h-[64px] flex-wrap items-center justify-between gap-4 rounded-[18px] border border-line bg-surface p-4 shadow-soft" aria-live="polite">
        {done ? (
          <p className="text-sm">
            <span className="font-semibold">All six matched in {moves} moves.</span>{" "}
            <span className="text-muted">That&apos;s my stack, and every card is something shipped.</span>
          </p>
        ) : lastPair ? (
          <p className="text-sm">
            <span className="font-semibold">
              {lastPair.tech} → {lastPair.built}.
            </span>{" "}
            <span className="text-muted">{lastPair.story}</span>
          </p>
        ) : (
          <p className="text-sm text-muted">Flip two cards. Match each technology with what I built with it.</p>
        )}
        <button onClick={restart} className="rounded-full border border-line px-4 py-1.5 text-sm transition-colors hover:border-fg">
          Shuffle ↺
        </button>
      </div>
    </GameShell>
  );
}
