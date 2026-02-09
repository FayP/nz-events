import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatEventType } from '@/lib/utils'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'

interface SimilarEventsProps {
  currentEventSlug: string
  eventType: string
  region: string
  city?: string
}

export default async function SimilarEvents({
  currentEventSlug,
  eventType,
  region,
  city,
}: SimilarEventsProps) {
  // Query for similar events: same type + same region, excluding current event
  const similarEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      startDate: { gte: new Date() },
      slug: { not: currentEventSlug },
      eventType: eventType as any,
      OR: [{ region }, ...(city ? [{ city }] : [])],
    },
    select: {
      slug: true,
      name: true,
      eventType: true,
      startDate: true,
      location: true,
      city: true,
      region: true,
      distances: true,
      images: true,
    },
    orderBy: { startDate: 'asc' },
    take: 6,
  })

  // If not enough results in same region, backfill with same type from any region
  let events = similarEvents
  if (events.length < 3) {
    const backfill = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        startDate: { gte: new Date() },
        slug: { not: currentEventSlug },
        eventType: eventType as any,
        id: { notIn: events.map((e) => (e as any).id).filter(Boolean) },
      },
      select: {
        slug: true,
        name: true,
        eventType: true,
        startDate: true,
        location: true,
        city: true,
        region: true,
        distances: true,
        images: true,
      },
      orderBy: { startDate: 'asc' },
      take: 6 - events.length,
    })
    events = [...events, ...backfill]
  }

  if (events.length === 0) return null

  const getEventTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'RUNNING':
        return { text: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)' }
      case 'BIKING':
      case 'CYCLING':
        return { text: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)' }
      case 'TRIATHLON':
        return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' }
      default:
        return { text: '#666', bg: 'rgba(100,100,100,0.15)', border: 'rgba(100,100,100,0.3)' }
    }
  }

  const typeColors = getEventTypeColor(eventType)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-1">
            Similar Events
          </h2>
          <p className="text-lg font-outfit font-semibold text-white/80">
            More {formatEventType(eventType).toLowerCase()} events in {region}
          </p>
        </div>
        <Link
          href={`/?eventType=${eventType}`}
          className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-full transition-all"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const daysUntil = Math.ceil(
            (new Date(event.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )

          return (
            <Link
              key={event.slug}
              href={`/events/${event.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.12]"
            >
              {/* Event Type Badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background: typeColors.bg,
                    color: typeColors.text,
                    border: `1px solid ${typeColors.border}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: typeColors.text }}
                  />
                  {formatEventType(event.eventType)}
                </span>

                {/* Days until badge */}
                {daysUntil <= 30 && (
                  <span className="text-[10px] font-medium text-white/30">
                    {daysUntil === 0
                      ? 'Today'
                      : daysUntil === 1
                        ? 'Tomorrow'
                        : `${daysUntil}d away`}
                  </span>
                )}
              </div>

              {/* Event Name */}
              <h3 className="font-outfit text-lg font-semibold text-white mb-3 leading-tight group-hover:text-white/90 transition-colors line-clamp-2">
                {event.name}
              </h3>

              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(event.startDate).toLocaleDateString('en-NZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Pacific/Auckland',
                  })}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {event.location}, {event.city}
                </span>
              </div>

              {/* Distances */}
              {Array.isArray(event.distances) && event.distances.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(event.distances as string[]).slice(0, 3).map((dist, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] font-medium text-white/50 bg-white/[0.04] rounded-md border border-white/[0.06]"
                    >
                      {dist}
                    </span>
                  ))}
                  {event.distances.length > 3 && (
                    <span className="px-2 py-0.5 text-[10px] font-medium text-white/30">
                      +{event.distances.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Hover arrow */}
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-white/30" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Mobile View All Link */}
      <div className="mt-6 sm:hidden">
        <Link
          href={`/?eventType=${eventType}`}
          className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl transition-all"
        >
          View all {formatEventType(eventType).toLowerCase()} events
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
