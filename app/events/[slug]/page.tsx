import { notFound } from 'next/navigation'
import { getEventBySlug, urlFor } from '@/lib/cms'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ShareButton from './ShareButton'
import EventMap from './EventMap'

interface PageProps {
  params: Promise<{
    slug: string
  }> | {
    slug: string
  }
}

// Helper to render portable text (Sanity's rich text format)
function PortableText({ blocks }: { blocks: any[] }) {
  if (!blocks || !Array.isArray(blocks)) return null

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {blocks.map((block, i) => {
        if (block._type === 'block') {
          const style = block.style || 'normal'
          const children = block.children?.map((child: any, j: number) => {
            if (child._type === 'span') {
              return <span key={j}>{child.text}</span>
            }
            return null
          })

          switch (style) {
            case 'h2':
              return <h2 key={i}>{children}</h2>
            case 'h3':
              return <h3 key={i}>{children}</h3>
            case 'blockquote':
              return <blockquote key={i}>{children}</blockquote>
            default:
              return <p key={i}>{children}</p>
          }
        }
        if (block._type === 'image' && block.asset) {
          const imageUrl = urlFor(block)?.url()
          return imageUrl ? (
            <Image
              key={i}
              src={imageUrl}
              alt={block.alt || ''}
              width={800}
              height={600}
              className="rounded-lg my-8"
            />
          ) : null
        }
        return null
      })}
    </div>
  )
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

  // Fallback to database if not in CMS
  if (!event) {
    const dbEvent = await prisma.event.findUnique({
      where: { slug },
    })

    if (!dbEvent) {
      notFound()
    }

    // Return basic page if not in CMS yet
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/events"
          className="mb-4 text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Events
        </Link>
        <h1 className="mb-4 text-4xl font-bold">{dbEvent.name}</h1>
        <div className="rounded-lg border border-zinc-200 bg-yellow-50 p-4 dark:border-zinc-800 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            This event page is being set up in the CMS. Check back soon for full details!
          </p>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <strong>Date:</strong>{' '}
            {new Date(dbEvent.startDate).toLocaleDateString('en-NZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div>
            <strong>Location:</strong> {dbEvent.location}, {dbEvent.city}, {dbEvent.region}
          </div>
          {dbEvent.description && (
            <div>
              <strong>Description:</strong>
              <p className="mt-2">{dbEvent.description}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const heroImageUrl = event.heroImage?.asset?.url
    ? urlFor(event.heroImage)?.url()
    : null

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

  // Get price range
  const getPriceRange = () => {
    if (!event.registration?.price) return null
    const { earlyBird, standard } = event.registration.price
    if (earlyBird && standard) {
      return `${earlyBird} - ${standard}`
    }
    return earlyBird || standard || null
  }

  const priceRange = getPriceRange()
  const distancesCount = event.distances?.length || 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="mb-4 text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to Events
      </Link>

      {/* Hero Section with Key Info */}
      <div className="mb-8">
        {/* Hero Image */}
        {heroImageUrl && (
          <div className="mb-6 overflow-hidden rounded-lg">
            <Image
              src={heroImageUrl}
              alt={event.title}
              width={1200}
              height={600}
              className="h-64 w-full object-cover md:h-96"
              priority
            />
          </div>
        )}

        {/* Event Title and Badge */}
        <div className="mb-6">
          <div className="mb-3">
            <Badge variant="default" className="text-sm">
              {event.eventType === 'BIKING' ? 'Cycling' : event.eventType}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold md:text-5xl">
            {event.title}
          </h1>
        </div>

        {/* Key Information Grid */}
        {event.eventDetails && (
          <Card className="mb-6">
            <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Date */}
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Date
                  </div>
                  <div className="text-base font-semibold text-black dark:text-zinc-50">
                    {formatDate(event.eventDetails.startDate)}
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Time
                  </div>
                  <div className="text-base font-semibold text-black dark:text-zinc-50">
                    {formatTime(event.eventDetails.startDate)}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Location
                  </div>
                  <div className="text-base font-semibold text-black dark:text-zinc-50">
                    {event.eventDetails.location}
                    <br />
                    <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400">
                      {event.eventDetails.city}, {event.eventDetails.region}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              {priceRange && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Price
                    </div>
                    <div className="text-base font-semibold text-black dark:text-zinc-50">
                      {priceRange}
                      {event.registration?.price?.currency && (
                        <span className="ml-1 text-sm font-normal">
                          {event.registration.price.currency}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Distances */}
              {distancesCount > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏃</span>
                  <div>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Races
                    </div>
                    <div className="text-base font-semibold text-black dark:text-zinc-50">
                      {distancesCount} distance{distancesCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                {event.registration?.registrationUrl && (
                  <Button asChild size="lg">
                    <a
                      href={event.registration.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Book Now
                    </a>
                  </Button>
                )}
                <ShareButton title={event.title} text={event.excerpt} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      {event.description && event.description.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">About This Event</h2>
          <PortableText blocks={event.description} />
        </div>
      )}

      {/* Location & Map Section */}
      {event.eventDetails && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Location</h2>
          
          {/* Map */}
          {event.eventDetails.coordinates?.lat && event.eventDetails.coordinates?.lng ? (
            <div className="mb-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              <EventMap
                latitude={event.eventDetails.coordinates.lat}
                longitude={event.eventDetails.coordinates.lng}
                location={event.eventDetails.location}
                city={event.eventDetails.city}
                region={event.eventDetails.region}
              />
            </div>
          ) : null}

          {/* Address and Directions */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                {event.eventDetails.address || event.eventDetails.location}
                <br />
                {event.eventDetails.city}, {event.eventDetails.region}
              </p>
              
              {/* Get Directions Link */}
              <Button asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    event.eventDetails.address || 
                    `${event.eventDetails.location}, ${event.eventDetails.city}, ${event.eventDetails.region}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Get Directions
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distances */}
      {event.distances && event.distances.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Available Distances</h2>
          <div className="flex flex-wrap gap-2">
            {event.distances.map((distance: string, i: number) => (
              <Badge key={i} variant="secondary">
                {distance}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Course Map */}
      {event.courseMap && urlFor(event.courseMap)?.url() && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Course Map</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-lg">
                <Image
                  src={urlFor(event.courseMap)?.url() || ''}
                  alt="Course Map"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Course Information */}
      {event.courseInfo && event.courseInfo.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Course Information</h2>
          <div className="space-y-4">
            {event.courseInfo.map((info: any, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{info.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Registration */}
      {event.registration && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.registration.registrationUrl && (
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a
                  href={event.registration.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Register Now
                </a>
              </Button>
            )}
            
            {/* Registration Dates */}
            {(event.registration.registrationOpenDate || event.registration.registrationCloseDate) && (
              <div className="space-y-2">
                <h3 className="font-semibold">Registration Period</h3>
                {event.registration.registrationOpenDate && (
                  <p className="text-sm text-muted-foreground">
                    Opens: {new Date(event.registration.registrationOpenDate).toLocaleDateString('en-NZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                {event.registration.registrationCloseDate && (
                  <p className="text-sm text-muted-foreground">
                    Closes: {new Date(event.registration.registrationCloseDate).toLocaleDateString('en-NZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            )}

            {/* Pricing */}
            {event.registration.price && (
              <div className="space-y-2">
                <h3 className="font-semibold">Pricing</h3>
                {event.registration.price.earlyBird && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">Early Bird</span>
                    <span className="text-sm font-semibold">
                      {event.registration.price.earlyBird}
                      {event.registration.price.currency && ` ${event.registration.price.currency}`}
                    </span>
                  </div>
                )}
                {event.registration.price.standard && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">Standard</span>
                    <span className="text-sm font-semibold">
                      {event.registration.price.standard}
                      {event.registration.price.currency && ` ${event.registration.price.currency}`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Registration Website */}
            {event.registration.website && (
              <div>
                <p className="mb-2 text-sm text-muted-foreground">
                  For more information, visit the official registration website.
                </p>
                <Button asChild variant="outline">
                  <a
                    href={event.registration.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Registration Website
                  </a>
                </Button>
              </div>
            )}

            {/* Fallback message if no registration details */}
            {!event.registration.registrationUrl && 
             !event.registration.website && 
             !event.registration.registrationOpenDate && 
             !event.registration.registrationCloseDate && 
             !event.registration.price && (
              <p className="text-sm text-muted-foreground">
                Registration details will be available soon. Please check back later or contact the event organizer for more information.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Highlights */}
      {event.highlights && event.highlights.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Event Highlights</h2>
          <ul className="list-disc space-y-2 pl-6">
            {event.highlights.map((highlight: string, i: number) => (
              <li key={i} className="text-zinc-600 dark:text-zinc-400">
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FAQ */}
      {event.faq && event.faq.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {event.faq.map((item: any, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      {event.gallery && event.gallery.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Gallery</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {event.gallery.map((image: any, i: number) => {
              const imageUrl = urlFor(image)?.url()
              return imageUrl ? (
                <Image
                  key={i}
                  src={imageUrl}
                  alt={image.alt || `Gallery image ${i + 1}`}
                  width={600}
                  height={400}
                  className="rounded-lg"
                />
              ) : null
            })}
          </div>
        </div>
      )}
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
      .filter((event) => event.slug) // Filter out any null/undefined slugs
      .map((event) => ({
        slug: event.slug,
      }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

