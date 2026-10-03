import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { gameBySlug, games } from "@/components/game/games";
import { RefractGame } from "@/components/game/RefractGame";
import { BugHunt } from "@/components/game/BugHunt";
import { StackMatch } from "@/components/game/StackMatch";

export const dynamicParams = false;

export function generateStaticParams() {
  return games.map((g) => ({ game: g.slug }));
}

type Params = { params: Promise<{ game: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { game } = await params;
  const g = gameBySlug[game as keyof typeof gameBySlug];
  if (!g) return {};
  return { title: `${g.title} · Arcade`, description: g.blurb, alternates: { canonical: `/arcade/${g.slug}` } };
}

export default async function GamePage({ params }: Params) {
  const { game } = await params;
  if (game === "refract") return <RefractGame />;
  if (game === "bug-hunt") return <BugHunt />;
  if (game === "stack-match") return <StackMatch />;
  notFound();
}
