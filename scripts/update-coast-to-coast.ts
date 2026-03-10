import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

import { PrismaClient } from '@prisma/client'

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

async function main() {
  console.log('Finding Coast to Coast event...\n')

  const event = await prisma.event.findFirst({
    where: {
      name: {
        contains: 'Coast to Coast',
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      highlights: true,
      distances: true,
      distanceDetails: true,
    },
  })

  if (!event) {
    console.error('Coast to Coast event not found in database!')
    process.exit(1)
  }

  console.log(`Found: ${event.name} (slug: ${event.slug})`)
  console.log(`Current description: ${event.description ? event.description.substring(0, 100) + '...' : '(empty)'}`)
  console.log(`Current highlights: ${event.highlights.length} items`)
  console.log(`Current distances: ${JSON.stringify(event.distances)}`)
  console.log(`Current distanceDetails: ${event.distanceDetails ? 'present' : '(empty)'}\n`)

  const newDescription = `The Kathmandu Coast to Coast is one of New Zealand's best-known multisport races and one of the longest-running events of its kind. Since 1983, when founder Robin Judkins convinced 79 competitors to race 243 kilometres across the South Island, it has grown into a major endurance event that draws competitors from around the globe.

The race traverses the full width of the South Island, from the wild black-sand beach at Kumara on the West Coast to New Brighton Beach in Christchurch on the east. Competitors cycle, run and kayak through some of New Zealand's most dramatic landscapes — following river valleys into the heart of the Southern Alps, crossing an alpine pass on foot through Arthur's Pass National Park, paddling 70 kilometres down the braided Waimakariri River through a stunning gorge, and riding out across the Canterbury Plains to the Pacific Ocean.

The signature "Longest Day" event — where individuals complete the entire 243 km course in a single day — holds the title of the World Multisport Championship. The fastest athletes cover the course in around 11 hours. The race can also be tackled over two days as an individual, in a two-person tandem team, or as a relay team with specialist cyclists, runners and kayakers.

With over four decades of history, legendary champions like nine-time winner Steve Gurney and five-time women's champion Kathy Lynch (equalled by Simone Maier in 2024), and a course that tests every dimension of endurance sport, the Coast to Coast is a defining event in New Zealand's sporting landscape.`

  const newHighlights = [
    'New Zealand\'s premier multisport event since 1983 — over 40 years of racing history',
    '243 km coast-to-coast crossing of the entire South Island',
    'Three disciplines: cycling (140 km), mountain running (33 km), and kayaking (70 km)',
    'Alpine pass crossing through Arthur\'s Pass National Park with nearly 800m elevation gain',
    '70 km paddle down the braided Waimakariri River through a spectacular gorge',
    '"Longest Day" one-day format holds the World Multisport Championship title',
    'Multiple race formats: one-day individual, two-day individual, tandem pairs, and relay teams',
    'Start on the wild West Coast black-sand beach, finish at New Brighton Pier on the Pacific',
  ]

  const newDistances = ['243km (Full Course)']

  const newDistanceDetails = [
    {
      name: 'Cycle Leg 1',
      distance: '55 km',
      elevation: '+250m',
      time: '1h 30m - 2h 30m',
      description: 'Following the Taramakau River valley from Kumara towards the Southern Alps. A flat to undulating road stage with a net elevation gain of 250 metres as you ride into the foothills.',
    },
    {
      name: 'Mountain Run',
      distance: '33 km',
      elevation: '+800m',
      time: '3h - 7h',
      description: 'The legendary alpine crossing through Arthur\'s Pass National Park. Mainly off-trail with rocky riverbeds, frigid river crossings, and the climb to Goat Pass. Very rough terrain where much of the course simply cannot be run — a test of coordination and strength as much as speed.',
    },
    {
      name: 'Cycle Leg 2',
      distance: '15 km',
      elevation: 'Minimal',
      time: '25m - 45m',
      description: 'A short transition ride linking the mountain run finish to the kayak put-in point on the Waimakariri River.',
    },
    {
      name: 'Kayak',
      distance: '70 km',
      elevation: 'N/A',
      time: '3h - 6h',
      description: 'The mighty Waimakariri River — 70 km of braided channels and a stunning gorge. Swift-flowing water mixes long calm sections with rapids up to Grade 2. For many competitors, this is both the highlight and the crux of the race.',
    },
    {
      name: 'Cycle Leg 3',
      distance: '70 km',
      elevation: 'Flat',
      time: '2h - 3h 30m',
      description: 'The final push from the heart of the Southern Alps out across the Canterbury Plains to the finish line at New Brighton Pier. A flat, fast ride with the East Coast finish festival waiting at the end.',
    },
  ]

  console.log('Updating event...\n')

  await prisma.event.update({
    where: { id: event.id },
    data: {
      description: newDescription,
      highlights: newHighlights,
      distances: newDistances,
      distanceDetails: newDistanceDetails,
      courseTerrain: 'Mountainous / Mixed',
      courseSurface: 'Mixed — Sealed Roads, Alpine Trail, River',
      cutoffTime: '15 hours (Longest Day)',
      requirements: [
        'Kayak or canoe (single for individual, double for tandem — supplied for tandem entries)',
        'Cycle helmet (mandatory for all cycle legs)',
        'Suitable trail running shoes for alpine terrain',
        'Thermal clothing and waterproof layer for mountain run',
        'Personal locator beacon (PLB) recommended for mountain stage',
        'Bike lights if finishing after dark',
      ],
      organizer: 'Coast to Coast Events',
      organizerWebsite: 'https://www.coasttocoast.co.nz',
      website: 'https://www.coasttocoast.co.nz',
    },
  })

  console.log('Updated successfully!')
  console.log(`  Description: ${newDescription.length} characters`)
  console.log(`  Highlights: ${newHighlights.length} items`)
  console.log(`  Distances: ${newDistances.length} items`)
  console.log(`  Distance Details: ${newDistanceDetails.length} stages`)
  console.log(`  Also updated: courseTerrain, courseSurface, cutoffTime, requirements, organizer`)
  console.log('\nDone!')
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
