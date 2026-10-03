"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { person, projects } from "@/content/profile";
import { toast, unlock } from "@/lib/achievements";
import { navigate } from "@/lib/transition";
import { toggleTheme } from "@/components/layout/Providers";
import { confetti } from "@/components/layout/EasterEggs";
import { goSection } from "@/components/layout/Nav";

/** Pune wall time, recomputed every second. */
function usePuneTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      // Shift to IST (UTC+5:30) so the widgets show Pune time anywhere.
      const utc = d.getTime() + d.getTimezoneOffset() * 60000;
      setNow(new Date(utc + 5.5 * 3600000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** A desktop widget: a soft card you can drag around (pointer devices only). */
export function Widget({ children, className = "", label, onClick }: { children: ReactNode; className?: string; label: string; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let sx = 0, sy = 0, ox = 0, oy = 0, drag = false, moved = false;
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button,input,[data-no-drag]")) return;
      moved = false;
      drag = true;
      sx = e.clientX;
      sy = e.clientY;
      ox = Number(gsap.getProperty(el, "x"));
      oy = Number(gsap.getProperty(el, "y"));
      el.setPointerCapture(e.pointerId);
      gsap.to(el, { scale: 1.03, boxShadow: "var(--shadow-lift)", zIndex: 30, duration: 0.3 });
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 4) moved = true;
      x(ox + e.clientX - sx);
      y(oy + e.clientY - sy);
    };
    const up = () => {
      if (!drag) return;
      drag = false;
      el.dataset.moved = moved ? "1" : "";
      gsap.to(el, { scale: 1, boxShadow: "var(--shadow-soft)", zIndex: 1, duration: 0.4 });
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-widget
      aria-label={label}
      role="group"
      onClick={() => {
        if (ref.current?.dataset.moved === "1") return;
        onClick?.();
      }}
      className={`relative touch-pan-y select-none rounded-[22px] bg-surface p-4 shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}

export function ClockWidget() {
  const now = usePuneTime();
  const s = now ? now.getSeconds() : 0;
  const m = now ? now.getMinutes() + s / 60 : 0;
  const h = now ? (now.getHours() % 12) + m / 60 : 0;
  const hand = (deg: number, len: number, w: number, color: string) => (
    <line x1="50" y1="50" x2="50" y2={50 - len} stroke={color} strokeWidth={w} strokeLinecap="round" transform={`rotate(${deg} 50 50)`} />
  );
  return (
    <Widget label="Clock showing the time in Pune" className="h-[150px] w-[150px]">
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="6"
            x2="50"
            y2={i % 3 === 0 ? 12 : 9}
            stroke="var(--muted)"
            strokeWidth={i % 3 === 0 ? 1.6 : 1}
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        <text x="50" y="33" textAnchor="middle" fontSize="6.5" letterSpacing="1" fill="var(--muted)" fontFamily="var(--font-mono)">
          PUNE
        </text>
        {now && (
          <>
            {hand(h * 30, 24, 3.2, "var(--fg)")}
            {hand(m * 6, 34, 2.2, "var(--fg)")}
            {hand(s * 6, 38, 0.9, "#ff5a36")}
          </>
        )}
        <circle cx="50" cy="50" r="2.4" fill="var(--fg)" />
      </svg>
    </Widget>
  );
}

export function CalendarWidget() {
  const now = usePuneTime();
  return (
    <Widget label={now ? `Today is ${now.toDateString()}` : "Calendar"} className="flex h-[150px] w-[150px] flex-col justify-between">
      <p className="text-xs font-semibold uppercase text-[#ff5a36]">
        {now ? now.toLocaleDateString("en-GB", { weekday: "long" }) : " "}
      </p>
      <p className="text-7xl font-semibold leading-none tabular-nums">{now ? now.getDate() : " "}</p>
      <p className="text-sm text-muted">
        {now ? now.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : " "}
      </p>
    </Widget>
  );
}

/** Easter egg: tap the card five times and it turns over. */
export function IdWidget() {
  const [taps, setTaps] = useState(0);
  const flipped = taps >= 5;
  const inner = useRef<HTMLDivElement>(null);

  const tap = () => {
    if (flipped) {
      setTaps(0);
      gsap.to(inner.current, { rotateY: 0, duration: 0.8, ease: "back.out(1.4)" });
      return;
    }
    const n = taps + 1;
    setTaps(n);
    gsap.fromTo(inner.current, { rotateZ: n % 2 ? -3 : 3 }, { rotateZ: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    if (n === 5) {
      gsap.to(inner.current, { rotateY: 180, duration: 0.9, ease: "back.out(1.4)" });
      const b = inner.current?.getBoundingClientRect();
      if (b) confetti(b.left + b.width / 2, b.top + b.height / 2, 60);
      unlock("prism");
    }
  };

  return (
    <Widget label="Identity card" className="h-[150px] w-[150px] !p-0 [perspective:700px]" onClick={tap}>
      <div ref={inner} className="relative h-full w-full [transform-style:preserve-3d]">
        <div className="absolute inset-0 flex flex-col justify-between p-4 [backface-visibility:hidden]">
          <svg viewBox="0 0 32 28" className="h-8 w-9" aria-hidden>
            <defs>
              <linearGradient id="id-spec" x1="0" x2="1">
                <stop offset="0" stopColor="#4db2ff" />
                <stop offset=".25" stopColor="#b6f24a" />
                <stop offset=".5" stopColor="#ff6b82" />
                <stop offset=".75" stopColor="#ffb547" />
                <stop offset="1" stopColor="#a68bff" />
              </linearGradient>
            </defs>
            <path d="M16 2 L30 26 H2 Z" fill="none" stroke="var(--fg)" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M16 2 L30 26" stroke="url(#id-spec)" strokeWidth="1.8" />
          </svg>
          <div>
            <p className="text-sm font-medium leading-tight">Saharsh Wadekar</p>
            <p className="mt-1 text-xs leading-tight text-muted">Pune, India · open to relocation</p>
          </div>
        </div>
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-[22px] p-4 text-[#0a0a0c] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ background: "linear-gradient(135deg,#4db2ff,#b6f24a,#ff6b82,#ffb547,#a68bff)" }}
          aria-hidden={!flipped}
        >
          <p className="text-[0.62rem] font-semibold uppercase tracking-wider">Secret · the back side</p>
          <div>
            <p className="text-sm font-semibold leading-tight">Curiosity</p>
            <p className="mt-1 text-[0.68rem] leading-snug">What started every project here. Tap to turn back.</p>
          </div>
        </div>
      </div>
    </Widget>
  );
}

type Line = { kind: "in" | "out" | "err"; text: string };

const INTRO: Line[] = [
  { kind: "in", text: "whoami" },
  { kind: "out", text: "saharsh, full stack engineer @ dealermatix" },
  { kind: "out", text: "type 'help' to look around" },
];

const HELP = [
  "help              this list",
  "whoami · about    who I am",
  "ls                what's on this desktop",
  "skills            my stack",
  "projects          case studies",
  "open <thing>      work · experience · stack · contact · a project",
  "play <game>       refract · bug-hunt · stack-match",
  "resume            download my résumé",
  "theme             toggle light / dark",
  "date · clear      the usual",
];

const GAMES = ["refract", "bug-hunt", "stack-match"];

/** A terminal that actually listens. */
export function TerminalWidget() {
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const count = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // Type the intro once the widget is in view.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      INTRO.forEach((l, i) => timers.push(window.setTimeout(() => setLines((ls) => [...ls, l]), 450 * (i + 1))));
    });
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const [head, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ").toLowerCase();
    const out: Line[] = [{ kind: "in", text: cmd }];
    const say = (...t: string[]) => t.forEach((x) => out.push({ kind: "out", text: x }));
    const err = (t: string) => out.push({ kind: "err", text: t });

    count.current++;
    if (count.current === 5) unlock("shell");

    switch (head.toLowerCase()) {
      case "help":
        say(...HELP);
        break;
      case "whoami":
      case "about":
        say(
          "Saharsh Wadekar, Full Stack Engineer at DealerMatix (Pune).",
          "React Native · Next.js · .NET · Salesforce Apex.",
          "3,000+ daily users across FMCG, consumer-electronics and industrial brands.",
        );
        break;
      case "ls":
        say("case-studies/  experience/  stack/  arcade/  resume.pdf  secrets.txt");
        break;
      case "cat":
        if (arg.includes("secret")) say("There are 7 secrets. One is a very old code: ↑↑↓↓←→←→ B A", "Another is on the back of a card. Be persistent.");
        else if (arg.includes("resume")) say("Binary file. Try 'resume' instead.");
        else err(`cat: ${arg || "?"}: no such file`);
        break;
      case "skills":
        say("React Native · Next.js · TypeScript · .NET · C#", "Apex · LWC · Flows · PostgreSQL · MySQL · MuleSoft · REST/SOAP");
        break;
      case "projects":
        projects.forEach((p) => say(`${p.slug.padEnd(14)} ${p.kind}`));
        say("open <name> to read one");
        break;
      case "open":
      case "cd": {
        const p = arg ? projects.find((x) => x.slug === arg || x.name.toLowerCase().startsWith(arg)) : undefined;
        const sections: Record<string, string> = { work: "work", "case-studies": "work", experience: "experience", stack: "stack", skills: "stack", github: "more", arcade: "arcade", games: "arcade", contact: "contact" };
        if (sections[arg]) {
          say(`opening ${arg}…`);
          goSection(sections[arg]);
        } else if (p) {
          say(`opening ${p.name}…`);
          navigate(`/work/${p.slug}`);
        } else err(`open: '${arg}' not found. Try 'projects'.`);
        break;
      }
      case "play":
        if (GAMES.includes(arg)) {
          say(`launching ${arg}…`);
          navigate(`/arcade/${arg}`);
        } else say("games: refract · bug-hunt · stack-match");
        break;
      case "resume":
      case "cv":
        say("opening résumé (PDF)…");
        window.open(person.resume, "_blank");
        break;
      case "theme":
        toggleTheme();
        say("appearance toggled");
        break;
      case "date":
        say(new Date().toString());
        break;
      case "clear":
        setLines([]);
        setValue("");
        return;
      case "echo":
        say(rest.join(" "));
        break;
      case "sudo":
        if (arg.startsWith("rm")) err("Nice try. 250+ Apex tests say no.");
        else if (arg.includes("hire")) {
          say("[sudo] password for recruiter: ********", "Permission granted. Opening your mail client…");
          unlock("sudo");
          confetti();
          window.setTimeout(() => (window.location.href = `mailto:${person.email}?subject=Let%27s%20talk`), 900);
        } else say("With great power… try 'sudo hire saharsh'.");
        break;
      case "coffee":
      case "tea":
      case "brew":
        err("HTTP 418: I'm a teapot. (But I run on coffee.)");
        unlock("teapot");
        break;
      case "hire":
        say("Excellent instinct. Now try 'sudo hire saharsh'.");
        break;
      case "exit":
        say("There is no exit. Only more case studies.");
        break;
      case "konami":
        say("↑ ↑ ↓ ↓ ← → ← → B A. Press it anywhere outside this box.");
        break;
      default:
        err(`command not found: ${head}. Type 'help'.`);
        if (count.current === 1) toast("Tip", "The terminal understands 'help'");
    }
    setLines((l) => [...l, ...out].slice(-80));
    setHistory((h) => [cmd, ...h].slice(0, 30));
    setHIdx(-1);
    setValue("");
  };

  return (
    <Widget label="Terminal" className="w-[316px] !bg-[#141416] !p-0 text-[#ece8e1]" onClick={() => input.current?.focus({ preventScroll: true })}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[0.65rem] text-white/40">~/saharsh · zsh</span>
      </div>
      <div ref={box} data-lenis-prevent data-no-drag className="h-[168px] cursor-text space-y-0.5 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed">
        {lines.map((l, i) => (
          <p key={i} className={`whitespace-pre-wrap break-words ${l.kind === "in" ? "text-white/90" : l.kind === "err" ? "text-[#ff8a80]" : "text-white/55"}`}>
            {l.kind === "in" && <span className="text-[#28c840]">→ </span>}
            {l.text}
          </p>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
          }}
          className="flex items-center gap-1.5"
        >
          <span className="text-[#28c840]">→</span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const i = Math.min(hIdx + 1, history.length - 1);
                if (history[i]) {
                  setHIdx(i);
                  setValue(history[i]);
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const i = hIdx - 1;
                setHIdx(Math.max(i, -1));
                setValue(i >= 0 ? history[i] : "");
              }
            }}
            aria-label="Terminal command"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="min-w-0 flex-1 bg-transparent text-white/90 caret-[#28c840] outline-none placeholder:text-white/25"
            placeholder="type help"
          />
        </form>
      </div>
    </Widget>
  );
}
