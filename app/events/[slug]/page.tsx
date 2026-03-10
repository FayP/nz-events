import { notFound, permanentRedirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { getEventBySlug } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { getNextOccurrenceDate } from "@/lib/utils/event-dates";
import Link from "next/link";
import { formatEventType } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { EventJsonLd } from "@/components/EventJsonLd";
import EventImageGallery from "@/components/EventImageGallery";
import DistanceSelector from "./DistanceSelector";
import CourseInfoBar from "./CourseInfoBar";
import EventContent from "./EventContent";
import AddToCalendar from "./AddToCalendar";
import WeatherForecast from "./WeatherForecast";
import RegistrationCard from "./RegistrationCard";
import RaceCountdown from "./RaceCountdown";
import SimilarEvents from "./SimilarEvents";

type JsonObject = Record<string, Prisma.JsonValue>;
type DistanceDetails = Array<Record<string, Prisma.JsonValue>>;
type ScheduleItems = Array<Record<string, Prisma.JsonValue>>;

interface PageProps {
  params:
    | Promise<{
        slug: string;
      }>
    | {
        slug: string;
      };
}

export default async function EventPage({ params }: PageProps) {
  // Handle params - it might be a Promise in Next.js 15+
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = resolvedParams?.slug;

  // Validate slug
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    console.error("Invalid slug:", slug);
    notFound();
  }

  // Try to get event from Sanity CMS first
  let event = await getEventBySlug(slug);

  // Always fetch from database to get latest fields (distanceDetails, courseInfo, etc.)
  const dbEvent = await prisma.event.findUnique({
    where: { slug },
  });

  // If no event in either place, check if this is an old slug that was migrated
  if (!event && !dbEvent) {
    const redirectEvent = await prisma.event.findFirst({
      where: { previousSlugs: { has: slug } },
      select: { slug: true },
    });

    if (redirectEvent) {
      permanentRedirect(`/events/${redirectEvent.slug}`);
    }

    notFound();
  }

  // Convert plain-text descriptions to paragraph blocks for cleaner rendering.
  const descriptionToBlocks = (description?: string) => {
    if (!description) return undefined;

    return description
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => ({
        _type: "block",
        style: "normal",
        children: [{ _type: "span", text: paragraph }],
      }));
  };

  // If database event exists, use it as source of truth for data fields
  // CMS can be used for rich content (descriptions, images) but database has the structured data
  if (dbEvent) {
    const nextStartDate = getNextOccurrenceDate(dbEvent.startDate);
    const nextEndDate = dbEvent.endDate
      ? new Date(
          nextStartDate.getTime() + (dbEvent.endDate.getTime() - dbEvent.startDate.getTime())
        )
      : undefined;

    event = {
      title: dbEvent.name,
      eventType: dbEvent.eventType,
      distanceDetails: (dbEvent.distanceDetails as DistanceDetails | null) ?? undefined,
      images: dbEvent.images,
      eventDetails: {
        startDate: nextStartDate.toISOString(),
        endDate: nextEndDate?.toISOString(),
        location: dbEvent.location,
        city: dbEvent.city,
        region: dbEvent.region,
        address: dbEvent.fullAddress,
        latitude: dbEvent.latitude,
        longitude: dbEvent.longitude,
        coordinates:
          dbEvent.latitude !== null && dbEvent.longitude !== null
            ? { lat: dbEvent.latitude, lng: dbEvent.longitude }
            : undefined,
      },
      website: dbEvent.website,
      organizer: dbEvent.organizer
        ? {
            name: dbEvent.organizer,
            website: dbEvent.organizerWebsite,
          }
        : undefined,
      courseInfo: {
        terrain: dbEvent.courseTerrain,
        surface: dbEvent.courseSurface,
        traffic: dbEvent.courseTraffic,
        cutoffTime: dbEvent.cutoffTime,
      },
      schedule: (dbEvent.schedule as ScheduleItems | null) ?? undefined,
      highlights: dbEvent.highlights,
      requirements: dbEvent.requirements,
      registration: {
        registrationUrl: dbEvent.registrationUrl,
        price: (dbEvent.price as JsonObject | null) ?? undefined,
        capacity: dbEvent.registrationCapacity,
        taken: dbEvent.registrationTaken,
        registrationCloseDate: dbEvent.registrationCloseDate?.toISOString(),
        inclusions: dbEvent.inclusions,
      },
      description: descriptionToBlocks(dbEvent.description),
    };
  }

  // Format date and time in NZ timezone
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NZ", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Pacific/Auckland",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-NZ", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Pacific/Auckland",
    });
  };

  // Get event type badge colors
  const getEventTypeColor = (eventType: string) => {
    const type = eventType.toUpperCase();
    switch (type) {
      case "RUNNING":
        return {
          bg: "rgba(249, 115, 22, 0.15)",
          text: "var(--event-running)",
          border: "rgba(249, 115, 22, 0.3)",
          gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        };
      case "BIKING":
      case "CYCLING":
        return {
          bg: "rgba(139, 92, 246, 0.15)",
          text: "var(--event-cycling)",
          border: "rgba(139, 92, 246, 0.3)",
          gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        };
      case "TRIATHLON":
        return {
          bg: "rgba(16, 185, 129, 0.15)",
          text: "var(--event-triathlon)",
          border: "rgba(16, 185, 129, 0.3)",
          gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        };
      default:
        return {
          bg: "rgba(100, 100, 100, 0.15)",
          text: "rgba(255, 255, 255, 0.6)",
          border: "rgba(100, 100, 100, 0.3)",
          gradient: "linear-gradient(135deg, #666666 0%, #555555 100%)",
        };
    }
  };

  const typeColors = getEventTypeColor(event.eventType);

  // Build course info object
  const courseInfo = event.courseInfo
    ? {
        terrain: event.courseInfo.terrain,
        surface: event.courseInfo.surface,
        traffic: event.courseInfo.traffic,
        cutoffTime: event.courseInfo.cutoffTime,
      }
    : undefined;

  const firstImage = event.images?.[0];
  const jsonLdImage = firstImage
    ? /^https?:\/\//i.test(firstImage)
      ? firstImage
      : `https://gostride.co.nz${firstImage.startsWith("/") ? "" : "/"}${firstImage}`
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0b] to-[#111113] relative overflow-hidden">
      {/* Structured Data for SEO */}
      <EventJsonLd
        name={event.title}
        slug={slug}
        description={event.description?.[0]?.children?.[0]?.text}
        startDate={event.eventDetails?.startDate || new Date().toISOString()}
        endDate={event.eventDetails?.endDate}
        location={event.eventDetails?.location || ""}
        city={event.eventDetails?.city || ""}
        region={event.eventDetails?.region || ""}
        address={event.eventDetails?.address}
        latitude={event.eventDetails?.latitude}
        longitude={event.eventDetails?.longitude}
        url={event.website}
        organizer={event.organizer}
        eventType={event.eventType}
        price={event.registration?.price}
        registrationUrl={event.registration?.registrationUrl}
        image={jsonLdImage}
      />

      {/* Ambient Background Effects */}
      <AmbientBackground eventType={event.eventType} />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Logo and Back Button */}
        <div className="max-w-7xl mx-auto px-4 pt-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10 animate-fade-in-up">
            <Logo size="md" />
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-full transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              All Events
            </Link>
          </div>
        </div>

        {/* ============ Hero: Two-Column Layout ============ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 lg:gap-12">
            {/* ---- Left Column: Event Info ---- */}
            <div className="space-y-6">
              {/* Type Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full"
                style={{
                  background: typeColors.bg,
                  border: `1px solid ${typeColors.border}`,
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

              {/* Event Title */}
              <h1
                className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-white bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent"
                style={{ letterSpacing: "-0.02em" }}
              >
                {event.title}
              </h1>

              {/* Date & Location Cards */}
              {event.eventDetails && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Date Card */}
                  <div className="flex items-center gap-4 px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl flex-1">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center text-xl">
                      📅
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">
                        {formatDate(event.eventDetails.startDate)}
                      </div>
                      <div className="text-xs text-white/40">
                        {formatTime(event.eventDetails.startDate)}
                      </div>
                    </div>
                  </div>

                  {/* Location Card */}
                  <div className="flex items-center gap-4 px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl flex-1">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center text-xl">
                      📍
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">
                        {event.eventDetails.location}
                      </div>
                      <div className="text-xs text-white/40">
                        {event.eventDetails.city}, {event.eventDetails.region}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Distance Pills (hero preview) */}
              {event.distanceDetails && event.distanceDetails.length > 0 && (
                <DistanceSelector
                  distances={event.distanceDetails}
                  eventType={event.eventType}
                  compact
                />
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

            {/* ---- Right Column: Image ---- */}
            <div className="space-y-6">
              {/* Image on mobile appears after title, on desktop in right column */}
              <div className="order-first lg:order-none">
                <EventImageGallery
                  images={event.images}
                  eventType={event.eventType}
                  eventName={event.title}
                />
              </div>
            </div>

            {/* Race Countdown & Training Timeline */}
            {event.eventDetails && (
              <div className="lg:col-span-2 w-full animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                <RaceCountdown
                  startDate={event.eventDetails.startDate}
                  eventType={event.eventType}
                />
              </div>
            )}
          </div>
        </div>

        {/* ============ Below Hero: Full Width Sections ============ */}

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

        {/* Main Content Area */}
        <div
          className="max-w-7xl mx-auto px-4 pb-20 sm:px-6 lg:px-8 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10">
            {/* Event Content */}
            <div>
              {/* Organizer Info */}
              {event.organizer?.name && (
                <div className="p-5 mb-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center text-2xl">
                    🏆
                  </div>
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wide mb-0.5">
                      Organised by
                    </div>
                    <div className="text-sm font-medium text-white">
                      {event.organizer.name}
                    </div>
                    {event.organizer.website && (
                      <a
                        href={event.organizer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline"
                        style={{ color: typeColors.text }}
                      >
                        {new URL(event.organizer.website).hostname.replace(
                          "www.",
                          ""
                        )}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <EventContent event={event} eventType={event.eventType} />
            </div>

            {/* Registration Sidebar (desktop) - share, inclusions */}
            <div className="hidden lg:block">
              <div className="sticky top-8">
                <RegistrationCard
                  eventType={event.eventType}
                  eventTitle={event.title}
                  registrationUrl={event.registration?.registrationUrl}
                  website={event.website}
                  price={event.registration?.price}
                  capacity={event.registration?.capacity}
                  taken={event.registration?.taken}
                  registrationCloseDate={
                    event.registration?.registrationCloseDate
                  }
                  inclusions={event.registration?.inclusions}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Registration Card - Mobile (below content on small screens) */}
        <div className="lg:hidden max-w-7xl mx-auto px-4 pb-12 sm:px-6">
          <RegistrationCard
            eventType={event.eventType}
            eventTitle={event.title}
            registrationUrl={event.registration?.registrationUrl}
            website={event.website}
            price={event.registration?.price}
            capacity={event.registration?.capacity}
            taken={event.registration?.taken}
            registrationCloseDate={event.registration?.registrationCloseDate}
            inclusions={event.registration?.inclusions}
          />
        </div>

        {/* Similar Events */}
        {event.eventDetails && (
          <div className="border-t border-white/[0.06]">
            <SimilarEvents
              currentEventSlug={slug}
              eventType={event.eventType}
              region={event.eventDetails.region}
              city={event.eventDetails.city}
            />
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}

// Generate static params for all published events.
export async function generateStaticParams() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: { slug: true },
    });

    return events
      .filter((event) => event.slug)
      .map((event) => ({
        slug: event.slug,
      }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
