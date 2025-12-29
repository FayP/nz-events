import { NextResponse } from 'next/server'
import { EventDiscoveryService } from '@/lib/services/event-discovery'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, eventType } = body

    if (!query || !eventType) {
      return NextResponse.json(
        { error: 'Query and eventType are required' },
        { status: 400 }
      )
    }

    const discoveryService = new EventDiscoveryService()
    const events = await discoveryService.discoverEvents(query, eventType)

    return NextResponse.json({ events, count: events.length })
  } catch (error: any) {
    console.error('Event discovery error:', error)
    return NextResponse.json(
      { error: error.message || 'Event discovery failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || 'running events'
    const eventType = (searchParams.get('eventType') || 'RUNNING') as 'RUNNING' | 'BIKING' | 'TRIATHLON'

    const discoveryService = new EventDiscoveryService()
    const events = await discoveryService.discoverEvents(query, eventType)

    // Optionally save discovered events
    const save = searchParams.get('save') === 'true'
    if (save) {
      const saved = await discoveryService.saveDiscoveredEvents(events)
      return NextResponse.json({ events, saved, count: events.length })
    }

    return NextResponse.json({ events, count: events.length })
  } catch (error: any) {
    console.error('Event discovery error:', error)
    return NextResponse.json(
      { error: error.message || 'Event discovery failed' },
      { status: 500 }
    )
  }
}

