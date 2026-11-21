"use client";

import { useEffect, useRef, useState } from "react";
import { TLink } from "@/components/ui/TLink";
import { RelayEngine, type Input, type Phase, type Upgrade } from "./engine";

const idleInput: Input = { x: 0, y: 0, aim: null, firing: false, dash: false, touch: false };
const upgrades: { id: Upgrade; title: string; detail: string }[] = [
  { id: "power", title: "Overclock", detail: "+65% base shot damage" },
  { id: "speed", title: "Fast lane", detail: "+20% base movement speed" },
  { id: "shield", title: "Recovery", detail: "Restore 55 hull points" },
];

export function RelayPreview() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const game = new RelayEngine();
    game.camera = { x: 560, y: 510 };
    game.player.x = 540; game.player.y = 550; game.player.angle = -0.5;
    game.charge[0] = 68;
    game.addEnemy(0); game.addEnemy(1);
    const draw = () => {
      const bounds = el.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio, 2);
      el.width = bounds.width * scale; el.height = bounds.height * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      game.draw(ctx, bounds.width, bounds.height);
    };
    const observer = new ResizeObserver(draw); observer.observe(el); draw();
    return () => observer.disconnect();
  }, []);
  return <canvas ref={canvas} className="relay-preview-canvas" role="img" aria-label="Relay Zero arena showing a spacecraft restoring a glowing network relay" />;
}

