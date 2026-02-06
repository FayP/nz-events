import Link from "next/link";
import { cn, getEventBadgeVariant, formatEventType } from "@/lib/utils";
import { normalizeDistanceLabel } from "@/lib/races";
import { Calendar, MapPin, ArrowRight, Star } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    name: string;
    eventType: string;
    startDate: Date;
    location: string;
    city: string;
    distances?: unknown;
    featured?: boolean;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group rounded-2xl bg-card border p-6 transition-all duration-200 ease-out hover:shadow-lg",
        event.featured
          ? "border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_20px_-5px] shadow-amber-500/10"
          : "border-border/40 hover:border-border"
      )}
    >
      {/* Badges */}
      <div className="mb-6 flex items-center gap-2">
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
        {event.featured && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <Star className="h-3 w-3 fill-amber-400" />
            Featured
          </span>
        )}
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
          {(Array.isArray(event.distances) ? (event.distances as string[]) : [])
            .slice(0, 3)
            .map((dist, i) => (
              <span
                key={i}
                className="text-base font-medium text-foreground/90"
              >
                {normalizeDistanceLabel(dist)}
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
