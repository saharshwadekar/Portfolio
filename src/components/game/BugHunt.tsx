"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { unlock } from "@/lib/achievements";
import { confetti } from "@/components/layout/EasterEggs";
import { GameShell, Stat } from "./GameShell";
import { gameBySlug } from "./games";

// Class names drawn from the features I build: incentives, visits, expenses, sync…
const FILES = [
  "OrderTrigger.cls",
  "IncentiveEngine.cls",
  "TeamScore.cls",
  "VisitPlanner.cls",
  "ExpenseService.cls",
  "GeoCheckIn.cls",
  "SelfieVerify.cls",
  "InvoiceBuilder.cls",
  "StockReminder.cls",
  "LeaveManager.cls",
  "SchemeCalc.cls",
  "ErpSync.cls",
];

const ROUND = 30_000;
const SAVE = "sw:bughunt";

type Phase = "idle" | "playing" | "done";

export function BugHunt() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [bugs, setBugs] = useState<Record<number, number>>({}); // cell → expiry time
  const [squashed, setSquashed] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const [left, setLeft] = useState(ROUND);
  const [best, setBest] = useState<number | null>(null);
  const [pops, setPops] = useState<{ id: number; cell: number }[]>([]);
  const start = useRef(0);
  const raf = useRef(0);
  const nextSpawn = useRef(0);
  // Source of truth for live bugs; state mirrors it for rendering.
  const bugsRef = useRef<Record<number, number>>({});
  const live = useRef({ squashed, escaped });
  live.current = { squashed, escaped };

  useEffect(() => {
    try {
      const b = localStorage.getItem(SAVE);
      if (b) setBest(Number(b));
    } catch {}
  }, []);

  const total = squashed + escaped;
  const coverage = total === 0 ? 0 : Math.round((squashed / total) * 100);

  const finish = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setPhase("done");
    bugsRef.current = {};
    setBugs({});
    const { squashed: s, escaped: e } = live.current;
    const cov = s + e === 0 ? 0 : Math.round((s / (s + e)) * 100);
    if (cov >= 90 && s >= 15) {
      unlock("bug-hunt");
      confetti();
    }
    setBest((b) => {
      const n = b === null ? cov : Math.max(b, cov);
      try {
        localStorage.setItem(SAVE, String(n));
      } catch {}
      return n;
    });
  }, []);

  const loop = useCallback(() => {
    const now = performance.now();
    const t = now - start.current;
    setLeft(Math.max(0, ROUND - t));
    if (t >= ROUND) {
      finish();
      return;
    }
    // Difficulty ramps: bugs appear faster and hide sooner.
    const progress = t / ROUND;
    const life = 1150 - progress * 520;
    const gap = 820 - progress * 420;

    const bugs = bugsRef.current;
    let changed = false;
    let missed = 0;
    for (const [cell, exp] of Object.entries(bugs)) {
      if (exp < now) {
        delete bugs[Number(cell)];
        missed++;
        changed = true;
      }
    }
    if (now >= nextSpawn.current) {
      const free = FILES.map((_, i) => i).filter((i) => !(i in bugs));
      if (free.length) {
        const cell = free[Math.floor(Math.random() * free.length)];
        bugs[cell] = now + life;
        // Late in the round, bugs sometimes come in pairs.
        const rest = free.filter((c) => c !== cell);
        if (progress > 0.5 && Math.random() < 0.35 && rest.length) bugs[rest[Math.floor(Math.random() * rest.length)]] = now + life;
        changed = true;
      }
      nextSpawn.current = now + gap;
    }
    if (missed) setEscaped((e) => e + missed);
    if (changed) setBugs({ ...bugs });
    raf.current = requestAnimationFrame(loop);
  }, [finish]);

  const play = () => {
    setSquashed(0);
    setEscaped(0);
    bugsRef.current = {};
    setBugs({});
    setPops([]);
    setLeft(ROUND);
    setPhase("playing");
    start.current = performance.now();
    nextSpawn.current = start.current + 400;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const hit = (cell: number, el: HTMLElement) => {
    if (phase !== "playing" || !(cell in bugsRef.current)) return;
    delete bugsRef.current[cell];
    setBugs({ ...bugsRef.current });
    setSquashed((s) => s + 1);
    const id = Date.now() + cell;
    setPops((p) => [...p.slice(-6), { id, cell }]);
    gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
  };

  const passed = phase === "done" && coverage >= 90 && squashed >= 15;

  return (
    <GameShell
      game={gameBySlug["bug-hunt"]}
      stats={
        <>
          <Stat label="Time" value={`${Math.ceil(left / 1000)}s`} />
          <Stat label="Squashed" value={squashed} />
          <Stat label="Escaped" value={escaped} />
          <Stat label="Best" value={best === null ? "—" : `${best}%`} />
        </>
      }
    >
      {/* Coverage meter */}
      <div className="mb-4 rounded-[18px] border border-line bg-surface p-4 shadow-soft">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Test coverage</span>
          <span className="tabular-nums">{coverage}%</span>
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${coverage}%`, background: coverage >= 90 ? "#10b981" : coverage >= 75 ? "#f59e0b" : "#f43f5e" }}
          />
          <span className="absolute inset-y-0 left-[75%] w-px bg-fg/40" title="75%: the Salesforce deploy minimum" />
          <span className="absolute inset-y-0 left-[90%] w-px bg-fg" title="90%: my bar" />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-muted">
          <span>0%</span>
          <span className="ml-auto mr-[8%]">75% deploy minimum</span>
          <span>90% goal</span>
        </div>
      </div>

      {/* Board */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4" role="group" aria-label="Apex classes">
          {FILES.map((f, i) => {
            const bug = i in bugs;
            const pop = pops.find((p) => p.cell === i);
            return (
              <button
                key={f}
                onPointerDown={(e) => hit(i, e.currentTarget)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && hit(i, e.currentTarget)}
                disabled={phase !== "playing"}
                aria-label={bug ? `${f}: bug! squash it` : f}
                className={`relative flex h-24 flex-col justify-between overflow-hidden rounded-[16px] border p-3 text-left transition-colors disabled:cursor-default sm:h-28 ${
                  bug ? "border-[#f43f5e] bg-[#f43f5e]/10" : "border-line bg-surface"
                }`}
              >
                <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                  {f}
                </span>
                <span className="space-y-1" aria-hidden>
                  <span className="block h-1 w-3/4 rounded-full bg-fg/10" />
                  <span className="block h-1 w-1/2 rounded-full bg-fg/10" />
                </span>
                {bug && (
                  <span className="bug-pop absolute right-3 top-1/2 -translate-y-1/2" aria-hidden>
                    <svg viewBox="0 0 32 32" className="h-10 w-10">
                      <ellipse cx="16" cy="18" rx="7" ry="9" fill="#f43f5e" />
                      <circle cx="16" cy="8.5" r="4" fill="#111113" />
                      <path d="M16 10v17M9 14 4 11m19 3 5-3M9 19H3m20 0h6M9 24l-4 3m18-3 4 3M14 5l-2-3m6 3 2-3" stroke="#111113" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                )}
                {pop && !bug && (
                  <span key={pop.id} className="fade-in absolute right-3 top-3 text-xs font-medium text-[#10b981]">
                    ✓ test passed
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center rounded-[20px] bg-bg/70 p-6 backdrop-blur-sm">
            <div className="max-w-[420px] rounded-[20px] border border-line bg-surface p-6 text-center shadow-lift">
              {phase === "idle" ? (
                <>
                  <p className="text-lg font-semibold">Ready to deploy?</p>
                  <p className="mt-2 text-sm text-muted">
                    Bugs pop out of Apex classes. Click them before they escape. Salesforce needs 75% coverage to deploy; I aim for 90%+.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold">{passed ? "Deploy approved ✓" : coverage >= 75 ? "Deployable, but not my bar" : "Deploy blocked"}</p>
                  <p className="mt-2 text-sm text-muted">
                    {coverage}% coverage · {squashed} squashed · {escaped} escaped.{" "}
                    {passed
                      ? "That's how 250+ Apex classes cleared 90% and earned an AppExchange listing."
                      : squashed < 15 && coverage >= 90
                        ? "Great accuracy. Squash at least 15 to ship."
                        : "Reach 90% with 15+ squashed to ship."}
                  </p>
                </>
              )}
              <button onClick={play} className="mt-5 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg" autoFocus>
                {phase === "idle" ? "Run tests ▶" : "Try again ↺"}
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
