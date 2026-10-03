import type { MetadataRoute } from "next";
import { projects } from "@/content/profile";
import { games } from "@/components/game/games";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, priority: 1 },
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}`, lastModified: now, priority: 0.8 })),
    ...games.map((g) => ({ url: `${site.url}/arcade/${g.slug}`, lastModified: now, priority: 0.3 })),
  ];
}
