import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const polls = await db.poll.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true }
  });
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...polls.map((poll) => ({
      url: `${base}/polls/${poll.slug}`,
      lastModified: poll.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8
    }))
  ];
}
