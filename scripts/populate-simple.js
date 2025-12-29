// Simple Node.js script to populate events using OpenAI
require('dotenv').config({ path: '.env.local' })

const OpenAI = require('openai')
// Use Prisma client from generated location  
const path = require('path')
const { PrismaClient } = require(path.join(__dirname, '../node_modules/.prisma/client/client'))

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

async function discoverEvents(eventType) {
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
- distances: Array of distances/categories
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

Focus on well-known, established events across all regions of New Zealand.`

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

async function saveEvent(event) {
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

    // Create event
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
        website: event.website || undefined,
        organizer: event.organizer || undefined,
        distances: event.distances || [],
        source: 'AI_GENERATED',
        status: 'PUBLISHED',
      },
    })

    // Index in Elasticsearch (we'll do this via API or skip for now)
    console.log(`✅ Saved: ${event.name} (${event.city}, ${event.region})`)
    
    return true
  } catch (error) {
    console.error(`❌ Error saving event ${event.name}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting event population...')
  console.log(`📅 Date range: ${dateRange.start} to ${dateRange.end}\n`)

  const eventTypes = ['RUNNING', 'BIKING', 'TRIATHLON']
  
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

