import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gostride.co.nz";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/races/half-marathons`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic event pages and region pages
  let eventPages: MetadataRoute.Sitemap = [];
  let regionPages: MetadataRoute.Sitemap = [];

  try {
    const events = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        slug: true,
        updatedAt: true,
        startDate: true,
        region: true,
        eventType: true,
        distances: true,
      },
    });

    eventPages = events
      .filter((event) => event.slug)
      .map((event) => ({
        url: `${baseUrl}/events/${event.slug}`,
        lastModified: event.updatedAt,
        changeFrequency: "weekly" as const,
        priority: event.startDate > new Date() ? 0.9 : 0.6,
      }));

    // Half marathon region pages
    const halfMarathonPatterns = [
      "half marathon",
      "half-marathon",
      "21km",
      "21.1km",
      "21k",
    ];
    const halfMarathonRegions = [
      ...new Set(
        events
          .filter(
            (e) =>
              e.eventType === "RUNNING" &&
              e.startDate > new Date() &&
              e.distances &&
              Array.isArray(e.distances) &&
              (e.distances as string[]).some((d) =>
                halfMarathonPatterns.some((p) => d.toLowerCase().includes(p))
              )
          )
          .map((e) => e.region)
      ),
    ];

    regionPages = halfMarathonRegions.map((region) => ({
      url: `${baseUrl}/races/half-marathons/${region.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching events for sitemap:", error);
  }

  return [...staticPages, ...eventPages, ...regionPages];
}
