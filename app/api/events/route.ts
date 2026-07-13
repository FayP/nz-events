import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { indexEvent } from '@/lib/elasticsearch'
import { generateSlug, ensureUniqueSlug } from '@/lib/utils/slugify'
import { requireApiKey } from '@/lib/api-auth'
import { parseBoundedInt } from '@/lib/api-validation'
import { getErrorMessage } from '@/lib/api-validation'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'

// Cache listing responses for 60 seconds — event data doesn't change by the minute
export const revalidate = 60

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = z.object({
      eventType: z.enum(['RUNNING', 'BIKING', 'TRIATHLON']).nullable(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
    }).safeParse({
      eventType: searchParams.get('eventType'),
      status: searchParams.get('status') || 'PUBLISHED',
    })
    if (!filters.success) {
      return NextResponse.json({ error: 'Invalid event filters' }, { status: 400 })
    }

    const eventType = filters.data.eventType
    const region = searchParams.get('region')
    const distance = searchParams.get('distance') // New: distance filter
    const status = filters.data.status
    const limit = parseBoundedInt(searchParams.get('limit'), 20, { max: 100 })
    const page = parseBoundedInt(searchParams.get('page'), 1, { max: 1000 })
    const skip = (page - 1) * limit

    const where: Prisma.EventWhereInput = {}
    if (eventType) where.eventType = eventType
    if (region) where.region = region
    if (status) where.status = status
    if (status === 'PUBLISHED') where.startDate = { gte: new Date() }

    const select = {
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
    } satisfies Prisma.EventSelect

    // Distances are stored as free-form JSON labels, so partial matching still
    // requires application filtering. The normal listing path stays entirely in
    // Postgres and uses the existing status/startDate indexes.
    if (distance) {
      const matchingEvents = (await prisma.event.findMany({
        where,
        select,
        orderBy: { startDate: 'asc' },
      })).filter((event) => {
        if (!event.distances || !Array.isArray(event.distances)) return false
        const distances = event.distances as string[]
        return distances.some((d) =>
          d.toLowerCase().includes(distance.toLowerCase()) ||
          distance.toLowerCase().includes(d.toLowerCase())
        )
      })

      return NextResponse.json({
        events: matchingEvents.slice(skip, skip + limit),
        total: matchingEvents.length,
        page,
        limit,
      })
    }

    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        where,
        select,
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ])

    return NextResponse.json({
      events,
      total,
      page,
      limit,
    })
  } catch (error: unknown) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to fetch events') },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const authError = requireApiKey(request)
  if (authError) return authError

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
  } catch (error: unknown) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to create event') },
      { status: 500 }
    )
  }
}
