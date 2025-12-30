// Get available filter options (regions, distances, etc.)
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('eventType') // Optional: filter by event type

    // Get all published events
    const where: any = { status: 'PUBLISHED' }
    if (eventType) {
      where.eventType = eventType
    }

    const events = await prisma.event.findMany({
      where,
      select: {
        region: true,
        distances: true,
        eventType: true,
      },
    })

    // Extract unique regions
    const regions = Array.from(new Set(events.map((e) => e.region).filter(Boolean))).sort()

    // Extract unique distances based on event type
    const allDistances: string[] = []
    events.forEach((event) => {
      if (event.distances && Array.isArray(event.distances)) {
        allDistances.push(...(event.distances as string[]))
      }
    })
    const uniqueDistances = Array.from(new Set(allDistances)).sort()

    // Separate distances by event type
    const runningDistances = uniqueDistances.filter((d) =>
      /^\d+[kmKM]|5K|10K|half[\s-]?marathon|marathon|ultra/i.test(d)
    )
    const triathlonDistances = uniqueDistances.filter((d) =>
      /sprint|olympic|70\.3|half[\s-]?ironman|ironman/i.test(d)
    )
    const cyclingDistances = uniqueDistances.filter(
      (d) => !runningDistances.includes(d) && !triathlonDistances.includes(d)
    )

    return NextResponse.json({
      regions,
      distances: {
        all: uniqueDistances,
        running: runningDistances,
        triathlon: triathlonDistances,
        cycling: cyclingDistances,
      },
      eventTypes: ['RUNNING', 'BIKING', 'TRIATHLON'],
    })
  } catch (error: any) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch filter options' },
      { status: 500 }
    )
  }
}

