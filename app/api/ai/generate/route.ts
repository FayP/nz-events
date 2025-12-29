import { NextResponse } from 'next/server'
import { ContentGeneratorService } from '@/lib/services/content-generator'
import { prisma } from '@/lib/prisma'

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

    if (type === 'description' || !type) {
      const description = await generator.generateEventDescription(event)
      result.description = description
    }

    if (type === 'seo' || !type) {
      const seo = await generator.generateSEOContent(event)
      result.seo = seo
    }

    if (type === 'tags' || !type) {
      const tags = await generator.generateTags(event)
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

