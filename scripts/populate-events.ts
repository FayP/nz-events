// Load environment variables FIRST using require (executes before imports)
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

// Try .env.local first, then .env
const envLocalPath = path.resolve(process.cwd(), '.env.local')
const envPath = path.resolve(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true })
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true })
}

// Now import modules that depend on environment variables
// Create OpenAI client directly to avoid import-time env check
import OpenAI from 'openai'
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
// Create Prisma client directly to avoid import path issues
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})
import { indexEvent, initializeElasticsearchIndex } from '../lib/elasticsearch'
import { ContentGeneratorService } from '../lib/services/content-generator'

interface DiscoveredEvent {
  name: string
  startDate: string // YYYY-MM-DD format
  endDate?: string
  location: string
  city: string
  region: string
  website?: string
  description?: string
  eventType: 'RUNNING' | 'BIKING' | 'TRIATHLON'
  distances?: string[]
  organizer?: string
}

// Calculate date range for next 3 months
const today = new Date()
const threeMonthsLater = new Date()
threeMonthsLater.setMonth(today.getMonth() + 3)

const dateRange = {
  start: today.toISOString().split('T')[0],
  end: threeMonthsLater.toISOString().split('T')[0],
}

async function discoverEventsWithAI(eventType: 'RUNNING' | 'BIKING' | 'TRIATHLON'): Promise<DiscoveredEvent[]> {
  const eventTypeName = eventType === 'BIKING' ? 'cycling' : eventType.toLowerCase()
  
  const prompt = `Find all ${eventTypeName} events in New Zealand that take place between ${dateRange.start} and ${dateRange.end}.

For each event, provide:
- name: Full event name
- startDate: Start date in YYYY-MM-DD format
- endDate: End date in YYYY-MM-DD format (if multi-day event)
- location: Specific venue or location name
- city: City name
- region: Region name (e.g., Auckland, Wellington, Canterbury, etc.)
- website: Event website URL if known
- description: Brief description of the event
- distances: Array of distances/categories (e.g., ["5K", "10K", "Half Marathon"] for running, ["40km", "80km", "160km"] for cycling)
- organizer: Organizer name if known

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
      "description": "Event description",
      "eventType": "${eventType}",
      "distances": ["5K", "10K"],
      "organizer": "Organizer Name"
    }
  ]
}

Focus on well-known, established events. Include events from major cities like Auckland, Wellington, Christchurch, Dunedin, Hamilton, Tauranga, and other regions across New Zealand.`

  try {
    console.log(`🔍 Discovering ${eventTypeName} events...`)
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert on New Zealand sports events. You have comprehensive knowledge of running, cycling, swimming, and triathlon events across all regions of New Zealand. Return only valid JSON with accurate event information.',
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

    // Generate content if description is missing
    const contentGenerator = new ContentGeneratorService()
    let description = event.description
    let seoTitle: string | undefined
    let seoDescription: string | undefined
    let tags: string[] = []

    if (!description || description.length < 50) {
      console.log(`📝 Generating content for: ${event.name}`)
      description = await contentGenerator.generateEventDescription(event)
      const seo = await contentGenerator.generateSEOContent(event)
      seoTitle = seo.title
      seoDescription = seo.description
      tags = await contentGenerator.generateTags(event)
    }

    // Create event
    const created = await prisma.event.create({
      data: {
        name: event.name,
        slug: `${slug}-${Date.now()}`,
        description: description || undefined,
        eventType: event.eventType,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : null,
        location: event.location,
        city: event.city,
        region: event.region,
        website: event.website || undefined,
        organizer: event.organizer || undefined,
        distances: event.distances || [],
        source: 'AI_GENERATED',
        status: 'PUBLISHED', // Auto-publish discovered events
        seoTitle,
        seoDescription,
        tags,
      },
    })

    // Index in Elasticsearch
    await indexEvent(created)
    console.log(`✅ Saved: ${event.name} (${event.city}, ${event.region})`)
    
    return true
  } catch (error: any) {
    console.error(`❌ Error saving event ${event.name}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting event population...')
  console.log(`📅 Date range: ${dateRange.start} to ${dateRange.end}\n`)

  // Initialize Elasticsearch index
  console.log('🔧 Initializing Elasticsearch index...')
  try {
    await initializeElasticsearchIndex()
    console.log('✅ Elasticsearch index ready\n')
  } catch (error) {
    console.error('❌ Error initializing Elasticsearch:', error)
    throw error
  }

  const eventTypes: Array<'RUNNING' | 'BIKING' | 'TRIATHLON'> = ['RUNNING', 'BIKING', 'TRIATHLON']
  
  // Also include swimming events as part of triathlon/running events
  // We'll treat swimming as part of triathlon events for now
  
  let totalDiscovered = 0
  let totalSaved = 0

  for (const eventType of eventTypes) {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`Processing ${eventType} events`)
    console.log('='.repeat(50))
    
    const events = await discoverEventsWithAI(eventType)
    totalDiscovered += events.length

    for (const event of events) {
      const saved = await saveEvent(event)
      if (saved) totalSaved++
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Also search for swimming-specific events (open water swims, etc.)
  // These can be added as RUNNING or TRIATHLON type events
  console.log(`\n${'='.repeat(50)}`)
  console.log('Processing Swimming events (as part of multi-sport)')
  console.log('='.repeat(50))
  
  const swimmingEvents = await discoverEventsWithAI('TRIATHLON') // Use triathlon to catch swimming events
  totalDiscovered += swimmingEvents.length

  for (const event of swimmingEvents) {
    // Filter for swimming-specific events
    if (event.name.toLowerCase().includes('swim') || 
        event.description?.toLowerCase().includes('swim')) {
      const saved = await saveEvent({ ...event, eventType: 'TRIATHLON' })
      if (saved) totalSaved++
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

