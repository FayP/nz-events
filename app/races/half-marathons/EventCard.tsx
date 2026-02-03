import Link from "next/link";
import { getEventBadgeVariant, formatEventType } from "@/lib/utils";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    name: string;
    eventType: string;
    startDate: Date;
    location: string;
    city: string;
    distances: unknown;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
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
                : getEventBadgeVariant(event.eventType) === "triathlon"
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
  );
}
