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
  console.log('Finding Wellington Round the Bays event...\n')

  const event = await prisma.event.findFirst({
    where: {
      slug: 'wellington-round-the-bays',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      startDate: true,
      highlights: true,
      distances: true,
      distanceDetails: true,
      images: true,
      location: true,
      organizer: true,
      website: true,
    },
  })

  if (!event) {
    console.error('Wellington Round the Bays event not found!')
    process.exit(1)
  }

  console.log(`Found: ${event.name} (slug: ${event.slug})`)
  console.log(`Current start date: ${event.startDate.toISOString()}`)
  console.log(`Current location: ${event.location}`)
  console.log(`Current organizer: ${event.organizer}`)
  console.log(`Current description length: ${event.description?.length ?? 0}`)
  console.log(`Current highlights: ${event.highlights.length} items`)
  console.log(`Current images: ${(event.images as string[])?.length ?? 0} items\n`)

  // --- Corrected date: Sunday 15 February 2026, 7:45am NZDT (Half Marathon start) ---
  // NZDT is UTC+13, so 7:45am NZDT = 6:45pm UTC the day before (14 Feb)
  const correctedStartDate = new Date('2026-02-14T18:45:00.000Z')
  const correctedEndDate = new Date('2026-02-15T01:15:00.000Z') // ~2:15pm NZDT (roads reopen at 1pm + buffer)

  // --- Rich description ---
  const newDescription = `The Southern Cross Round the Bays Wellington is one of New Zealand's best-known mass participation events, drawing over 10,000 runners, joggers, walkers and wheelers to the capital's harbour-edge roads each February. Now in its 47th year, it is a longstanding Wellington tradition.

The event follows Wellington's spectacular waterfront, starting alongside Waitangi Park and tracing the curve of the harbour through Oriental Bay, Evans Bay and beyond to the finish at Kilbirnie Park. The course is almost entirely flat and sealed, running at sea level with panoramic views of Wellington Harbour, the Miramar Peninsula and the Rimutaka Range throughout.

The Honda Half Marathon, run in partnership with Athletics Wellington on a fully measured and certified course, starts from Oriental Bay and extends east through Evans Bay, Hataitai, Balaena Bay and Shelly Bay before turning at Scorching Bay and returning to finish at Kilbirnie Park. It has become one of Wellington's premier road running events, attracting competitive runners alongside first-time half marathoners.

The 8.4 km Fun Run is the heart of the event — a celebration of movement for all ages and abilities. Participants can run, jog, walk or roll, choosing from Runners, Joggers, Walkers or Competitive/Non-Competitive Mobility start groups. A family-friendly 5.5 km shortcut is available on the day for anyone who needs it.

First held in the late 1970s, Wellington Round the Bays has grown from a small community fun run into one of the capital's signature events. Organised by Stuff Events in partnership with Nuku Ora (formerly Sport Wellington), the event is part of the wider Round the Bays series that now spans Wellington, Christchurch and Auckland. The 2026 theme is "Elemental" — with Wellington's element being Wind.`

  // --- Event-specific highlights ---
  const newHighlights = [
    "One of New Zealand's largest mass participation events with 10,000+ participants annually",
    'Flat, fast, fully sealed waterfront course with stunning Wellington Harbour views',
    'Honda Half Marathon — fully measured and certified by Athletics Wellington',
    '8.4 km Fun Run for all ages and abilities — run, jog, walk or roll',
    'Family-friendly 5.5 km shortcut available on the day',
    'Free event shuttles from the finish line back to the start area',
    'Finisher medals, on-course entertainment and water stations for all participants',
    'Part of the Round the Bays series across Wellington, Christchurch and Auckland',
  ]

  // --- Corrected distance details ---
  const newDistanceDetails = [
    {
      name: 'Honda Half Marathon',
      distance: '21.1 km',
      elevation: '~23m',
      time: '1h 25m - 2h 30m',
      description: 'A flat, fast, Athletics Wellington-certified course starting from Oriental Bay, running east through Evans Bay, Hataitai, Balaena Bay and Shelly Bay, turning at Scorching Bay and returning to finish at Kilbirnie Park. Pacers available at 1:25, 1:40, 1:50, 2:10, 2:20 and 2:30. Must reach the 6 km checkpoint by 9:15 am and the Scorching Bay turnaround by 11:00 am. Open to ages 16+.',
    },
    {
      name: 'Fun Run',
      distance: '8.4 km',
      elevation: 'Minimal',
      time: '40 min - 1h 30m',
      description: 'The main event — a flat waterfront course from Waitangi Park along Evans Bay Parade and Cobham Drive, turning at the Miramar Roundabout and finishing at Kilbirnie Park. Open to runners, joggers, walkers and wheelchair/mobility participants. Choose from Runners, Joggers, Walkers or Mobility start groups. A 5.5 km shortcut is available on the day. Starts at 9:15 am, 3-hour cutoff.',
    },
  ]

  const newDistances = [
    'Honda Half Marathon (21.1km)',
    'Fun Run (8.4km)',
  ]

  // --- Accurate images from official Round the Bays website ---
  const newImages = [
    'https://cdn.prod.website-files.com/668b175ce9412bf59c696f59/6848f09fdfb164cdab5f5b9c_RTB25%20Wtn%20Running.avif',
    'https://cdn.prod.website-files.com/668b175ce9412bf59c696f59/6870a0a15217668f0eae9666_RTB25%20Wellington%20-%20course%202.avif',
    'https://cdn.prod.website-files.com/668b175ce9412bf59c696f59/67b3bf548979b7255456d580_Firefighters.avif',
    'https://cdn.prod.website-files.com/668b175ce9412bf59c696f59/6870ad1a9d63bd36e1d7eef3_Nuku-Ora-Active-Wellington.avif',
  ]

  // --- Schedule ---
  const newSchedule = [
    { time: '6:30 AM', description: 'Event village opens at Kilbirnie Park' },
    { time: '7:00 AM', description: 'Half marathon bag drop opens' },
    { time: '7:45 AM', description: 'Honda Half Marathon start (Oriental Bay)' },
    { time: '8:30 AM', description: 'Fun Run bag drop opens' },
    { time: '9:15 AM', description: '8.4 km Fun Run start (Waitangi Park)' },
    { time: '10:00 AM', description: 'Free event shuttles begin (finish to start)' },
    { time: '12:15 PM', description: 'Fun Run cutoff' },
    { time: '1:00 PM', description: 'Roads reopen; event shuttles end at 2:00 PM' },
  ]

  // --- Pricing ---
  const newPriceTiers = [
    { category: 'Honda Half Marathon — Supersaver (Sept)', price: '$80' },
    { category: 'Honda Half Marathon — Early Bird (Sept–Oct)', price: '$95' },
    { category: 'Honda Half Marathon — Standard (Oct–Feb)', price: '$105' },
    { category: 'Honda Half Marathon — Late Entry (Feb)', price: '$120' },
    { category: 'Fun Run — Adult (16+)', price: 'From $39' },
    { category: 'Fun Run — Child (5–15)', price: 'From $20' },
    { category: 'Fun Run — Infant (0–4)', price: 'Free' },
  ]

  const newPrice = {
    min: 20,
    max: 120,
    currency: 'NZD',
    note: 'Fun Run from $20, Half Marathon tiers from $80 to $120. See official site for current pricing windows.',
  }

  console.log('Updating event...\n')

  await prisma.event.update({
    where: { id: event.id },
    data: {
      name: 'Wellington Round the Bays',
      startDate: correctedStartDate,
      endDate: correctedEndDate,
      location: 'Waitangi Park',
      fullAddress: 'Waitangi Park, Cable Street, Te Aro, Wellington 6011',
      city: 'Wellington',
      region: 'Wellington',
      latitude: -41.2924,
      longitude: 174.7876,
      description: newDescription,
      highlights: newHighlights,
      distances: newDistances,
      distanceDetails: newDistanceDetails,
      images: newImages,
      schedule: newSchedule,
      price: {
        ...newPrice,
        tiers: newPriceTiers,
      },
      website: 'https://www.roundthebays.co.nz/wellington',
      registrationUrl: 'https://raceroster.com/events/2026/108842/southern-cross-round-the-bays-wellington',
      organizer: 'Stuff Events',
      organizerWebsite: 'https://www.roundthebays.co.nz',
      courseTerrain: 'Flat',
      courseSurface: 'Sealed Roads',
      courseTraffic: 'Full Road Closure',
      cutoffTime: 'Half Marathon: 5h 15m from start; Fun Run: 3 hours',
      requirements: [
        'Half Marathon: Open to participants aged 16 years and older',
        'Fun Run: Open to all ages (children 5–15 require child entry; infants 0–4 are free)',
        'No bicycles, scooters, pets, poles, flags, drones or motorised vehicles on course',
        'Pushchairs must use the Walker start group',
        'Entries cannot be purchased on race day — register online in advance',
      ],
      inclusions: [
        'Race bib with timing chip',
        "Finisher's medal",
        'Downloadable finisher certificate',
        'On-course water stations and toilets',
        'On-course entertainment',
        'Medical assistance (Wellington Free Ambulance)',
        'Free event shuttles from finish to start (10 AM – 2 PM)',
        'Bag drop service (drawstring bags only)',
      ],
      seoTitle: 'Wellington Round the Bays 2026 — Half Marathon & 8.4 km Fun Run',
      seoDescription: "Join 10,000+ participants at New Zealand's iconic Wellington Round the Bays on 15 February 2026. Choose the Honda Half Marathon (21.1 km) or 8.4 km Fun Run along Wellington's stunning waterfront.",
      tags: ['running', 'half-marathon', 'fun-run', 'wellington', 'waterfront', 'road-running', 'mass-participation', 'family-friendly'],
    },
  })

  console.log('Updated successfully!')
  console.log(`  Name: Wellington Round the Bays`)
  console.log(`  Date: Sun 15 Feb 2026 (corrected from Mon 16 Feb)`)
  console.log(`  Location: Waitangi Park (corrected from Frank Kitts Park)`)
  console.log(`  Organizer: Stuff Events (corrected from Sport Wellington)`)
  console.log(`  Website: roundthebays.co.nz/wellington (corrected from old domain)`)
  console.log(`  Description: ${newDescription.length} characters`)
  console.log(`  Highlights: ${newHighlights.length} items`)
  console.log(`  Distances: ${newDistances.length} options (corrected from 3 wrong distances)`)
  console.log(`  Distance Details: ${newDistanceDetails.length} races (removed incorrect Bay Ten & 6.5km)`)
  console.log(`  Elevation: Corrected from 450m/200m/120m to ~23m/Minimal (flat course!)`)
  console.log(`  Images: ${newImages.length} photos from official RTB website`)
  console.log(`  Schedule: ${newSchedule.length} time entries`)
  console.log(`  Price: NZD $${newPrice.min} - $${newPrice.max} (+ ${newPriceTiers.length} tier entries)`)
  console.log(`  Also updated: requirements, inclusions, SEO, tags, registration URL, course info`)
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
