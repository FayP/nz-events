import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEventBadgeVariant, formatEventType } from "@/lib/utils";
import { Calendar, MapPin, ArrowRight, ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Half Marathon Races in New Zealand",
  description:
    "Find upcoming half marathon events across New Zealand. From coastal courses to mountain trails, discover your next 21.1km race from Northland to Southland.",
  openGraph: {
    title: "Half Marathon Races in New Zealand | GoStride",
    description:
      "Find upcoming half marathon events across New Zealand. From coastal courses to mountain trails, discover your next 21.1km race.",
    type: "website",
  },
};

interface PageProps {
  searchParams: Promise<{ region?: string }> | { region?: string };
}

export default async function HalfMarathonsPage({ searchParams }: PageProps) {
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams;
  const activeRegion = resolvedSearchParams?.region || null;
  const allRunningEvents = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      eventType: "RUNNING",
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
  });

  // Filter to events that include a half marathon distance
  const halfMarathonPatterns = [
    "half marathon",
    "half-marathon",
    "21km",
    "21.1km",
    "21k",
  ];
  const events = allRunningEvents.filter((event) => {
    if (!event.distances || !Array.isArray(event.distances)) return false;
    return (event.distances as string[]).some((d) =>
      halfMarathonPatterns.some((p) => d.toLowerCase().includes(p))
    );
  });

  // Get unique regions from all events (before filtering)
  const regions = [...new Set(events.map((e) => e.region))].sort();

  // Filter by region if one is selected
  const filteredEvents = activeRegion
    ? events.filter((e) => e.region === activeRegion)
    : events;

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
        <div className="mb-12">
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[var(--event-running)] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Running
            </span>
          </div>
          <h1 className="mb-5 text-5xl font-bold text-foreground tracking-tight">
            Half Marathon Races in New Zealand
          </h1>
          <div className="max-w-3xl text-base leading-relaxed text-muted-foreground space-y-4">
            <p>
              The half marathon is one of the most popular race distances in New Zealand,
              offering a genuine endurance challenge without the months-long training
              commitment of a full marathon. At 21.1 kilometres, it sits in a sweet spot
              that attracts both experienced runners chasing a personal best and newer
              runners stepping up from 10K for the first time.
            </p>
            <p>
              New Zealand's half marathon calendar spans the full length of the country,
              from the subtropical orchards of Kerikeri's famously fast downhill course
              to the alpine scenery of Queenstown and the rugged coastlines of the South
              Island. Whether you prefer a flat, fast city course through Wellington or
              Christchurch, a trail run through native bush, or a scenic coastal route
              with ocean views, there's a half marathon to match. Most events also offer
              shorter distances, making them a great option for a group or family entry
              where everyone races at their own level.
            </p>
          </div>
        </div>

        {/* Region filters */}
        {regions.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Regions:</span>
            <Link
              href="/races/half-marathons"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !activeRegion
                  ? "bg-foreground text-background"
                  : "bg-transparent border border-border text-foreground hover:bg-muted/50"
              }`}
            >
              All
            </Link>
            {regions.map((region) => (
              <Link
                key={region}
                href={
                  activeRegion === region
                    ? "/races/half-marathons"
                    : `/races/half-marathons?region=${encodeURIComponent(region)}`
                }
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeRegion === region
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
            {filteredEvents.length} upcoming half marathon
            {filteredEvents.length !== 1 ? "s" : ""}
            {activeRegion ? ` in ${activeRegion}` : ""}
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        {filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              {activeRegion
                ? `No upcoming half marathons in ${activeRegion}. Try another region or view all.`
                : "No upcoming half marathons found. Check back soon for new events!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group rounded-2xl bg-card border border-border/40 p-6 transition-all duration-200 ease-out hover:border-border hover:shadow-lg"
              >
                {/* Event Type Badge */}
                <div className="mb-6">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      getEventBadgeVariant(event.eventType) === "running"
                        ? "bg-[var(--event-running)] text-white"
                        : getEventBadgeVariant(event.eventType) === "cycling"
                          ? "bg-[var(--event-cycling)] text-white"
                          : getEventBadgeVariant(event.eventType) ===
                              "triathlon"
                            ? "bg-[var(--event-triathlon)] text-white"
                            : "bg-muted text-foreground"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    {formatEventType(event.eventType)}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="mb-6 text-2xl font-bold text-foreground tracking-tight">
                  {event.name}
                </h3>

                {/* Date */}
                <div className="mb-3 flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString("en-NZ", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Location */}
                <div className="mb-8 flex items-center gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {event.location}, {event.city}
                  </span>
                </div>

                {/* Distances and Arrow */}
                <div className="flex items-end justify-between">
                  <div className="flex flex-wrap gap-3">
                    {event.distances &&
                      Array.isArray(event.distances) &&
                      (event.distances as string[])
                        .slice(0, 3)
                        .map((dist, i) => (
                          <span
                            key={i}
                            className="text-base font-medium text-foreground/90"
                          >
                            {dist}
                          </span>
                        ))}
                  </div>
                  <div className="flex items-center justify-center rounded-full w-14 h-14 shrink-0 transition-all duration-300 bg-[var(--event-running)]/15 border border-[var(--event-running)]/30 group-hover:bg-[var(--event-running)]/25">
                    <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1 text-[var(--event-running)]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Breadcrumb JSON-LD */}
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
                item: "https://gostride.co.nz",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Half Marathons",
                item: "https://gostride.co.nz/races/half-marathons",
              },
            ],
          }),
        }}
      />

      <Footer />
    </div>
  );
}
