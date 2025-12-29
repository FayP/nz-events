import { openai } from '@/lib/openai'
import { WebSearchService } from '@/lib/web-search'
import { prisma } from '@/lib/prisma'
import { indexEvent } from '@/lib/elasticsearch'

export interface DiscoveredEvent {
  name: string
  date?: string
  location?: string
  website?: string
  description?: string
  eventType: 'RUNNING' | 'BIKING' | 'TRIATHLON'
}

export class EventDiscoveryService {
  private webSearch: WebSearchService

  constructor() {
    this.webSearch = new WebSearchService()
  }

  async discoverEvents(query: string, eventType: 'RUNNING' | 'BIKING' | 'TRIATHLON'): Promise<DiscoveredEvent[]> {
    // Search web for events
    const searchQuery = `${query} ${eventType.toLowerCase()} events New Zealand 2024`
    const searchResults = await this.webSearch.searchEvents(searchQuery)

    // Use AI to extract structured event data from search results
    const events = await this.extractEventData(searchResults, eventType)

    return events
  }

  private async extractEventData(searchResults: any[], eventType: 'RUNNING' | 'BIKING' | 'TRIATHLON'): Promise<DiscoveredEvent[]> {
    const prompt = `Extract event information from the following search results. Return a JSON array of events with this structure:
{
  "name": "Event name",
  "date": "YYYY-MM-DD or date range",
  "location": "City, Region",
  "website": "URL if found",
  "description": "Brief description"
}

Search results:
${JSON.stringify(searchResults, null, 2)}

Extract only valid events related to ${eventType.toLowerCase()} in New Zealand. Return only the JSON array.`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting structured event data from web search results. Return only valid JSON arrays.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) return []

      const data = JSON.parse(content)
      return Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error extracting event data:', error)
      return []
    }
  }

  async saveDiscoveredEvents(events: DiscoveredEvent[]) {
    const savedEvents = []

    for (const event of events) {
      // Check if event already exists
      const existing = await prisma.event.findFirst({
        where: {
          name: { contains: event.name, mode: 'insensitive' },
          startDate: event.date ? new Date(event.date) : undefined,
        },
      })

      if (existing) {
        console.log(`Event already exists: ${event.name}`)
        continue
      }

      // Generate slug
      const slug = event.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Parse location
      const locationParts = event.location?.split(',').map((s) => s.trim()) || []
      const city = locationParts[0] || ''
      const region = locationParts[1] || locationParts[0] || ''

      // Create event
      const created = await prisma.event.create({
        data: {
          name: event.name,
          slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
          description: event.description,
          eventType: event.eventType,
          startDate: event.date ? new Date(event.date) : new Date(),
          location: event.location || '',
          city,
          region,
          website: event.website,
          source: 'AI_GENERATED',
          status: 'DRAFT', // Review before publishing
        },
      })

      // Index in Elasticsearch
      await indexEvent(created)

      savedEvents.push(created)
    }

    return savedEvents
  }
}

