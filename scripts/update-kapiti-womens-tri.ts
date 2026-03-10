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
  console.log('Finding Kāpiti Women\'s Triathlon event...\n')

  const event = await prisma.event.findFirst({
    where: {
      slug: 'k-piti-women-s-triathlon',
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
      schedule: true,
    },
  })

  if (!event) {
    console.error('Kāpiti Women\'s Triathlon event not found!')
    process.exit(1)
  }

  console.log(`Found: ${event.name} (slug: ${event.slug})`)
  console.log(`Current description length: ${event.description?.length ?? 0}`)
  console.log(`Current highlights: ${event.highlights.length} items`)
  console.log(`Current images: ${(event.images as string[])?.length ?? 0} items\n`)

  // --- New description ---
  const newDescription = `The Kāpiti Women's Triathlon is one of New Zealand's longest-running women-only multisport events, held every summer since 1984. Run entirely by volunteers as a registered charity, the event was founded with a simple mission: encouraging women and girls to get out and have a go, focusing on fun, fitness and health.

Held at Weka Park on the beachfront at Raumati, the event welcomes women of every age and fitness level — from first-timers to experienced triathletes. With eight age categories spanning 12 to 70+, and race formats ranging from a short novice triathlon to a 10 km run/walk, there's genuinely something for everyone.

What sets the Kāpiti Women's Triathlon apart is the extensive training programme in the weeks leading up to race day. Saturday morning Tri Skills sessions at Raumati Beach run from January through to February, progressing from open-water swimming through to full swim/bike/run sessions. Wednesday evening ocean swims with surf lifesaving supervision help nervous swimmers build confidence, and a free weekly Thursday night run club coached by Life In Motion provides ongoing support year-round. An online masterclass covers everything first-timers need to know about gear, transitions and race-day strategy.

The triathlon courses start with an ocean swim off Raumati Beach — anxious swimmers can request a pink cap for extra lifeguard attention — followed by a bike leg on sealed roads through the coastal streets, and an off-road run along the Wharemauku walking track and stream. The atmosphere is famously supportive, with wave starts of around 50 women grouped by age, marshalled courses, and a community celebration at prizegiving.

Over four decades the event has stayed true to its roots: a safe, fun and accessible day that promotes women's health, celebrates the Kāpiti Coast community, and proves that every woman can cross a finish line.`

  // --- New highlights ---
  const newHighlights = [
    'One of New Zealand\'s longest-running women-only multisport events, held annually since 1984',
    'Extensive pre-event training programme including Saturday Tri Skills sessions, ocean swims and a weekly run club',
    'Multiple race formats: triathlon (short/medium/long), duathlon, aquathon, aqua bike, and 5km/10km run/walk',
    'Welcoming to all ages and abilities with eight age categories from 12 to 70+ (over 70s enter free)',
    'Ocean swim off Raumati Beach with optional pink caps for anxious swimmers and surf lifesaving support',
    'Off-road run along the scenic Wharemauku walking track and stream',
    'Group entry discount of 20% for teams of 6 or more',
    'Registered charity (CC25397) run entirely by a dedicated team of women volunteers',
  ]

  // --- Distance details ---
  const newDistanceDetails = [
    {
      name: 'Long Triathlon',
      distance: '750m swim / 18km bike / 5km run',
      elevation: 'Flat',
      time: '1.5 - 2.5 hrs',
      description: 'The longest triathlon distance, designed for experienced and competitive triathletes. The swim is two laps in the ocean, followed by two laps on the sealed road bike course and a 2.5km out-and-back run along the Wharemauku track.',
    },
    {
      name: 'Medium Triathlon',
      distance: '400m swim / 12km bike / 4km run',
      elevation: 'Flat',
      time: '1 - 2 hrs',
      description: 'The intermediate option with a single-loop ocean swim, a medium bike loop through coastal streets via the Manly Street roundabout, and a 2km out-and-back run.',
    },
    {
      name: 'Short Triathlon',
      distance: '200m swim / 6km bike / 2km run',
      elevation: 'Flat',
      time: '0.5 - 1.5 hrs',
      description: 'Perfect for first-timers. A short ocean swim, a brief bike to the Manly Street roundabout and back, and a 1km out-and-back run. Pink swim caps available for nervous swimmers.',
    },
    {
      name: 'Duathlon',
      distance: 'Run / Bike / Run',
      elevation: 'Flat',
      time: '0.5 - 1.5 hrs',
      description: 'Skip the swim — a run/bike/run format available for teams of two or solo competitors.',
    },
    {
      name: 'Aquathon',
      distance: 'Swim / Run',
      elevation: 'Flat',
      time: '0.5 - 1 hr',
      description: 'A swim and run combination for those who prefer to leave the bike at home.',
    },
    {
      name: 'Aqua Bike',
      distance: 'Swim / Bike',
      elevation: 'Flat',
      time: '0.5 - 1.5 hrs',
      description: 'An ocean swim followed by the bike leg — no running required.',
    },
    {
      name: '5km Run/Walk',
      distance: '5km',
      elevation: 'Flat',
      time: '0.5 - 1 hr',
      description: 'A 2.5km out-and-back along the Wharemauku walking track. Walking, running or jogging all welcome.',
    },
    {
      name: '10km Run/Walk',
      distance: '10km',
      elevation: 'Flat',
      time: '1 - 1.5 hrs',
      description: 'An extended course incorporating the Expressway track for those wanting a longer distance. Walking, running or jogging all welcome.',
    },
  ]

  const newDistances = [
    'Long Triathlon (750m/18km/5km)',
    'Medium Triathlon (400m/12km/4km)',
    'Short Triathlon (200m/6km/2km)',
    'Duathlon',
    'Aquathon',
    'Aqua Bike',
    '5km Run/Walk',
    '10km Run/Walk',
  ]

  // --- Race day schedule ---
  const newSchedule = [
    { time: '11:00 AM (Sat)', description: 'Registration opens (Saturday)' },
    { time: '3:00 PM (Sat)', description: 'Saturday registration closes' },
    { time: '7:00 AM', description: 'Sunday registration opens' },
    { time: '8:00 AM', description: 'Sunday registration closes' },
    { time: '8:15 AM', description: 'Mandatory event briefing' },
    { time: '8:45 AM', description: 'First wave start (long distance)' },
    { time: '8:48 AM+', description: 'Subsequent waves every 3 minutes by age group' },
    { time: '11:30 AM', description: 'Prizegiving and celebration' },
  ]

  console.log('Updating event...\n')

  await prisma.event.update({
    where: { id: event.id },
    data: {
      description: newDescription,
      highlights: newHighlights,
      distances: newDistances,
      distanceDetails: newDistanceDetails,
      schedule: newSchedule,
      location: 'Weka Park, Raumati Beach',
      fullAddress: 'Weka Park, Marine Parade, Raumati Beach, Paraparaumu 5032',
      website: 'https://www.kwt.org.nz/',
      registrationUrl: 'https://raceroster.com/events/2026/101472/kapiti-womens-triathlon',
      organizer: 'Kāpiti Women\'s Triathlon Inc.',
      organizerWebsite: 'https://www.kwt.org.nz/',
      courseTerrain: 'Flat — Coastal',
      courseSurface: 'Ocean Swim, Sealed Roads, Off-road Walking Track',
      cutoffTime: '2 hours (long distance)',
      requirements: [
        'Swim cap provided (compulsory)',
        'Approved cycling helmet (compulsory for bike leg)',
        'Shoes for the run leg',
        'Ankle-worn timing transponder (provided)',
      ],
      inclusions: [
        'Swim cap',
        'Timing transponder',
        'Marshalled course with drink stations',
        'Surf lifesaving support for ocean swim',
        'Prizegiving celebration',
      ],
    },
  })

  console.log('Updated successfully!')
  console.log(`  Description: ${newDescription.length} characters`)
  console.log(`  Highlights: ${newHighlights.length} items`)
  console.log(`  Distances: ${newDistances.length} options`)
  console.log(`  Distance Details: ${newDistanceDetails.length} race formats`)
  console.log(`  Schedule: ${newSchedule.length} items`)
  console.log(`  Also updated: location, fullAddress, website, registrationUrl, organizer, courseTerrain, courseSurface, cutoffTime, requirements, inclusions`)
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
