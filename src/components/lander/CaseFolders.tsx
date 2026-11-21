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
  const featured = projects[0];
  const remaining = projects.slice(1);

  return (
    <section id="work" aria-label="Selected work" className="selected-work">
      <header data-reveal data-rail-anchor className="work-heading">
        <h2>Selected work<span>.</span></h2>
        <p>Built, shipped, used.</p>
      </header>
      <article className="featured-project" data-reveal>
        <div className="featured-copy">
          <p className="project-kicker">At DealerMatix · Mobile engineering</p>
          <h3>{featured.name}</h3>
          <p className="featured-description">One app. Four brands.<br />Thousands of working days.</p>
          <p className="text-muted">I build the React Native screens and Apex services behind everyday field sales, from offline check-ins to orders and incentives.</p>
          <dl className="featured-stats">
            <div><dt>3,000+</dt><dd>daily users</dd></div>
            <div><dt>4</dt><dd>brands in production</dd></div>
          </dl>
          <TLink href={`/work/${featured.slug}`} className="portfolio-button primary">Explore the case study</TLink>
        </div>
        <div className="system-preview" aria-label="System overview">
          <div className="system-caption"><span>DealerMatix DMS</span><span>System overview</span></div>
          <div className="system-app">
            <div className="app-monogram">D</div>
            <div><strong>In the field</strong><span>React Native · iOS & Android</span></div>
          </div>
          <div className="system-features">
            <span>Visit planning</span><span>Order taking</span><span>Offline check-in</span><span>Incentives</span>
          </div>
          <div className="system-connector" aria-hidden="true" />
          <div className="system-layer"><span>Apex services</span><small>Business rules & verification</small></div>
          <div className="system-connector" aria-hidden="true" />
          <div className="system-layer salesforce"><span>Salesforce</span><small>Brand-specific data & configuration</small></div>
          <p className="system-footer">One codebase, configured for each brand.</p>
        </div>
      </article>
      <div className="secondary-projects">
        {remaining.map((p) => (
          <div key={p.slug}>
            <ProjectFolder p={p} />
            <p className="project-caption">{p.slug === "xmatix" ? "Metadata-driven business modules across web and mobile." : p.slug === "irctc-ticket-helper" ? "A faster booking workflow, built as a Chrome extension." : "Create Salesforce quotes directly from an Excel sheet."}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
