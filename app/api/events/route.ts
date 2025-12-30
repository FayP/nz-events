import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { indexEvent } from '@/lib/elasticsearch'

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

    let events = await prisma.event.findMany({
      where,
      skip: 0, // Get all matching events first for distance filtering
      take: 1000, // Get enough to filter by distance
      orderBy: { startDate: 'asc' },
    })

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
    const total = events.length
    events = events.slice(skip, skip + limit)

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

    // Generate slug if not provided
    const eventSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

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

