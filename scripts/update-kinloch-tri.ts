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
  console.log('Finding Kinloch Triathlon Festival...\n')

  const event = await prisma.event.findFirst({
    where: { slug: 'kinloch-triathlon-festival' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      highlights: true,
      startDate: true,
    },
  })

  if (!event) {
    console.error('Kinloch Triathlon Festival not found!')
    process.exit(1)
  }

  console.log(`Found: ${event.name} (slug: ${event.slug})`)
  console.log(`Current startDate: ${event.startDate.toISOString()}`)
  console.log(`Current description: ${event.description?.substring(0, 80) ?? '(empty)'}...`)
  console.log(`Current highlights: ${event.highlights.length} items\n`)

  // Fix the start time: Saturday 14 Feb 2026, 7:00am NZDT (UTC+13) = 13 Feb 18:00 UTC
  const correctedStartDate = new Date('2026-02-13T18:00:00.000Z')
  // End date: Sunday 15 Feb 2026, afternoon NZDT
  const endDate = new Date('2026-02-15T05:00:00.000Z')

  const newName = 'Seven Oaks Kinloch Triathlon Festival'

  const newDescription = `The Seven Oaks Kinloch Triathlon Festival is one of New Zealand's longest-running triathlon festivals. First held in 1985 under the name Taupo Triathlon, it has been a fixture on the New Zealand multisport calendar for over 40 years, drawing competitors and supporters to the lakeside village of Kinloch each February.

Set on the shores of Lake Taupo with stunning views across to the volcanic peaks of Tongariro National Park, the festival spans two days and offers something for everyone — from seasoned triathletes chasing World Championship qualifying spots to kids trying their first Splash and Dash.

Saturday features the Triathlon New Zealand National Aquathlon Championships, with open, U19 and U16 categories racing swim-run courses along Kinloch Beach. Sunday is the main triathlon day, headlined by the Erin Baker Standard Distance — named after the legendary New Zealand triathlete — plus a draft-legal Sprint, Youth Triathlon, Try-A-Tri, AquaBike (a World Championship qualifier), and open water swims from 750m to 3km.

The crystal-clear freshwater swim in Lake Taupo is a highlight, with a challenging bike course through the rolling Waikato countryside and a run that brings athletes back to the village finish line. The relaxed, community atmosphere of Kinloch village — backed by decades of local support — makes this one of the most welcoming triathlon festivals in the country.`

  const newHighlights = [
    'One of New Zealand\'s longest-running triathlon festivals — on the calendar since 1985',
    'Stunning Lake Taupo setting with views to Tongariro National Park\'s volcanic peaks',
    'Two-day festival: National Aquathlon Championships (Saturday) and Triathlon (Sunday)',
    'Erin Baker Standard Distance — named after the legendary NZ triathlete',
    'AquaBike World Championship qualifier event',
    'Crystal-clear freshwater swim in Lake Taupo',
    'Races for all ages and abilities: from kids\' Splash & Dash ($10) to standard distance',
    'Draft-legal Sprint option for competitive racers',
  ]

  const newDistanceDetails = [
    {
      name: 'Erin Baker Standard Distance',
      distance: '51.5 km',
      elevation: 'Moderate',
      time: '2h 15m - 4h',
      description: 'The headline race: 1.5 km swim, 40 km bike, 10 km run. Named after legendary Kiwi triathlete Erin Baker. Individual or team entry. AquaBike option available (swim + bike only) as a World Championship qualifier.',
    },
    {
      name: 'Sprint Distance',
      distance: '25.75 km',
      elevation: 'Moderate',
      time: '1h 10m - 2h 30m',
      description: '750m swim, 20 km bike, 5 km run. Available as draft-legal for competitive racers, or standard non-drafting. Individual or team entry.',
    },
    {
      name: 'Youth Triathlon / Try-A-Tri',
      distance: '12.8 km',
      elevation: 'Easy',
      time: '40m - 1h 30m',
      description: '300m swim, 10 km bike, 2.5 km run. Open to ages 8-16 (Youth) or anyone new to triathlon (Try-A-Tri). A perfect introduction to multisport.',
    },
    {
      name: 'National Aquathlon (Open)',
      distance: '6 km',
      elevation: 'Flat',
      time: '25m - 50m',
      description: 'Triathlon NZ National Aquathlon Championships held on Saturday. 1 km swim (2 laps) and 5 km run along Kinloch Beach. Open category includes Elite.',
    },
    {
      name: 'Open Water Swim',
      distance: '750m / 1.5km / 3km',
      elevation: 'N/A',
      time: '15m - 1h 15m',
      description: 'Three open water swim distances in the crystal-clear freshwater of Lake Taupo. A great standalone event or warm-up for Sunday\'s triathlon.',
    },
  ]

  const newDistances = [
    'Standard (1.5km/40km/10km)',
    'Sprint (750m/20km/5km)',
    'Youth Tri (300m/10km/2.5km)',
    'Aquathlon (1km swim/5km run)',
    'Open Water Swim (750m/1.5km/3km)',
  ]

  const newPrice = { min: 10, max: 120, currency: 'NZD' }

  const newSchedule = [
    { time: 'Sat 1:00 PM', description: 'Race pack collection opens at Kinloch Community Hall' },
    { time: 'Sat Afternoon', description: 'Triathlon NZ National Aquathlon Championships' },
    { time: 'Sun 6:30 AM', description: 'Transition area opens' },
    { time: 'Sun 7:00 AM', description: 'Erin Baker Standard Distance & AquaBike start' },
    { time: 'Sun 8:00 AM', description: 'Sprint Distance start' },
    { time: 'Sun 8:30 AM', description: 'Youth Triathlon, Try-A-Tri & Open Water Swims' },
    { time: 'Sun 9:00 AM', description: 'Splash & Dash (kids under 8)' },
  ]

  console.log('Updating event...\n')

  await prisma.event.update({
    where: { id: event.id },
    data: {
      name: newName,
      description: newDescription,
      highlights: newHighlights,
      distances: newDistances,
      distanceDetails: newDistanceDetails,
      startDate: correctedStartDate,
      endDate: endDate,
      price: newPrice,
      schedule: newSchedule,
      location: 'Kinloch Beach',
      city: 'Taupo',
      region: 'Waikato',
      fullAddress: 'Kinloch Beach, Kinloch, Taupo',
      latitude: -38.6270,
      longitude: 175.9080,
      website: 'https://trisporttaupo.co.nz/events/seven-oaks-kinloch-triathlon-festival-2026/',
      registrationUrl: 'https://trisporttaupo.co.nz/events/seven-oaks-kinloch-triathlon-festival-2026/',
      organizer: 'TriSport Taupo',
      organizerWebsite: 'https://trisporttaupo.co.nz',
      courseTerrain: 'Flat to Rolling',
      courseSurface: 'Mixed — Lake Swim, Sealed Roads, Paths',
      cutoffTime: '4 hours (Standard Distance)',
      requirements: [
        'Bike helmet (mandatory for all bike legs)',
        'Covered shoes for the run',
        'Upper torso coverage during race (except swim)',
        'Triathlon NZ one-day membership or current financial membership',
        'Check Clean Dry compliance for all equipment (freshwater gold clam biosecurity)',
      ],
      inclusions: [
        'Race bib with timing transponder',
        'Transition area access',
        'Aid station support on course',
        'Finisher results',
      ],
    },
  })

  console.log('Updated successfully!')
  console.log(`  Name: ${newName}`)
  console.log(`  Start date: ${correctedStartDate.toISOString()} (7am NZDT Sat 14 Feb)`)
  console.log(`  End date: ${endDate.toISOString()} (Sun 15 Feb)`)
  console.log(`  Description: ${newDescription.length} characters`)
  console.log(`  Highlights: ${newHighlights.length} items`)
  console.log(`  Distances: ${newDistances.length} options`)
  console.log(`  Distance Details: ${newDistanceDetails.length} race categories`)
  console.log(`  Schedule: ${newSchedule.length} items`)
  console.log(`  Price: $${newPrice.min} - $${newPrice.max} NZD`)
  console.log(`  Also updated: location, coordinates, organizer, course info, requirements, website`)
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
