// Populate events directly to database, bypassing API
import { config } from 'dotenv'
import { resolve } from 'path'
import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'

// Load .env.local first
config({ path: resolve(process.cwd(), '.env.local'), override: true })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

// Calculate date range for next 3 months
const today = new Date()
const threeMonthsLater = new Date()
threeMonthsLater.setMonth(today.getMonth() + 3)

const dateRange = {
  start: today.toISOString().split('T')[0],
  end: threeMonthsLater.toISOString().split('T')[0],
}

interface DiscoveredEvent {
  name: string
  startDate: string
  endDate?: string
  location: string
  city: string
  region: string
  website?: string
  registrationUrl?: string
  description?: string
  eventType: 'RUNNING' | 'BIKING' | 'TRIATHLON'
  distances?: string[]
  distanceDetails?: Array<{
    name: string
    distance: string
    elevation: string
    time: string
    description: string
  }>
  organizer?: string
  organizerWebsite?: string
  highlights?: string[]
  requirements?: string[]
  schedule?: Array<{ time: string; description: string }>
  courseTerrain?: string
  courseSurface?: string
  courseTraffic?: string
  cutoffTime?: string
  latitude?: number
  longitude?: number
  fullAddress?: string
  inclusions?: string[]
}

async function discoverEvents(eventType: 'RUNNING' | 'BIKING' | 'TRIATHLON'): Promise<DiscoveredEvent[]> {
  const eventTypeName = eventType === 'BIKING' ? 'cycling' : eventType.toLowerCase()
  
  const prompt = `Find all ${eventTypeName} events in New Zealand that take place between ${dateRange.start} and ${dateRange.end}.

For each event, provide ALL of the following fields (leave null if genuinely unknown):
- name: Full event name
- startDate: Start date in YYYY-MM-DD format
- endDate: End date in YYYY-MM-DD format (if multi-day event)
- location: Specific venue or location name (e.g., "Hagley Park", "Queenstown Bay")
- city: City name
- region: Region name (e.g., Auckland, Wellington, Canterbury, Otago, etc.)
- fullAddress: Full street address if known
- latitude: Latitude coordinate (decimal, e.g., -43.5321)
- longitude: Longitude coordinate (decimal, e.g., 172.6362)
- website: Event website URL
- registrationUrl: Direct registration/entry page URL
- description: Detailed description (2-3 paragraphs) covering what makes this event special, its history, the course, and what participants can expect
- eventType: "${eventType}"
- distances: Array of distance categories (e.g., ["5K", "10K", "Half Marathon"])
- distanceDetails: Array of detailed distance objects, each with:
    - name: Distance/category name
    - distance: Exact distance (e.g., "21.1km")
    - elevation: Elevation gain (e.g., "+320m", "Flat")
    - time: Expected completion time range
    - description: One sentence about the route for this distance
- organizer: Organization or company running the event
- organizerWebsite: Organizer's main website URL
- highlights: Array of 4-8 highlight strings — what makes this event worth entering
- requirements: Array of equipment/entry requirements
- schedule: Array of race-day schedule items, each with { time, description }
- courseTerrain: Terrain type (e.g., "Flat", "Rolling Hills", "Mountainous")
- courseSurface: Surface type (e.g., "Sealed Roads", "Trail", "Mixed")
- courseTraffic: Road closure info (e.g., "Full Road Closure", "Open Roads with Marshals")
- cutoffTime: Time limit if any (e.g., "6 hours", "No cutoff")
- inclusions: What's included with entry (e.g., ["Race bib", "Finisher medal", "Event t-shirt"])

Return a JSON object with this structure:
{
  "events": [
    {
      "name": "Event Name",
      "startDate": "2026-03-15",
      "location": "Venue Name",
      "city": "City Name",
      "region": "Region Name",
      "fullAddress": "123 Street, City 1234",
      "latitude": -41.2865,
      "longitude": 174.7762,
      "website": "https://example.com",
      "registrationUrl": "https://example.com/enter",
      "description": "Detailed multi-paragraph description...",
      "eventType": "${eventType}",
      "distances": ["5K", "10K", "Half Marathon"],
      "distanceDetails": [{ "name": "Half Marathon", "distance": "21.1km", "elevation": "+180m", "time": "1h 30m - 2h 30m", "description": "Scenic waterfront course." }],
      "organizer": "Organizer Name",
      "organizerWebsite": "https://organizer.com",
      "highlights": ["Scenic waterfront course", "Post-race festival"],
      "requirements": ["No specific requirements"],
      "schedule": [{ "time": "7:30 AM", "description": "Race start" }],
      "courseTerrain": "Flat",
      "courseSurface": "Sealed Roads",
      "courseTraffic": "Full Road Closure",
      "cutoffTime": "3.5 hours",
      "inclusions": ["Race bib", "Finisher medal"]
    }
  ]
}

Focus on well-known, established events across all regions of New Zealand. Provide as much detail as possible — rich, accurate data is essential.`

  try {
    console.log(`🔍 Discovering ${eventTypeName} events...`)
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert on New Zealand sports events. Return only valid JSON with accurate event information.',
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
    
    console.log(`✅ Found ${events.length} ${eventTypeName} events`)
    return events
  } catch (error) {
    console.error(`Error discovering ${eventType} events:`, error)
    return []
  }
}

