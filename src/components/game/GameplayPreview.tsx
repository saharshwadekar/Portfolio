"use client";

import { useEffect, useRef, useState } from "react";
import { RelayEngine, relays } from "./relay/engine";
import type { OrbitGate } from "./orbitObstacles";

export type PreviewGame = "relay-zero" | "orbit-rush";

function relayDemo(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const relay = relays[0];
  const game = new RelayEngine();
  game.player.x = relay.x + 80;
  game.player.y = relay.y + 60;
  game.camera = { x: game.player.x, y: game.player.y };
  game.charge[0] = 44;
  game.addEnemy(1);
  game.start();

  let width = 1, height = 1;
  return {
    resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const scale = Math.min(devicePixelRatio, 1.5);
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    },
    draw(dt: number) {
      const angle = 0.65 + game.time * 1.1;
      const targetX = relay.x + Math.cos(angle) * 76;
      const targetY = relay.y + Math.sin(angle) * 76;
      game.update(dt, {
        x: (targetX - game.player.x) / 35,
        y: (targetY - game.player.y) / 35,
        dash: false, aim: null, firing: true, touch: true,
      }, width, height);
      if (game.phase === "upgrade") game.upgrade("power");
      game.draw(ctx, width, height);
    },
    dispose() {},
  };
}

async function orbitDemo(canvas: HTMLCanvasElement) {
  const { OrbitScene } = await import("./OrbitScene");
  if (!canvas.isConnected) return;
  const scene = new OrbitScene(canvas);
  const gates: OrbitGate[] = [
    { distance: 48, angle: 0.45, kind: 0 },
    { distance: 118, angle: -0.55, kind: 1 },
    { distance: 188, angle: 0.35, kind: 2 },
    { distance: 258, angle: -0.65, kind: 0 },
  ];
  let distance = 0, angle = 0;
  return {
    resize: () => scene.resize(canvas.clientWidth, canvas.clientHeight),
    draw(dt: number) {
      distance += dt * 30;
      const nextGate = gates.find(gate => gate.distance + 5 > distance) ?? gates[gates.length - 1];
      angle += (nextGate.angle - angle) * Math.min(1, dt * 2);
      scene.draw(angle, distance, gates);
    },
    dispose: () => scene.dispose(),
  };
}

export function GameplayPreview({ game, playing, onEnd }: {
  game: PreviewGame;
  playing: boolean;
  onEnd: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const render = useRef<((dt: number) => void) | null>(null);
  const elapsed = useRef(0);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function setup(element: HTMLCanvasElement) {
      try {
        const demo = game === "relay-zero" ? relayDemo(element) : await orbitDemo(element);
        if (cancelled) {
          demo?.dispose();
          return;
        }
        if (!demo) {
          setUnavailable(true);
          return;
        }
        const resize = () => { demo.resize(); demo.draw(0); };
        const observer = new ResizeObserver(resize);
        observer.observe(element);
        resize();
        render.current = demo.draw;
        cleanup = () => { observer.disconnect(); demo.dispose(); };
      } catch {
        if (!cancelled) setUnavailable(true);
      }
    }

    void setup(element);
    return () => {
      cancelled = true;
      render.current = null;
      cleanup?.();
    };
  }, [game]);

  useEffect(() => {
    if (!playing) return;
    let frame: number, last = 0;
    const tick = (now: number) => {
      if (render.current || unavailable) {
        const dt = Math.min((now - (last || now)) / 1000, 0.04);
        elapsed.current += dt;
        render.current?.(dt);
        if (elapsed.current >= 8) {
          onEnd();
          return;
        }
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, onEnd, unavailable]);

  return unavailable
    ? <p className="gameplay-fallback">Preview unavailable on this device.</p>
    : <canvas ref={canvas} className="gameplay-canvas" aria-hidden="true" />;
}
