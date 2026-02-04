import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { EventCard } from "../../_components/EventCard";
import { FeaturedEventsSection } from "../../_components/FeaturedEventsSection";
import {
  getUltraEvents,
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

  const allEvents = await getUltraEvents();
  const regions = getRegions(allEvents);
  const regionName = regions.find((r) => regionToSlug(r) === regionSlug);

  if (!regionName) return {};

  const events = allEvents.filter((e) => e.region === regionName);
  const year = new Date().getFullYear();

  const description = `Find ${events.length} upcoming ultra marathon races in ${regionName}, New Zealand for ${year}. Browse ultra distance events with dates, distances, and registration links.`;

  return {
    title: `Ultra Marathon Races in ${regionName}, New Zealand`,
    description,
    openGraph: {
      title: `Ultra Marathon Races in ${regionName} | GoStride`,
      description,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  const events = await getUltraEvents();
  const regions = getRegions(events);
  return regions.map((region) => ({ region: regionToSlug(region) }));
}

export default async function RegionUltraMarathonsPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const regionSlug = resolvedParams.region;

  const allEvents = await getUltraEvents();
  const regions = getRegions(allEvents);
  const regionName = regions.find((r) => regionToSlug(r) === regionSlug);

  if (!regionName) {
    notFound();
  }

  const events = allEvents.filter((e) => e.region === regionName);
  const featuredEvents = getFeaturedEvents(events);
  const monthGroups = groupEventsByMonth(events);
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
                href="/races/ultra-marathons"
                className="hover:text-foreground transition-colors"
              >
                Ultra Marathons
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
            Ultra Marathons in {regionName}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            Upcoming ultra marathon races in the {regionName} region of New Zealand.
            Browse ultra distance events below, or explore{" "}
            <Link
              href="/races/ultra-marathons"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              all ultra marathons across New Zealand
            </Link>
            .
          </p>
        </div>

        {/* Region filters */}
        {regions.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Regions:</span>
            <Link
              href="/races/ultra-marathons"
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-transparent border border-border text-foreground hover:bg-muted/50 transition-colors"
            >
              All
            </Link>
            {regions.map((region) => (
              <Link
                key={region}
                href={`/races/ultra-marathons/${regionToSlug(region)}`}
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
            {events.length} upcoming ultra marathon
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
              No upcoming ultra marathons in {regionName} right now. Browse{" "}
              <Link
                href="/races/ultra-marathons"
                className="text-foreground underline underline-offset-4 hover:no-underline"
              >
                all ultra marathons
              </Link>{" "}
              or check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Upcoming Ultra Marathons in {regionName}
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
        )}
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
              href="/races/marathons"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              marathons
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
              href="/races/ultra-marathons"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              all ultra marathons across New Zealand
            </Link>
            .
          </p>
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
                name: "Ultra Marathons",
                item: `${baseUrl}/races/ultra-marathons`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: regionName,
                item: `${baseUrl}/races/ultra-marathons/${regionToSlug(regionName)}`,
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
              name: `Ultra Marathon Races in ${regionName}`,
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

      <Footer />
    </div>
  );
}
