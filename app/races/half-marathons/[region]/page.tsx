import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { EventCard } from "../EventCard";
import { FeaturedEventsSection } from "../FeaturedEventsSection";
import {
  getHalfMarathonEvents,
  getRegions,
  regionToSlug,
  groupEventsByMonth,
  getFeaturedEvents,
  getRegionIntroCopy,
} from "../data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ region: string }> | { region: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const regionSlug = resolvedParams.region;

  const allEvents = await getHalfMarathonEvents();
  const regions = getRegions(allEvents);
  const regionName = regions.find((r) => regionToSlug(r) === regionSlug);

  if (!regionName) return {};

  const events = allEvents.filter((e) => e.region === regionName);
  const year = new Date().getFullYear();

  const description = `Find ${events.length} upcoming half marathon races in ${regionName}, New Zealand for ${year}. Browse 21.1km events with dates, distances, and registration links.`;

  return {
    title: `Half Marathon Races in ${regionName}, New Zealand`,
    description,
    openGraph: {
      title: `Half Marathon Races in ${regionName} | GoStride`,
      description,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  const events = await getHalfMarathonEvents();
  const regions = getRegions(events);
  return regions.map((region) => ({ region: regionToSlug(region) }));
}

export default async function RegionHalfMarathonsPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const regionSlug = resolvedParams.region;

  const allEvents = await getHalfMarathonEvents();
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
  const regionIntro = getRegionIntroCopy(regionName);

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
                href="/races/half-marathons"
                className="hover:text-foreground transition-colors"
              >
                Half Marathons
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
            Half Marathon Races in {regionName}
          </h1>
          <div className="max-w-3xl text-base leading-relaxed text-muted-foreground space-y-4">
            {regionIntro ? (
              <p>{regionIntro}</p>
            ) : (
              <p>
                Upcoming half marathon races in the {regionName} region of New
                Zealand. The 21.1km half marathon is one of NZ&apos;s most popular
                race distances, offering a genuine endurance challenge that suits
                both experienced runners chasing a personal best and newcomers
                stepping up from 10K for the first time.
              </p>
            )}
            <p>
              Browse events below with dates, distances, and registration details,
              or explore{" "}
              <Link
                href="/races/half-marathons"
                className="text-foreground underline underline-offset-4 hover:no-underline"
              >
                all half marathons across New Zealand
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Region filters */}
        {regions.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Regions:</span>
            <Link
              href="/races/half-marathons"
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-transparent border border-border text-foreground hover:bg-muted/50 transition-colors"
            >
              All
            </Link>
            {regions.map((region) => (
              <Link
                key={region}
                href={`/races/half-marathons/${regionToSlug(region)}`}
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
            {events.length} upcoming half marathon
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
              No upcoming half marathons in {regionName} right now. Browse{" "}
              <Link
                href="/races/half-marathons"
                className="text-foreground underline underline-offset-4 hover:no-underline"
              >
                all half marathons
              </Link>{" "}
              or check back soon.
            </p>
          </div>
        ) : monthGroups.length > 0 ? (
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Upcoming Half Marathons in {regionName}
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
            Looking for a shorter race? Browse{" "}
            <Link
              href="/"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              all running events in New Zealand
            </Link>{" "}
            to find 5K and 10K options near you. Want to see events in other
            regions? View{" "}
            <Link
              href="/races/half-marathons"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              all half marathons across New Zealand
            </Link>
            .
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="border-t border-border/40 pt-10">
          <h2 className="mb-8 text-3xl font-bold text-foreground tracking-tight">Half Marathon FAQ</h2>
          <div className="max-w-3xl space-y-8">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">How long does it take to train for a half marathon?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Most training plans run between 10 and 16 weeks, depending on your starting fitness. If you can comfortably run 5&ndash;10 kilometres, a 12-week plan is a common choice. Complete beginners should allow closer to 16&ndash;20 weeks to build a safe base. The key is consistency&mdash;three to four runs per week with one longer run on the weekend&mdash;rather than high mileage.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">What&apos;s the fastest half marathon course in New Zealand?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                The Kerikeri Half Marathon is widely regarded as the fastest course in the country thanks to its net-downhill profile, dropping around 200 metres over 21.1 kilometres through Northland orchards and countryside. The Christchurch Marathon half is another fast option with its flat, sea-level course. Auckland&apos;s half marathon also attracts PB-chasers, particularly when conditions are cool.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">Do I need to qualify for a half marathon?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                No. Almost every half marathon in New Zealand is open-entry&mdash;you simply register and pay the entry fee. There are no qualifying times or previous race requirements. Some popular events like the Auckland Marathon and Queenstown International Marathon can sell out, so entering early is recommended.
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
              {
                "@type": "ListItem",
                position: 3,
                name: regionName,
                item: `${baseUrl}/races/half-marathons/${regionToSlug(regionName)}`,
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
              name: `Half Marathon Races in ${regionName}`,
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
                name: "How long does it take to train for a half marathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most training plans run between 10 and 16 weeks, depending on your starting fitness. If you can comfortably run 5–10 kilometres, a 12-week plan is a common choice. Complete beginners should allow closer to 16–20 weeks to build a safe base.",
                },
              },
              {
                "@type": "Question",
                name: "What's the fastest half marathon course in New Zealand?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The Kerikeri Half Marathon is widely regarded as the fastest course in the country thanks to its net-downhill profile, dropping around 200 metres over 21.1 kilometres. The Christchurch Marathon half and Auckland half marathon are also fast, flat options.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to qualify for a half marathon?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Almost every half marathon in New Zealand is open-entry — you simply register and pay the entry fee. There are no qualifying times or previous race requirements. Some popular events can sell out, so entering early is recommended.",
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
