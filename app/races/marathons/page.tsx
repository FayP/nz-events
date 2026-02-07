import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { EventCard } from "../_components/EventCard";
import { FeaturedEventsSection } from "../_components/FeaturedEventsSection";
import { DistanceNav } from "../_components/DistanceNav";
import {
  getMarathonEvents,
  getRegions,
  regionToSlug,
  groupEventsByMonth,
  getFeaturedEvents,
} from "./data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const events = await getMarathonEvents();
  const regions = getRegions(events);
  const year = new Date().getFullYear();

  const regionSnippet =
    regions.length > 2
      ? `from ${regions[0]} to ${regions[regions.length - 1]}`
      : "across the country";

  const description = `Find marathon races across New Zealand in ${year}. Browse ${events.length} upcoming 42.2km events ${regionSnippet}, with dates, distances, and registration links.`;

  return {
    title: "Marathon Races in New Zealand",
    description,
    openGraph: {
      title: "Marathon Races in New Zealand | GoStride",
      description,
      type: "website",
    },
  };
}

export default async function MarathonsPage() {
  const events = await getMarathonEvents();
  const regions = getRegions(events);
  const featuredEvents = getFeaturedEvents(events);
  const featuredIds = new Set(featuredEvents.map((e) => e.id));
  const monthGroups = groupEventsByMonth(events.filter((e) => !featuredIds.has(e.id)));
  const baseUrl = "https://gostride.co.nz";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-8">
        <div className="mb-10">
          <Logo size="lg" />
        </div>

        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li><span className="text-foreground font-medium">Marathons</span></li>
          </ol>
        </nav>

        <div className="mb-8">
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[var(--event-running)] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Running
            </span>
          </div>
          <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Marathon Races in New Zealand
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            Browse {events.length} upcoming 42.2km events across New Zealand, from the
            harbour bridge crossing at the Auckland Marathon to the alpine scenery of
            Queenstown. The marathon offers flat city courses, trail options, and
            world-class finish lines for runners chasing a Boston qualifier or a
            bucket-list experience.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <DistanceNav current="marathon" />

          {regions.length > 0 && (
            <nav aria-label="Filter by region" className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Region:</span>
              <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-foreground text-background">All</span>
              {regions.map((region) => (
                <Link key={region} href={`/races/marathons/${regionToSlug(region)}`} className="px-3 py-1.5 rounded-full text-sm font-medium bg-transparent border border-border text-foreground hover:bg-muted/50 transition-colors">
                  {region}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {events.length} upcoming marathon{events.length !== 1 ? "s" : ""}
          </p>
        </div>

        <FeaturedEventsSection events={featuredEvents} subtitle="Marquee marathons you won't want to miss" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12">
        {events.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No upcoming marathons found. Check back soon for new events!</p>
          </div>
        ) : monthGroups.length > 0 ? (
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Upcoming Marathons</h2>
            {monthGroups.map((group) => (
              <section key={group.label}>
                <h3 className="mb-6 text-xl font-semibold text-foreground">{group.label}</h3>
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

      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="border-t border-border/40 pt-10">
          <h2 className="mb-8 text-3xl font-bold text-foreground tracking-tight">Marathon FAQ</h2>
          <div className="max-w-3xl space-y-8">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">How long does it take to train for a marathon?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Most marathon training plans run 16&ndash;20 weeks, assuming you already have a solid running base of around 30&ndash;40 kilometres per week. If you&apos;re coming from a half marathon, 16 weeks is typical. Complete beginners should plan for 6&ndash;12 months to safely build up the distance, often running a half marathon as a stepping stone along the way.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">What is a good marathon time for a first-timer?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                The average finish time for a first marathon in New Zealand is around 4 hours 30 minutes to 5 hours. Anything under 4 hours is a strong result for a first attempt. The most important goal for your first marathon is to finish feeling good&mdash;you can chase a faster time next time. Most NZ marathons have cutoff times between 6 and 7 hours.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">Which is the best marathon in New Zealand?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                The Auckland Marathon is the largest in the country and features an iconic harbour bridge crossing. The Queenstown International Marathon is consistently rated one of the most scenic marathons in the world, with lakeside and mountain views throughout. The Rotorua Marathon, one of NZ&apos;s oldest, is a flat lakeside course popular for PB attempts. The right choice depends on whether you prioritise scenery, speed, or atmosphere.
              </p>
            </div>
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: baseUrl }, { "@type": "ListItem", position: 2, name: "Marathons", item: `${baseUrl}/races/marathons` }] }) }} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "Marathon Races in New Zealand", numberOfItems: events.length, itemListElement: events.map((event, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "SportsEvent", name: event.name, description: event.description || `${event.name} - a running event in ${event.city}, New Zealand`, startDate: event.startDate.toISOString(), endDate: (event.endDate || event.startDate).toISOString(), eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", eventStatus: "https://schema.org/EventScheduled", image: (event.images as string[] | null)?.[0] || `${baseUrl}/images/fallback-running.jpg`, location: { "@type": "Place", name: event.location, address: { "@type": "PostalAddress", addressLocality: event.city, addressRegion: event.region, addressCountry: "NZ" }, ...(event.latitude && event.longitude && { geo: { "@type": "GeoCoordinates", latitude: event.latitude, longitude: event.longitude } }) }, sport: "Running", url: `${baseUrl}/events/${event.slug}`, ...(event.website && { sameAs: event.website }), organizer: { "@type": "Organization", name: event.organizer || "Event Organizer" } } })) }) }} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "How long does it take to train for a marathon?", acceptedAnswer: { "@type": "Answer", text: "Most marathon training plans run 16–20 weeks, assuming you already have a solid running base of around 30–40 kilometres per week. Complete beginners should plan for 6–12 months." } }, { "@type": "Question", name: "What is a good marathon time for a first-timer?", acceptedAnswer: { "@type": "Answer", text: "The average finish time for a first marathon in New Zealand is around 4 hours 30 minutes to 5 hours. Anything under 4 hours is a strong result for a first attempt." } }, { "@type": "Question", name: "Which is the best marathon in New Zealand?", acceptedAnswer: { "@type": "Answer", text: "The Auckland Marathon is the largest, Queenstown International Marathon is rated one of the most scenic in the world, and Rotorua Marathon is popular for PB attempts on its flat lakeside course." } }] }) }} />

      <Footer />
    </div>
  );
}
