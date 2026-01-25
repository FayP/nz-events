import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { indexEvent, initializeElasticsearchIndex } from '@/lib/elasticsearch'
import { ContentGeneratorService } from './content-generator'
import { smartGeocode } from './geocoding'
import { Event } from '@/types'

export interface DiscoveredEvent {
  name: string
  startDate: string // YYYY-MM-DD format
  endDate?: string
  location: string
  city: string
  region: string
  website?: string
  registrationUrl?: string
  description?: string
  eventType: 'RUNNING' | 'BIKING' | 'TRIATHLON'
  distances?: string[]
  organizer?: string
  organizerWebsite?: string
  priceRange?: string
  latitude?: number
  longitude?: number
}

export interface EnrichedEventDetails {
  registrationUrl?: string
  priceRange?: string
  organizer?: string
  organizerWebsite?: string
  courseTerrain?: string
  courseSurface?: string
  cutoffTime?: string
}

// NZ regions to search across
const NZ_REGIONS = [
  'Auckland',
  'Wellington',
  'Canterbury',
  'Waikato',
  'Bay of Plenty',
  'Otago',
  'Manawatu-Whanganui',
  'Northland',
  'Hawkes Bay',
  'Taranaki',
  'Southland',
  'Nelson',
  'Marlborough',
  'West Coast',
  'Gisborne',
  'Tasman',
]

export class EventDiscoveryService {
  private contentGenerator: ContentGeneratorService

  constructor() {
    this.contentGenerator = new ContentGeneratorService()
  }

  /**
   * Calculate date range for discovery (next 6 months)
   */
  private getDateRange() {
    const today = new Date()
    const sixMonthsLater = new Date()
    sixMonthsLater.setMonth(today.getMonth() + 6)

    return {
      start: today.toISOString().split('T')[0],
      end: sixMonthsLater.toISOString().split('T')[0],
    }
  }

