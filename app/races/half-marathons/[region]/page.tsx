import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { EventCard } from "../EventCard";
import { getHalfMarathonEvents, getRegions, regionToSlug } from "../data";

interface PageProps {
  params: Promise<{ region: string }> | { region: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const regionSlug = resolvedParams.region;

  const events = await getHalfMarathonEvents();
  const regions = getRegions(events);
  const regionName = regions.find((r) => regionToSlug(r) === regionSlug);

  if (!regionName) return {};

  return {
    title: `Half Marathon Races in ${regionName}, New Zealand`,
    description: `Find upcoming half marathon events in ${regionName}. Discover 21.1km races, trail runs, and road courses across the ${regionName} region of New Zealand.`,
    openGraph: {
      title: `Half Marathon Races in ${regionName} | GoStride`,
      description: `Find upcoming half marathon events in ${regionName}, New Zealand. Discover your next 21.1km race.`,
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
            Half Marathons in {regionName}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            Upcoming half marathon races in the {regionName} region of New Zealand.
            Browse 21.1km events below, or explore{" "}
            <Link
              href="/races/half-marathons"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              all half marathons across New Zealand
            </Link>
            .
          </p>
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
      </div>

      {/* Events Grid */}
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
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
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
              {
                "@type": "ListItem",
                position: 3,
                name: regionName,
                item: `https://gostride.co.nz/races/half-marathons/${regionToSlug(regionName)}`,
              },
            ],
          }),
        }}
      />

      <Footer />
    </div>
  );
}
