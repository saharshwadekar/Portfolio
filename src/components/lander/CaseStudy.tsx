import Image from "next/image";
import { projectBySlug, projects, type Project } from "@/content/profile";
import { Tint } from "@/components/layout/Tint";
import { ProjectGlyph } from "@/components/ui/ProjectGlyph";
import { TLink } from "@/components/ui/TLink";

/** Left-to-right boxes showing how the pieces of a project connect. */
function Flow({ flow }: { flow: NonNullable<Project["flow"]> }) {
  return (
    <figure aria-label="How it fits together" className="rounded-[22px] border border-line bg-surface p-5 shadow-soft sm:p-8">
      <figcaption className="mb-5 text-sm text-muted">How it fits together</figcaption>
      <ol className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        {flow.map((step, i) => (
          <li key={step.label} className="contents">
            {i > 0 && (
              <span className="self-center text-muted" aria-hidden>
                <span className="sm:hidden">↓</span>
                <span className="hidden sm:inline">→</span>
              </span>
            )}
            <div className="flex-1 rounded-[14px] border border-line bg-bg p-4">
              <p className="text-sm font-semibold">{step.label}</p>
              <p className="mt-1 text-xs leading-snug text-muted">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function CaseStudy({ slug }: { slug: string }) {
  const p = projectBySlug[slug];
  const idx = projects.findIndex((x) => x.slug === slug);
  const next = projects[(idx + 1) % projects.length];

  return (
    <article className="lander min-h-[100svh]">
      <Tint area={p.area} />
      <div className="mx-auto max-w-[1040px] px-[var(--gutter)] pb-28 pt-24">
        <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-sm text-muted">
          <TLink href="/" className="hover:text-fg">
            Home
          </TLink>
          <span aria-hidden>/</span>
          <TLink href="/#work" className="hover:text-fg">
            Case studies
          </TLink>
          <span aria-hidden>/</span>
          <span className="text-fg">{p.name}</span>
        </nav>

        <header>
          <p className="text-sm text-muted">
            {p.kind} · {p.period}
          </p>
          <h1 className="mt-2 type-hero">{p.name}</h1>
          <p className="mt-6 max-w-[62ch] type-subhead text-muted">{p.summary}</p>
          {p.context === "work" && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              Office work at DealerMatix. A team product: everything below is the part I built. No client data or code is shown.
            </p>
          )}
          {p.links && (
            <div className="mt-8 flex flex-wrap gap-3">
              {p.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-fg px-5 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-85"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </header>

        <dl data-reveal className="mt-10 grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-2">
          {[
            ["My role", p.role],
            ["Stack", p.stack.join(" · ")],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface p-5">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-1 text-sm">{v}</dd>
            </div>
          ))}
        </dl>

        {p.stats.length > 0 && (
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            {p.stats.map((s) => (
              <div key={s.label} className="rounded-[18px] border border-line bg-surface p-5">
                <dd className="text-3xl font-semibold">{s.value}</dd>
                <dt className="mt-1 text-xs text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}

        <div data-reveal className="mt-4">
          {p.diagram ? (
            <figure className="overflow-hidden rounded-[22px] border border-line bg-surface p-3 shadow-soft sm:p-5">
              <Image src={p.diagram.src} alt={p.diagram.alt} width={p.diagram.width} height={p.diagram.height} className="h-auto w-full" unoptimized />
              <figcaption className="mt-3 px-1 text-xs text-muted">{p.diagram.caption}</figcaption>
            </figure>
          ) : p.flow ? (
            <Flow flow={p.flow} />
          ) : (
            <div className="rounded-[22px] border border-line bg-surface px-[8%] py-[5%] text-fg shadow-soft">
              <ProjectGlyph glyph={p.glyph} key={p.slug} className="mx-auto max-w-[600px]" />
            </div>
          )}
        </div>

        <div className="mt-16 space-y-12">
          {p.sections.map((s) => (
            <section key={s.heading} data-reveal className="grid gap-4 md:grid-cols-[220px_1fr] md:gap-10">
              <h2 className="text-xl font-semibold">{s.heading}</h2>
              <div className="max-w-[64ch] space-y-4 text-base">
                {s.body && <p>{s.body}</p>}
                {s.points && (
                  <ul className="space-y-3">
                    {s.points.map((pt) => (
                      <li key={pt} className="grid grid-cols-[1rem_1fr] gap-2">
                        <span className="mt-[0.6em] h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        {p.shots && (
          <section data-reveal aria-label="Screenshots" className="mt-16">
            <h2 className="mb-6 text-xl font-semibold">Screenshots</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {p.shots.map((s) => (
                <figure key={s.src}>
                  <Image src={s.src} alt={s.alt} width={s.width} height={s.height} className="h-auto w-full rounded-[16px] border border-line shadow-soft" />
                  <figcaption className="mt-2 text-xs leading-snug text-muted">{s.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {p.note && (
          <aside data-reveal className="mt-16 rounded-[18px] border border-line bg-surface p-6 text-sm text-muted">
            <p className="mb-1 font-medium text-fg">Worth saying up front</p>
            {p.note}
          </aside>
        )}

        <TLink
          href={`/work/${next.slug}`}
          className="group mt-16 flex items-center justify-between gap-6 rounded-[22px] border border-line bg-surface p-6 shadow-soft transition-shadow hover:shadow-lift sm:p-8"
        >
          <span>
            <span className="block text-sm text-muted">Next case study</span>
            <span className="mt-1 block type-title">{next.name}</span>
          </span>
          <span className="text-2xl text-muted transition-transform group-hover:translate-x-1" aria-hidden>
            →
          </span>
        </TLink>
      </div>
    </article>
  );
}
