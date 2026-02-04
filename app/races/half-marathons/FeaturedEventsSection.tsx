import { Star } from "lucide-react";
import { EventCard } from "./EventCard";
import type { HalfMarathonEvent } from "./data";

interface FeaturedEventsSectionProps {
  events: HalfMarathonEvent[];
}

export function FeaturedEventsSection({ events }: FeaturedEventsSectionProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/25">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Featured Events
          </h2>
          <p className="text-sm text-muted-foreground">
            Marquee half marathons you won&apos;t want to miss
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
