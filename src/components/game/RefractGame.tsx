"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { setState } from "@/lib/store";
import { unlock } from "@/lib/achievements";
import { areaById } from "@/content/profile";
import { readTokens } from "@/lib/tokens";
import { TLink } from "@/components/ui/TLink";
import { confetti } from "@/components/layout/EasterEggs";
import { initialOrients, keyOf, par, rotatables, targetsOf, trace, type Color, type Level, type Orient } from "./engine";
import { levels } from "./levels";
import { GameShell, Stat } from "./GameShell";
import { gameBySlug } from "./games";

const SAVE = "sw:refract";

interface Save {
  cleared: number[];
  best: Record<number, number>;
}

function loadSave(): Save {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE) || "null");
    if (s && Array.isArray(s.cleared)) return s;
  } catch {}
  return { cleared: [], best: {} };
}

function stars(moves: number, p: number) {
  return moves <= p ? 3 : moves <= p + 2 ? 2 : 1;
}

export function RefractGame() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [save, setSave] = useState<Save>({ cleared: [], best: {} });
  const level = levels[levelIdx];
  const levelPar = useMemo(() => par(level) ?? 0, [level]);
  const [orients, setOrients] = useState<Record<string, Orient>>(() => initialOrients(level));
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const result = useMemo(() => trace(level, orients), [level, orients]);
  const targets = useMemo(() => targetsOf(level), [level]);
  const litCount = targets.filter((t) => result.lit.has(t)).length;

  useEffect(() => setSave(loadSave()), []);

  // Each level tints the page to its discipline.
  useEffect(() => {
    setState({ area: level.area });
    setOrients(initialOrients(level));
    setMoves(0);
    setWon(false);
  }, [level]);

  useEffect(() => {
    if (won || litCount !== targets.length || moves === 0) return;
    setWon(true);
    unlock(`refract-${level.id}`);
    setSave((s) => {
      const next: Save = {
        cleared: s.cleared.includes(level.id) ? s.cleared : [...s.cleared, level.id],
        best: { ...s.best, [level.id]: Math.min(s.best[level.id] ?? Infinity, moves) },
      };
      try {
        localStorage.setItem(SAVE, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [litCount, targets.length, moves, won, level.id]);

  const flip = useCallback(
    (k: string) => {
      if (won) return;
      setOrients((o) => ({ ...o, [k]: o[k] === "/" ? "\\" : "/" }));
      setMoves((m) => m + 1);
    },
    [won],
  );

  const reset = () => {
    setOrients(initialOrients(level));
    setMoves(0);
    setWon(false);
  };

  const unlockedUpTo = Math.max(1, ...save.cleared.map((c) => c + 1));
  const area = areaById[level.area];

  return (
    <GameShell
      game={gameBySlug.refract}
      stats={
        <>
          <Stat label="Moves" value={moves} />
          <Stat label="Par" value={levelPar} />
          <Stat label="Targets" value={`${litCount}/${targets.length}`} />
          <Stat label="Best" value={save.best[level.id] ?? "—"} />
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Levels" className="flex flex-wrap gap-1.5">
          {levels.map((l, i) => {
            const open = l.id <= unlockedUpTo;
            const cleared = save.cleared.includes(l.id);
            const on = i === levelIdx;
            return (
              <button
                key={l.id}
                disabled={!open}
                onClick={() => setLevelIdx(i)}
                aria-current={on}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${on ? "border-transparent text-[#0a0a0c]" : open ? "border-line bg-surface hover:border-fg" : "cursor-not-allowed border-line opacity-40"}`}
                style={on ? { background: areaById[l.area].accent } : undefined}
                title={open ? l.title : "Clear the previous level to unlock"}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: on ? "#0a0a0c" : areaById[l.area].accent }} />
                {l.id}. {l.title}
                {cleared && " ✓"}
              </button>
            );
          })}
        </nav>
        <button onClick={reset} className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm transition-colors hover:border-fg">
          Reset ↺
        </button>
      </div>

      <p className="mb-4 text-sm text-muted">{level.brief}</p>

      <Board level={level} orients={orients} result={result} onFlip={flip} won={won} />

      <p className="mt-4 text-xs text-muted">
        Click a mirror (or focus it and press Enter) to flip it. Splitters pass <em>and</em> reflect. Prisms colour white light, and coloured light
        only lights a target of the same colour.
      </p>

      {won && (
        <WinCard
          key={level.id}
          level={level}
          moves={moves}
          par={levelPar}
          accent={area.accent}
          last={levelIdx === levels.length - 1}
          onNext={() => setLevelIdx((i) => Math.min(i + 1, levels.length - 1))}
          onReplay={reset}
        />
      )}
    </GameShell>
  );
}

function WinCard({
  level,
  moves,
  par: p,
  accent,
  last,
  onNext,
  onReplay,
}: {
  level: Level;
  moves: number;
  par: number;
  accent: string;
  last: boolean;
  onNext: () => void;
  onReplay: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const s = stars(moves, p);
  useEffect(() => {
    const el = ref.current;
    gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", delay: 0.3 });
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (last) confetti();
  }, [last]);
  return (
    <div ref={ref} role="status" className="mt-6 rounded-[20px] border bg-surface p-6 shadow-soft md:p-8" style={{ borderColor: accent, opacity: 0 }}>
      <p className="text-sm font-medium" style={{ color: accent }}>
        Level {level.id} cleared in {moves} moves (par {p}) · {"★".repeat(s)}
        <span className="opacity-30">{"★".repeat(3 - s)}</span>
      </p>
      <p className="mt-3 text-xs text-muted">Unlocked: a true story</p>
      <p className="mt-1 max-w-[60ch] type-subhead">{level.unlock}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={onReplay} className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-fg">
          Replay
        </button>
        {last ? (
          <TLink href="/#contact" className="rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg">
            White light restored. Say hello →
          </TLink>
        ) : (
          <button onClick={onNext} className="rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg" autoFocus>
            Next level →
          </button>
        )}
      </div>
    </div>
  );
}

const ANG: Record<Orient, number> = { "/": -Math.PI / 4, "\\": Math.PI / 4 };

function Board({
  level,
  orients,
  result,
  onFlip,
  won,
}: {
  level: Level;
  orients: Record<string, Orient>;
  result: ReturnType<typeof trace>;
  onFlip: (k: string) => void;
  won: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ orients, result, won });
  live.current = { orients, result, won };
  const angles = useRef<Record<string, number>>({});
  const hover = useRef<string | null>(null);
  const rots = useMemo(() => rotatables(level), [level]);

  useEffect(() => {
    angles.current = {};
  }, [level]);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    let tokens = readTokens();
    let frameN = 0;
    let wonAt = 0;

    const colorOf = (c: Color) => (c === "white" ? tokens.fg : areaById[c].accent);

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);
      if (frameN++ % 30 === 0) tokens = readTokens();
      const W = wrap.current!.clientWidth;
      const cell = W / level.cols;
      const H = cell * level.rows;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
        cv.style.height = `${H}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const { orients: o, result: r, won: w } = live.current;
      const light = document.documentElement.dataset.theme === "light";
      if (w && !wonAt) wonAt = time;
      if (!w) wonAt = 0;
      const cx = (x: number) => (x + 0.5) * cell;
      const cy = (y: number) => (y + 0.5) * cell;

      // Grid
      ctx.fillStyle = tokens.muted;
      ctx.globalAlpha = 0.35;
      for (let x = 0; x <= level.cols; x++)
        for (let y = 0; y <= level.rows; y++) ctx.fillRect(x * cell - 1, y * cell - 1, 2, 2);
      ctx.globalAlpha = 1;

      // Beams
      ctx.lineCap = "round";
      ctx.globalCompositeOperation = light ? "source-over" : "lighter";
      for (const s of r.segments) {
        const col = colorOf(s.color);
        const x1 = cx(s.x1), y1 = cy(s.y1), x2 = cx(s.x2), y2 = cy(s.y2);
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.14;
        ctx.lineWidth = cell * 0.22;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 0.95;
        ctx.lineWidth = Math.max(2, cell * 0.035);
        ctx.stroke();
        // Photons flowing along the beam.
        ctx.setLineDash([2, cell * 0.28]);
        ctx.lineDashOffset = -time * 0.06;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = light ? tokens.fg : "#ffffff";
        ctx.lineWidth = Math.max(1.5, cell * 0.025);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // Pieces
      for (const c of level.cells) {
        const k = keyOf(c.x, c.y);
        const x = cx(c.x), y = cy(c.y);
        const p = c.piece;
        switch (p.kind) {
          case "wall": {
            const s = cell * 0.82;
            ctx.fillStyle = tokens.fg;
            ctx.globalAlpha = 0.07;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = tokens.muted;
            ctx.lineWidth = 1;
            ctx.save();
            ctx.beginPath();
            ctx.rect(x - s / 2, y - s / 2, s, s);
            ctx.clip();
            for (let i = -s; i < s; i += 8) {
              ctx.beginPath();
              ctx.moveTo(x - s / 2 + i, y + s / 2);
              ctx.lineTo(x - s / 2 + i + s, y - s / 2);
              ctx.stroke();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            break;
          }
          case "source": {
            ctx.fillStyle = tokens.fg;
            ctx.beginPath();
            ctx.arc(x, y, cell * 0.16, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = tokens.fg;
            ctx.globalAlpha = 0.3 + 0.2 * Math.sin(time * 0.004);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, cell * 0.3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            break;
          }
          case "prism": {
            const col = areaById[p.color].accent;
            const s = cell * 0.3;
            ctx.beginPath();
            ctx.moveTo(x, y - s);
            ctx.lineTo(x + s * 0.95, y + s * 0.65);
            ctx.lineTo(x - s * 0.95, y + s * 0.65);
            ctx.closePath();
            ctx.fillStyle = col;
            ctx.globalAlpha = 0.22;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = col;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            break;
          }
          case "target": {
            const col = areaById[p.color].accent;
            const on = r.lit.has(k);
            const bad = r.wrong.has(k);
            const pulse = on ? 1 + 0.08 * Math.sin(time * 0.006) : 1;
            const rad = cell * 0.24 * pulse;
            if (on) {
              ctx.fillStyle = col;
              ctx.globalAlpha = 0.18;
              ctx.beginPath();
              ctx.arc(x, y, rad * 1.9, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            ctx.strokeStyle = col;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = on ? col : bad && Math.floor(time / 180) % 2 ? tokens.muted : "transparent";
            ctx.beginPath();
            ctx.arc(x, y, rad * 0.55, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = on ? tokens.fg : tokens.muted;
            ctx.font = `${Math.max(9, cell * 0.12)}px ${tokens.mono}, monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(p.label.toUpperCase(), x, y + cell * 0.32);
            break;
          }
          case "mirror":
          case "splitter": {
            const target = ANG[o[k] ?? p.orient];
            const cur = angles.current[k] ?? target;
            const next = cur + (target - cur) * 0.2;
            angles.current[k] = next;
            const len = cell * 0.38;
            const dx = Math.cos(next) * len, dy = Math.sin(next) * len;
            const isHover = hover.current === k;
            if (!p.locked) {
              ctx.strokeStyle = tokens.fg;
              ctx.globalAlpha = isHover ? 0.5 : 0.14;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(x, y, cell * 0.44, 0, Math.PI * 2);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
            ctx.strokeStyle = p.locked ? tokens.muted : tokens.fg;
            ctx.lineWidth = p.kind === "mirror" ? Math.max(3, cell * 0.05) : Math.max(2, cell * 0.035);
            if (p.kind === "splitter") ctx.setLineDash([cell * 0.06, cell * 0.05]);
            ctx.beginPath();
            ctx.moveTo(x - dx, y - dy);
            ctx.lineTo(x + dx, y + dy);
            ctx.stroke();
            ctx.setLineDash([]);
            if (p.locked) {
              ctx.fillStyle = tokens.muted;
              ctx.fillRect(x - 2, y - 2, 4, 4);
            }
            break;
          }
        }
      }

      // Victory sweep.
      if (wonAt) {
        const t = Math.min((time - wonAt) / 1200, 1);
        const g = ctx.createLinearGradient(0, 0, W, 0);
        ["#4db2ff", "#b6f24a", "#ff6b82", "#ffb547", "#a68bff"].forEach((c, i) => g.addColorStop(i / 4, c));
        ctx.globalAlpha = 0.18 * Math.sin(t * Math.PI);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W * t, H);
        ctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [level]);

  return (
    <div
      ref={wrap}
      className="relative mx-auto w-full select-none overflow-hidden rounded-[20px] border border-line bg-surface shadow-soft"
      data-no-3d
      style={{ aspectRatio: `${level.cols} / ${level.rows}`, maxWidth: `calc(68svh * ${level.cols / level.rows})` }}
    >
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="absolute inset-0" role="group" aria-label={`Puzzle board, ${result.lit.size} of ${targetsOf(level).length} targets lit`}>
        {rots.map((c) => {
          const k = keyOf(c.x, c.y);
          return (
            <button
              key={k}
              onClick={() => onFlip(k)}
              onPointerEnter={() => (hover.current = k)}
              onPointerLeave={() => (hover.current = null)}
              onFocus={() => (hover.current = k)}
              onBlur={() => (hover.current = null)}
              data-cursor="Flip"
              aria-label={`${c.piece.kind} at column ${c.x + 1}, row ${c.y + 1}, currently ${orients[k] === "/" ? "slash" : "backslash"}. Flip.`}
              className="absolute rounded-full focus-visible:outline-offset-[-4px]"
              style={{
                left: `${(c.x / level.cols) * 100}%`,
                top: `${(c.y / level.rows) * 100}%`,
                width: `${100 / level.cols}%`,
                height: `${100 / level.rows}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
