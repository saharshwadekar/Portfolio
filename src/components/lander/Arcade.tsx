"use client";

import { TLink } from "@/components/ui/TLink";
import { RelayPreview } from "@/components/game/relay/RelayZero";

export function Arcade() {
  return (
    <section id="arcade" className="experiment-section" aria-label="Interactive experiment">
      <div className="experiment-copy">
        <p className="project-kicker">OFF THE CLOCK / INTERACTIVE EXPERIMENT</p>
        <h2>Step inside<br />the network.</h2>
        <p>Meet Relay Zero. Pilot a ship through a fractured system, restore its relays, and fight your way back online.</p>
        <ul><li>An explorable arena</li><li>Ship upgrades</li><li>A final guardian</li></ul>
        <TLink href="/arcade/relay-zero" className="portfolio-button primary">Play Relay Zero</TLink>
        <TLink href="/arcade/orbit-rush" className="portfolio-button">Play Orbit Rush</TLink>
        <span className="experiment-note">Mouse & keyboard or touch · Best score saved locally</span>
      </div>
      <TLink href="/arcade/relay-zero" className="experiment-preview" aria-label="Launch Relay Zero">
        <RelayPreview />
        <div className="experiment-preview-label"><span>RELAY ZERO</span><span>Enter the arena</span></div>
      </TLink>
    </section>
  );
}
