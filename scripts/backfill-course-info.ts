import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file FIRST
config({ path: resolve(__dirname, '../.env.local') })

import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Add pgbouncer parameter to avoid prepared statement errors with Supabase
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not found')
  return url.includes('?') ? `${url}&pgbouncer=true` : `${url}?pgbouncer=true`
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

interface CourseInfoResult {
  terrain: string
  surface: string
  cutoffTime: string
}

async function generateCourseInfo(
  eventName: string,
  eventType: string,
  location: string,
  region: string,
  distances: string[]
): Promise<CourseInfoResult> {
  const prompt = `You are an expert on New Zealand endurance events. Based on the following event information, provide the course characteristics:

Event Name: ${eventName}
Event Type: ${eventType}
Location: ${location}, ${region}
Distances: ${distances.join(', ')}

Please provide:
1. **Terrain**: Describe the course terrain (e.g., "Flat", "Rolling Hills", "Hilly", "Mountainous", "Mixed")
2. **Surface**: Describe the surface type (e.g., "100% Sealed", "Sealed Roads", "Trail", "Gravel", "Mixed")
3. **Cutoff Time**: Provide the typical cutoff time for the longest distance (e.g., "6.5 hours", "8 hours", "No cutoff")

Use your knowledge of New Zealand geography and common event practices. For well-known events, use accurate details. For lesser-known events, make reasonable assumptions based on the location and event type.

Return ONLY a JSON object with this exact structure:
{
  "terrain": "description here",
  "surface": "description here",
  "cutoffTime": "time here"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in response')
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const result = JSON.parse(jsonMatch[0])
    return result
  } catch (error) {
    console.error('Error generating course info:', error)
    // Provide defaults based on event type
    return {
      terrain: eventType === 'RUNNING' ? 'Mixed' : eventType === 'CYCLING' ? 'Road' : 'Mixed',
      surface: eventType === 'CYCLING' ? '100% Sealed' : 'Mixed',
      cutoffTime: 'No cutoff',
    }
  }
}

async function main() {
  console.log('Backfilling course info for all events...\\n')

  const events = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      name: true,
      eventType: true,
      location: true,
      region: true,
      distances: true,
      courseTerrain: true,
      courseSurface: true,
      cutoffTime: true,
    },
  })

  console.log(`Found ${events.length} published events\\n`)

  let updated = 0
  let skipped = 0

  for (const event of events) {
    // Skip if already has all course info
    if (event.courseTerrain && event.courseSurface && event.cutoffTime) {
      console.log(`⏭️  ${event.name} - already has course info, skipping`)
      skipped++
      continue
    }

    console.log(`\\n📍 Processing: ${event.name}`)
    console.log(`   Type: ${event.eventType}, Location: ${event.location}, ${event.region}`)

    try {
      const distances = (event.distances as string[]) || []
      const courseInfo = await generateCourseInfo(
        event.name,
        event.eventType,
        event.location,
        event.region,
        distances
      )

      console.log(`   Generated:`)
      console.log(`   - Terrain: ${courseInfo.terrain}`)
      console.log(`   - Surface: ${courseInfo.surface}`)
      console.log(`   - Cutoff: ${courseInfo.cutoffTime}`)

      // Update event
      await prisma.event.update({
        where: { id: event.id },
        data: {
          courseTerrain: courseInfo.terrain,
          courseSurface: courseInfo.surface,
          cutoffTime: courseInfo.cutoffTime,
        },
      })

      console.log(`   ✅ Updated successfully`)
      updated++

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error(`   ❌ Failed:`, error instanceof Error ? error.message : error)
    }
  }

  console.log(`\\n\\n📊 Summary:`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total: ${events.length}`)
  console.log(`\\n✅ Backfill complete!`)
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
