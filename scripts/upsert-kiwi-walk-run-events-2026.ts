import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

config({ path: resolve(process.cwd(), ".env.local"), override: true });
config({ path: resolve(process.cwd(), ".env"), override: false });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local or .env.");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

type KiwiEventSeed = {
  name: string;
  slug: string;
  description: string;
  startDateUtc: string;
  location: string;
  city: string;
  region: string;
  website: string;
  registrationUrl: string;
  distances: string[];
  image: string;
  courseTerrain?: string;
  courseSurface?: string;
  highlights?: string[];
};

const ORGANIZER = "SMC Events";
const ORGANIZER_WEBSITE = "https://kiwiwalkrun.co.nz";

const SEEDS: KiwiEventSeed[] = [
  {
    name: "Redwoods Trail, Rotorua",
    slug: "redwoods-trail-rotorua",
    description:
      "A trail event through Rotorua's Redwoods with short, mid, and long course options on flowing forest trails.",
    startDateUtc: "2026-03-27T20:00:00.000Z", // 9:00am NZDT
    location: "Rotorua Redwoods (Whakarewarewa Forest)",
    city: "Rotorua",
    region: "Bay of Plenty",
    website: "https://kiwiwalkrun.co.nz/event/redwoods-trail-rotorua/",
    registrationUrl:
      "https://raceroster.com/events/2026/112145/redwoods-trail-rotorua-2026",
    distances: ["7km", "10.3km", "14.5km"],
    image: "https://kiwiwalkrun.co.nz/wp-content/uploads/2025/10/11.jpg",
    courseTerrain: "Forest trail",
    courseSurface: "Mixed trails",
    highlights: ["Redwoods forest trails", "Short to long course options"],
  },
  {
    name: "Hutt River Trail, Wellington",
    slug: "hutt-river-trail-wellington",
    description:
      "A riverside trail event in Upper Hutt with short, mid, and long course options along the Hutt River corridor.",
    startDateUtc: "2026-04-17T21:00:00.000Z", // 9:00am NZST
    location: "Awakairangi Park",
    city: "Upper Hutt",
    region: "Wellington",
    website: "https://kiwiwalkrun.co.nz/event/hutt-river-trail-wellington/",
    registrationUrl:
      "https://raceroster.com/events/2026/112146/hutt-river-trail-wellington-2026",
    distances: ["7km", "10km", "14km"],
    image: "https://kiwiwalkrun.co.nz/wp-content/uploads/2025/10/XXXXXX-1.jpg",
    courseTerrain: "Flat",
    courseSurface: "Mixed (trail and pathway)",
    highlights: ["Riverside trail", "Suitable for all abilities"],
  },
  {
    name: "Walk n' Wag, Auckland",
    slug: "walk-n-wag-auckland",
    description:
      "Auckland's Walk n' Wag event at Omana Regional Park with dog-friendly course options from short to long.",
    startDateUtc: "2026-05-08T21:00:00.000Z", // 9:00am NZST
    location: "Omana Regional Park",
    city: "Auckland",
    region: "Auckland",
    website: "https://kiwiwalkrun.co.nz/event/walk-n-wag/",
    registrationUrl:
      "https://raceroster.com/events/2026/112148/walk-n-wag-auckland-2026",
    distances: ["1.5km", "5.5km", "9km"],
    image: "https://kiwiwalkrun.co.nz/wp-content/uploads/2025/10/14-1.jpg",
    courseTerrain: "Mixed",
    courseSurface: "30% pavement, 20% gravel, 50% forest trail",
    highlights: ["Dog-friendly format", "Regional park trails"],
  },
  {
    name: "McLeans Forest Trail, Christchurch",
    slug: "mcleans-forest-trail-christchurch",
    description:
      "A Christchurch trail event at McLeans Island with forest and riverside sections across three course lengths.",
    startDateUtc: "2026-05-22T21:00:00.000Z", // 9:00am NZST
    location: "McLeans Island",
    city: "Christchurch",
    region: "Canterbury",
    website: "https://kiwiwalkrun.co.nz/event/mcleans-forest-trail/",
    registrationUrl:
      "https://raceroster.com/events/2026/112162/mcleans-forest-trail-christchurch-2026",
    distances: ["5.6km", "10.8km", "16.5km"],
    image:
      "https://kiwiwalkrun.co.nz/wp-content/uploads/2025/12/Jay-French-Aramex-Kiwi-Walk-Run-3136-3.jpg",
    courseTerrain: "Forest and riverside",
    courseSurface: "85% well-formed track/forestry road, 15% river stone pathways",
    highlights: ["Pine forest sections", "Waimakariri River views"],
  },
  {
    name: "Tongariro River Trail, Turangi-Taupo",
    slug: "tongariro-river-trail-turangi-taupo",
    description:
      "A trail event on Tongariro River tracks through native forest and DOC trail sections near Turangi.",
    startDateUtc: "2026-09-11T21:00:00.000Z", // 9:00am NZST
    location: "Tongariro River Trail",
    city: "Turangi",
    region: "Waikato",
    website: "https://kiwiwalkrun.co.nz/event/tongariro-river-trail/",
    registrationUrl:
      "https://raceroster.com/events/2026/112150/tongariro-river-trail-turangi-taupo-2026",
    distances: ["5km", "11.2km", "14.5km"],
    image: "https://kiwiwalkrun.co.nz/wp-content/uploads/2025/10/15.jpg",
    courseTerrain: "River trail",
    courseSurface: "Trail and DOC track",
    highlights: ["Tongariro River course", "Native forest sections"],
  },
  {
    name: "Botanic Gardens Trail, Auckland",
    slug: "botanic-gardens-trail-auckland",
    description:
      "Auckland trail event combining Botanic Gardens pathways and Totara Park bush trail segments.",
    startDateUtc: "2026-09-25T21:00:00.000Z", // 9:00am NZST
    location: "Auckland Botanic Gardens",
    city: "Auckland",
    region: "Auckland",
    website: "https://kiwiwalkrun.co.nz/event/botanic-gardens-trail/",
    registrationUrl:
      "https://raceroster.com/events/2026/112154/botanic-gardens-trail-auckland-2026",
    distances: ["5km", "10.8km", "14.5km"],
    image: "https://kiwiwalkrun.co.nz/wp-content/uploads/2025/10/16.jpg",
    courseTerrain: "Mixed",
    courseSurface: "Gardens pathway and bush trail",
    highlights: ["Botanic Gardens route", "Totara Park sections"],
  },
  {
    name: "McLaren Falls Trail, Tauranga",
    slug: "mclaren-falls-trail-tauranga",
    description:
      "A Tauranga trail event through McLaren Falls Regional Park with forest tracks and lake views.",
    startDateUtc: "2026-10-02T20:00:00.000Z", // 9:00am NZDT
    location: "McLaren Falls Regional Park",
    city: "Tauranga",
    region: "Bay of Plenty",
    website: "https://kiwiwalkrun.co.nz/event/mclaren-falls-trail/",
    registrationUrl:
      "https://raceroster.com/events/2026/109753/mclaren-falls-trail-tauranga-2026",
    distances: ["5km", "10km", "14.5km"],
    image: "https://kiwiwalkrun.co.nz/wp-content/uploads/2025/10/17.jpg",
    courseTerrain: "Forest trail",
    courseSurface: "Well-formed trail",
    highlights: ["Regional park trails", "Lake and forest scenery"],
  },
  {
    name: "Vineyard Vista Trail, Hawke's Bay",
    slug: "vineyard-vista-trail-hawkes-bay",
    description:
      "A Hawke's Bay trail event starting at Black Barn Vineyards with mixed vineyard and rural terrain.",
    startDateUtc: "2026-10-09T20:00:00.000Z", // 9:00am NZDT
    location: "Black Barn Vineyards",
    city: "Havelock North",
    region: "Hawke's Bay",
    website: "https://kiwiwalkrun.co.nz/event/vineyard-vista-trail/",
    registrationUrl:
      "https://raceroster.com/events/2026/112159/vineyard-vista-trail-hawkes-bay-2026",
    distances: ["5.8km", "12.3km", "14.5km"],
    image: "https://kiwiwalkrun.co.nz/wp-content/uploads/2025/10/18.jpg",
    courseTerrain: "Rolling",
    courseSurface: "Mixed (gravel, vineyard trail, rural road)",
    highlights: ["Vineyard course", "Rural and trail mix"],
  },
  {
    name: "Trek the Forest, Rotorua",
    slug: "trek-the-forest-rotorua",
    description:
      "A Rotorua forest event around Lake Tikitapu and Whakarewarewa trail networks with three distance options.",
    startDateUtc: "2026-10-16T20:00:00.000Z", // 9:00am NZDT
    location: "Lake Tikitapu (Blue Lake)",
    city: "Rotorua",
    region: "Bay of Plenty",
    website: "https://kiwiwalkrun.co.nz/event/trek-the-forest/",
    registrationUrl:
      "https://raceroster.com/events/2026/112160/trek-the-forest-rotorua-2026",
    distances: ["5.5km", "13.7km", "15.6km"],
    image: "https://kiwiwalkrun.co.nz/wp-content/uploads/2025/10/19.jpg",
    courseTerrain: "Forest trail",
    courseSurface: "Trail",
    highlights: ["Blue Lake setting", "Whakarewarewa forest sections"],
  },
  {
    name: "Hamilton Gardens Trail, Hamilton",
    slug: "hamilton-gardens-trail-hamilton",
    description:
      "A Hamilton event through Hamilton Gardens and Waikato River trail sections with short, mid, and long options.",
    startDateUtc: "2026-11-06T20:00:00.000Z", // 9:00am NZDT
    location: "Hamilton Gardens",
    city: "Hamilton",
    region: "Waikato",
    website: "https://kiwiwalkrun.co.nz/event/hamilton-gardens-trail/",
    registrationUrl:
      "https://raceroster.com/events/2026/112161/hamilton-gardens-trail-hamilton-2026",
    distances: ["6km", "12.3km", "16.5km"],
    image: "https://kiwiwalkrun.co.nz/wp-content/uploads/2025/10/TBC_-2.jpg",
    courseTerrain: "Mixed",
    courseSurface: "Gardens paths and river trail",
    highlights: ["Hamilton Gardens start/finish", "Waikato River sections"],
  },
];

