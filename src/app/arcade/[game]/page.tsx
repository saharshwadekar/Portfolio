import { OrbitRush } from "@/components/game/OrbitRush";
import { RelayZero } from "@/components/game/relay/RelayZero";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { gameBySlug } from "@/components/game/games";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ game: "relay-zero" }, { game: "orbit-rush" }];
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
  if (game === "orbit-rush") return <OrbitRush />;
  if (game === "relay-zero") return <RelayZero />;
  notFound();
}
