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
  datasources: { db: { url: getDatabaseUrl() } }
})

async function updateEvent(name: string, slug: string, data: any) {
  const event = await prisma.event.findFirst({
    where: { slug },
    select: { id: true, name: true },
  })
  if (!event) {
    console.log(`SKIP: ${name} not found`)
    return
  }
  await prisma.event.update({ where: { id: event.id }, data })
  console.log(`UPDATED: ${name}`)
}

async function main() {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Paataka Farmlands Marathon
  // ─────────────────────────────────────────────────────────────────────────
  await updateEvent('Paataka Farmlands Marathon', 'paataka-farmlands-marathon', {
    description: `The Paataka Farmlands Marathon is a rural running event set in the heart of the Wairarapa, taking runners through the stunning farmlands surrounding Masterton in the greater Wellington region. The event offers a unique opportunity to experience the rolling pastoral countryside that makes the Wairarapa one of New Zealand's most picturesque agricultural regions, with courses winding through working farmland far removed from the urban running experience.

The Wairarapa has a proud tradition of country marathon running, with Athletics and Cycling Masterton having organised road running events in the region for decades. The Paataka Farmlands Marathon continues this heritage, offering participants an authentic rural New Zealand running experience on a course that showcases the region's wide-open spaces, dramatic hill country, and the kind of quiet back-country roads and farm tracks that make Wairarapa running so special.

Whether you are chasing a personal best on the full marathon distance or looking for a more accessible entry into trail and rural running, the event provides a well-supported race day in one of the North Island's most scenic rural settings. The relaxed, community-focused atmosphere is a hallmark of Wairarapa sporting events, and the post-race hospitality reflects the generous spirit of small-town New Zealand.`,
    highlights: [
      'Scenic rural marathon through Wairarapa farmlands near Masterton',
      'Authentic country running experience on quiet back-country roads and farm tracks',
      'Stunning views of the Wairarapa\'s rolling pastoral hill country',
      'Part of a proud tradition of country marathon running in the region',
      'Community-focused atmosphere with generous post-race hospitality',
      'Located in the greater Wellington region, accessible from the capital',
    ],
    organizer: 'Athletics and Cycling Masterton',
    organizerWebsite: 'https://www.acm.kiwi.nz',
    website: 'https://www.paatakamarathon.co.nz',
    registrationUrl: 'https://www.paatakamarathon.co.nz',
    courseTerrain: 'Rolling / Rural',
    courseSurface: 'Mixed — Sealed Roads, Gravel, Farm Tracks',
    courseTraffic: 'Quiet Rural Roads',
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Queenstown Marathon
  // ─────────────────────────────────────────────────────────────────────────
  await updateEvent('Queenstown Marathon', 'queenstown-marathon', {
    description: `The NZ Sotheby's International Realty Queenstown Marathon presented by ASICS is one of New Zealand's premier road running events, set against the breathtaking backdrop of the Crown and Remarkable mountain ranges in the Queenstown Lakes district. The event has grown into one of the most scenic marathons in the world, attracting thousands of runners from across New Zealand and internationally each November to race through some of the South Island's most spectacular landscapes.

The point-to-point courses showcase the very best of the Queenstown Lakes region. The marathon starts at the prestigious Millbrook Resort near Arrowtown and follows a route that takes in the historic gold-mining village of Arrowtown, the tranquil shores of Lake Hayes, the dramatic Shotover River gorge, the shimmering waters of Lake Wakatipu, and the manicured Queenstown Gardens before finishing in the heart of Queenstown itself. With 70% of the course on smooth hard-packed trails away from roads and the remaining 30% on closed or partially closed roads, runners enjoy a mainly flat, fast course with stunning mountain scenery at every turn.

The event offers four distances to suit all abilities: the full 42 km marathon, a 21.1 km half marathon, a 10 km fun run, and a 2.2 km kids run. The course is renowned for its flat, fast profile ideal for personal bests, while the world-class aid station support, finisher medals, and the electric atmosphere of the Queenstown finish line make it a bucket-list event for runners of all levels. The seven-hour course time limit for the marathon ensures the event is accessible to a wide range of participants.`,
    highlights: [
      'One of the most scenic marathon courses in the world, set beneath the Remarkables',
      'Point-to-point course from Millbrook Resort through Arrowtown to Queenstown',
      '70% smooth hard-packed trails, 30% closed roads — mainly flat and fast',
      'Four distances: 42 km marathon, 21.1 km half, 10 km, and 2.2 km kids run',
      'Course passes Lake Hayes, Shotover River, Lake Wakatipu, and Queenstown Gardens',
      'All marathon finishers receive a finisher medal with optional custom engraving',
      'Free shuttle bus from Queenstown to all start lines included with entry',
      'Seven-hour course time limit makes the marathon accessible to all abilities',
    ],
    distanceDetails: [
      {
        name: 'Air New Zealand Marathon',
        distance: '42 km',
        elevation: 'Mainly flat with a few undulations',
        time: 'Up to 7 hours',
        description: 'The flagship event starting at Millbrook Resort, Arrowtown. A point-to-point course through Arrowtown, past Lake Hayes, along the Shotover River, beside Lake Wakatipu and through Queenstown Gardens to the finish at Queenstown Recreation Ground. 70% hard-packed trails, 30% closed roads. Cut-off: 7 hours (course closes 4:00 PM).',
      },
      {
        name: 'La Roche Posay Half Marathon',
        distance: '21.1 km',
        elevation: 'Flat',
        time: 'Up to 3.5 hours',
        description: 'Starting on Speargrass Flat Road, the half marathon joins the marathon course at Lake Hayes and follows the same stunning route to Queenstown. A flat, fast course ideal for half marathon personal bests.',
      },
      {
        name: 'United Airlines 10km',
        distance: '10 km',
        elevation: 'Rolling',
        time: 'Up to 1.5 hours',
        description: 'Starting from Allan Crescent in Frankton, the 10 km follows the final section of the marathon course along Lake Wakatipu and through Queenstown Gardens to the finish line.',
      },
      {
        name: 'Kids Run',
        distance: '2.2 km',
        elevation: 'Flat',
        time: '15 - 30 min',
        description: 'A fun, non-competitive run for children held in the afternoon at 1:00 PM in central Queenstown.',
      },
    ],
    distances: [
      'Marathon (42km)',
      'Half Marathon (21.1km)',
      '10km',
      'Kids Run (2.2km)',
    ],
    schedule: [
      { time: '7:30 AM', description: 'United Airlines 10km start (Allan Crescent, Frankton)' },
      { time: '8:00 AM', description: 'La Roche Posay Half Marathon start (Speargrass Flat Rd)' },
      { time: '8:20 AM', description: 'Air New Zealand Marathon start (Millbrook Resort)' },
      { time: '1:00 PM', description: 'Kids Run start (Queenstown)' },
      { time: '4:00 PM', description: 'Course officially closes' },
    ],
    organizer: 'Queenstown Marathon',
    organizerWebsite: 'https://queenstown-marathon.co.nz',
    website: 'https://queenstown-marathon.co.nz',
    registrationUrl: 'https://queenstown-marathon.co.nz/entry-info/',
    courseTerrain: 'Flat to Rolling',
    courseSurface: 'Mixed — 70% Hard-Packed Trails, 30% Sealed Roads',
    courseTraffic: 'Closed or Partially Closed Roads',
    cutoffTime: '7 hours (Marathon)',
    requirements: [
      'Marathon runners must reach Lake Hayes Trail (11.65 km) by 11:00 AM',
      'Marathon runners must reach Domain Road Track (25 km) by 1:10 PM',
      'Marathon runners must reach SH6 crossing (32.2 km) by 2:25 PM',
    ],
    inclusions: [
      'Race bib with timing device',
      'Gear bag tag',
      'Free shuttle bus to start line',
      'Aid station support (11 stations on marathon, 5 on half, 2 on 10 km)',
      'Water and energy drinks on course',
      'Toilet facilities at aid stations',
      'First aid support',
      'Finisher medal (marathon)',
    ],
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Whangarei Triathlon
  // ─────────────────────────────────────────────────────────────────────────
  await updateEvent('Whangarei Triathlon', 'whangarei-triathlon', {
    description: `The Whangarei Triathlon is a community-focused multisport event organised by the Whangarei Triathlon Club, one of Northland's most established triathlon clubs. Held at the scenic Onerahi Foreshore on the edge of Whangarei Harbour, the event offers both long and short course triathlon distances as well as duathlon options, making it accessible to athletes of all ages and abilities from first-timers to experienced competitors.

The Whangarei Triathlon Club is a not-for-profit organisation dedicated to providing a fun and safe environment for multisport participation. The club runs a full season of events through the warmer months, including triathlons and Splash & Dash events in summer, and road and off-road duathlons in winter. The Whangarei Triathlon is the flagship race day and draws participants from across the Northland region.

The Onerahi Foreshore provides an ideal race venue with harbour swimming, a cycling course through Whangarei's coastal roads, and running along the foreshore. The club ethos of inclusivity means the event is particularly welcoming to newcomers, with the motto "Your first Tri is free!" encouraging athletes to give triathlon a go in a supportive, low-pressure environment.`,
    highlights: [
      'Community triathlon at scenic Onerahi Foreshore on Whangarei Harbour',
      'Long course (600m swim / 20 km cycle / 7 km run) and short course options',
      'Organised by Whangarei Triathlon Club — a not-for-profit community club',
      '"Your first Tri is free!" — welcoming to newcomers and first-time triathletes',
      'Duathlon option available (3.5 km run / 10 km bike / 3.5 km run)',
      'Full season of events from summer triathlons to winter duathlons',
    ],
    distanceDetails: [
      {
        name: 'Long Course Triathlon',
        distance: '27.6 km total',
        elevation: 'Minimal',
        time: '1h 15m - 2h 30m',
        description: '600m harbour swim, 20 km cycle, and 7 km run at Onerahi Foreshore. The main event distance for experienced triathletes.',
      },
      {
        name: 'Short Course Triathlon',
        distance: '13.8 km total',
        elevation: 'Minimal',
        time: '40m - 1h 30m',
        description: '300m harbour swim, 10 km cycle, and 3.5 km run. An ideal introductory triathlon distance for newcomers or those building fitness.',
      },
      {
        name: 'Duathlon',
        distance: '17 km total',
        elevation: 'Minimal',
        time: '45m - 1h 30m',
        description: '3.5 km run, 10 km bike, 3.5 km run. A great option for those who prefer to skip the swim.',
      },
    ],
    distances: [
      'Long Course (600m/20km/7km)',
      'Short Course (300m/10km/3.5km)',
      'Duathlon (3.5km/10km/3.5km)',
    ],
    organizer: 'Whangarei Triathlon Club',
    organizerWebsite: 'https://whangareitri.co.nz',
    website: 'https://www.whangareitriathlon.co.nz/',
    registrationUrl: 'https://whangareitri.co.nz/whangarei-triathlon-club/',
    courseTerrain: 'Flat / Coastal',
    courseSurface: 'Mixed — Harbour Swim, Sealed Roads, Foreshore Paths',
    courseTraffic: 'Partial Road Closure',
    requirements: [
      'Bike helmet (mandatory for all cycle legs)',
      'Triathlon NZ one-day or annual membership',
      'Covered shoes for the run',
    ],
    inclusions: [
      'Race bib with timing',
      'Transition area access',
      'Aid station support',
      'First triathlon free for newcomers',
    ],
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Kerikeri Half Marathon (NEEDS COORDS)
  // ─────────────────────────────────────────────────────────────────────────
  await updateEvent('Kerikeri Half Marathon', 'kerikeri-half-marathon', {
    description: `The Northland Waste Kerikeri Half Marathon is renowned as New Zealand's fastest and most scenic half marathon, featuring a predominantly downhill course from the rural township of Okaihau to the beautiful Kerikeri Domain in the heart of the Bay of Islands. The event is the final race in the Sport Northland Run/Walk Series each year and has become an iconic fixture on the Northland events calendar, drawing runners from across the country who are chasing personal bests on this famously fast course.

Starting at the junction of State Highway 1 and Waiare Road near Okaihau, the 21.1 km course descends approximately 200 metres through the rolling Northland countryside towards the coast. The first 7 km features a gradual climb with two distinct hills, after which the remaining 14 km is predominantly downhill, making it one of the fastest half marathon courses in New Zealand. Runners pass through lush farmland and native bush with views that capture the essence of subtropical Northland.

In addition to the half marathon, the event offers a scenic 5 km fun run that heads off-road and explores Kerikeri's spectacular trails, including views of the Wairoa Stream Waterfall. The 5 km is open to all ages, with children under 15 required to be accompanied by an adult. Buses run from Kerikeri and Paihia to transport half marathon runners to the Okaihau start, and the finish at Kerikeri Domain provides a festive atmosphere with the community turning out in force to welcome runners home.`,
    highlights: [
      'New Zealand\'s fastest half marathon course — predominantly downhill with 200m net descent',
      'Scenic point-to-point course from Okaihau to Kerikeri Domain in the Bay of Islands',
      'Final event in the Sport Northland Run/Walk Series',
      '5 km fun run on off-road trails with views of the Wairoa Stream Waterfall',
      'Bus transport from Kerikeri and Paihia to the Okaihau start line included',
      'Staggered start times for runners, competitive walkers, hybrid run/walkers, and walkers',
      'Ideal course for half marathon personal bests through Northland countryside',
    ],
    distanceDetails: [
      {
        name: 'Half Marathon',
        distance: '21.1 km',
        elevation: '-200m (net downhill)',
        time: '1h 10m - 3h 30m',
        description: 'Point-to-point from Okaihau to Kerikeri Domain. The first 7 km includes a gradual climb with two hills, followed by 14 km of predominantly downhill running through rolling Northland countryside. Staggered starts: runners at 7:00 AM, competitive walkers at 7:20 AM, hybrid run/walkers at 7:25 AM, walkers at 7:30 AM.',
      },
      {
        name: '5km Fun Run',
        distance: '5 km',
        elevation: 'Undulating',
        time: '20m - 1h',
        description: 'An off-road trail run through Kerikeri\'s spectacular bush trails, including views of the Wairoa Stream Waterfall. Open to all ages, but children under 15 must be accompanied by an adult.',
      },
    ],
    distances: [
      'Half Marathon (21.1km)',
      '5km Fun Run',
    ],
    schedule: [
      { time: '5:15 AM', description: 'Buses depart Kerikeri for Okaihau start' },
      { time: '5:30 AM', description: 'Registration opens at 21 km start area (Okaihau)' },
      { time: '6:00 AM', description: 'Last bus from Paihia' },
      { time: '6:30 AM', description: 'Last bus from Kerikeri' },
      { time: '6:45 AM', description: 'Compulsory safety briefing' },
      { time: '6:55 AM', description: 'Wheelchairs/Race Chairs start' },
      { time: '7:00 AM', description: 'Runners start' },
      { time: '7:20 AM', description: 'Competitive Walkers start' },
      { time: '7:25 AM', description: 'Hybrid (Run/Walkers) start' },
      { time: '7:30 AM', description: 'Walkers start' },
    ],
    organizer: 'Sport Northland Events',
    organizerWebsite: 'https://www.sportnorthlandevents.co.nz',
    website: 'https://www.kerikerihalfmarathon.co.nz/',
    registrationUrl: 'https://www.kerikerihalfmarathon.co.nz/',
    courseTerrain: 'Rolling / Downhill',
    courseSurface: 'Sealed Roads',
    courseTraffic: 'Partial Road Closure',
    // Kerikeri Domain finish location coordinates
    latitude: -35.2268,
    longitude: 173.9474,
    requirements: [
      'Children under 15 must be accompanied by an adult (5 km)',
      'Participants must attend the compulsory safety briefing at 6:45 AM',
      'Parking at Kerikeri Domain must be exited by 1:30 PM',
    ],
    inclusions: [
      'Bus transport from Kerikeri and Paihia to the start line',
      'Race bib with timing',
      'On-course aid stations',
      'Finish line at Kerikeri Domain',
    ],
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Timaru Ten
  // ─────────────────────────────────────────────────────────────────────────
  await updateEvent('Timaru Ten', 'timaru-ten', {
    description: `The Timaru Ten is a fast and flat 10 km road race held annually at Levels Raceway in Timaru, South Canterbury. Featuring what is billed as New Zealand's fastest certified 10 km course, the event has become a must-do for runners chasing personal bests as well as a celebration of community running for participants of all abilities. The course layout at the motorsport circuit delivers a perfectly flat, wind-sheltered environment that is purpose-built for speed.

The event has grown to become a significant fixture on the New Zealand running calendar, hosting the New Zealand 10 km Road Championships in recent years — a mark of the course's quality and certification standard. Athletics Canterbury is closely involved in the event, and the fast, flat course on the smooth sealed surface of Levels Raceway consistently produces some of the quickest 10 km times in the country. The layout consists of one small lap and four 2.3 km laps, giving spectators and supporters excellent viewing opportunities.

Beyond the headline Bluestone 10 km, the Timaru Ten offers a Frontrunner 5 km run on a certified course and a Kids' Mile for primary school-aged children, making it a genuine family event. The atmosphere is electric, with a cheering crowd lining the course and a legendary post-race spread to refuel after the finish. Gates open at 7:00 AM, and the community spirit and South Canterbury hospitality make this one of the most enjoyable race days on the running calendar.`,
    highlights: [
      'New Zealand\'s fastest certified 10 km course — perfectly flat at Levels Raceway',
      'Host of the NZ 10 km Road Championships — a mark of course quality',
      'Four 2.3 km laps on smooth sealed surface — ideal for personal bests',
      'Frontrunner 5 km certified course and Kids\' Mile for families',
      'Electric atmosphere with cheering crowds and legendary post-race food',
      'Wind-sheltered motorsport circuit setting in the heart of South Canterbury',
    ],
    distanceDetails: [
      {
        name: 'Bluestone 10km',
        distance: '10 km',
        elevation: 'Flat',
        time: '30m - 1h 10m',
        description: 'New Zealand\'s fastest certified 10 km course at Levels Raceway. One small lap and four 2.3 km laps on perfectly flat sealed surface. Pacers available. Host of the NZ 10 km Road Championships.',
      },
      {
        name: 'Frontrunner 5km',
        distance: '5 km',
        elevation: 'Flat',
        time: '18m - 40m',
        description: 'A certified 5 km course providing the perfect opportunity for runners and joggers of all abilities on the same flat, fast Levels Raceway circuit.',
      },
      {
        name: 'Kids\' Mile',
        distance: '1.6 km',
        elevation: 'Flat',
        time: '5m - 15m',
        description: 'A fun run for primary school-aged children around the raceway. A great introduction to running in a safe, traffic-free environment.',
      },
    ],
    distances: [
      'Bluestone 10km',
      'Frontrunner 5km',
      'Kids\' Mile',
    ],
    schedule: [
      { time: '7:00 AM', description: 'Gates open — race bib pick up and warm up' },
    ],
    organizer: 'Run Timaru',
    organizerWebsite: 'https://timaruten.nz',
    website: 'https://timaruten.nz/',
    registrationUrl: 'https://timaruten.nz/register-now-blustone10/',
    courseTerrain: 'Flat',
    courseSurface: 'Sealed — Motorsport Circuit',
    courseTraffic: 'Traffic Free (closed circuit)',
    requirements: [
      'Late race bib pick ups and cash registrations must be 30+ minutes before race start',
    ],
    inclusions: [
      'Race bib with timing',
      'Certified course for official times',
      'Pacers on the 10 km course',
      'Post-race food spread',
    ],
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Huka Challenge (Lake Taupo Cycle Challenge MTB events)
  // ─────────────────────────────────────────────────────────────────────────
  await updateEvent('Huka Challenge', 'huka-challenge', {
    description: `The Huka Challenge is the mountain biking arm of the legendary Lake Taupo Cycle Challenge, New Zealand's largest and longest-running cycling event. First held in 1977 when just 26 riders circumnavigated Lake Taupo, the Lake Taupo Cycle Challenge has grown into a premier bucket-list cycling festival attracting around 7,000 riders each year on the last Saturday of November. The Huka mountain bike events offer riders the chance to experience some of the best MTB trails in the central North Island.

The Huka MTB courses wind through pine forests and beautiful native bush with epic views over Lake Taupo, passing iconic landmarks including the AJ Hackett Bungy, Huka Falls, Aratiatia Dam, and the steamy silica thermal stream at Wairakei via the Taupo Rotary Ride track. Three distances are on offer: the Huka Teaser (approximately 30 km on Grade 2-3 tracks), the Huka Steamer (approximately 60 km on Grade 3-4 tracks), and the Tineli Huka Hundy (approximately 100 km through pine forests and native bush — the ultimate MTB challenge). E-bikes are permitted in all categories and timed separately.

The event is a locally owned, not-for-profit Rotary event, with all surpluses distributed back into the Taupo community. Rider check-in takes place at the Great Lake Centre in Taupo, and the event atmosphere is enhanced by a Sport & Lifestyle Expo. The Huka Challenge is part of a wider festival that includes the iconic Round the Lake road rides, making it a true celebration of cycling in all its forms.`,
    highlights: [
      'Part of the legendary Lake Taupo Cycle Challenge — NZ\'s largest cycling event since 1977',
      'Three MTB distances: 30 km Huka Teaser, 60 km Huka Steamer, 100 km Tineli Huka Hundy',
      'Trails pass Huka Falls, AJ Hackett Bungy, Aratiatia Dam, and thermal landscapes',
      'Courses wind through pine forests and native bush with views over Lake Taupo',
      'Not-for-profit Rotary community event — surpluses go back into Taupo',
      'E-bikes welcome in all categories, timed separately',
      'Approximately 7,000 riders across all event categories each year',
      'Comprehensive on-course support including mechanical, hydration, and first aid',
    ],
    distanceDetails: [
      {
        name: 'Tineli Huka Hundy',
        distance: '~100 km',
        elevation: 'Significant',
        time: '4h - 8h',
        description: 'The ultimate MTB challenge — 100 km of incredible mountain bike tracks winding through pine forests and native bush with epic views over Lake Taupo. A water stop and hydration point at The Hub at approximately 27 km. E-bikes permitted and timed separately.',
      },
      {
        name: 'Huka Steamer',
        distance: '~60 km',
        elevation: '+1,125m / -1,128m',
        time: '2h 30m - 5h',
        description: 'Approximately 80% Grade 3 and 20% Grade 4 tracks. A challenging MTB course passing Huka Falls, AJ Hackett Bungy, Aratiatia Dam, and the Wairakei thermal stream. For experienced mountain bikers.',
      },
      {
        name: 'Huka Teaser',
        distance: '~30 km',
        elevation: 'Moderate',
        time: '1h 30m - 3h',
        description: 'A mixture of Grade 2 and Grade 3 tracks — ideal for intermediate riders or those new to MTB events. Shares many of the iconic course highlights including Huka Falls and thermal landscapes.',
      },
    ],
    distances: [
      'Tineli Huka Hundy (~100km)',
      'Huka Steamer (~60km)',
      'Huka Teaser (~30km)',
    ],
    schedule: [
      { time: 'Fri 12:00 PM', description: 'Rider check-in opens at Great Lake Centre, Taupo' },
      { time: 'Fri 8:00 PM', description: 'Friday check-in closes' },
      { time: 'Sat 6:00 AM', description: 'Saturday check-in opens' },
      { time: 'Sat 9:00 AM', description: 'Saturday check-in closes' },
    ],
    organizer: 'Lake Taupo Cycle Challenge (Rotary)',
    organizerWebsite: 'https://www.cyclechallenge.com',
    website: 'https://www.cyclechallenge.com',
    registrationUrl: 'https://www.cyclechallenge.com',
    courseTerrain: 'Hilly / Forest',
    courseSurface: 'MTB Trail — Grade 2-4 Single Track, Forest Tracks',
    courseTraffic: 'Off-Road (dedicated MTB trails)',
    requirements: [
      'Mountain bike in good working order',
      'Bike helmet (mandatory)',
      'E-bikes permitted in all categories (timed separately)',
    ],
    inclusions: [
      'Online entry and electronic timing',
      'Regular email updates and welcome guide',
      'Bike mechanical support on course',
      'Water and hydration stations on course',
      'First aid cover from St John Ambulance',
      'Sport & Lifestyle Expo access',
      'Certificates and online results',
      'Personalised online magazine post-event',
      'Cadence Club participation recognition',
    ],
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Pioneer Mountain Bike Stage Race
  // ─────────────────────────────────────────────────────────────────────────
  await updateEvent('Pioneer Mountain Bike Stage Race', 'pioneer-mountain-bike-stage-race', {
    description: `The Pioneer is a world-class 6-day mountain bike stage race based in Queenstown, New Zealand, and one of only three events worldwide to hold EPIC status alongside the Swiss Epic and the Absa Cape Epic in South Africa. Created by IRONMAN Group Oceania Managing Director Dave Beeche, The Pioneer debuted in 2016 and has rapidly established itself as one of the premier multi-day MTB stage races in the world.

The race covers approximately 424 km with around 15,000 metres of climbing over six stages, taking riders through some of the most spectacular and varied terrain in the South Island. The course changes every year but consistently delivers stunning landscapes, challenging single track, epic climbs, and iconic Kiwi hospitality. Past editions have taken riders from Queenstown south-east to Alexandra and the Clutha River before returning to the finish in Queenstown, with a prologue stage at Coronet Peak.

All riders must compete in teams of two, staying no more than two minutes apart for the entire race — a format that rewards teamwork and strategy as much as fitness. The Pioneer Race Village moves to a new host town each day, providing tented accommodation, catering (breakfast and dinner), mechanical services, laundry, showers and massage. On-course aid stations provide food and PURE Sports Nutrition electrolyte and gels. The event is as much about the community and camaraderie as it is about the racing, making it a truly pioneering mountain bike experience.`,
    highlights: [
      'One of only three EPIC-status MTB stage races in the world',
      '6-day stage race covering ~424 km with ~15,000m of climbing',
      'Teams of two must stay within 2 minutes of each other throughout the race',
      'Course changes every year — stunning South Island terrain guaranteed',
      'Race Village moves daily with tented accommodation, meals, and full support services',
      'Created in 2016 by IRONMAN Group Oceania — rapidly gained world-class status',
      'Past routes have included Coronet Peak, Alexandra, Clutha River, and Queenstown trails',
      'Aid stations with food and PURE Sports Nutrition on every stage',
    ],
    distanceDetails: [
      {
        name: 'The Pioneer (6-Day Stage Race)',
        distance: '~424 km total',
        elevation: '+15,000m total',
        time: '6 days',
        description: 'A 6-day mountain bike stage race in teams of two, covering approximately 424 km with 15,000m of climbing through the spectacular terrain of the South Island. Course changes annually. Riders must stay within 2 minutes of their teammate at all times. Includes a prologue and five longer stages.',
      },
    ],
    distances: [
      'The Pioneer (6-Day, ~424km)',
    ],
    organizer: 'The IRONMAN Group',
    organizerWebsite: 'https://www.thepioneer.co.nz',
    website: 'https://www.thepioneer.co.nz',
    registrationUrl: 'https://www.thepioneer.co.nz/overview/entry-info/',
    courseTerrain: 'Mountainous / Varied',
    courseSurface: 'MTB Trail — Single Track, Gravel, Back-Country Roads',
    courseTraffic: 'Off-Road and Closed Roads',
    requirements: [
      'Must enter as a team of two',
      'Riders must stay within 2 minutes of their teammate at all times',
      'Mountain bike in good working order',
      'Bike helmet (mandatory)',
      'Appropriate fitness for multi-day endurance mountain biking',
    ],
    inclusions: [
      'Tented accommodation in Pioneer Race Village (5 nights)',
      'Breakfast and dinner daily in the Race Village',
      'Aid stations with food and PURE Sports Nutrition on each stage',
      'Basic mechanical services on course and in Race Village',
      'Laundry, shower, and massage facilities',
      'Gear bag transport between stages',
      'Electronic timing and online results',
    ],
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Cape Reinga to Bluff (Tour Aotearoa) (NEEDS COORDS)
  // ─────────────────────────────────────────────────────────────────────────
  await updateEvent('Cape Reinga to Bluff', 'cape-reinga-to-bluff', {
    description: `Tour Aotearoa is New Zealand's longest and most iconic bikepacking event — a self-supported, 3,000 km brevet from Cape Reinga at the very top of the North Island to Bluff at the bottom of the South Island. Created by New Zealand cycling historian and guidebook writer Jonathan Kennett in 2016, the event was designed to highlight New Zealand's most scenic and noteworthy locations while avoiding heavy traffic, linking together Great Rides from the New Zealand Cycle Trail, quiet back-country roads, and even Ninety Mile Beach.

The route is a mix of off-road trails, back-country roads, some stretches of highway, and the legendary 90 Mile Beach, which riders tackle at low tide on firm sand near the water's edge. Participants must complete the ride in no less than 10 days and no more than 30 days (extended to 45 days in the 2026 edition), passing through 30 photo checkpoints along the way. Tour Aotearoa is not a race — it is a brevet, meaning cyclists ride at their own pace, fully self-supported, carrying all their own gear and handling their own bike repairs.

The 2026 Tour Aotearoa Brevet event starts in waves of 100 people per day from Cape Reinga in late February. To participate in the official brevet, riders must sign up for the Maprogress SPOT tracker service, make a $100 donation to a charity of their choice, and carry the equipment and knowledge to perform basic bike repairs including fixing punctures, broken chains, and bent wheels. The Kennett Brothers — Jonathan, Paul and Simon — have been central to New Zealand's mountain biking scene since 1984, and Tour Aotearoa represents their ultimate vision: a bikepacking odyssey through the length of Aotearoa New Zealand.`,
    highlights: [
      'New Zealand\'s longest bikepacking event — 3,000 km from Cape Reinga to Bluff',
      'Self-supported brevet: carry all your own gear, ride at your own pace',
      'Created by cycling historian Jonathan Kennett in 2016 with the Kennett Brothers',
      'Route links New Zealand Cycle Trail Great Rides, back-country roads, and 90 Mile Beach',
      'Complete in 10-30 days via 30 photo checkpoints (up to 45 days in 2026)',
      '2026 brevet starts in waves of 100 riders per day from Cape Reinga',
      'Not a race — a brevet celebrating self-sufficiency, adventure, and community',
      'Riders tackle Ninety Mile Beach at low tide on firm sand near the water\'s edge',
    ],
    distanceDetails: [
      {
        name: 'Tour Aotearoa Brevet',
        distance: '3,000 km',
        elevation: 'Significant (varied terrain over 3,000 km)',
        time: '10 - 30 days (up to 45 days in 2026)',
        description: 'A self-supported bikepacking brevet from Cape Reinga to Bluff, via 30 photo checkpoints. The route follows New Zealand Cycle Trail Great Rides, quiet back-country roads, off-road trails, and Ninety Mile Beach. Riders must be fully self-sufficient with all gear, food and repair capability.',
      },
    ],
    distances: [
      'Tour Aotearoa Brevet (3,000km)',
    ],
    organizer: 'Jonathan Kennett / Kennett Brothers',
    organizerWebsite: 'https://www.kennett.co.nz',
    website: 'https://www.touraotearoa.nz',
    registrationUrl: 'https://www.touraotearoa.nz/p/group-ride.html',
    courseTerrain: 'Varied — Coastal, Forest, Mountain, Plains',
    courseSurface: 'Mixed — Trails, Gravel, Sealed Roads, Beach Sand',
    courseTraffic: 'Mostly Quiet Back-Country Roads and Off-Road Trails',
    cutoffTime: '30 days (45 days for 2026 edition)',
    // Cape Reinga Lighthouse start coordinates
    latitude: -34.4288,
    longitude: 172.6810,
    requirements: [
      'Must be fully self-supported — carry all gear, food, and repair equipment',
      'Ability to fix a puncture, broken chain, and bent wheel',
      'Carry spare derailleur hanger, spare brake pads, spare tubes, and cleat screws',
      'Sign up for Maprogress SPOT tracker service for brevet participation',
      'Make a $100 donation to a charity of your choice',
      'Minimum tyre width of 1.6 inch / 40 mm recommended',
      'Plan start time around Ninety Mile Beach low tide',
    ],
    inclusions: [
      'GPS route files and official route documentation',
      'SPOT tracker live tracking at tai26.maprogress.com',
      'Brevet completion recognition',
    ],
  })

  console.log('\nBatch 5 enrichment complete!')
}

main()
  .catch((e: any) => { console.error('Fatal:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
