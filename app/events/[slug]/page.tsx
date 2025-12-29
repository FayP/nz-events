import { notFound } from 'next/navigation'
import { getEventBySlug, urlFor } from '@/lib/cms'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/events"
        className="mb-4 text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to Events
      </Link>

      {/* Hero Section */}
      {heroImageUrl && (
        <div className="mb-8 overflow-hidden rounded-lg">
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

      {/* Header */}
      <div className="mb-6">
        <span className="mb-2 inline-block rounded bg-black px-3 py-1 text-sm font-medium text-white dark:bg-white dark:text-black">
          {event.eventType}
        </span>
        <h1 className="mt-4 text-4xl font-bold text-black dark:text-zinc-50">
          {event.title}
        </h1>
        {event.excerpt && (
          <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400">
            {event.excerpt}
          </p>
        )}
      </div>

      {/* Event Details */}
      {event.eventDetails && (
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-2xl font-semibold">Event Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <strong className="text-zinc-700 dark:text-zinc-300">Date:</strong>
              <p className="text-zinc-600 dark:text-zinc-400">
                {new Date(event.eventDetails.startDate).toLocaleDateString('en-NZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {event.eventDetails.endDate &&
                  ` - ${new Date(event.eventDetails.endDate).toLocaleDateString('en-NZ', {
                    month: 'long',
                    day: 'numeric',
                  })}`}
              </p>
            </div>
            <div>
              <strong className="text-zinc-700 dark:text-zinc-300">Location:</strong>
              <p className="text-zinc-600 dark:text-zinc-400">
                {event.eventDetails.location}
                <br />
                {event.eventDetails.city}, {event.eventDetails.region}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {event.description && event.description.length > 0 && (
        <div className="mb-8">
          <PortableText blocks={event.description} />
        </div>
      )}

      {/* Distances */}
      {event.distances && event.distances.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Available Distances</h2>
          <div className="flex flex-wrap gap-2">
            {event.distances.map((distance: string, i: number) => (
              <span
                key={i}
                className="rounded bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
              >
                {distance}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Registration */}
      {event.registration && (
        <div className="mb-8 rounded-lg border border-zinc-200 bg-blue-50 p-6 dark:border-zinc-800 dark:bg-blue-900/20">
          <h2 className="mb-4 text-2xl font-semibold">Registration</h2>
          {event.registration.registrationUrl && (
            <a
              href={event.registration.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Register Now
            </a>
          )}
          {event.registration.price && (
            <div className="mt-4">
              <strong>Price:</strong>
              {event.registration.price.earlyBird && (
                <p>Early Bird: {event.registration.price.earlyBird}</p>
              )}
              {event.registration.price.standard && (
                <p>Standard: {event.registration.price.standard}</p>
              )}
            </div>
          )}
        </div>
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
              <div key={i} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{item.answer}</p>
              </div>
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

