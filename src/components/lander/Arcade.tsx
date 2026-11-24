"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TLink } from "@/components/ui/TLink";
import { GameplayPreview, type PreviewGame } from "@/components/game/GameplayPreview";

const games = {
  "relay-zero": { name: "Relay Zero", preview: "Fight off drones and restore a network relay" },
  "orbit-rush": { name: "Orbit Rush", preview: "Steer around the rail and through barrier openings" },
} satisfies Record<PreviewGame, { name: string; preview: string }>;

export function Arcade() {
  const panel = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<PreviewGame>("relay-zero");
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [playback, setPlayback] = useState<boolean | null>(null);
  const autoplay = playback ?? !reducedMotion;
  const next = useCallback(() => setGame(current => current === "relay-zero" ? "orbit-rush" : "relay-zero"), []);

  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(motion.matches);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    syncMotion();
    motion.addEventListener("change", syncMotion);
    observer.observe(element);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", syncMotion);
    };
  }, []);

  return (
    <section id="arcade" className="experiment-section" aria-label="Arcade">
      <div className="experiment-copy">
        <p className="project-kicker">OFF THE CLOCK / ARCADE</p>
        <h2>Step inside<br />the network.</h2>
        <p>Restore a fractured network in Relay Zero, or steer through barriers on a twisting rail in Orbit Rush.</p>
        <div className="experiment-actions">
          <TLink href="/arcade/relay-zero" className="portfolio-button primary">Play Relay Zero</TLink>
          <TLink href="/arcade/orbit-rush" className="portfolio-button">Play Orbit Rush</TLink>
        </div>
        <span className="experiment-note">Keyboard or touch · Best scores saved locally</span>
      </div>
      <div ref={panel} className="experiment-preview" aria-label="Gameplay previews" role="group">
        {visible && <GameplayPreview key={game} game={game} playing={autoplay} onEnd={next} />}
        <div className="gameplay-controls">
          <div className="gameplay-switch" role="group" aria-label="Choose a gameplay preview">
            {(Object.keys(games) as PreviewGame[]).map(id => (
              <button key={id} type="button" aria-pressed={game === id} onClick={() => setGame(id)}>
                {games[id].name}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setPlayback(!autoplay)}>
            {autoplay ? "Pause previews" : "Play previews"}
          </button>
        </div>
        <p className="experiment-preview-label">{games[game].preview}</p>
      </div>
    </section>
  );
}
