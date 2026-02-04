import { getEventsByDistance } from "@/lib/races";

export {
  regionToSlug,
  getRegions,
  getFeaturedEvents,
  groupEventsByMonth,
  type RunningEvent as HalfMarathonEvent,
} from "@/lib/races";

const HALF_MARATHON_PATTERNS = [
  "half marathon",
  "half-marathon",
  "21km",
  "21.1km",
  "21k",
];

export async function getHalfMarathonEvents() {
  return getEventsByDistance(HALF_MARATHON_PATTERNS);
}
