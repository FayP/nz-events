import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { EventCard } from "./EventCard";
import { getHalfMarathonEvents, getRegions, regionToSlug } from "./data";

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

export default async function HalfMarathonsPage() {
  const events = await getHalfMarathonEvents();
  const regions = getRegions(events);

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
              New Zealand&apos;s half marathon calendar spans the full length of the country,
              from the subtropical orchards of Kerikeri&apos;s famously fast downhill course
              to the alpine scenery of Queenstown and the rugged coastlines of the South
              Island. Whether you prefer a flat, fast city course through Wellington or
              Christchurch, a trail run through native bush, or a scenic coastal route
              with ocean views, there&apos;s a half marathon to match. Most events also offer
              shorter distances, making them a great option for a group or family entry
              where everyone races at their own level.
            </p>
          </div>
        </div>

        {/* Region filters */}
        {regions.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Regions:</span>
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
          </div>
        )}

        {/* Event Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {events.length} upcoming half marathon
            {events.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        {events.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No upcoming half marathons found. Check back soon for new events!
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
            ],
          }),
        }}
      />

      <Footer />
    </div>
  );
}
