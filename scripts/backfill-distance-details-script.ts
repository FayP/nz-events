import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') })

import { PrismaClient } from '@prisma/client'
import { generateDistanceDetails } from '../lib/services/distance-generator'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting backfill of distance details...\n')

  const events = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
    },
  })

  // Filter to only events without distance details
  const eventsToUpdate = events.filter((e) => !e.distanceDetails)

  console.log(`Found ${eventsToUpdate.length} events to update\n`)

  for (let i = 0; i < eventsToUpdate.length; i++) {
    const event = eventsToUpdate[i]
    console.log(`[${i + 1}/${events.length}] Processing: ${event.name}`)

    try {
      // Parse distances from JSON
      const distances = event.distances as string[] | null

      if (!distances || distances.length === 0) {
        console.log(`  ⚠️  No distances found, skipping`)
        continue
      }

      // Generate distance details
      const distanceDetails = await generateDistanceDetails(
        event.eventType,
        distances,
        event.location,
        event.region,
        event.name
      )

      // Update event
      await prisma.event.update({
        where: { id: event.id },
        data: {
          distanceDetails: JSON.parse(JSON.stringify(distanceDetails)),
        },
      })

      console.log(`  ✓ Generated ${distanceDetails.length} distance detail(s)`)

      // Small delay to avoid rate limiting
      if (i < eventsToUpdate.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.error(`  ✗ Failed to update ${event.name}:`, error)
    }
  }

  console.log('\n✅ Backfill complete!')
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