function toDistanceDetails(distances: string[]) {
  const labels = ["Short Course", "Mid Course", "Long Course"];
  return distances.map((distance, index) => ({
    name: labels[index] || `Option ${index + 1}`,
    distance,
    description: `${labels[index] || "Distance option"} (${distance})`,
  }));
}

async function ensureSlugAvailable(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function upsertKiwiEvent(seed: KiwiEventSeed, dryRun: boolean) {
  const existing = await prisma.event.findFirst({
    where: {
      OR: [
        { slug: seed.slug },
        { website: seed.website },
        { registrationUrl: seed.registrationUrl },
        { name: { equals: seed.name, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      slug: true,
      previousSlugs: true,
      name: true,
    },
  });

  const baseData = {
    name: seed.name,
    description: seed.description,
    eventType: "RUNNING" as const,
    startDate: new Date(seed.startDateUtc),
    endDate: new Date(seed.startDateUtc),
    location: seed.location,
    city: seed.city,
    region: seed.region,
    website: seed.website,
    registrationUrl: seed.registrationUrl,
    organizer: ORGANIZER,
    organizerWebsite: ORGANIZER_WEBSITE,
    distances: seed.distances,
    distanceDetails: toDistanceDetails(seed.distances),
    courseTerrain: seed.courseTerrain,
    courseSurface: seed.courseSurface,
    images: [seed.image],
    highlights: seed.highlights || [],
    status: "PUBLISHED" as const,
    source: "MANUAL" as const,
    verified: true,
    tags: ["kiwi-walk-run-series", "trail", "running"],
    seoTitle: `${seed.name} 2026 | GoStride`,
    seoDescription: seed.description,
  };

  if (existing) {
    const nextSlug = await ensureSlugAvailable(seed.slug, existing.id);
    const previousSlugs =
      existing.slug !== nextSlug
        ? Array.from(new Set([...(existing.previousSlugs || []), existing.slug]))
        : existing.previousSlugs;

    if (dryRun) {
      console.log(`[DRY RUN] update ${existing.name} -> slug=${nextSlug}`);
      return "updated";
    }

    await prisma.event.update({
      where: { id: existing.id },
      data: {
        ...baseData,
        slug: nextSlug,
        previousSlugs,
      },
    });

    console.log(`Updated: ${seed.name}`);
    return "updated";
  }

  const slug = await ensureSlugAvailable(seed.slug);

  if (dryRun) {
    console.log(`[DRY RUN] create ${seed.name} -> slug=${slug}`);
    return "created";
  }

  await prisma.event.create({
    data: {
      ...baseData,
      slug,
    },
  });

  console.log(`Created: ${seed.name}`);
  return "created";
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(
    `Upserting ${SEEDS.length} Kiwi Walk & Run events (2026)${
      dryRun ? " [dry run]" : ""
    }...`
  );

  let created = 0;
  let updated = 0;

  for (const seed of SEEDS) {
    const result = await upsertKiwiEvent(seed, dryRun);
    if (result === "created") created += 1;
    if (result === "updated") updated += 1;
  }

  console.log(`Done. Created: ${created}, Updated: ${updated}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
