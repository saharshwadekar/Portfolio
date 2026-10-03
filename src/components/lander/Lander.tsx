"use client";

import { useRef, useState } from "react";
import { areaById, education, experience, more, person, projectBySlug, recognition, stack } from "@/content/profile";
import { Tint } from "@/components/layout/Tint";
import { unlock } from "@/lib/achievements";
import { TLink } from "@/components/ui/TLink";
import { Desktop } from "./Desktop";
import { CaseFolders } from "./CaseFolders";
import { Arcade } from "./Arcade";
import { ScrollRail } from "./ScrollRail";

const ICONS: Record<string, { bg: string; path: React.ReactNode }> = {
  Publication: { bg: "#3b82f6", path: <path d="M6 3h9l4 4v14H6Zm9 0v4h4M9 12h7M9 16h7" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" /> },
  Award: { bg: "#8b5cf6", path: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19l1-5.8L3.5 9.2l5.9-.9Z" fill="#fff" /> },
  Scholarship: { bg: "#10b981", path: <path d="m3 9 9-5 9 5-9 5Zm4 2.3V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.7M21 9v6" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" /> },
  Leadership: { bg: "#f43f5e", path: <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3 3-5 6-5s6 2 6 5m0-4.6c.6-.3 1.3-.4 2-.4 3 0 6 2 6 5" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" /> },
  Milestone: { bg: "#f59e0b", path: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-4 9 3 3 5-6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> },
};

function RecognitionRow() {
  return (
    <section id="recognition" aria-label="Recognition" className="px-[var(--gutter)] py-20">
      <div className="mx-auto max-w-[1200px]">
        <h2 data-reveal data-rail-anchor className="mb-8 type-title">Recognition</h2>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
          {recognition.map((r) => {
            const icon = ICONS[r.tag];
            return (
              <li key={r.title} data-reveal>
                <div className="grid aspect-[1.35] place-items-center rounded-[20px] border border-line bg-surface">
                  <span className="grid h-14 w-14 place-items-center rounded-[16px] shadow-soft" style={{ background: icon.bg }}>
                    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
                      {icon.path}
                    </svg>
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold leading-snug">{r.title}</h3>
                <p className="mt-1 text-sm text-muted">{r.body}</p>
                {r.href && (
                  <a href={r.href} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium underline-offset-4 hover:underline">
                    Read on IEEE Xplore ↗
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function ExperienceRow() {
  return (
    <section id="experience" aria-label="Experience" className="px-[var(--gutter)] py-20">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 data-reveal data-rail-anchor className="mb-8 type-headline">
            Experience
          </h2>
          <ol className="space-y-4">
            {experience.map((e) => (
              <li key={e.title} data-reveal className="rounded-[22px] border border-line bg-surface p-6 shadow-soft sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">
                    {e.title} <span className="font-normal text-muted">· {e.company}</span>
                  </h3>
                  <p className="text-sm tabular-nums text-muted">{e.period}</p>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {e.points.map((pt) => (
                    <li key={pt} className="grid grid-cols-[1rem_1fr] gap-2 text-sm sm:text-base">
                      <span className="mt-[0.6em] h-1.5 w-1.5 rounded-full bg-fg/40" aria-hidden />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
        <aside data-reveal className="self-start rounded-[22px] border border-line bg-surface p-6 shadow-soft lg:mt-[4.5rem]">
          <p className="text-xs text-muted">Education · {education.period}</p>
          <h3 className="mt-2 text-lg font-semibold leading-snug">{education.degree}</h3>
          <p className="mt-1 text-sm text-muted">
            {education.school}, {education.city}
          </p>
          <p className="mt-5 text-3xl font-semibold">{education.cgpa}</p>
          <p className="mt-1 text-sm text-muted">{education.note}</p>
        </aside>
      </div>
    </section>
  );
}

function StackRow() {
  return (
    <section id="stack" aria-label="Stack" className="px-[var(--gutter)] py-20">
      <div className="mx-auto max-w-[1200px]">
        <header data-reveal data-rail-anchor className="mb-8">
          <h2 className="type-headline">Stack</h2>
          <p className="mt-3 max-w-[60ch] text-muted">Grouped by layer, and linked to where I used it.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {stack.map((g) => (
            <div key={g.name} data-reveal className="rounded-[22px] border border-line bg-surface p-6 shadow-soft">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <span className="h-2 w-2 rounded-full" style={{ background: areaById[g.area].accent }} aria-hidden />
                {g.name}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <li key={it} className="rounded-full border border-line px-3 py-1 text-sm">
                    {it}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-muted">
                Used in{" "}
                {g.usedIn.map((slug, i) => (
                  <span key={slug}>
                    {i > 0 && (i === g.usedIn.length - 1 ? " and " : ", ")}
                    <TLink href={`/work/${slug}`} className="text-fg underline-offset-4 hover:underline">
                      {projectBySlug[slug].name}
                    </TLink>
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MoreRow() {
  return (
    <section id="more" aria-label="More on GitHub" className="px-[var(--gutter)] py-20">
      <div className="mx-auto max-w-[1200px]">
        <header data-reveal data-rail-anchor className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="type-headline">More on GitHub</h2>
            <p className="mt-3 text-muted">Smaller projects from college: machine learning and a web portal.</p>
          </div>
          <a
            href={person.links.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-fg"
          >
            All repositories ↗
          </a>
        </header>
        <ul className="grid gap-px overflow-hidden rounded-[22px] border border-line bg-line">
          {more.map((m) => {
            const body = (
              <>
                <span className="min-w-0">
                  <span className="block font-semibold">{m.name}</span>
                  <span className="mt-0.5 block text-sm text-muted">{m.blurb}</span>
                </span>
                <span className="flex flex-none items-center gap-4 text-xs text-muted">
                  <span className="hidden sm:inline">{m.stack}</span>
                  {m.href ? <span aria-hidden>↗</span> : <span>No public repo</span>}
                </span>
              </>
            );
            const cls = "flex items-center justify-between gap-6 bg-surface px-5 py-4 sm:px-6";
            return (
              <li key={m.name} data-reveal>
                {m.href ? (
                  <a href={m.href} target="_blank" rel="noreferrer" className={`${cls} transition-colors hover:bg-bg`}>
                    {body}
                  </a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function ContactMin() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      unlock("hello");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${person.email}`;
    }
  };
  return (
    <section id="contact" aria-label="Contact" className="px-[var(--gutter)] pb-40 pt-20">
      <div data-reveal data-rail-anchor className="mx-auto max-w-[1200px] rounded-[28px] bg-surface p-8 shadow-soft sm:p-14">
        <p className="text-sm text-muted">Open to roles and relocation</p>
        <h2 className="mt-3 max-w-[18ch] type-headline">Have something to build? Let&apos;s talk.</h2>
        <p className="mt-5 max-w-[56ch] text-muted">{person.seeking}</p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button onClick={copy} className="rounded-full bg-fg px-5 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-85" data-cursor={copied ? "Copied" : "Copy"}>
            {copied ? "Copied ✓" : person.email}
          </button>
          <a href={person.resume} target="_blank" rel="noreferrer" className="rounded-full border border-line px-5 py-3 text-sm font-medium transition-colors hover:border-fg">
            Résumé (PDF) ↗
          </a>
          <a href={person.links.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-line px-5 py-3 text-sm font-medium transition-colors hover:border-fg">
            LinkedIn ↗
          </a>
          <a href={person.links.github} target="_blank" rel="noreferrer" className="rounded-full border border-line px-5 py-3 text-sm font-medium transition-colors hover:border-fg">
            GitHub ↗
          </a>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-[1200px] text-xs text-muted">
        © 2026 {person.name} · Designed and built by me with Next.js and GSAP · There are a few secrets here
      </p>
    </section>
  );
}

/** The home page: a calm desktop, then the evidence. */
export function Lander() {
  const timeline = useRef<HTMLDivElement>(null);
  return (
    <div className="lander">
      <Tint area={null} />
      <Desktop />
      {/* Everything below the fold hangs off one scroll timeline. */}
      <div ref={timeline} className="relative xl:pl-24">
        <ScrollRail container={timeline} />
        <CaseFolders />
        <ExperienceRow />
        <StackRow />
        <MoreRow />
        <RecognitionRow />
        <Arcade />
        <ContactMin />
      </div>
    </div>
  );
}
