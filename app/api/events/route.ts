import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { indexEvent } from '@/lib/elasticsearch'
import { generateSlug, ensureUniqueSlug } from '@/lib/utils/slugify'
import { getNextOccurrenceDate } from '@/lib/utils/event-dates'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('eventType')
    const region = searchParams.get('region')
    const distance = searchParams.get('distance') // New: distance filter
    const status = searchParams.get('status') || 'PUBLISHED'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const where: any = {}
    if (eventType) where.eventType = eventType
    if (region) where.region = region
    if (status) where.status = status

    // Fetch only what's needed — no bulk 1000-row pull
    // Distance filtering on JSON arrays can't be done in Prisma easily,
    // so we fetch a reasonable working set and filter in memory only when needed.
    const needsDistanceFilter = !!distance
    const fetchLimit = needsDistanceFilter ? limit * 10 : limit  // overfetch only when filtering
    const fetchSkip = needsDistanceFilter ? 0 : skip

    let events = await prisma.event.findMany({
      where,
      skip: fetchSkip,
      take: needsDistanceFilter ? Math.min(fetchLimit, 500) : fetchLimit,
      select: {
        id: true,
        name: true,
        slug: true,
        eventType: true,
        startDate: true,
        endDate: true,
        location: true,
        city: true,
        region: true,
        distances: true,
        status: true,
      },
    })

    // Roll past event dates to next annual occurrence, then sort chronologically.
    events = events
      .map((event) => ({
        ...event,
        startDate: getNextOccurrenceDate(event.startDate),
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

    // Filter by distance if provided (Prisma doesn't easily filter JSON arrays)
    if (distance) {
      events = events.filter((event) => {
        if (!event.distances || !Array.isArray(event.distances)) return false
        const distances = event.distances as string[]
        return distances.some((d) => 
          d.toLowerCase().includes(distance.toLowerCase()) ||
          distance.toLowerCase().includes(d.toLowerCase())
        )
      })
    }

    // Apply pagination after filtering
    const total = needsDistanceFilter ? events.length : await prisma.event.count({ where })
    if (needsDistanceFilter) {
      events = events.slice(skip, skip + limit)
    }

    return NextResponse.json({
      events,
      total,
      page,
      limit,
    })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      description,
      eventType,
      startDate,
      endDate,
      location,
      city,
      region,
      latitude,
      longitude,
      website,
      registrationUrl,
      organizer,
      distances,
      price,
      images,
      tags,
    } = body

    // Generate clean slug if not provided
    const eventSlug = slug || await ensureUniqueSlug(generateSlug(name), prisma)

    const event = await prisma.event.create({
      data: {
        name,
        slug: eventSlug,
        description,
        eventType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        city,
        region,
        latitude,
        longitude,
        website,
        registrationUrl,
        organizer,
        distances: distances || [],
        price: price || null,
        images: images || [],
        tags: tags || [],
        source: 'MANUAL',
        status: 'DRAFT',
      },
    })

    // Index in Elasticsearch
    await indexEvent(event)

    return NextResponse.json({ event }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    )
  }
}
