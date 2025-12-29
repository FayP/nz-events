// Sync events from database to Sanity CMS
import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@sanity/client'

// Load environment variables FIRST before any imports that might use them
config({ path: resolve(process.cwd(), '.env.local'), override: true })

// Create Sanity write client directly (with token for write access)
const sanityWriteClient = process.env.SANITY_PROJECT_ID && process.env.SANITY_API_TOKEN
  ? createClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET || 'production',
      useCdn: false,
      apiVersion: '2024-01-01',
      token: process.env.SANITY_API_TOKEN,
    })
  : null

const prisma = new PrismaClient()

interface EventData {
  id: string
  name: string
  slug: string
  description: string | null
  eventType: string
  startDate: Date
  endDate: Date | null
  location: string
  city: string
  region: string
  website: string | null
  registrationUrl: string | null
  organizer: string | null
  organizerEmail: string | null
  distances: any
  latitude: number | null
  longitude: number | null
  registrationOpenDate: Date | null
  registrationCloseDate: Date | null
  seoTitle: string | null
  seoDescription: string | null
  tags: string[]
}

async function syncEventToSanity(event: EventData) {
  if (!sanityWriteClient) {
    console.error('❌ Sanity write client not configured. Set SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_TOKEN')
    return false
  }

  try {
    // Check if event already exists in Sanity
    const existing = await sanityWriteClient.fetch(
      `*[_type == "event" && eventId == $eventId][0]`,
      { eventId: event.id }
    )

    // Prepare the document
    const document = {
      _type: 'event',
      eventId: event.id,
      title: event.name,
      slug: {
        _type: 'slug',
        current: event.slug,
      },
      eventType: event.eventType,
      excerpt: event.description
        ? event.description.substring(0, 200)
        : `Join us for ${event.name} in ${event.city}, ${event.region}`,
      description: event.description
        ? [
            {
              _type: 'block',
              _key: 'description',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: event.description,
                },
              ],
            },
          ]
        : [],
      eventDetails: {
        startDate: event.startDate.toISOString(),
        endDate: event.endDate ? event.endDate.toISOString() : null,
        location: event.location,
        city: event.city,
        region: event.region,
        coordinates: event.latitude && event.longitude
          ? {
              lat: event.latitude,
              lng: event.longitude,
            }
          : null,
      },
      distances: event.distances && Array.isArray(event.distances) ? event.distances : [],
      registration: {
        website: event.website || null,
        registrationUrl: event.registrationUrl || null,
        registrationOpenDate: event.registrationOpenDate
          ? event.registrationOpenDate.toISOString()
          : null,
        registrationCloseDate: event.registrationCloseDate
          ? event.registrationCloseDate.toISOString()
          : null,
      },
      organizer: event.organizer
        ? {
            name: event.organizer,
            email: event.organizerEmail || null,
          }
        : null,
      seo: {
        title: event.seoTitle || `${event.name} - ${event.city}, ${event.region}`,
        description:
          event.seoDescription ||
          `Join us for ${event.name} in ${event.location}, ${event.city}, ${event.region}`,
        keywords: event.tags || [],
      },
      status: 'published',
    }

    if (existing) {
      // Update existing document
      await sanityWriteClient
        .patch(existing._id)
        .set(document)
        .commit()
      console.log(`✅ Updated: ${event.name}`)
      return true
    } else {
      // Create new document
      await sanityWriteClient.create(document)
      console.log(`✅ Created: ${event.name}`)
      return true
    }
  } catch (error: any) {
    console.error(`❌ Error syncing ${event.name}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting event sync to Sanity CMS...\n')

  if (!sanityWriteClient) {
    console.error(
      '❌ Sanity CMS not configured. Please set SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_TOKEN in .env.local'
    )
    console.log('\nTo set up Sanity:')
    console.log('1. Go to https://sanity.io and create a project')
    console.log('2. Get your Project ID and Dataset name')
    console.log('3. Create an API token with Editor permissions:')
    console.log('   - Go to https://sanity.io/manage')
    console.log('   - Select your project')
    console.log('   - Go to API > Tokens')
    console.log('   - Create a new token with Editor permissions')
    console.log('4. Add them to .env.local:')
    console.log('   SANITY_PROJECT_ID=your_project_id')
    console.log('   SANITY_DATASET=production')
    console.log('   SANITY_API_TOKEN=your_token_here')
    process.exit(1)
  }

  try {
    // Fetch all published events from database
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        startDate: 'asc',
      },
    })

    console.log(`📊 Found ${events.length} events to sync\n`)

    let synced = 0
    let failed = 0

    for (const event of events) {
      const success = await syncEventToSanity(event as EventData)
      if (success) {
        synced++
      } else {
        failed++
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    console.log(`\n${'='.repeat(50)}`)
    console.log('✨ Sync complete!')
    console.log(`${'='.repeat(50)}`)
    console.log(`✅ Successfully synced: ${synced}`)
    if (failed > 0) {
      console.log(`❌ Failed: ${failed}`)
    }
  } catch (error: any) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

