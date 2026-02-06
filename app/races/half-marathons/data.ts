import { getEventsByDistance, regionToSlug } from "@/lib/races";

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

/**
 * Events to exclude from half marathon listings.
 * These are ultra/trail events that happen to have a 21km option but aren't
 * primarily half marathon events.
 */
const EXCLUDED_SLUGS = [
  "tarawera-ultra-trail-by-utmb",
];

export async function getHalfMarathonEvents() {
  const events = await getEventsByDistance(HALF_MARATHON_PATTERNS);
  return events.filter((e) => !EXCLUDED_SLUGS.includes(e.slug));
}

/** Region-specific intro copy for SEO */
export const REGION_INTRO_COPY: Record<string, string> = {
  auckland: `Auckland's half marathon scene centres on the city's biggest running event — the Auckland Marathon, which includes a half marathon starting in Devonport and crossing the Harbour Bridge, the only time of year runners get to do so. The course rolls through the North Shore and finishes at Victoria Park, with thousands of runners and big-event atmosphere. It's one of New Zealand's most iconic half marathon experiences and regularly sells out. If you're looking for a fast, well-supported half marathon in the upper North Island, Auckland is hard to beat.`,

  "bay-of-plenty": `The Bay of Plenty offers some of New Zealand's most scenic half marathon courses, with Mount Maunganui's flat, fast coastal loop a standout for anyone chasing a personal best. The course wraps around the base of Mauao with ocean views for much of the distance — and the beach is right there for a post-race cool-down. Further inland, Rotorua's marathon event includes a half marathon option set against the volcanic lakefront. With warm, settled weather through the season, this region is ideal for runners who want a fast course and a weekend away.`,

  canterbury: `Christchurch hosts one of the country's fastest-growing marathon events, with a half marathon course that's flat, fast, and runs through the heart of the rebuilt city. The course follows the Avon River and is well-supported with enthusiastic crowds. Canterbury's wide-open terrain makes for predictably flat courses, which is great news if you're training to a target time. The region also hosts smaller trail and off-road events in the surrounding hill country for runners after something more rugged.`,

  gisborne: `Gisborne's half marathon scene is built around the local harriers club, offering a more intimate, community-driven race experience. The Gisborne Harriers Half Marathon is a well-organised event with a loyal following — expect a relaxed atmosphere, friendly volunteers, and a course that showcases the East Cape landscape. It's a great option if you prefer smaller fields and a genuine club feel over the big-city events.`,

  "hawkes-bay": `Hawke's Bay is home to one of New Zealand's most popular half marathon weekends, combining a well-organised race with the region's famous food and wine scene. The course runs through Napier on a mix of cycle trails and country roads, passing orchards and vineyards along the way. The finish line festival is a real highlight — think local wine, artisan food, and live music. If you want a half marathon that doubles as a weekend away with great post-race dining, Hawke's Bay is hard to beat.`,

  nelson: `The Nelson Striders Half Marathon offers a small-field, well-run race in one of New Zealand's sunniest regions. Nelson's compact size means you're never far from cafes, craft breweries, and the waterfront. The course showcases the region's mix of coast and countryside. If you're combining a race with a holiday at the top of the South Island, this is a solid pick — and the weather in Nelson is usually on your side.`,

  northland: `Northland's star event is the Kerikeri Half Marathon, widely regarded as New Zealand's fastest half marathon course. The point-to-point route starts at Okaihau and drops roughly 200 metres over 21.1km of rolling countryside before finishing at the Kerikeri Domain. It's an AIMS-certified course, making it eligible for record attempts and qualifying times. The post-race street party with live music and local food is legendary. If you're after a PB, this is the course to do it on.`,

  otago: `Otago offers two very different half marathon experiences. The Queenstown Marathon event includes a half marathon that winds through some of the most dramatic scenery in the country — think lakefront trails, mountain backdrops, and riverside paths. It's a bucket-list race for many New Zealand runners. In Dunedin, the marathon event features a two-lap half marathon course through the city centre, keeping spectators close to the action throughout. Both events draw strong fields and are well worth the trip south.`,

  taranaki: `The Taranaki Off-Road Half Marathon offers something different — a trail-based 21km course near New Plymouth with the volcanic cone of Taranaki Maunga as your backdrop. This one suits runners who prefer dirt over tarmac, with varied terrain through farmland and bush tracks. The region's Coastal Walkway and surrounding trails make it a great destination for a running weekend, with plenty of flat, scenic routes for pre-race shakeout runs along the coast.`,

  wellington: `Wellington has two major half marathon events. Round the Bays in February is one of New Zealand's oldest and largest fun runs, with a half marathon distance along the waterfront from Frank Kitts Park — it's a great early-season goal. Later in the year, the Gazley Volkswagen Wellington Marathon includes a half marathon course from Sky Stadium through the city's waterfront and southern suburbs. Wellington's compact, walkable city centre and excellent café scene make it easy to combine race day with a weekend in the capital.`,
};

/** Get intro copy for a region, falling back to generic if not found */
export function getRegionIntroCopy(regionName: string): string | null {
  const slug = regionToSlug(regionName);
  return REGION_INTRO_COPY[slug] || null;
}
