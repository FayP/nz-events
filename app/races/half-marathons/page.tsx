import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { EventCard } from "./EventCard";
import { FeaturedEventsSection } from "./FeaturedEventsSection";
import { DistanceNav } from "../_components/DistanceNav";
import {
  getHalfMarathonEvents,
  getRegions,
  regionToSlug,
  groupEventsByMonth,
  getFeaturedEvents,
} from "./data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const events = await getHalfMarathonEvents();
  const regions = getRegions(events);
  const year = new Date().getFullYear();

  const regionSnippet =
    regions.length > 2
      ? `from ${regions[0]} to ${regions[regions.length - 1]}`
      : "across the country";

  const description = `Find half marathon races across New Zealand in ${year}. Browse ${events.length} upcoming 21.1km events ${regionSnippet}, with dates, distances, and registration links.`;

  return {
    title: "Half Marathon Races in New Zealand",
    description,
    openGraph: {
      title: "Half Marathon Races in New Zealand | GoStride",
      description,
      type: "website",
    },
  };
}

export default async function HalfMarathonsPage() {
  const events = await getHalfMarathonEvents();
  const regions = getRegions(events);
  const featuredEvents = getFeaturedEvents(events);
  const featuredIds = new Set(featuredEvents.map((e) => e.id));
  const monthGroups = groupEventsByMonth(events.filter((e) => !featuredIds.has(e.id)));
  const baseUrl = "https://gostride.co.nz";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-8">
        <div className="mb-10">
          <Logo size="lg" />
        </div>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <span className="text-foreground font-medium">
                Half Marathons
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-8">
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[var(--event-running)] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Running
            </span>
          </div>
          <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Half Marathon Races in New Zealand
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            Browse {events.length} upcoming 21.1km events across New Zealand, from
            Kerikeri&apos;s famously fast downhill course to the alpine scenery of
            Queenstown. The half marathon offers a genuine endurance challenge
            without the months-long training commitment of a full marathon.
          </p>
        </div>

        {/* Navigation filters */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <DistanceNav current="half-marathon" />

          {regions.length > 0 && (
            <nav aria-label="Filter by region" className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Region:</span>
              <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-foreground text-background">
                All
              </span>
              {regions.map((region) => (
                <Link
                  key={region}
                  href={`/races/half-marathons/${regionToSlug(region)}`}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-transparent border border-border text-foreground hover:bg-muted/50 transition-colors"
                >
                  {region}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Event Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {events.length} upcoming half marathon
            {events.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Featured Events */}
        <FeaturedEventsSection events={featuredEvents} />
      </div>

      {/* Events by Month */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        {events.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No upcoming half marathons found. Check back soon for new events!
            </p>
          </div>
        ) : monthGroups.length > 0 ? (
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Upcoming Half Marathons
            </h2>
            {monthGroups.map((group) => (
              <section key={group.label}>
                <h3 className="mb-6 text-xl font-semibold text-foreground">
                  {group.label}
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {group.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="border-t border-border/40 pt-10">
          <h2 className="mb-8 text-3xl font-bold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl space-y-8">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                How long does it take to train for a half marathon?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                It depends on your starting fitness. If you can already run
                comfortably for 45&ndash;60 minutes, most training plans will have
                you race-ready in 8&ndash;12 weeks. Complete beginners should allow
                16&ndash;20 weeks to safely build up the distance. The key is
                consistency&mdash;three to four runs per week with a longer run on
                the weekend, gradually increasing distance by no more than 10% per
                week. Most NZ marathon events publish free training plans on their
                websites closer to race day.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                What is a good half marathon time?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                For a first-timer, finishing is the goal&mdash;most people complete
                their first half marathon in 2:00 to 2:30. An intermediate runner
                might target 1:45 to 2:00, while competitive club runners often aim
                for 1:20 to 1:45. The overall average half marathon finish time in
                New Zealand sits around 2:05 to 2:10. Remember, your first half is
                about completing the distance. You can chase times once you know the
                feeling.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                What is the fastest half marathon course in New Zealand?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                The Kerikeri Half Marathon in Northland is widely considered New
                Zealand&apos;s fastest course. It&apos;s a point-to-point route from
                Okaihau to Kerikeri with roughly 200 metres of net descent over
                21.1km. The course is AIMS-certified, making it eligible for record
                attempts. Mount Maunganui and Christchurch also offer fast, flat
                courses suited to personal bests.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                Do I need to qualify for a half marathon?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                No. Almost all half marathons in New Zealand are open-entry
                events&mdash;you simply register and pay the entry fee. There are no
                qualifying times or prerequisites. Some larger events like the
                Auckland Marathon may have field caps and sell out, so it&apos;s
                worth entering early. A few events require under-16 runners to
                complete a dispensation form.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                What should I eat before a half marathon?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Eat a familiar breakfast 2&ndash;3 hours before your start time.
                Most runners go with something carbohydrate-rich and easy to
                digest&mdash;toast with peanut butter and banana, porridge, or a
                bagel are popular choices. Avoid high-fibre and high-fat foods on
                race morning. The golden rule is nothing new on race day: practise
                your pre-race meal during training runs so your stomach knows what
                to expect.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                What gear do I need for a half marathon?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                At minimum: running shoes you&apos;ve trained in, comfortable running
                clothes, and your race number. Beyond that, a GPS watch is useful
                for pacing, and a cap or sunglasses help in New Zealand&apos;s strong
                UV. For nutrition, most runners carry one or two gels for runs over
                15km. Body Glide or Vaseline on areas prone to chafing is worth the
                30 seconds it takes to apply. Check the weather forecast the night
                before and adjust your clothing&mdash;conditions can vary
                significantly across NZ regions.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                Can I walk a half marathon?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Absolutely. Many NZ half marathon events welcome walkers, and some
                have specific walking categories with prizes. At a brisk walking
                pace of around 7&ndash;8 minutes per kilometre, you&apos;d finish in
                approximately 2:30 to 2:50. Most events have generous course cutoff
                times (typically 3&ndash;3.5 hours) to accommodate walkers. Check the
                specific event&apos;s cutoff time before entering to make sure it
                works for your pace.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                When is half marathon season in New Zealand?
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Half marathons run year-round in New Zealand, but the main season is
                from February to November. The calendar peaks between May and
                September, when most of the major city marathons (which include half
                marathon distances) take place. Summer events tend to be in the
                South Island or at altitude where temperatures are cooler, while
                autumn and winter events are spread across both islands. There&apos;s
                no off-season&mdash;you can find a half marathon in most months of
                the year.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: baseUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Half Marathons",
                item: `${baseUrl}/races/half-marathons`,
              },
            ],
          }),
        }}
      />

      {/* Structured Data: ItemList + Event schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Half Marathon Races in New Zealand",
            numberOfItems: events.length,
            itemListElement: events.map((event, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "SportsEvent",
                name: event.name,
                startDate: event.startDate.toISOString(),
                ...(event.endDate && {
                  endDate: event.endDate.toISOString(),
                }),
                eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                eventStatus: "https://schema.org/EventScheduled",
                location: {
                  "@type": "Place",
                  name: event.location,
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: event.city,
                    addressRegion: event.region,
                    addressCountry: "NZ",
                  },
                  ...(event.latitude &&
                    event.longitude && {
                      geo: {
                        "@type": "GeoCoordinates",
                        latitude: event.latitude,
                        longitude: event.longitude,
                      },
                    }),
                },
                sport: "Running",
                url: `${baseUrl}/events/${event.slug}`,
                ...(event.website && {
                  sameAs: event.website,
                }),
                ...(event.organizer && {
                  organizer: {
                    "@type": "Organization",
                    name: event.organizer,
                  },
                }),
              },
            })),
          }),
        }}
      />

      {/* Structured Data: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How long does it take to train for a half marathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "It depends on your starting fitness. If you can already run comfortably for 45–60 minutes, most training plans will have you race-ready in 8–12 weeks. Complete beginners should allow 16–20 weeks to safely build up the distance. The key is consistency — three to four runs per week with a longer run on the weekend, gradually increasing distance by no more than 10% per week.",
                },
              },
              {
                "@type": "Question",
                name: "What is a good half marathon time?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "For a first-timer, finishing is the goal — most people complete their first half marathon in 2:00 to 2:30. An intermediate runner might target 1:45 to 2:00, while competitive club runners often aim for 1:20 to 1:45. The overall average half marathon finish time in New Zealand sits around 2:05 to 2:10.",
                },
              },
              {
                "@type": "Question",
                name: "What is the fastest half marathon course in New Zealand?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The Kerikeri Half Marathon in Northland is widely considered New Zealand's fastest course. It's a point-to-point route from Okaihau to Kerikeri with roughly 200 metres of net descent over 21.1km. The course is AIMS-certified, making it eligible for record attempts. Mount Maunganui and Christchurch also offer fast, flat courses suited to personal bests.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to qualify for a half marathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Almost all half marathons in New Zealand are open-entry events — you simply register and pay the entry fee. There are no qualifying times or prerequisites. Some larger events like the Auckland Marathon may have field caps and sell out, so it's worth entering early.",
                },
              },
              {
                "@type": "Question",
                name: "What should I eat before a half marathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Eat a familiar breakfast 2–3 hours before your start time. Most runners go with something carbohydrate-rich and easy to digest — toast with peanut butter and banana, porridge, or a bagel are popular choices. Avoid high-fibre and high-fat foods on race morning. The golden rule is nothing new on race day.",
                },
              },
              {
                "@type": "Question",
                name: "What gear do I need for a half marathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "At minimum: running shoes you've trained in, comfortable running clothes, and your race number. Beyond that, a GPS watch is useful for pacing, and a cap or sunglasses help in New Zealand's strong UV. For nutrition, most runners carry one or two gels for runs over 15km. Body Glide or Vaseline on areas prone to chafing is worth the 30 seconds it takes to apply.",
                },
              },
              {
                "@type": "Question",
                name: "Can I walk a half marathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely. Many NZ half marathon events welcome walkers, and some have specific walking categories with prizes. At a brisk walking pace of around 7–8 minutes per kilometre, you'd finish in approximately 2:30 to 2:50. Most events have generous course cutoff times (typically 3–3.5 hours) to accommodate walkers.",
                },
              },
              {
                "@type": "Question",
                name: "When is half marathon season in New Zealand?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Half marathons run year-round in New Zealand, but the main season is from February to November. The calendar peaks between May and September, when most of the major city marathons take place. There's no true off-season — you can find a half marathon in most months of the year.",
                },
              },
            ],
          }),
        }}
      />

      <Footer />
    </div>
  );
}
