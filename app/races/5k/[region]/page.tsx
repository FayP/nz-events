import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { EventCard } from "../../_components/EventCard";
import { FeaturedEventsSection } from "../../_components/FeaturedEventsSection";
import {
  get5kEvents,
  getRegions,
  regionToSlug,
  groupEventsByMonth,
  getFeaturedEvents,
} from "../data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ region: string }> | { region: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const regionSlug = resolvedParams.region;

  const allEvents = await get5kEvents();
  const regions = getRegions(allEvents);
  const regionName = regions.find((r) => regionToSlug(r) === regionSlug);

  if (!regionName) return {};

  const events = allEvents.filter((e) => e.region === regionName);
  const year = new Date().getFullYear();

  const description = `Find ${events.length} upcoming 5K races in ${regionName}, New Zealand for ${year}. Browse 5km events with dates, distances, and registration links.`;

  return {
    title: `5K Races in ${regionName}, New Zealand`,
    description,
    openGraph: {
      title: `5K Races in ${regionName} | GoStride`,
      description,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  const events = await get5kEvents();
  const regions = getRegions(events);
  return regions.map((region) => ({ region: regionToSlug(region) }));
}

export default async function Region5kPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const regionSlug = resolvedParams.region;

  const allEvents = await get5kEvents();
  const regions = getRegions(allEvents);
  const regionName = regions.find((r) => regionToSlug(r) === regionSlug);

  if (!regionName) {
    notFound();
  }

  const events = allEvents.filter((e) => e.region === regionName);
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
              <Link
                href="/races/5k"
                className="hover:text-foreground transition-colors"
              >
                5K Races
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <span className="text-foreground font-medium">{regionName}</span>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[var(--event-running)] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Running
            </span>
          </div>
          <h1 className="mb-5 text-5xl font-bold text-foreground tracking-tight">
            5K Races in {regionName}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            Upcoming 5K races in the {regionName} region of New Zealand. The
            5km is the most accessible race distance&mdash;achievable for
            almost anyone with a few weeks of preparation, yet fast enough to
            challenge experienced runners chasing a personal best. {regionName}{" "}
            hosts a variety of 5K events year-round, from community fun runs to
            competitive road races. Browse events below, or explore{" "}
            <Link
              href="/races/5k"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              all 5K races across New Zealand
            </Link>
            .
          </p>
        </div>

        {/* Region filters */}
        {regions.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Regions:</span>
            <Link
              href="/races/5k"
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-transparent border border-border text-foreground hover:bg-muted/50 transition-colors"
            >
              All
            </Link>
            {regions.map((region) => (
              <Link
                key={region}
                href={`/races/5k/${regionToSlug(region)}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  region === regionName
                    ? "bg-foreground text-background"
                    : "bg-transparent border border-border text-foreground hover:bg-muted/50"
                }`}
              >
                {region}
              </Link>
            ))}
          </div>
        )}

        {/* Event Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {events.length} upcoming 5K race
            {events.length !== 1 ? "s" : ""} in {regionName}
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
              No upcoming 5K races in {regionName} right now. Browse{" "}
              <Link
                href="/races/5k"
                className="text-foreground underline underline-offset-4 hover:no-underline"
              >
                all 5K races
              </Link>{" "}
              or check back soon.
            </p>
          </div>
        ) : monthGroups.length > 0 ? (
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Upcoming 5K Races in {regionName}
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

      {/* Internal Links */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="border-t border-border/40 pt-10">
          <h2 className="mb-4 text-2xl font-bold text-foreground tracking-tight">
            Explore More Distances
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Looking for a different distance? Browse{" "}
            <Link
              href="/races/10k"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              10K races
            </Link>{" "}
            or{" "}
            <Link
              href="/races/half-marathons"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              half marathons
            </Link>{" "}
            near you. Want to see events in other regions? View{" "}
            <Link
              href="/races/5k"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              all 5K races across New Zealand
            </Link>
            .
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="border-t border-border/40 pt-10">
          <h2 className="mb-8 text-3xl font-bold text-foreground tracking-tight">5K FAQ</h2>
          <div className="max-w-3xl space-y-8">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">How long does it take to train for a 5K?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Most couch-to-5K programmes take 6&ndash;9 weeks, running three times a week. If you&apos;re already active (walking regularly, playing other sports), you may need just 4&ndash;6 weeks to get race-ready. The key is building up running time gradually rather than pushing too hard too soon.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">What is a good 5K time for a beginner?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                For a first-time runner, completing a 5K in 30&ndash;40 minutes is a great achievement. Many people walk portions of their first 5K and still finish in under 45 minutes. With consistent training, most runners can bring their time under 30 minutes within a few months.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">Can I walk a 5K event?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Yes. The vast majority of 5K events in New Zealand welcome walkers alongside runners. Most events have no cutoff time for the 5km distance. Walking a 5K typically takes 45&ndash;60 minutes depending on your pace, and it&apos;s a great way to experience a race-day atmosphere before committing to a running goal.
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
                name: "5K Races",
                item: `${baseUrl}/races/5k`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: regionName,
                item: `${baseUrl}/races/5k/${regionToSlug(regionName)}`,
              },
            ],
          }),
        }}
      />

      {/* Structured Data: ItemList + Event schema */}
      {events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `5K Races in ${regionName}`,
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
      )}

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
                name: "How long does it take to train for a 5K?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most couch-to-5K programmes take 6–9 weeks, running three times a week. If you're already active, you may need just 4–6 weeks.",
                },
              },
              {
                "@type": "Question",
                name: "What is a good 5K time for a beginner?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "For a first-time runner, completing a 5K in 30–40 minutes is a great achievement. With consistent training, most runners can get under 30 minutes within a few months.",
                },
              },
              {
                "@type": "Question",
                name: "Can I walk a 5K event?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. The vast majority of 5K events in New Zealand welcome walkers alongside runners. Most events have no cutoff time for the 5km distance.",
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
