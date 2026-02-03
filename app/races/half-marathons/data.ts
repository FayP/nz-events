import { prisma } from "@/lib/prisma";

const HALF_MARATHON_PATTERNS = [
  "half marathon",
  "half-marathon",
  "21km",
  "21.1km",
  "21k",
];

/** Canonical spelling for regions with known inconsistencies */
const REGION_ALIASES: Record<string, string> = {
  "Hawkes Bay": "Hawke's Bay",
};

function normalizeRegion(region: string): string {
  return REGION_ALIASES[region] || region;
}

export async function getHalfMarathonEvents() {
  const allRunningEvents = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      eventType: "RUNNING",
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
  });

  return allRunningEvents
    .filter((event) => {
      if (!event.distances || !Array.isArray(event.distances)) return false;
      return (event.distances as string[]).some((d) =>
        HALF_MARATHON_PATTERNS.some((p) => d.toLowerCase().includes(p))
      );
    })
    .map((event) => ({
      ...event,
      region: normalizeRegion(event.region),
    }));
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

export type HalfMarathonEvent = Awaited<ReturnType<typeof getHalfMarathonEvents>>[number];

/** Group events by month, returning entries in chronological order */
export function groupEventsByMonth(events: HalfMarathonEvent[]) {
  const groups: { label: string; events: HalfMarathonEvent[] }[] = [];
  const map = new Map<string, HalfMarathonEvent[]>();

  for (const event of events) {
    const date = new Date(event.startDate);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-NZ", {
      month: "long",
      year: "numeric",
    });

    if (!map.has(key)) {
      const group = { label, events: [] as HalfMarathonEvent[] };
      map.set(key, group.events);
      groups.push(group);
    }
    map.get(key)!.push(event);
  }

  return groups;
}
