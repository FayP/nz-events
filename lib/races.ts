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

/**
 * Standardized distance labels for display.
 * Maps various formats to a consistent display format.
 */
const DISTANCE_LABEL_MAP: Record<string, string> = {
  // 5K variants
  "5km": "5K",
  "5k": "5K",
  "5 km": "5K",

  // 10K variants
  "10km": "10K",
  "10k": "10K",
  "10 km": "10K",

  // Half marathon variants
  "21km": "Half Marathon",
  "21.1km": "Half Marathon",
  "21k": "Half Marathon",
  "half marathon": "Half Marathon",
  "half-marathon": "Half Marathon",
  "halfmarathon": "Half Marathon",

  // Marathon variants
  "42km": "Marathon",
  "42.2km": "Marathon",
  "42k": "Marathon",
  "marathon": "Marathon",
  "full marathon": "Marathon",
};

/**
 * Normalize a distance label to a standardized display format.
 * E.g., "21km" -> "Half Marathon", "10k" -> "10K"
 */
export function normalizeDistanceLabel(distance: string): string {
  const lower = distance.toLowerCase().trim();

  // Check direct mapping first
  if (DISTANCE_LABEL_MAP[lower]) {
    return DISTANCE_LABEL_MAP[lower];
  }

  // Try partial matches for common patterns
  if (lower.includes("half marathon") || lower.includes("half-marathon")) {
    return "Half Marathon";
  }
  if (lower === "marathon" || (lower.includes("marathon") && !lower.includes("half") && !lower.includes("ultra"))) {
    // Keep specific marathon names like "Queenstown Marathon" as-is
    if (lower === "marathon") return "Marathon";
  }

  // Return original if no mapping found (preserves unique distances like "Miler (160km)")
  return distance;
}

/**
 * Normalize an array of distance labels for display.
 */
export function normalizeDistanceLabels(distances: string[]): string[] {
  return distances.map(normalizeDistanceLabel);
}
