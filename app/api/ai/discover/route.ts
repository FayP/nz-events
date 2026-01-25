import { NextResponse } from 'next/server'
import { EventDiscoveryService } from '@/lib/services/event-discovery'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventType } = body

    if (!eventType) {
      return NextResponse.json(
        { error: 'eventType is required (RUNNING, BIKING, or TRIATHLON)' },
        { status: 400 }
      )
    }

    const discoveryService = new EventDiscoveryService()
    const events = await discoveryService.discoverEventsByType(eventType)

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
    const eventType = (searchParams.get('eventType') || 'RUNNING') as 'RUNNING' | 'BIKING' | 'TRIATHLON'

    const discoveryService = new EventDiscoveryService()
    const events = await discoveryService.discoverEventsByType(eventType)

    // Optionally save discovered events
    const save = searchParams.get('save') === 'true'
    if (save) {
      let savedCount = 0
      for (const event of events) {
        const saved = await discoveryService.saveEvent(event)
        if (saved) savedCount++
      }
      return NextResponse.json({ events, savedCount, count: events.length })
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
