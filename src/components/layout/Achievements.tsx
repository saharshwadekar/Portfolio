"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import {
  achievements,
  levelOf,
  onToast,
  onUnlock,
  resetAchievements,
  totalXp,
  useUnlocked,
  xpOf,
} from "@/lib/achievements";
import { areaById } from "@/content/profile";
import { getLenis } from "./Providers";

const Star = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M8 1 L10 6 H15 L11 9.2 L12.5 14.5 L8 11.3 L3.5 14.5 L5 9.2 L1 6 H6 Z" fill="currentColor" />
  </svg>
);

/** XP pill in the menu bar; opens the achievements panel. */
export function XPPill() {
  const ids = useUnlocked();
  const xp = xpOf(ids);
  const { level, into, span } = levelOf(xp);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLButtonElement>(null);
  const secretsLeft = achievements.filter((a) => a.secret && !ids.includes(a.id)).length;

  useEffect(
    () =>
      onUnlock(() => {
        gsap.fromTo(pill.current, { scale: 1.2 }, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.4)" });
      }),
    [],
  );

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    if (open) {
      getLenis()?.stop();
      gsap.set(el, { display: "block" });
      gsap.fromTo(el, { opacity: 0, y: -8, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" });
    } else {
      getLenis()?.start();
      gsap.to(el, { opacity: 0, y: -6, duration: 0.2, onComplete: () => void gsap.set(el, { display: "none" }) });
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !pill.current?.contains(t)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div className="relative">
      <button
        ref={pill}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="xp-panel"
        className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-sm tabular-nums transition-colors hover:bg-fg/5"
        title="Achievements"
      >
        <Star className="h-3.5 w-3.5 text-[#f59e0b]" />
        {xp}
        <span className="hidden text-muted sm:inline">XP</span>
      </button>

      <div
        id="xp-panel"
        ref={panel}
        data-lenis-prevent
        className="absolute right-0 top-11 hidden max-h-[78vh] w-[min(92vw,400px)] overflow-y-auto rounded-[18px] border border-line bg-surface p-5 shadow-lift"
        style={{ opacity: 0 }}
      >
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted">Achievements</p>
            <p className="text-xl font-semibold">Level {level}</p>
          </div>
          <p className="text-right text-xs text-muted">
            <span className="font-medium text-fg tabular-nums">{xp}</span> / {totalXp} XP
            <br />
            {ids.length} of {achievements.length} · {secretsLeft} secrets left
          </p>
        </div>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-[#f59e0b] transition-[width] duration-700" style={{ width: `${(into / span) * 100}%` }} />
        </div>
        <p className="mb-4 text-sm text-muted">
          I build gamification for field sales teams, so this portfolio keeps score too. Some badges are secrets.
        </p>
        <ul className="space-y-1.5">
          {achievements.map((a) => {
            const got = ids.includes(a.id);
            const hidden = a.secret && !got;
            const color = a.area ? areaById[a.area].accent : "#f59e0b";
            return (
              <li key={a.id} className={`flex items-center gap-3 rounded-[12px] px-2.5 py-2 ${got ? "bg-fg/[0.04]" : "opacity-55"}`}>
                <span
                  className="grid h-8 w-8 flex-none place-items-center rounded-full"
                  style={{ background: got ? color : "var(--line)", color: got ? "#0a0a0c" : "var(--muted)" }}
                >
                  {got ? (
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                      <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{hidden ? "?" : "·"}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{hidden ? "Secret" : a.title}</span>
                  <span className="block truncate text-xs text-muted">{a.hint}</span>
                </span>
                <span className="text-xs tabular-nums text-muted">+{a.xp}</span>
              </li>
            );
          })}
        </ul>
        <button onClick={resetAchievements} className="mt-4 text-xs text-muted underline-offset-4 hover:underline">
          Reset progress
        </button>
      </div>
    </div>
  );
}

type ToastItem = { key: number; title: string; body?: string; xp?: number; color: string };

/** Bottom-right toasts for unlocks and easter eggs. */
export function Toasts() {
  const [queue, setQueue] = useState<ToastItem[]>([]);

  useEffect(() => {
    const push = (t: Omit<ToastItem, "key">) => {
      const key = Date.now() + Math.random();
      setQueue((q) => [...q.slice(-2), { ...t, key }]);
      setTimeout(() => setQueue((q) => q.filter((x) => x.key !== key)), 4200);
    };
    const offA = onUnlock((a) => push({ title: a.title, body: "Achievement unlocked", xp: a.xp, color: a.area ? areaById[a.area].accent : "#f59e0b" }));
    const offB = onToast((n) => push({ title: n.title, body: n.body, color: "var(--fg)" }));
    return () => {
      offA();
      offB();
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 top-16 z-[95] flex flex-col items-end gap-2">
      {queue.map((t) => (
        <Toast key={t.key} t={t} />
      ))}
    </div>
  );
}

function Toast({ t }: { t: ToastItem }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tl = gsap
      .timeline()
      .fromTo(ref.current, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" })
      .to(ref.current, { x: 20, opacity: 0, duration: 0.4, ease: "power2.in" }, 3.7);
    return () => {
      tl.kill();
    };
  }, []);
  return (
    <div ref={ref} className="flex w-[300px] items-center gap-3 rounded-[16px] border border-line bg-surface/95 p-3 shadow-lift backdrop-blur-xl">
      <span className="grid h-9 w-9 flex-none place-items-center rounded-full" style={{ background: t.color, color: t.color === "var(--fg)" ? "var(--bg)" : "#0a0a0c" }}>
        <Star className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{t.title}</span>
        {t.body && <span className="block truncate text-xs text-muted">{t.body}</span>}
      </span>
      {t.xp !== undefined && <span className="text-xs font-medium tabular-nums text-muted">+{t.xp}</span>}
    </div>
  );
}
