import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { EventCard } from "../_components/EventCard";
import { FeaturedEventsSection } from "../_components/FeaturedEventsSection";
import {
  getUltraEvents,
  getRegions,
  regionToSlug,
  groupEventsByMonth,
  getFeaturedEvents,
} from "./data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const events = await getUltraEvents();
  const regions = getRegions(events);
  const year = new Date().getFullYear();

  const regionSnippet =
    regions.length > 2
      ? `from ${regions[0]} to ${regions[regions.length - 1]}`
      : "across the country";

  const description = `Find ultra marathon races across New Zealand in ${year}. Browse ${events.length} upcoming ultra events ${regionSnippet}, from 50K trail runs to 100-mile endurance races.`;

  return {
    title: "Ultra Marathon Races in New Zealand",
    description,
    openGraph: {
      title: "Ultra Marathon Races in New Zealand | GoStride",
      description,
      type: "website",
    },
  };
}

export default async function UltraMarathonsPage() {
  const events = await getUltraEvents();
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
            <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li><span className="text-foreground font-medium">Ultra Marathons</span></li>
          </ol>
        </nav>

        <div className="mb-12">
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[var(--event-running)] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Running
            </span>
          </div>
          <h1 className="mb-5 text-5xl font-bold text-foreground tracking-tight">
            Ultra Marathon Races in New Zealand
          </h1>
          <div className="max-w-3xl text-base leading-relaxed text-muted-foreground space-y-4">
            <p>
              New Zealand is one of the best places in the world for ultra running.
              Any race beyond the standard 42.2km marathon distance counts as an ultra,
              and NZ&apos;s options range from 50K trail races through native bush to
              100-mile mountain crossings that test the limits of endurance. The
              terrain is the main attraction&mdash;rugged coastline, alpine passes,
              and pristine backcountry that most runners only see in photos.
            </p>
            <p>
              The Tarawera Ultramarathon near Rotorua, the Kepler Challenge in
              Fiordland, and the Old Ghost Road Ultra on the West Coast are among
              the most celebrated trail ultras in the Southern Hemisphere. Whether
              you&apos;re stepping up from a marathon for the first time with a 50K or
              targeting a multi-day stage race, New Zealand&apos;s ultra calendar has
              something to push every limit.
            </p>
          </div>
        </div>

        {regions.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Regions:</span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-foreground text-background">All</span>
            {regions.map((region) => (
              <Link key={region} href={`/races/ultra-marathons/${regionToSlug(region)}`} className="px-3 py-1.5 rounded-full text-sm font-medium bg-transparent border border-border text-foreground hover:bg-muted/50 transition-colors">
                {region}
              </Link>
            ))}
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {events.length} upcoming ultra marathon{events.length !== 1 ? "s" : ""}
          </p>
        </div>

        <FeaturedEventsSection events={featuredEvents} subtitle="Marquee ultra events across New Zealand" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12">
        {events.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No upcoming ultra marathons found. Check back soon for new events!</p>
          </div>
        ) : monthGroups.length > 0 ? (
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Upcoming Ultra Marathons</h2>
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
          <h2 className="mb-4 text-2xl font-bold text-foreground tracking-tight">Explore More Distances</h2>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Building towards an ultra? Start with a{" "}
            <Link href="/races/marathons" className="text-foreground underline underline-offset-4 hover:no-underline">marathon</Link>{" "}
            or a{" "}
            <Link href="/races/half-marathons" className="text-foreground underline underline-offset-4 hover:no-underline">half marathon</Link>{" "}
            to build your endurance base. Browse{" "}
            <Link href="/" className="text-foreground underline underline-offset-4 hover:no-underline">all running events in New Zealand</Link>.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="border-t border-border/40 pt-10">
          <h2 className="mb-8 text-3xl font-bold text-foreground tracking-tight">Ultra Marathon FAQ</h2>
          <div className="max-w-3xl space-y-8">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">How do I start training for an ultra marathon?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Most coaches recommend having at least one marathon under your belt before attempting an ultra. A typical 50K training plan is 16&ndash;24 weeks and peaks at 80&ndash;100 kilometres per week. The focus shifts from speed to time on feet&mdash;long back-to-back weekend runs are a staple of ultra training. Practice your nutrition strategy during training, as fuelling becomes critical beyond marathon distance.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">What are the best ultra marathons in New Zealand?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                The Tarawera Ultramarathon (50K&ndash;100 miles through Rotorua&apos;s geothermal forests), the Kepler Challenge (60K on the Kepler Track in Fiordland), and the Old Ghost Road Ultra (85K on the West Coast) are widely considered the top three. The Northburn 100 in Central Otago and the Tararua Mountain Race near Wellington are also highly regarded for experienced ultra runners.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">What gear do I need for a trail ultra?</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                Most NZ trail ultras have mandatory gear lists that typically include a waterproof jacket, thermal layer, headlamp, first aid kit, emergency blanket, and enough food and water to reach the next aid station. Trail running shoes with good grip are essential&mdash;road shoes won&apos;t cut it on NZ&apos;s muddy, rooty trails. Check your specific event&apos;s gear list well before race day, as requirements vary by course and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: baseUrl }, { "@type": "ListItem", position: 2, name: "Ultra Marathons", item: `${baseUrl}/races/ultra-marathons` }] }) }} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "Ultra Marathon Races in New Zealand", numberOfItems: events.length, itemListElement: events.map((event, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "SportsEvent", name: event.name, startDate: event.startDate.toISOString(), ...(event.endDate && { endDate: event.endDate.toISOString() }), eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", eventStatus: "https://schema.org/EventScheduled", location: { "@type": "Place", name: event.location, address: { "@type": "PostalAddress", addressLocality: event.city, addressRegion: event.region, addressCountry: "NZ" }, ...(event.latitude && event.longitude && { geo: { "@type": "GeoCoordinates", latitude: event.latitude, longitude: event.longitude } }) }, sport: "Running", url: `${baseUrl}/events/${event.slug}`, ...(event.website && { sameAs: event.website }), ...(event.organizer && { organizer: { "@type": "Organization", name: event.organizer } }) } })) }) }} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "How do I start training for an ultra marathon?", acceptedAnswer: { "@type": "Answer", text: "Most coaches recommend having at least one marathon under your belt. A typical 50K training plan is 16–24 weeks and peaks at 80–100 kilometres per week, with a focus on time on feet rather than speed." } }, { "@type": "Question", name: "What are the best ultra marathons in New Zealand?", acceptedAnswer: { "@type": "Answer", text: "The Tarawera Ultramarathon, the Kepler Challenge (60K in Fiordland), and the Old Ghost Road Ultra (85K on the West Coast) are widely considered the top three." } }, { "@type": "Question", name: "What gear do I need for a trail ultra?", acceptedAnswer: { "@type": "Answer", text: "Most NZ trail ultras require a waterproof jacket, thermal layer, headlamp, first aid kit, emergency blanket, and enough food and water to reach the next aid station. Trail running shoes with good grip are essential." } }] }) }} />

      <Footer />
    </div>
  );
}
