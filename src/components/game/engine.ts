// Refract: grid optics. Pure functions so levels can be solved and tested.

import type { AreaId } from "@/content/profile";

export type Color = "white" | AreaId;
export type Dir = 0 | 1 | 2 | 3; // right, down, left, up
export type Orient = "/" | "\\";

export type Piece =
  | { kind: "source"; dir: Dir }
  | { kind: "mirror"; orient: Orient; locked?: boolean }
  | { kind: "splitter"; orient: Orient; locked?: boolean }
  | { kind: "prism"; color: AreaId }
  | { kind: "target"; color: AreaId; label: string }
  | { kind: "wall" };

export interface Cell {
  x: number;
  y: number;
  piece: Piece;
}

export interface Level {
  id: number;
  area: AreaId;
  title: string;
  brief: string;
  unlock: string;
  cols: number;
  rows: number;
  cells: Cell[];
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: Color;
}

const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

function dirOf(dx: number, dy: number): Dir {
  if (dx === 1) return 0;
  if (dy === 1) return 1;
  if (dx === -1) return 2;
  return 3;
}

/** "/" maps (dx,dy) → (-dy,-dx); "\" maps (dx,dy) → (dy,dx). */
export function reflect(d: Dir, o: Orient): Dir {
  const dx = DX[d], dy = DY[d];
  return o === "/" ? dirOf(-dy, -dx) : dirOf(dy, dx);
}

export interface TraceResult {
  segments: Segment[];
  lit: Set<string>;
  /** Targets hit by the wrong colour, for feedback. */
  wrong: Set<string>;
}

export const keyOf = (x: number, y: number) => `${x},${y}`;

export function trace(level: Level, orients: Record<string, Orient>): TraceResult {
  const grid = new Map<string, Piece>();
  for (const c of level.cells) grid.set(keyOf(c.x, c.y), c.piece);

  const segments: Segment[] = [];
  const lit = new Set<string>();
  const wrong = new Set<string>();
  const seen = new Set<string>();

  type Ray = { x: number; y: number; d: Dir; color: Color };
  const rays: Ray[] = [];
  for (const c of level.cells) {
    if (c.piece.kind === "source") rays.push({ x: c.x, y: c.y, d: c.piece.dir, color: "white" });
  }

  let guard = 0;
  while (rays.length && guard++ < 500) {
    const r = rays.shift()!;
    let x = r.x, y = r.y;
    const sx = x, sy = y;
    let d = r.d;
    let color = r.color;
    // Walk until something changes the ray.
    for (let step = 0; step < 200; step++) {
      const nx = x + DX[d], ny = y + DY[d];
      if (nx < 0 || ny < 0 || nx >= level.cols || ny >= level.rows) {
        segments.push({ x1: sx, y1: sy, x2: x + DX[d] * 0.5, y2: y + DY[d] * 0.5, color });
        break;
      }
      x = nx;
      y = ny;
      const k = keyOf(x, y);
      const p = grid.get(k);
      if (!p) continue;

      const stateKey = `${k}:${d}:${color}`;
      if (seen.has(stateKey)) {
        segments.push({ x1: sx, y1: sy, x2: x, y2: y, color });
        break;
      }
      seen.add(stateKey);

      if (p.kind === "wall" || p.kind === "source") {
        segments.push({ x1: sx, y1: sy, x2: x - DX[d] * 0.5, y2: y - DY[d] * 0.5, color });
        break;
      }
      if (p.kind === "target") {
        segments.push({ x1: sx, y1: sy, x2: x, y2: y, color });
        if (color === p.color) lit.add(k);
        else wrong.add(k);
        break;
      }
      if (p.kind === "prism") {
        segments.push({ x1: sx, y1: sy, x2: x, y2: y, color });
        if (color === "white" || color === p.color) rays.push({ x, y, d, color: p.color });
        break;
      }
      if (p.kind === "mirror" || p.kind === "splitter") {
        const o = orients[k] ?? p.orient;
        segments.push({ x1: sx, y1: sy, x2: x, y2: y, color });
        rays.push({ x, y, d: reflect(d, o), color });
        if (p.kind === "splitter") rays.push({ x, y, d, color });
        break;
      }
    }
  }

  return { segments, lit, wrong };
}

export function targetsOf(level: Level) {
  return level.cells.filter((c) => c.piece.kind === "target").map((c) => keyOf(c.x, c.y));
}

export function rotatables(level: Level) {
  return level.cells.filter(
    (c) => (c.piece.kind === "mirror" || c.piece.kind === "splitter") && !c.piece.locked,
  );
}

export function initialOrients(level: Level): Record<string, Orient> {
  const o: Record<string, Orient> = {};
  for (const c of level.cells) {
    if (c.piece.kind === "mirror" || c.piece.kind === "splitter") o[keyOf(c.x, c.y)] = c.piece.orient;
  }
  return o;
}

export function solved(level: Level, orients: Record<string, Orient>) {
  const { lit } = trace(level, orients);
  return targetsOf(level).every((t) => lit.has(t));
}

/** Fewest flips from the starting position (brute force; levels are small). */
export function par(level: Level): number | null {
  const rs = rotatables(level);
  const start = initialOrients(level);
  let best: number | null = null;
  for (let mask = 0; mask < 1 << rs.length; mask++) {
    const o = { ...start };
    let flips = 0;
    rs.forEach((c, i) => {
      if (mask & (1 << i)) {
        const k = keyOf(c.x, c.y);
        o[k] = o[k] === "/" ? "\\" : "/";
        flips++;
      }
    });
    if ((best === null || flips < best) && solved(level, o)) best = flips;
  }
  return best;
}
