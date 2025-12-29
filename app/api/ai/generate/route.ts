import { NextResponse } from 'next/server'
import { ContentGeneratorService } from '@/lib/services/content-generator'
import { prisma } from '@/lib/prisma'
import { Event } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventId, type } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const generator = new ContentGeneratorService()
    let result: any = {}

    // Convert Prisma null values to undefined for type compatibility
    const eventData: Partial<Event> = {
      ...event,
      description: event.description ?? undefined,
      endDate: event.endDate ?? undefined,
      registrationOpenDate: event.registrationOpenDate ?? undefined,
      registrationCloseDate: event.registrationCloseDate ?? undefined,
      website: event.website ?? undefined,
      registrationUrl: event.registrationUrl ?? undefined,
      organizer: event.organizer ?? undefined,
      organizerEmail: event.organizerEmail ?? undefined,
      latitude: event.latitude ?? undefined,
      longitude: event.longitude ?? undefined,
      seoTitle: event.seoTitle ?? undefined,
      seoDescription: event.seoDescription ?? undefined,
      distances: Array.isArray(event.distances) ? event.distances as string[] : undefined,
      price: event.price ? event.price as any : undefined,
      images: event.images ? event.images as any : undefined,
    }

    if (type === 'description' || !type) {
      const description = await generator.generateEventDescription(eventData)
      result.description = description
    }

    if (type === 'seo' || !type) {
      const seo = await generator.generateSEOContent(eventData)
      result.seo = seo
    }

    if (type === 'tags' || !type) {
      const tags = await generator.generateTags(eventData)
      result.tags = tags
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Content generation failed' },
      { status: 500 }
    )
  }
}

