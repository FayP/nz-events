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
    {
      url: `${baseUrl}/races/marathons`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/races/10k`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/races/5k`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/races/ultra-marathons`,
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

    // Region pages for each distance category
    const slugify = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const runningEvents = events.filter(
      (e) =>
        e.eventType === "RUNNING" &&
        e.startDate > new Date() &&
        e.distances &&
        Array.isArray(e.distances)
    );

    const distanceCategories: { path: string; patterns: string[] }[] = [
      { path: "half-marathons", patterns: ["half marathon", "half-marathon", "21km", "21.1km", "21k"] },
      { path: "marathons", patterns: ["marathon", "42km", "42.2km", "42k"] },
      { path: "10k", patterns: ["10km", "10k", "10 km"] },
      { path: "5k", patterns: ["5km", "5k", "5 km"] },
      { path: "ultra-marathons", patterns: ["ultra", "50km", "50k", "100km", "100k", "60km", "80km", "100 mile", "160km"] },
    ];

    for (const cat of distanceCategories) {
      const matchingRegions = [
        ...new Set(
          runningEvents
            .filter((e) =>
              (e.distances as string[]).some((d) =>
                cat.patterns.some((p) => d.toLowerCase().includes(p))
              )
            )
            .map((e) => e.region)
        ),
      ];

      for (const region of matchingRegions) {
        regionPages.push({
          url: `${baseUrl}/races/${cat.path}/${slugify(region)}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching events for sitemap:", error);
  }

  return [...staticPages, ...eventPages, ...regionPages];
}
