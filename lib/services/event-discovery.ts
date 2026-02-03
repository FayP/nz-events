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
  inclusions?: string[] // What's included with entry fee
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
   * Source images for an event by scraping its website, falling back to Unsplash
   */
  async sourceImages(eventType: string, city: string, website?: string, registrationUrl?: string): Promise<string[]> {
    // Try scraping from the event's own website first
    const urls = [website, registrationUrl].filter(Boolean) as string[]
    for (const url of urls) {
      const scraped = await this.scrapeImagesFromUrl(url)
      if (scraped.length > 0) return scraped.slice(0, 5)
    }

    // Fall back to Unsplash API if configured
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (accessKey) {
      const sportName = eventType === 'BIKING' ? 'cycling' : eventType.toLowerCase()
      const queries = [
        `${sportName} ${city} New Zealand`,
        `${sportName} New Zealand`,
        `${sportName} race`,
      ]
      for (const query of queries) {
        try {
          const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&client_id=${accessKey}`
          const res = await fetch(apiUrl)
          if (!res.ok) continue
          const data = await res.json()
          if (data.results && data.results.length >= 3) {
            return data.results.map((photo: any) => photo.urls.regular)
          }
        } catch {
          // Continue to next query
        }
      }
    }

    return []
  }

  /**
   * Scrape event images from a URL by extracting og:image, img tags, and background images
   */
  private async scrapeImagesFromUrl(url: string): Promise<string[]> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      })
      clearTimeout(timeout)
      if (!res.ok) return []

      const html = await res.text()
      const skipPatterns = [
        'logo', 'icon', 'favicon', 'avatar', 'badge', 'sponsor', 'payment',
        'visa', 'mastercard', '1x1', 'pixel', 'tracking', 'widget', 'arrow',
        'button', 'dummy', 'transparent', 'placeholder', 'blank', 'spacer',
      ]

      const isEventImage = (imgUrl: string, tag?: string): boolean => {
        const lower = imgUrl.toLowerCase()
        if (skipPatterns.some(p => lower.includes(p))) return false
        const sizeInUrl = lower.match(/[-_](\d+)x(\d+)/)
        if (sizeInUrl && parseInt(sizeInUrl[1]) <= 200 && parseInt(sizeInUrl[2]) <= 200) return false
        if (tag) {
          const wMatch = tag.match(/width=["']?(\d+)/i)
          const hMatch = tag.match(/height=["']?(\d+)/i)
          if (wMatch && parseInt(wMatch[1]) < 200) return false
          if (hMatch && parseInt(hMatch[1]) < 200) return false
        }
        return true
      }

      // Priority 1: og:image / twitter:image
      const metaImages: string[] = []
      for (const m of html.matchAll(/(?:property|name)=["']og:image(?::url)?["']\s+content=["']([^"']+)["']/gi)) metaImages.push(m[1])
      for (const m of html.matchAll(/content=["']([^"']+)["']\s+(?:property|name)=["']og:image(?::url)?["']/gi)) metaImages.push(m[1])
      for (const m of html.matchAll(/(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/gi)) metaImages.push(m[1])
      for (const m of html.matchAll(/content=["']([^"']+)["']\s+(?:property|name)=["']twitter:image["']/gi)) metaImages.push(m[1])

      // Priority 2: Large img tags
      const contentImages: string[] = []
      for (const m of html.matchAll(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["'][^>]*>/gi)) {
        if (isEventImage(m[1], m[0])) contentImages.push(m[1])
      }

      // Priority 3: <source> srcset
      for (const m of html.matchAll(/<source[^>]+srcset=["']([^"',\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"',\s]*)?)/gi)) {
        if (isEventImage(m[1], m[0])) contentImages.push(m[1])
      }

      // Priority 4: Background images
      for (const m of html.matchAll(/background(?:-image)?:\s*url\(["']?([^"')]+\.(?:jpg|jpeg|png|webp)(?:\?[^"')]*)?)/gi)) {
        if (isEventImage(m[1])) contentImages.push(m[1])
      }

      // Resolve relative URLs and deduplicate
      const baseUrl = new URL(url)
      const seen = new Set<string>()
      const resolved: string[] = []
      for (const img of [...metaImages, ...contentImages]) {
        try {
          const full = new URL(img, baseUrl).href
          if (full.startsWith('data:') || full.endsWith('.svg')) continue
          const key = full.split('?')[0]
          if (seen.has(key)) continue
          seen.add(key)
          resolved.push(full)
        } catch { continue }
      }

      return resolved
    } catch {
      return []
    }
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

IMPORTANT: Only include events you are CONFIDENT actually exist. Do not make up or guess events. If you're unsure about an event's existence or date, do not include it.

Search comprehensively across ALL regions: ${NZ_REGIONS.join(', ')}.

I expect to find 20-40 events across New Zealand. Include:
${eventType === 'RUNNING' ? `
- Major city marathons: Auckland Marathon, Wellington Marathon, Christchurch Marathon, Dunedin Marathon, Rotorua Marathon, Queenstown Marathon, Hawke's Bay Marathon
- Half marathons in each major city
- Round the Bays events (Auckland, Wellington)
- Ultra events: Tarawera Ultra, Kepler Challenge, Old Ghost Road, Taupo Ultramarathon
- Trail runs and fun runs in smaller towns
- Park runs that have become organized events
- Charity runs (e.g., Relay for Life runs)` : ''}
${eventType === 'BIKING' ? `
- Lake Taupo Cycle Challenge
- Tour of Southland
- Gran Fondos (Auckland, Wellington, etc.)
- Mountain bike events
- Gravel rides
- Cycling tours and sportives
- Criteriums and road races` : ''}
${eventType === 'TRIATHLON' ? `
- Ironman New Zealand (Taupo)
- Ironman 70.3 events
- Challenge Wanaka
- Port of Tauranga Half
- Sprint and Olympic distance triathlons in each region
- Aquathons and duathlons
- Xterra off-road triathlons` : ''}

For each event provide:
- name: Full official event name
- startDate: Start date in YYYY-MM-DD format (use your best knowledge of when annual events typically occur)
- endDate: End date if multi-day
- location: Venue name
- city: City name
- region: Region name
- website: Official website URL (only if you're confident it's correct)
- description: Brief 1-2 sentence description
- distances: Array of distances offered
- organizer: Organizer name if known

Return JSON: { "events": [...] }

Remember: Quality over quantity. Only include events you're confident are real.`

    try {
      console.log(`Discovering ${eventTypeName} events...`)

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert on New Zealand ${eventTypeName} events. You have detailed knowledge of established annual events across all NZ regions.

CRITICAL: Only include events you are CERTAIN exist. Do not hallucinate or make up events. If you're unsure whether an event exists or its exact date, omit it. It's better to return fewer accurate events than many questionable ones.

For annual events, use your knowledge of when they typically occur each year. Return only valid JSON.`,
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

Search for and provide ONLY information you are CONFIDENT is accurate for this specific event:

1. registrationUrl: Direct link to registration/entry page
2. priceRange: Entry fee range (e.g., "$50-$150")
3. organizer: Event organizer name
4. organizerWebsite: Organizer's main website
5. courseTerrain: Type of terrain (e.g., "Rolling Hills", "Flat", "Mountainous", "Mixed")
6. courseSurface: Surface type (e.g., "Sealed Roads", "Trail", "Mixed", "Track")
7. cutoffTime: Time limit if any (e.g., "6 hours", "No cutoff")
8. inclusions: Array of items included with entry fee (e.g., ["Race t-shirt", "Finisher medal", "Timing chip", "Aid stations", "Post-race refreshments"])
   - ONLY include items you know this specific event provides
   - Do NOT guess or assume - if unsure, return empty array
   - Common inclusions vary greatly between events, so only list what you're confident about

Return a JSON object. Use null for unknown fields, empty array [] for unknown inclusions:
{
  "registrationUrl": "url or null",
  "priceRange": "range or null",
  "organizer": "name or null",
  "organizerWebsite": "url or null",
  "courseTerrain": "description or null",
  "courseSurface": "description or null",
  "cutoffTime": "time or null",
  "inclusions": ["item1", "item2"] or []
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

      // Source images from the event website, falling back to Unsplash
      console.log(`Sourcing images for: ${event.name}`)
      const images = await this.sourceImages(
        event.eventType,
        event.city,
        event.website,
        enrichedDetails.registrationUrl || event.registrationUrl,
      )

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
          images: images.length > 0 ? images : undefined,
          price,
          courseTerrain: enrichedDetails.courseTerrain,
          courseSurface: enrichedDetails.courseSurface,
          cutoffTime: enrichedDetails.cutoffTime,
          inclusions: enrichedDetails.inclusions || [],
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
