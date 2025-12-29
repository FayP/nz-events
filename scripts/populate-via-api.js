// Populate events using OpenAI and the API endpoint
require('dotenv').config({ path: '.env.local' })

const OpenAI = require('openai')
const fetch = require('node-fetch')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const API_URL = process.env.API_URL || 'http://localhost:3000'

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

Focus on well-known, established events across all regions of New Zealand. Include major events from Auckland, Wellington, Christchurch, Dunedin, Hamilton, Tauranga, and other cities.`

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
    const response = await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: event.name,
        description: event.description,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate || null,
        location: event.location,
        city: event.city,
        region: event.region,
        website: event.website || null,
        organizer: event.organizer || null,
        distances: event.distances || [],
        status: 'PUBLISHED',
      }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log(`✅ Saved: ${event.name} (${event.city}, ${event.region})`)
      return true
    } else {
      const error = await response.text()
      if (error.includes('Unique constraint') || error.includes('duplicate')) {
        console.log(`⏭️  Skipping existing event: ${event.name}`)
        return false
      }
      console.error(`❌ Error saving ${event.name}:`, error)
      return false
    }
  } catch (error) {
    console.error(`❌ Error saving event ${event.name}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting event population via API...')
  console.log(`📅 Date range: ${dateRange.start} to ${dateRange.end}`)
  console.log(`🌐 API URL: ${API_URL}\n`)

  // Check if API is available
  try {
    const healthCheck = await fetch(`${API_URL}/api/events?limit=1`)
    if (!healthCheck.ok) {
      throw new Error('API not responding')
    }
  } catch (error) {
    console.error('❌ API is not available. Make sure the dev server is running: npm run dev')
    process.exit(1)
  }

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

