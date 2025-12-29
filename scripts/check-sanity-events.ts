// Check if events exist in Sanity CMS
import { config } from 'dotenv'
import { resolve } from 'path'
import { sanityClient } from '../lib/cms'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local'), override: true })

async function checkSanityEvents() {
  if (!sanityClient) {
    console.log('❌ Sanity CMS not configured')
    console.log('Set SANITY_PROJECT_ID and SANITY_DATASET in .env.local')
    return
  }

  try {
    const query = `*[_type == "event"] {
      _id,
      title,
      eventId,
      slug,
      status,
      eventType
    }`
    
    const events = await sanityClient.fetch(query)
    
    console.log(`\n📊 Events in Sanity CMS: ${events.length}\n`)
    
    if (events.length === 0) {
      console.log('No events found in Sanity CMS.')
      console.log('Run: npm run sync:sanity to sync events from database\n')
    } else {
      console.log('Events:')
      events.forEach((event: any) => {
        console.log(`  - ${event.title} (${event.eventType})`)
        console.log(`    ID: ${event.eventId}`)
        console.log(`    Slug: ${event.slug?.current || 'N/A'}`)
        console.log(`    Status: ${event.status || 'N/A'}`)
        console.log('')
      })
    }
  } catch (error: any) {
    console.error('Error checking Sanity:', error.message)
    if (error.message.includes('project')) {
      console.log('\nMake sure SANITY_PROJECT_ID is correct')
    }
  }
}

checkSanityEvents()

