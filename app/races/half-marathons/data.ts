import { prisma } from "@/lib/prisma";

const HALF_MARATHON_PATTERNS = [
  "half marathon",
  "half-marathon",
  "21km",
  "21.1km",
  "21k",
];

export async function getHalfMarathonEvents() {
  const allRunningEvents = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      eventType: "RUNNING",
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
  });

  return allRunningEvents.filter((event) => {
    if (!event.distances || !Array.isArray(event.distances)) return false;
    return (event.distances as string[]).some((d) =>
      HALF_MARATHON_PATTERNS.some((p) => d.toLowerCase().includes(p))
    );
  });
}

export function regionToSlug(region: string): string {
  return region
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getRegions(events: { region: string }[]): string[] {
  return [...new Set(events.map((e) => e.region))].sort();
}
