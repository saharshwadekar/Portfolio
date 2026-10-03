import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projectBySlug, projects } from "@/content/profile";
import { CaseStudy } from "@/components/lander/CaseStudy";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug[slug];
  if (!p) return {};
  return {
    title: p.name,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: p.name, description: p.summary, url: `/work/${p.slug}` },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug[slug];
  if (!p) notFound();
  return <CaseStudy slug={p.slug} />;
}
