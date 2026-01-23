import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/lib/cms'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatEventType } from '@/lib/utils'
import { Calendar, MapPin } from 'lucide-react'
import { AmbientBackground } from '@/components/ui/ambient-background'
import { Logo } from '@/components/ui/logo'
import DistanceSelector from './DistanceSelector'
import CourseInfoBar from './CourseInfoBar'
import EventContent from './EventContent'
import AddToCalendar from './AddToCalendar'
import WeatherForecast from './WeatherForecast'

interface PageProps {
  params: Promise<{
    slug: string
  }> | {
    slug: string
  }
}

export default async function EventPage({ params }: PageProps) {
  // Handle params - it might be a Promise in Next.js 15+
  const resolvedParams = params instanceof Promise ? await params : params
  const slug = resolvedParams?.slug

  // Validate slug
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    console.error('Invalid slug:', slug)
    notFound()
  }

  // Try to get event from Sanity CMS first
  let event = await getEventBySlug(slug)

  // Always fetch from database to get latest fields (distanceDetails, courseInfo, etc.)
  const dbEvent = await prisma.event.findUnique({
    where: { slug },
  })

  // If no event in either place, return 404
  if (!event && !dbEvent) {
    notFound()
  }

  // If database event exists, use it as source of truth for data fields
  // CMS can be used for rich content (descriptions, images) but database has the structured data
  if (dbEvent) {
    event = {
      title: dbEvent.name,
      eventType: dbEvent.eventType,
      distanceDetails: dbEvent.distanceDetails as any,
      eventDetails: {
        startDate: dbEvent.startDate.toISOString(),
        endDate: dbEvent.endDate?.toISOString(),
        location: dbEvent.location,
        city: dbEvent.city,
        region: dbEvent.region,
        address: dbEvent.fullAddress,
        latitude: dbEvent.latitude,
        longitude: dbEvent.longitude,
      },
      website: dbEvent.website,
      organizer: dbEvent.organizer ? {
        name: dbEvent.organizer,
        website: dbEvent.organizerWebsite,
      } : undefined,
      courseInfo: {
        terrain: dbEvent.courseTerrain,
        surface: dbEvent.courseSurface,
        traffic: dbEvent.courseTraffic,
        cutoffTime: dbEvent.cutoffTime,
      },
      schedule: dbEvent.schedule as any,
      highlights: dbEvent.highlights,
      requirements: dbEvent.requirements,
      registration: {
        registrationUrl: dbEvent.registrationUrl,
        price: dbEvent.price as any,
        capacity: dbEvent.registrationCapacity,
        taken: dbEvent.registrationTaken,
      },
      description: dbEvent.description ? [
        {
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: dbEvent.description }],
        },
      ] : undefined,
    }
  }

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NZ', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-NZ', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Get event type badge colors
  const getEventTypeColor = (eventType: string) => {
    const type = eventType.toUpperCase()
    switch (type) {
      case 'RUNNING':
        return {
          bg: 'rgba(249, 115, 22, 0.15)',
          text: 'var(--event-running)',
          border: 'rgba(249, 115, 22, 0.3)',
        }
      case 'BIKING':
      case 'CYCLING':
        return {
          bg: 'rgba(139, 92, 246, 0.15)',
          text: 'var(--event-cycling)',
          border: 'rgba(139, 92, 246, 0.3)',
        }
      case 'TRIATHLON':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          text: 'var(--event-triathlon)',
          border: 'rgba(16, 185, 129, 0.3)',
        }
      default:
        return {
          bg: 'rgba(100, 100, 100, 0.15)',
          text: 'rgba(255, 255, 255, 0.6)',
          border: 'rgba(100, 100, 100, 0.3)',
        }
    }
  }

  const typeColors = getEventTypeColor(event.eventType)

  // Build course info object
  const courseInfo = event.courseInfo
    ? {
        terrain: event.courseInfo.terrain,
        surface: event.courseInfo.surface,
        traffic: event.courseInfo.traffic,
        cutoffTime: event.courseInfo.cutoffTime,
      }
    : undefined

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0b] to-[#111113] relative overflow-hidden">
      {/* Ambient Background Effects */}
      <AmbientBackground eventType={event.eventType} />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mb-12 animate-fade-in-up">
            <Logo size="md" />
          </div>

          {/* Type Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full mb-8 animate-fade-in-up"
            style={{
              background: typeColors.bg,
              border: `1px solid ${typeColors.border}`,
              animationDelay: '0.1s'
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: typeColors.text }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: typeColors.text }}
            >
              {formatEventType(event.eventType)}
            </span>
          </div>

          {/* Header Grid with Organizer on Top Right */}
          <div
            className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-start mb-8 animate-fade-in-up"
            style={{ animationDelay: '0.15s' }}
          >
            {/* Left Column - Event Info */}
            <div>
              {/* Event Title */}
              <h1 className="font-outfit text-5xl md:text-6xl font-semibold leading-tight mb-6 text-white bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent"
                  style={{ letterSpacing: '-0.02em' }}>
                {event.title}
              </h1>

              {/* Quick Info */}
              {event.eventDetails && (
                <div className="flex flex-wrap items-start gap-6 text-white/60 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {formatDate(event.eventDetails.startDate)}
                      </div>
                      <div className="text-xs text-white/40">
                        {formatTime(event.eventDetails.startDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{event.eventDetails.location}</div>
                      <div className="text-xs text-white/40">
                        {event.eventDetails.city}, {event.eventDetails.region}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add to Calendar */}
              {event.eventDetails && (
                <AddToCalendar
                  eventName={event.title}
                  startDate={event.eventDetails.startDate}
                  endDate={event.eventDetails.endDate}
                  location={event.eventDetails.location}
                  city={event.eventDetails.city}
                  region={event.eventDetails.region}
                  description={event.description?.[0]?.children?.[0]?.text}
                  url={event.website}
                />
              )}
            </div>

            {/* Right Column - Organizer Card */}
            {event.organizer?.name && (
              <div className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center gap-4 self-start hidden md:flex">
                <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{event.organizer.name}</div>
                  {event.organizer.website && (
                    <a
                      href={event.organizer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline"
                      style={{ color: typeColors.text }}
                    >
                      {new URL(event.organizer.website).hostname.replace('www.', '')}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Organizer Card Below (Mobile Only) */}
          {event.organizer?.name && (
            <div className="md:hidden p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <div className="text-sm font-medium text-white">{event.organizer.name}</div>
                {event.organizer.website && (
                  <a
                    href={event.organizer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs hover:underline"
                    style={{ color: typeColors.text }}
                  >
                    {new URL(event.organizer.website).hostname.replace('www.', '')}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Distance Selector */}
        {event.distanceDetails && event.distanceDetails.length > 0 && (
          <DistanceSelector distances={event.distanceDetails} eventType={event.eventType} />
        )}

        {/* Course Info Bar */}
        {courseInfo && <CourseInfoBar courseInfo={courseInfo} />}

        {/* Weather Forecast */}
        {event.eventDetails && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <WeatherForecast
              latitude={event.eventDetails.latitude}
              longitude={event.eventDetails.longitude}
              eventDate={event.eventDetails.startDate}
              eventType={event.eventType}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-20 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <EventContent event={event} eventType={event.eventType} />
        </div>
      </div>
    </div>
  )
}

// Generate static params for all events
export async function generateStaticParams() {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    })

    return events
      .filter((event) => event.slug)
      .map((event) => ({
        slug: event.slug,
      }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}
