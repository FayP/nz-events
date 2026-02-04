import { Star } from "lucide-react";
import { EventCard } from "./EventCard";
import type { RunningEvent } from "@/lib/races";

interface FeaturedEventsSectionProps {
  events: RunningEvent[];
  subtitle?: string;
}

export function FeaturedEventsSection({
  events,
  subtitle = "Marquee events you won\u2019t want to miss",
}: FeaturedEventsSectionProps) {
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
          <p className="text-sm text-muted-foreground">{subtitle}</p>
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
