import { TLink } from "@/components/ui/TLink";

export default function NotFound() {
  return (
    <section className="lander grid min-h-[100svh] place-items-center px-[var(--gutter)] pt-12">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[22px] border border-line bg-surface shadow-lift">
        <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-auto text-xs text-muted">Finder</span>
        </div>
        <div className="p-8 text-center">
          <svg viewBox="0 0 64 50" className="mx-auto h-16 w-20" aria-hidden>
            <path d="M4 8a4 4 0 0 1 4-4h14.5a4 4 0 0 1 3.1 1.5L29 10h27a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" fill="var(--line)" />
            <path d="M4 16a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" fill="var(--faint)" />
            <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--surface)">404</text>
          </svg>
          <h1 className="mt-5 text-2xl font-semibold">This file isn&apos;t in the cabinet.</h1>
          <p className="mt-2 text-sm text-muted">It may have been moved, renamed, or never shipped. Unlike my Apex classes, it has no test coverage.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <TLink href="/" className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg">
              Back home
            </TLink>
            <TLink href="/arcade/bug-hunt" className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-fg">
              Squash some bugs instead
            </TLink>
          </div>
        </div>
      </div>
    </section>
  );
}
