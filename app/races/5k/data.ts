import { getEventsByDistance } from "@/lib/races";

export {
  regionToSlug,
  getRegions,
  getFeaturedEvents,
  groupEventsByMonth,
  type RunningEvent,
} from "@/lib/races";

const PATTERNS = ["5km", "5k", "5 km"];

export async function get5kEvents() {
  return getEventsByDistance(PATTERNS);
}
