import { prisma } from "@/lib/prisma";

/** Canonical spelling for regions with known inconsistencies */
const REGION_ALIASES: Record<string, string> = {
  "Hawkes Bay": "Hawke's Bay",
};

function normalizeRegion(region: string): string {
  return REGION_ALIASES[region] || region;
}

/** Fetch all upcoming published running events, with normalized regions */
async function getAllRunningEvents() {
  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      eventType: "RUNNING",
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
  });

  return events.map((event) => ({
    ...event,
    region: normalizeRegion(event.region),
  }));
}

export type RunningEvent = Awaited<ReturnType<typeof getAllRunningEvents>>[number];

/** Filter events by distance patterns (case-insensitive match on distances array) */
export async function getEventsByDistance(patterns: string[]) {
  const allEvents = await getAllRunningEvents();

  return allEvents.filter((event) => {
    if (!event.distances || !Array.isArray(event.distances)) return false;
    return (event.distances as string[]).some((d) =>
      patterns.some((p) => d.toLowerCase().includes(p))
    );
  });
}

/**
 * For marathon filtering, we need to match "marathon" but exclude
 * "half marathon" and "ultra marathon" to avoid false positives.
 */
export async function getMarathonEvents() {
  const allEvents = await getAllRunningEvents();

  return allEvents.filter((event) => {
    if (!event.distances || !Array.isArray(event.distances)) return false;
    return (event.distances as string[]).some((d) => {
      const lower = d.toLowerCase();
      return (
        (lower.includes("marathon") || lower.includes("42km") || lower.includes("42.2km") || lower.includes("42k")) &&
        !lower.includes("half") &&
        !lower.includes("ultra") &&
        !lower.includes("21km") &&
        !lower.includes("21.1km")
      );
    });
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

export function getFeaturedEvents(events: RunningEvent[]) {
  return events.filter((e) => e.featured);
}

/** Group events by month, returning entries in chronological order */
export function groupEventsByMonth(events: RunningEvent[]) {
  const groups: { label: string; events: RunningEvent[] }[] = [];
  const map = new Map<string, RunningEvent[]>();

  for (const event of events) {
    const date = new Date(event.startDate);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-NZ", {
      month: "long",
      year: "numeric",
    });

    if (!map.has(key)) {
      const group = { label, events: [] as RunningEvent[] };
      map.set(key, group.events);
      groups.push(group);
    }
    map.get(key)!.push(event);
  }

  return groups;
}