async function saveEvent(event: DiscoveredEvent): Promise<boolean> {
  try {
    // Check if event already exists
    const existing = await prisma.event.findFirst({
      where: {
        name: { contains: event.name, mode: 'insensitive' },
        startDate: new Date(event.startDate),
      },
    })

    if (existing) {
      console.log(`⏭️  Skipping existing event: ${event.name}`)
      return false
    }

    // Generate slug
    const slug = event.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Create event with all available fields
    const created = await prisma.event.create({
      data: {
        name: event.name,
        slug: `${slug}-${Date.now()}`,
        description: event.description || undefined,
        eventType: event.eventType,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : null,
        location: event.location,
        city: event.city,
        region: event.region,
        fullAddress: event.fullAddress || undefined,
        latitude: event.latitude || undefined,
        longitude: event.longitude || undefined,
        website: event.website || undefined,
        registrationUrl: event.registrationUrl || undefined,
        organizer: event.organizer || undefined,
        organizerWebsite: event.organizerWebsite || undefined,
        distances: event.distances || [],
        distanceDetails: event.distanceDetails || undefined,
        highlights: event.highlights || [],
        requirements: event.requirements || [],
        schedule: event.schedule || undefined,
        courseTerrain: event.courseTerrain || undefined,
        courseSurface: event.courseSurface || undefined,
        courseTraffic: event.courseTraffic || undefined,
        cutoffTime: event.cutoffTime || undefined,
        inclusions: event.inclusions || [],
        source: 'AI_GENERATED',
        status: 'PUBLISHED',
      },
    })

    console.log(`✅ Saved: ${event.name} (${event.city}, ${event.region})`)
    
    return true
  } catch (error: any) {
    console.error(`❌ Error saving event ${event.name}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting event population (direct to database)...')
  console.log(`📅 Date range: ${dateRange.start} to ${dateRange.end}\n`)

  const eventTypes: Array<'RUNNING' | 'BIKING' | 'TRIATHLON'> = ['RUNNING', 'BIKING', 'TRIATHLON']
  
  let totalDiscovered = 0
  let totalSaved = 0

  for (const eventType of eventTypes) {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`Processing ${eventType} events`)
    console.log('='.repeat(50))
    
    const events = await discoverEvents(eventType)
    totalDiscovered += events.length

    for (const event of events) {
      const saved = await saveEvent(event)
      if (saved) totalSaved++
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log('✨ Population complete!')
  console.log(`${'='.repeat(50)}`)
  console.log(`📊 Total events discovered: ${totalDiscovered}`)
  console.log(`💾 Total events saved: ${totalSaved}`)
  console.log(`⏭️  Skipped (duplicates): ${totalDiscovered - totalSaved}`)
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

