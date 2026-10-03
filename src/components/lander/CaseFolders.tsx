"use client";

import type { ReactNode } from "react";
import { areaById, projects, type Project } from "@/content/profile";
import { ProjectGlyph } from "@/components/ui/ProjectGlyph";
import { TLink } from "@/components/ui/TLink";

interface FolderProps {
  href?: string;
  onClick?: () => void;
  title: string;
  tag: string;
  meta?: string;
  tint: string;
  sheets: [ReactNode, ReactNode, ReactNode];
}

/**
 * A case file: a folder with three sheets tucked inside and a frosted
 * front pocket. On hover the sheets rise and fan out.
 */
function Folder({ href, onClick, title, tag, meta, tint, sheets }: FolderProps) {
  const inner = (
    <>
      {/* Back panel with tab */}
      <div className="absolute inset-x-0 bottom-0 top-3 rounded-[22px] bg-surface shadow-soft" />
      <div className="absolute left-0 top-0 h-8 w-[38%] rounded-t-[16px] bg-surface" />

      {/* Sheets */}
      <div className="absolute inset-x-[12%] bottom-[34%] top-[9%]">
        <div className="folder-sheet folder-sheet-l" style={{ background: `color-mix(in oklab, ${tint} 22%, var(--bg))` }}>
          {sheets[0]}
        </div>
        <div className="folder-sheet folder-sheet-r" style={{ background: `color-mix(in oklab, ${tint} 12%, var(--bg))` }}>
          {sheets[2]}
        </div>
        <div className="folder-sheet folder-sheet-c">{sheets[1]}</div>
      </div>

      {/* Front pocket */}
      <div className="folder-pocket absolute inset-x-0 bottom-0 flex h-[40%] flex-col justify-end rounded-[22px] border border-line bg-surface/75 p-5 backdrop-blur-xl">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{title}</h3>
            <p className="mt-0.5 truncate text-sm text-muted">{tag}</p>
          </div>
          {meta && <span className="flex-none text-xs text-muted">{meta}</span>}
        </div>
      </div>
    </>
  );
  const cls = "folder group relative block aspect-[1.18] w-full text-left [perspective:900px]";
  return href ? (
    <TLink href={href} className={cls} data-reveal>
      {inner}
    </TLink>
  ) : (
    <button onClick={onClick} className={cls} data-reveal>
      {inner}
    </button>
  );
}

function GlyphSheet({ glyph }: { glyph: Parameters<typeof ProjectGlyph>[0]["glyph"] }) {
  return (
    <div className="flex h-full items-center justify-center p-3 text-fg">
      <ProjectGlyph glyph={glyph} />
    </div>
  );
}

function Lines({ n = 5 }: { n?: number }) {
  return (
    <div className="space-y-1.5 p-3">
      <div className="h-1.5 w-1/2 rounded-full bg-fg/25" />
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-1 rounded-full bg-fg/12" style={{ width: `${90 - ((i * 23) % 40)}%` }} />
      ))}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex h-full flex-col justify-end p-3">
      <p className="text-lg font-semibold leading-none">{value}</p>
      <p className="mt-1 text-[0.55rem] leading-tight text-muted">{label}</p>
    </div>
  );
}

function ProjectFolder({ p }: { p: Project }) {
  const lead = p.stats[0];
  return (
    <Folder
      href={`/work/${p.slug}`}
      title={p.name}
      tag={p.kind}
      meta={p.period.replace(" — Present", "+")}
      tint={areaById[p.area].accent}
      sheets={[
        <Lines key="l" />,
        <GlyphSheet key="g" glyph={p.glyph} />,
        lead ? <Stat key="s" value={lead.value} label={lead.label} /> : <Lines key="s" n={6} />,
      ]}
    />
  );
}

export function CaseFolders() {
  const work = projects.filter((p) => p.context === "work");
  const side = projects.filter((p) => p.context === "side");

  return (
    <section id="work" aria-label="Case studies" className="px-[var(--gutter)] pb-24 pt-16">
      <header data-reveal data-rail-anchor className="mx-auto mb-10 flex max-w-[1200px] flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">The problem, what I built, and what happened</p>
          <h2 className="mt-2 type-headline">Case studies</h2>
        </div>
        <p className="max-w-[40ch] text-sm text-muted">Client names are left out. The work and the numbers are mine.</p>
      </header>

      <div className="mx-auto max-w-[1200px]">
        <h3 data-reveal className="mb-5 text-sm font-medium text-muted">Office work at DealerMatix · team products, my parts</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {work.map((p) => (
            <ProjectFolder key={p.slug} p={p} />
          ))}
        </div>

        <h3 data-reveal className="mb-5 mt-16 text-sm font-medium text-muted">
          Side projects
        </h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {side.map((p) => (
            <ProjectFolder key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
