"use client";

import { useSyncExternalStore } from "react";
import type { AreaId } from "@/content/profile";

// I build gamification and incentive schemes for field teams,
// so this portfolio keeps score too.

export interface Achievement {
  id: string;
  title: string;
  hint: string;
  xp: number;
  area?: AreaId;
  /** Hidden in the panel until unlocked. */
  secret?: boolean;
}

export const achievements: Achievement[] = [
  // Exploring
  { id: "theme", title: "Night & day", hint: "Toggle the theme", xp: 30 },
  { id: "hello", title: "Say hello", hint: "Copy my email address", xp: 100 },
  // Arcade
  { id: "refract-1", title: "Hello, Apex", hint: "Clear Refract level 1", xp: 60, area: "salesforce" },
  { id: "refract-2", title: "Integrated", hint: "Clear Refract level 2", xp: 60, area: "backend" },
  { id: "refract-3", title: "Pixel perfect", hint: "Clear Refract level 3", xp: 60, area: "frontend" },
  { id: "refract-4", title: "Every layer", hint: "Clear Refract level 4", xp: 60, area: "fullstack" },
  { id: "refract-5", title: "Offline first", hint: "Clear Refract level 5", xp: 60, area: "mobile" },
  { id: "refract-all", title: "White light restored", hint: "Clear every Refract level", xp: 150 },
  { id: "bug-hunt", title: "Ship it", hint: "Reach 90% coverage in Bug Hunt", xp: 120, area: "salesforce" },
  { id: "memory", title: "Total recall", hint: "Match every pair in Stack Match", xp: 100, area: "frontend" },
  { id: "memory-fast", title: "Photographic", hint: "Finish Stack Match in 10 moves or fewer", xp: 120 },
  // Secrets
  { id: "konami", title: "Up, up, down, down", hint: "A very old code", xp: 150, secret: true },
  { id: "sudo", title: "Root access", hint: "Ask the terminal nicely", xp: 100, secret: true },
  { id: "shell", title: "Shell explorer", hint: "Run 5 terminal commands", xp: 60, secret: true },
  { id: "about", title: "About this Saharsh", hint: "Look behind the logo", xp: 60, secret: true },
  { id: "prism", title: "Refraction found", hint: "Some cards have a back", xp: 80, secret: true },
  { id: "headhunter", title: "Headhunter", hint: "Type the magic word", xp: 120, secret: true },
  { id: "teapot", title: "418", hint: "Order a drink", xp: 40, secret: true },
];

export const totalXp = achievements.reduce((a, b) => a + b.xp, 0);

const KEY = "sw:achievements";

let unlocked: Set<string> = new Set();
let snapshot: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();
const toastListeners = new Set<(a: Achievement) => void>();

export interface Note {
  title: string;
  body?: string;
}
const noteListeners = new Set<(n: Note) => void>();

/** A plain toast, for easter eggs and small confirmations. */
export function toast(title: string, body?: string) {
  noteListeners.forEach((l) => l({ title, body }));
}

export function onToast(fn: (n: Note) => void) {
  noteListeners.add(fn);
  return () => {
    noteListeners.delete(fn);
  };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    unlocked = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    unlocked = new Set();
  }
  snapshot = [...unlocked];
}

export function unlock(id: string) {
  load();
  if (unlocked.has(id)) return;
  const a = achievements.find((x) => x.id === id);
  if (!a) return;
  unlocked.add(id);
  snapshot = [...unlocked];
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {}
  listeners.forEach((l) => l());
  toastListeners.forEach((l) => l(a));
  if (id.startsWith("refract-") && id !== "refract-all") {
    if ([1, 2, 3, 4, 5].every((n) => unlocked.has(`refract-${n}`))) unlock("refract-all");
  }
}

export function onUnlock(fn: (a: Achievement) => void) {
  toastListeners.add(fn);
  return () => {
    toastListeners.delete(fn);
  };
}

export function resetAchievements() {
  unlocked = new Set();
  snapshot = [];
  try {
    localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
}

const empty: string[] = [];

export function useUnlocked(): string[] {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return snapshot;
    },
    () => empty,
  );
}

export function xpOf(ids: string[]) {
  return achievements.filter((a) => ids.includes(a.id)).reduce((s, a) => s + a.xp, 0);
}

/** Level curve: every 250 XP is a level. */
export function levelOf(xp: number) {
  return { level: Math.floor(xp / 250) + 1, into: xp % 250, span: 250 };
}
