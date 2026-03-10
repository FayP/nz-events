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
  console.log('Finding Tarawera Ultra-Trail event...\n')

  const event = await prisma.event.findFirst({
    where: {
      name: { contains: 'Tarawera', mode: 'insensitive' },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      highlights: true,
      distances: true,
      distanceDetails: true,
      images: true,
    },
  })

  if (!event) {
    console.error('Tarawera Ultra-Trail event not found!')
    process.exit(1)
  }

  console.log(`Found: ${event.name} (slug: ${event.slug})`)
  console.log(`Current description length: ${event.description?.length ?? 0}`)
  console.log(`Current highlights: ${event.highlights.length} items`)
  console.log(`Current images: ${(event.images as string[])?.length ?? 0} items\n`)

  // --- New description ---
  const newDescription = `The Tarawera Ultra-Trail by UTMB is one of New Zealand's leading trail running events. Part of the UTMB World Series, it attracts more than 2,000 runners from around the globe to the geothermal heartland of Rotorua each February.

Founded in 2009 by Rotorua local Paul Charteris, the race began with just 85 kilometres and a vision to showcase the extraordinary natural landscapes of the Bay of Plenty while bringing together a global community of trail runners. It has since grown into a world-class event spanning five distances from 14 km to 163 km, and joined the UTMB World Series in 2023.

The courses wind through some of the most stunning scenery in the North Island — towering native podocarp forests, groves of cathedral-like redwoods, past eight glistening lakes, down crystal-clear streams, alongside steaming geothermal vents, and beneath the mighty volcanic peaks of Tarawera, Ruawahia and Wahanga. All courses are point-to-point on mostly non-technical, runnable terrain — designed with achievement at heart so that anyone and everyone is welcome on the trails.

The race is deeply connected to the Maori heritage of the region. Trails traverse the sacred lands of the tangata whenua, and the event is built on the principle of manaaki — reciprocal warmth and hospitality — welcoming all runners into the trail running whanau. World-renowned aid stations staffed by passionate volunteers have become a hallmark of the Tarawera experience.

Some of trail running's biggest international names have raced here, including Courtney Dauwalter, Jim Walmsley, Tom Evans, and Camille Herron. The current 102 km course records are held by New Zealanders Ruth Croft and Daniel Jones, both set in 2025. The T102 carries a coveted Golden Ticket entry to the Western States 100, and all distances earn Running Stones towards qualifying for UTMB Mont Blanc.`

  // --- New highlights ---
  const newHighlights = [
    "One of New Zealand's leading trail running events since 2009",
    'Part of the UTMB World Series — earn Running Stones towards UTMB Mont Blanc qualification',
    'Five distances from 14 km to the 163 km TMiler, catering to all abilities',
    'Courses pass eight lakes, waterfalls, native bush, redwood forests and geothermal landscapes',
    'T102 carries a Golden Ticket entry to the Western States 100 Mile Endurance Run',
    'Point-to-point courses on mostly non-technical, runnable terrain beneath volcanic peaks',
    'World-renowned aid stations and deep connection to Maori culture and manaaki hospitality',
    'Past winners include Courtney Dauwalter, Jim Walmsley, Tom Evans and Camille Herron',
  ]

  // --- Updated distance details with accurate elevation data ---
  const newDistanceDetails = [
    {
      name: 'TMiler',
      distance: '163 km',
      elevation: '+3,800m',
      time: '18 - 36 hrs',
      description: 'The ultimate test — a loop course starting and finishing in Rotorua that takes in all eight stunning lakes and runs beneath the volcanic peaks of Tarawera, Ruawahia and Wahanga. Earns 4 Running Stones towards UTMB qualification.',
    },
    {
      name: 'T102',
      distance: '102 km',
      elevation: '+2,300m',
      time: '9 - 18 hrs',
      description: 'The flagship race and a Western States 100 Golden Ticket qualifier. A point-to-point course from Kawerau to Rotorua passing five stunning lakes beneath the mighty maunga. The current course records are held by Ruth Croft and Daniel Jones. Earns 3 Running Stones.',
    },
    {
      name: 'T50',
      distance: '52 km',
      elevation: '+1,150m',
      time: '4.5 - 10 hrs',
      description: 'A challenging but achievable ultramarathon through the heart of the Tarawera course — native bush, lakeside trails and geothermal landscapes. Earns 2 Running Stones towards UTMB qualification.',
    },
    {
      name: 'T21',
      distance: '23 km',
      elevation: '+400m',
      time: '2 - 4 hrs',
      description: 'A spectacular trail half marathon perfect for those stepping up to trail running or looking for a fast, scenic race through native forest and past glistening lakes. Earns 1 Running Stone.',
    },
    {
      name: 'T14',
      distance: '14 km',
      elevation: '+161m',
      time: '1 - 2.5 hrs',
      description: 'The most accessible distance, starting from Te Puia in Rotorua. An ideal introduction to trail running through beautiful native landscapes with gentle elevation on runnable terrain.',
    },
  ]

  // --- Replace low-res and wrong-event images with high-res Tarawera photos ---
  const newImages = [
    // Keep the existing high-res hero
    'https://res.cloudinary.com/utmb-world/image/upload/q_auto/f_auto/c_fill,g_auto/if_w_gt_1920/c_scale,w_1920/if_end/v1/tarawera/Tarawera_24_homepage_hero_94968c2aab?_a=ATADJd80',
    // Trail runner by waterfall
    'https://res.cloudinary.com/utmb-world/image/upload/q_auto/f_auto/c_fill,g_auto/if_w_gt_1920/c_scale,w_1920/if_end/v1/tarawera/Header%20Images/header_waterfall_trail_runner_1ae6cba5e5',
    // Aerial shot of runners through ferns
    'https://res.cloudinary.com/utmb-world/image/upload/q_auto/f_auto/c_fill,g_auto/if_w_gt_1920/c_scale,w_1920/if_end/v1/tarawera/Header%20Images/aerial_ferns_runners_right_header_da5eec22c2',
    // Night miler headlamps in native bush
    'https://res.cloudinary.com/utmb-world/image/upload/q_auto/f_auto/c_fill,g_auto/if_w_gt_1920/c_scale,w_1920/if_end/v1/tarawera/Header%20Images/night_miler_lights_native_844edb0ead',
    // Runners on bridge near thermal pools
    'https://res.cloudinary.com/utmb-world/image/upload/q_auto/f_auto/c_fill,g_auto/if_w_gt_1920/c_scale,w_1920/if_end/v1/tarawera/Header%20Images/runners_bridge_thermal_pools_hero_right_header_258ea14799',
  ]

  const newDistances = [
    'TMiler (163km)',
    'T102 (102km)',
    'T50 (52km)',
    'T21 (23km)',
    'T14 (14km)',
  ]

  console.log('Updating event...\n')

  await prisma.event.update({
    where: { id: event.id },
    data: {
      description: newDescription,
      highlights: newHighlights,
      distances: newDistances,
      distanceDetails: newDistanceDetails,
      images: newImages,
      website: 'https://tarawera.utmb.world/',
      courseTerrain: 'Volcanic / Forest / Lakeside',
      courseSurface: 'Trail — Native Bush, Redwood Forest, Lakeside Paths',
      cutoffTime: '36 hours (TMiler)',
      requirements: [
        'Mandatory gear list varies by distance — check race briefing',
        'Headlamp with spare batteries (TMiler and T102)',
        'Waterproof jacket (all distances 50km+)',
        'Personal cup/bottle (minimum 500ml)',
        'Emergency whistle',
        'Mobile phone (charged)',
      ],
      inclusions: [
        'Race bib with timing chip',
        'World-class aid station support',
        'UTMB Running Stones',
        'Finisher medal',
        'Finish line celebration at Te Puia, Rotorua',
      ],
    },
  })

  console.log('Updated successfully!')
  console.log(`  Description: ${newDescription.length} characters`)
  console.log(`  Highlights: ${newHighlights.length} items`)
  console.log(`  Distances: ${newDistances.length} options`)
  console.log(`  Distance Details: ${newDistanceDetails.length} races`)
  console.log(`  Images: ${newImages.length} high-res photos (replaced 4 bad images)`)
  console.log(`  Also updated: courseTerrain, courseSurface, cutoffTime, requirements, inclusions, website`)
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
