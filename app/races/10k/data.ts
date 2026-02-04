import { getEventsByDistance } from "@/lib/races";

export {
  regionToSlug,
  getRegions,
  getFeaturedEvents,
  groupEventsByMonth,
  type RunningEvent,
} from "@/lib/races";

const PATTERNS = ["10km", "10k", "10 km"];

export async function get10kEvents() {
  return getEventsByDistance(PATTERNS);
}