  /**
   * Discover events using AI for a specific event type
   */
  async discoverEventsByType(eventType: 'RUNNING' | 'BIKING' | 'TRIATHLON'): Promise<DiscoveredEvent[]> {
    const dateRange = this.getDateRange()
    const eventTypeName = eventType === 'BIKING' ? 'cycling' : eventType.toLowerCase()

    const prompt = `Find all ${eventTypeName} events in New Zealand that take place between ${dateRange.start} and ${dateRange.end}.

Search comprehensively across all regions including: ${NZ_REGIONS.join(', ')}.

For each event, provide as much detail as possible:
- name: Full event name
- startDate: Start date in YYYY-MM-DD format
- endDate: End date in YYYY-MM-DD format (if multi-day event)
- location: Specific venue or location name
- city: City name
- region: Region name (e.g., Auckland, Wellington, Canterbury)
- website: Official event website URL
- registrationUrl: Direct link to registration page (if different from website)
- description: Brief description of the event (1-2 sentences)
- distances: Array of distances/categories
- organizer: Organizer name
- organizerWebsite: Organizer's website if different from event website
- priceRange: Approximate price range (e.g., "$50-$150", "Free")

Return a JSON object with this structure:
{
  "events": [
    {
      "name": "Event Name",
      "startDate": "2024-01-15",
      "endDate": "2024-01-15",
      "location": "Venue Name",
      "city": "City Name",
      "region": "Region Name",
      "website": "https://example.com",
      "registrationUrl": "https://example.com/register",
      "description": "Brief event description",
      "eventType": "${eventType}",
      "distances": ["5K", "10K"],
      "organizer": "Organizer Name",
      "organizerWebsite": "https://organizer.com",
      "priceRange": "$50-$100"
    }
  ]
}

Focus on well-known, established events. Include major events like:
${eventType === 'RUNNING' ? '- Round the Bays, Auckland Marathon, Queenstown Marathon, Rotorua Marathon, Wellington Round the Bays, Christchurch Marathon, Kepler Challenge, etc.' : ''}
${eventType === 'BIKING' ? '- Tour of Southland, Lake Taupo Cycle Challenge, Tour of New Zealand, various Gran Fondos, etc.' : ''}
${eventType === 'TRIATHLON' ? '- Ironman New Zealand, Challenge Wanaka, Port of Tauranga Half, various sprint and olympic distance races, etc.' : ''}

Be thorough and include smaller regional events as well.`

    try {
      console.log(`Discovering ${eventTypeName} events...`)

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert on New Zealand sports events with comprehensive knowledge of ${eventTypeName} events across all regions. You have access to current event calendars and can provide accurate information about upcoming events. Return only valid JSON with accurate event information.`,
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
      if (!content) {
        console.error('No response from OpenAI')
        return []
      }

      const data = JSON.parse(content)
      const events = Array.isArray(data.events) ? data.events : []

      console.log(`Found ${events.length} ${eventTypeName} events`)
      return events
    } catch (error) {
      console.error(`Error discovering ${eventType} events:`, error)
      return []
    }
  }

  /**
   * Enrich event with additional details via AI follow-up
   */
  async enrichEventDetails(event: DiscoveredEvent): Promise<EnrichedEventDetails> {
    const prompt = `Find additional details for this New Zealand ${event.eventType.toLowerCase()} event:

Event: ${event.name}
Date: ${event.startDate}
Location: ${event.city}, ${event.region}
${event.website ? `Website: ${event.website}` : ''}

Search for and provide:
1. registrationUrl: Direct link to registration/entry page
2. priceRange: Entry fee range (e.g., "$50-$150")
3. organizer: Event organizer name
4. organizerWebsite: Organizer's main website
5. courseTerrain: Type of terrain (e.g., "Rolling Hills", "Flat", "Mountainous", "Mixed")
6. courseSurface: Surface type (e.g., "Sealed Roads", "Trail", "Mixed", "Track")
7. cutoffTime: Time limit if any (e.g., "6 hours", "No cutoff")

Return a JSON object with these fields. Only include fields you can find reliable information for:
{
  "registrationUrl": "url or null",
  "priceRange": "range or null",
  "organizer": "name or null",
  "organizerWebsite": "url or null",
  "courseTerrain": "description or null",
  "courseSurface": "description or null",
  "cutoffTime": "time or null"
}`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are researching event details. Only provide information you are confident about. Return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) return {}

      return JSON.parse(content)
    } catch (error) {
      console.error(`Error enriching event ${event.name}:`, error)
      return {}
    }
  }

  /**
   * Check if an event already exists in the database
   */
  async eventExists(event: DiscoveredEvent): Promise<boolean> {
    const existing = await prisma.event.findFirst({
      where: {
        OR: [
          // Match by name and date
          {
            name: { contains: event.name, mode: 'insensitive' },
            startDate: new Date(event.startDate),
          },
          // Match by similar name within 7 days
          {
            name: { contains: event.name.split(' ')[0], mode: 'insensitive' },
            startDate: {
              gte: new Date(new Date(event.startDate).getTime() - 7 * 24 * 60 * 60 * 1000),
              lte: new Date(new Date(event.startDate).getTime() + 7 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
    })

    return !!existing
  }

  /**
   * Save a discovered event to the database
   */
  async saveEvent(event: DiscoveredEvent, enrich: boolean = true): Promise<boolean> {
    try {
      // Check for duplicates
      if (await this.eventExists(event)) {
        console.log(`Skipping existing event: ${event.name}`)
        return false
      }

      // Enrich with additional details
      let enrichedDetails: EnrichedEventDetails = {}
      if (enrich) {
        console.log(`Enriching details for: ${event.name}`)
        enrichedDetails = await this.enrichEventDetails(event)
      }

      // Geocode the location
      let latitude = event.latitude
      let longitude = event.longitude
      if (!latitude || !longitude) {
        console.log(`Geocoding: ${event.city}, ${event.region}`)
        const geoResult = await smartGeocode(event.location, event.city, event.region)
        if (geoResult) {
          latitude = geoResult.latitude
          longitude = geoResult.longitude
        }
      }

      // Generate slug
      const baseSlug = event.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const slug = `${baseSlug}-${Date.now()}`

      // Generate content
      console.log(`Generating content for: ${event.name}`)
      const eventData: Partial<Event> = {
        name: event.name,
        eventType: event.eventType,
        location: event.location,
        city: event.city,
        region: event.region,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : undefined,
        distances: event.distances,
        organizer: event.organizer || enrichedDetails.organizer,
      }

      let description = event.description
      if (!description || description.length < 50) {
        description = await this.contentGenerator.generateEventDescription(eventData)
      }
      const seo = await this.contentGenerator.generateSEOContent(eventData)
      const tags = await this.contentGenerator.generateTags(eventData)

      // Parse price if available
      let price: any = null
      const priceStr = enrichedDetails.priceRange || event.priceRange
      if (priceStr) {
        const priceMatch = priceStr.match(/\$?(\d+)(?:\s*-\s*\$?(\d+))?/)
        if (priceMatch) {
          price = {
            min: parseInt(priceMatch[1]),
            max: priceMatch[2] ? parseInt(priceMatch[2]) : parseInt(priceMatch[1]),
            currency: 'NZD',
            note: priceStr,
          }
        }
      }

      // Create event
      const created = await prisma.event.create({
        data: {
          name: event.name,
          slug,
          description,
          eventType: event.eventType,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : null,
          location: event.location,
          city: event.city,
          region: event.region,
          latitude,
          longitude,
          website: event.website,
          registrationUrl: enrichedDetails.registrationUrl || event.registrationUrl,
          organizer: event.organizer || enrichedDetails.organizer,
          organizerWebsite: enrichedDetails.organizerWebsite || event.organizerWebsite,
          distances: event.distances || [],
          price,
          courseTerrain: enrichedDetails.courseTerrain,
          courseSurface: enrichedDetails.courseSurface,
          cutoffTime: enrichedDetails.cutoffTime,
          source: 'AI_GENERATED',
          status: 'PUBLISHED', // Auto-publish discovered events
          seoTitle: seo.title,
          seoDescription: seo.description,
          tags,
        },
      })

      // Index in Elasticsearch
      await indexEvent(created)
      console.log(`Saved: ${event.name} (${event.city}, ${event.region})`)

      return true
    } catch (error: any) {
      console.error(`Error saving event ${event.name}:`, error.message)
      return false
    }
  }

  /**
   * Run full discovery process for all event types
   */
  async runFullDiscovery(): Promise<{ discovered: number; saved: number }> {
    console.log('Starting full event discovery...')

    // Initialize Elasticsearch
    try {
      await initializeElasticsearchIndex()
      console.log('Elasticsearch index ready')
    } catch (error) {
      console.error('Error initializing Elasticsearch:', error)
    }

    const dateRange = this.getDateRange()
    console.log(`Date range: ${dateRange.start} to ${dateRange.end}`)

    const eventTypes: Array<'RUNNING' | 'BIKING' | 'TRIATHLON'> = ['RUNNING', 'BIKING', 'TRIATHLON']

    let totalDiscovered = 0
    let totalSaved = 0

    for (const eventType of eventTypes) {
      console.log(`\nProcessing ${eventType} events...`)

      const events = await this.discoverEventsByType(eventType)
      totalDiscovered += events.length

      for (const event of events) {
        const saved = await this.saveEvent(event)
        if (saved) totalSaved++

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`\nDiscovery complete!`)
    console.log(`Total discovered: ${totalDiscovered}`)
    console.log(`Total saved: ${totalSaved}`)
    console.log(`Skipped (duplicates): ${totalDiscovered - totalSaved}`)

    return { discovered: totalDiscovered, saved: totalSaved }
  }
}

// Export singleton instance
export const eventDiscoveryService = new EventDiscoveryService()
