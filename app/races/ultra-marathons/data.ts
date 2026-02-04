import { getEventsByDistance } from "@/lib/races";

export {
  regionToSlug,
  getRegions,
  getFeaturedEvents,
  groupEventsByMonth,
  type RunningEvent,
} from "@/lib/races";

const PATTERNS = [
  "ultra",
  "50km",
  "50k",
  "100km",
  "100k",
  "60km",
  "80km",
  "100 mile",
  "160km",
];

export async function getUltraEvents() {
  return getEventsByDistance(PATTERNS);
}
