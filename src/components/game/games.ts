import type { AreaId } from "@/content/profile";

export interface GameInfo {
  slug: "orbit-rush" | "relay-zero" | "refract" | "bug-hunt" | "stack-match";
  title: string;
  tag: string;
  blurb: string;
  area: AreaId;
  color: string;
}

export const games: GameInfo[] = [
  { slug: "orbit-rush", title: "Orbit Rush", tag: "Orbital survival", blurb: "Rotate through approaching gates and chase your best survival time.", area: "frontend", color: "#93ffda" },
  { slug: "relay-zero", title: "Relay Zero", tag: "Exploration · Arena shooter", blurb: "Restore a fractured network, upgrade your ship, and defeat its guardian.", area: "backend", color: "#8ba6ff" },
  {
    slug: "refract",
    title: "Refract",
    tag: "Light puzzle · 5 levels",
    blurb: "Flip mirrors and splitters to route refracted light to targets named after my work.",
    area: "fullstack",
    color: "#f59e0b",
  },
  {
    slug: "bug-hunt",
    title: "Bug Hunt",
    tag: "Reflex · 30 seconds",
    blurb: "Bugs pop out of Apex classes. Squash them fast enough to ship with 90%+ coverage.",
    area: "salesforce",
    color: "#3b82f6",
  },
  {
    slug: "stack-match",
    title: "Stack Match",
    tag: "Memory · 6 pairs",
    blurb: "Pair each technology with what I built with it. Every match reveals the real story.",
    area: "frontend",
    color: "#f43f5e",
  },
];

export const gameBySlug = Object.fromEntries(games.map((g) => [g.slug, g])) as Record<GameInfo["slug"], GameInfo>;