export function RelayZero() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<RelayEngine | null>(null);
  const controls = useRef<Input>({ ...idleInput });
  const keys = useRef(new Set<string>());
  const [hud, setHud] = useState({ phase: "ready" as Phase, hp: 100, restored: 0, score: 0, dash: 0, time: 0 });
  const [best, setBest] = useState(0);
  const [assist, setAssist] = useState(false);
  const [touch, setTouch] = useState(false);
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const [announcement, setAnnouncement] = useState("");
  const sync = () => {
    const g = engine.current;
    if (g) setHud({ phase: g.phase, hp: g.player.hp, restored: g.restored, score: g.score, dash: g.dash, time: g.time });
  };
  useEffect(() => {
    const el = canvas.current, ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const game = new RelayEngine(); engine.current = game;
    game.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(pointer: coarse)").matches;
    setTouch(mobile); setAssist(mobile); controls.current.touch = mobile;
    try { setBest(Number(localStorage.getItem("sw:relay-best")) || 0); } catch {}
    let width = 0, height = 0, frame = 0, last = 0, hudTime = 0, priorPhase: Phase = "ready";
    const resize = () => {
      const rect = el.getBoundingClientRect(); width = rect.width; height = rect.height;
      const ratio = Math.min(window.devicePixelRatio, 2);
      el.width = width * ratio; el.height = height * ratio; ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    const loop = (now: number) => {
      const g = engine.current!;
      const dt = Math.min((now - (last || now)) / 1000, 0.035); last = now;
      if (!mobile) {
        controls.current.x = Number(keys.current.has("d") || keys.current.has("ArrowRight")) - Number(keys.current.has("a") || keys.current.has("ArrowLeft"));
        controls.current.y = Number(keys.current.has("s") || keys.current.has("ArrowDown")) - Number(keys.current.has("w") || keys.current.has("ArrowUp"));
      }
      g.update(dt, controls.current, width, height); controls.current.dash = false;
      g.draw(ctx, width, height);
      if (now - hudTime > 100 || g.phase !== priorPhase) { sync(); hudTime = now; }
      if (g.phase !== priorPhase) {
        setAnnouncement(g.phase === "upgrade" ? "Relay restored. Choose an upgrade." : g.phase === "won" ? "Network restored. Mission complete." : g.phase === "lost" ? "Ship lost. Try again." : "");
        if (g.phase === "won" || g.phase === "lost") {
          setBest(current => {
            const value = Math.max(current, g.score);
            try { localStorage.setItem("sw:relay-best", String(value)); } catch {}
            return value;
          });
        }
        priorPhase = g.phase;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("button, a, input")) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) e.preventDefault();
      keys.current.add(key);
      if (key === " " && !e.repeat) controls.current.dash = true;
      if (key === "Escape" && !e.repeat) pause();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const loseFocus = () => {
      keys.current.clear(); controls.current = { ...idleInput, touch: controls.current.touch };
      if (engine.current?.phase === "playing") { engine.current.phase = "paused"; sync(); }
      setStick({ x: 0, y: 0 });
    };
    const visibility = () => { if (document.hidden) loseFocus(); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    window.addEventListener("blur", loseFocus); document.addEventListener("visibilitychange", visibility);
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", down); window.removeEventListener("keyup", up);
      window.removeEventListener("blur", loseFocus); document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  function pause() {
    const g = engine.current;
    if (!g || !["playing", "paused"].includes(g.phase)) return;
    g.phase = g.phase === "playing" ? "paused" : "playing";
    controls.current.firing = false; keys.current.clear(); sync();
    if (g.phase === "playing") canvas.current?.focus();
  }
  function start() {
    const reduced = engine.current?.reduced || false;
    engine.current = new RelayEngine(); engine.current.reduced = reduced;
    engine.current.start(); controls.current = { ...idleInput, touch: assist };
    keys.current.clear(); sync(); canvas.current?.focus();
  }
  const resetStick = () => { controls.current.x = 0; controls.current.y = 0; setStick({ x: 0, y: 0 }); };
  const moveStick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / 40, y = (e.clientY - r.top - r.height / 2) / 40;
    const length = Math.max(1, Math.hypot(x, y));
    controls.current.x = x / length; controls.current.y = y / length;
    setStick({ x: x / length * 32, y: y / length * 32 });
  };
  return (
    <main className="relay-game" aria-label="Relay Zero game">
      <canvas ref={canvas} tabIndex={0} aria-label="Game arena. Move with WASD or arrow keys, aim with the mouse, hold click to fire, press Space to dash and Escape to pause. Enable aim assist for automatic targeting and firing."
        onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); controls.current.aim = { x: e.clientX - r.left, y: e.clientY - r.top }; }}
        onPointerDown={e => { e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); controls.current.firing = true; }}
        onPointerUp={() => { controls.current.firing = false; }} onPointerCancel={() => { controls.current.firing = false; }} />
      <header className="relay-hud">
        <TLink href="/#arcade" className="relay-exit">Exit game</TLink>
        <div className="relay-title">RELAY ZERO<span>{hud.restored === 3 ? "DESTROY THE GUARDIAN" : "RESTORE THE NETWORK"}</span></div>
        <button onClick={pause} disabled={!["playing", "paused"].includes(hud.phase)}>{hud.phase === "paused" ? "Resume" : "Pause"}</button>
      </header>
      <div className="relay-status">
        <div><span>HULL {Math.ceil(hud.hp)}%</span><meter min="0" max="100" value={hud.hp} aria-label="Hull integrity" /></div>
        <span>RELAYS {hud.restored}/3</span><span>{hud.score.toLocaleString()} PTS</span>
      </div>
      <p className="sr-only" role="status">{announcement}</p>
      {hud.phase === "playing" && <div className="relay-bottom">
        <label><input type="checkbox" checked={assist} onChange={e => { setAssist(e.target.checked); controls.current.touch = e.target.checked; canvas.current?.focus(); }} /> Aim assist</label>
        <span>{hud.dash > 0 ? `Dash ${hud.dash.toFixed(1)}s` : "Dash ready"}</span>
      </div>}
      {touch && hud.phase === "playing" && <div className="relay-touch">
        <div className="relay-stick" role="group" aria-label="Drag to move" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); moveStick(e); }} onPointerMove={moveStick} onPointerUp={resetStick} onPointerCancel={resetStick}>
          <span style={{ transform: `translate(${stick.x}px, ${stick.y}px)` }} />
        </div>
        <button onPointerDown={() => { controls.current.dash = true; }} disabled={hud.dash > 0}>Dash</button>
      </div>}
      {hud.phase !== "playing" && <div className="relay-overlay">
        <section className="relay-dialog" aria-label={hud.phase === "upgrade" ? "Choose upgrade" : "Mission controls"}>
          <p className="relay-eyebrow">{hud.phase === "upgrade" ? "RELAY RESTORED" : "AN INTERACTIVE EXPERIMENT BY SAHARSH"}</p>
          <h1>{hud.phase === "ready" ? "Relay Zero" : hud.phase === "paused" ? "Take a breath." : hud.phase === "upgrade" ? "Choose your edge." : hud.phase === "won" ? "Back online." : "Signal lost."}</h1>
          <p>{hud.phase === "ready" ? "A fractured network. One pilot. Restore three relays, outmaneuver hostile drones, and take down the guardian." : hud.phase === "paused" ? "Your mission is waiting exactly where you left it." : hud.phase === "upgrade" ? "Your next sector gets harder. Upgrade your ship for the fight ahead." : hud.phase === "won" ? "All three relays restored. Guardian neutralized. Network operational." : "The network needs another run. Keep moving and dash through danger."}</p>
          {hud.phase === "ready" && <div className="relay-instructions"><span><b>{touch ? "Drag" : "W A S D"}</b> Move</span><span><b>{touch ? "Automatic" : "Mouse + click"}</b> Aim & fire</span><span><b>{touch ? "Dash button" : "Space"}</b> Dash</span><span><b>Stay in a ring</b> Restore relay</span></div>}
          {hud.phase === "upgrade" ? <div className="relay-upgrades">{upgrades.map(u => <button key={u.id} onClick={() => { engine.current?.upgrade(u.id); sync(); canvas.current?.focus(); }}><strong>{u.title}</strong><span>{u.detail}</span></button>)}</div> : <>
            {(hud.phase === "lost" || hud.phase === "won") && <div className="relay-result"><span>{hud.score.toLocaleString()} points</span><span>{Math.floor(hud.time)} seconds</span></div>}
            <button className="relay-launch" onClick={() => { if (hud.phase === "paused") { pause(); canvas.current?.focus(); } else start(); }}>{hud.phase === "ready" ? "Enter the network" : hud.phase === "paused" ? "Resume mission" : "Run it again"}</button>
            <p className="relay-best">Best run · {best.toLocaleString()} points</p>
          </>}
        </section>
      </div>}
    </main>
  );
}
