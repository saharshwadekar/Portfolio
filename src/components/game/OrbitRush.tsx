"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clearsObstacle } from "./orbitObstacles";
import { OrbitScene, type OrbitGate } from "./OrbitScene";

export function OrbitRush() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const steering = useRef(0);
  const running = useRef(false);
  const reset = useRef(() => {});
  const [phase, setPhase] = useState("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  useEffect(() => {
    const element = canvas.current!;
    let world: OrbitScene;
    try { world = new OrbitScene(element); } catch { setPhase("unsupported"); return; }
    let width = 1, height = 1, angle = 0, elapsed = 0, spawn = 0, last = 0, frame = 0;
    let gates: OrbitGate[] = [];
    let previousGateAngle = 0;
    let distance = 0;
    let record = 0;
    try { record = Number(localStorage.getItem("sw:orbit-best")) || 0; setBest(record); } catch {}
    const resize = () => {
      width = element.clientWidth; height = element.clientHeight;
      world.resize(width, height);
    };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    reset.current = () => { elapsed = 0; distance = 0; angle = 0; previousGateAngle = 0; spawn = 1; gates = []; steering.current = 0; running.current = true; setPhase("playing"); setScore(0); };
    const pause = () => { if (running.current) { running.current = false; steering.current = 0; setPhase("paused"); } };
    const down = (event: KeyboardEvent) => {
      if (event.key === "Escape") pause();
      if (["ArrowLeft", "ArrowRight", "a", "d"].includes(event.key)) {
        event.preventDefault(); steering.current = ["ArrowLeft", "a"].includes(event.key) ? -1 : 1;
      }
    };
    const up = () => { steering.current = 0; };
    const visibility = () => { if (document.hidden) pause(); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    window.addEventListener("blur", pause); document.addEventListener("visibilitychange", visibility);
    const draw = (now: number) => {
      const dt = Math.min((now - (last || now)) / 1000, .04); last = now;
      if (running.current) {
        elapsed += dt; angle -= steering.current * dt * 2.7; spawn -= dt;
        const previousDistance = distance;
        distance += dt * Math.min(65, 30 + elapsed * .25);
        if (spawn <= 0) {
          previousGateAngle += (Math.random() - .5) * 2.4;
          gates.push({ distance: distance + 180, angle: previousGateAngle, kind: Math.floor(elapsed / 7) % 3 });
          spawn = Math.max(.8, 1.7 - elapsed / 140);
        }
        for (const gate of gates) {
          if (previousDistance < gate.distance + .8 && distance >= gate.distance - .8) {
            if (!clearsObstacle(angle, gate)) {
              running.current = false; setPhase("lost");
              record = Math.max(record, Math.floor(elapsed * 10)); setBest(record);
              try { localStorage.setItem("sw:orbit-best", String(record)); } catch {}
            }
          }
        }
        gates = gates.filter(gate => gate.distance > distance - 15);
        setScore(Math.floor(elapsed * 10));
      }
      world.draw(angle, distance, gates);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); world.dispose(); observer.disconnect(); running.current = false; window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", pause); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <div className="relay-game">
    <canvas ref={canvas} aria-label="Orbit Rush flight arena" />
    <header className="relay-hud"><Link className="relay-exit" href="/#arcade">Exit game</Link><div className="relay-title">ORBIT RUSH<span>{score} POINTS · BEST {best}</span></div><button disabled={phase !== "playing"} onClick={() => { running.current = false; setPhase("paused"); steering.current = 0; }}>Pause</button></header>
    {phase === "playing" && <div className="orbit-controls">{[-1, 1].map(direction => <button key={direction} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); steering.current = direction; }} onPointerUp={() => { steering.current = 0; }} onPointerCancel={() => { steering.current = 0; }}>{direction < 0 ? "Rotate left" : "Rotate right"}</button>)}</div>}
    {phase !== "playing" && <div className="relay-overlay"><section className="relay-dialog"><p className="relay-eyebrow">AN ORIGINAL ORBITAL SURVIVAL GAME</p><h1>{phase === "unsupported" ? "WebGL unavailable" : phase === "lost" ? "Orbit broken." : phase === "paused" ? "Flight paused." : "Orbit Rush"}</h1><p>Travel forward automatically along the rail. Steer around its surface to pass through the green openings in solid barriers. Your speed builds with every second.</p><div className="relay-instructions"><span><b>A / D or arrow keys</b>Steer around the rail</span><span><b>Touch controls</b>Hold left or right</span></div><p>{score} points · Best {best}</p><button disabled={phase === "unsupported"} className="relay-launch" onClick={() => { if (phase === "paused") { running.current = true; setPhase("playing"); } else reset.current(); }}>{phase === "paused" ? "Resume flight" : "Launch run"}</button></section></div>}
  </div>;
}
