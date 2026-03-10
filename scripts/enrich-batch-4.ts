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
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Taupo Ultra
  // ──────────────────────────────────────────────────────────────────────────
  await updateEvent('Taupo Ultra', 'taupo-ultra', {
    description: `The Taupo Ultramarathon is a spectacular trail running event that takes competitors on a journey along Taupo's Great Lake Trail, showcasing stunning lake views, volcanic mountains, rivers, waterfalls and native New Zealand bush. Organised by Total Sport, the event has grown into one of the most popular ultramarathons in New Zealand, attracting runners from across the country and beyond to the shores of Lake Taupo each October.

The courses wind through some of the most breathtaking scenery in the central North Island, utilising interconnected trails across private land that make this quite possibly the most runnable set of ultramarathon events in New Zealand. From the remote western shores of the lake at the Waihaha River, through rolling private farmland, dense native podocarp forest, and along the scenic Kawakawa Bay, runners experience an ever-changing landscape beneath the volcanic skyline. The 100km event is a recognised UTMB Index and Western States 100-mile qualifying race.

What makes the Taupo Ultra special is its deep sense of community — the base camp at Whakaipo Bay is renowned for its high emotions and mutual support among participants. With distances from 24km to 100km (including a team relay), the event welcomes everyone from first-time trail runners to seasoned ultra athletes. The iconic glass finisher medals have become collector's items, and 2026 has been confirmed as the final year of this beloved tradition.`,

    highlights: [
      'Spectacular point-to-point courses along Taupo\'s Great Lake Trail through native bush and lakeside scenery',
      'Recognised UTMB Index and Western States 100-mile qualifying event',
      'Five distance options from 24km to 100km plus a 100km team relay',
      'Iconic glass finisher medals — 2026 confirmed as the final year of this tradition',
      'Described as the most runnable set of ultramarathon events in New Zealand',
      'Courses traverse private land, native bush, farmland and volcanic landscapes',
      'World-class aid stations with food, electrolytes and volunteer support',
      'Welcoming community atmosphere at the Whakaipo Bay finish line',
    ],

    organizer: 'Total Sport',
    organizerWebsite: 'https://www.totalsport.co.nz',
    registrationUrl: 'https://portal.totalsport.co.nz',

    distanceDetails: [
      {
        name: '100km Run',
        distance: '100 km',
        elevation: '+1,853m',
        time: '9 - 19 hrs',
        description: 'The flagship ultra beginning at Waihaha River carpark on the western shores of Lake Taupo. Runners traverse native bush, private farmland and forestry before reaching the halfway airstrip, then continue through the scenic Kawakawa Bay section and finish via the W2K trail and Headland Loop at Whakaipo Bay. 80% single trail, 10% road, 10% off-road.',
      },
      {
        name: '100km Team Relay',
        distance: '100 km',
        elevation: '+1,853m',
        time: '9 - 19 hrs',
        description: 'The same epic 100km course tackled as a team relay with exchange points at designated aid stations. A great way to experience the full course with friends or a running group.',
      },
      {
        name: '70km Run',
        distance: '70 km',
        elevation: '+1,269m',
        time: '7 - 15 hrs',
        description: 'Starting at Richardson\'s Farm on Hingarae Road, this distance serves as a stepping stone toward the full 100km. Runners traverse private farmland, forest sections and scenic Great Lake Trail portions before finishing at Whakaipo Bay. 70% single trail, 15% off-road, 15% road.',
      },
      {
        name: '50km Run/Walk',
        distance: '50 km',
        elevation: '+859m',
        time: '4 - 11 hrs',
        description: 'Beginning at the airstrip on Whangamata Road and heading down onto the Kawakawa section of the Great Lake Trails. 98% single trail terrain with all downhill to Kawakawa Bay through amazing native bush before climbing to Codger\'s Rock and finishing at Whakaipo Bay.',
      },
      {
        name: '24km Run/Walk',
        distance: '24 km',
        elevation: '+734m',
        time: '2 - 6 hrs',
        description: 'Starting at Kinloch Domain and travelling through Kinloch streets before transitioning to the W2K trail and Headland Loop. A challenging but accessible introduction to trail ultra running with 92% single trail terrain.',
      },
    ],

    schedule: [
      { time: '3:30 PM (Fri)', description: 'Registration opens at Great Lake Centre, Storey Place, Taupo' },
      { time: '8:00 PM (Fri)', description: 'Registration closes' },
      { time: '5:30 AM', description: '100km start — Waihaha carpark, SH32' },
      { time: '8:00 AM', description: '70km start — Richardson\'s Farm, Hingarae Road' },
      { time: '10:00 AM', description: '50km start — Airstrip, Whangamata Road' },
      { time: '12:15 PM', description: '24km start — Kinloch Domain' },
      { time: '12:00 AM', description: 'Finish line closure at Whakaipo Bay (midnight)' },
      { time: '11:00 AM (Sun)', description: 'Prize giving at Great Lake Centre Theatre' },
    ],

    courseTerrain: 'Trail / Volcanic / Lakeside',
    courseSurface: 'Single Trail, Gravel Road, Farm Tracks',
    courseTraffic: 'Off-road — Private Land and Trails',
    cutoffTime: '100km: midnight (18.5hrs); 70km: midnight; 50km: midnight',

    requirements: [
      'Compulsory race briefing attendance (Friday or online)',
      'Headlamp with spare batteries for 100km dark start and all distances if finishing late',
      'Reusable cup or bottle — no disposable cups at aid stations',
      'Weigh-in required at registration for 70km and 100km participants',
      'Mandatory gear as per Health & Safety guidelines',
      'Mobile phone (charged)',
    ],

    inclusions: [
      'Glass finisher medal (final year in 2026)',
      'Aid station support with food, electrolytes and water',
      'Drop bag service at designated aid stations',
      'Bus transport to start lines from Whakaipo Bay',
      'Finish line food and Speight\'s beer',
      'Race timing and results',
    ],
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Motu Challenge
  // ──────────────────────────────────────────────────────────────────────────
  await updateEvent('Motu Challenge', 'motu-challenge', {
    description: `The Motu Challenge is the North Island's premier multisport event and one of New Zealand's best-known races of its kind. Held annually in and around Opotiki in the Bay of Plenty, the event takes competitors on a gruelling but spectacular journey through some of the most remote and rugged terrain in the eastern Bay of Plenty, following the historic Motu Road and trails that wind through native bush, river valleys and coastal landscapes.

The event offers multiple formats to suit different athletes. The flagship Motu Challenge multisport race comprises four stages — a 65km mountain bike leg, a 17km run, a 52km road cycle, and a final multisport stage featuring a 27km kayak, 8km road cycle and 3km run to the finish. The Motu 160 is a pure cycling challenge combining the 65km mountain bike stage with a 95km road bike ride back over Traffords Hill and down the Waioeka Gorge to Opotiki. Duathlon options in both short and long course formats are also available.

The mountain bike stage, which has been voted the best mountain bike section of any race in New Zealand, starts with a mass start in Elliott Street, Opotiki, following the East Coast Scenic Highway before turning onto the legendary Motu Road — a winding, hilly gravel road through some of the most remote countryside in the North Island. Competitors can enter as individuals or two-person teams, making the event accessible to a wide range of abilities and ambitions.`,

    highlights: [
      'North Island\'s premier multisport event held annually in Opotiki, Bay of Plenty',
      'Mountain bike stage voted the best mountain bike section of any race in New Zealand',
      '65km mountain bike leg on the legendary Motu gravel road through remote countryside',
      'Multiple event formats: full multisport, Motu 160 cycling challenge, and duathlon options',
      'Mass start in Elliott Street, Opotiki with scenic East Coast Highway route',
      'Individual and two-person team entry options available',
      'Stunning course through native bush, river valleys and the Waioeka Gorge',
    ],

    organizer: 'Motu Challenge Events',
    organizerWebsite: 'https://www.motuchallenge.co.nz',

    latitude: -38.0094,
    longitude: 177.2872,

    distanceDetails: [
      {
        name: 'Motu Challenge (Multisport)',
        distance: '172 km total',
        elevation: 'Significant — hilly gravel roads and trails',
        time: 'Full day event',
        description: 'The flagship multisport race with four stages: 65km mountain bike on the Motu Road, 17km run, 52km road cycle, and a multisport finale of 27km kayak, 8km road cycle and 3km run to the finish at Opotiki Memorial Park.',
      },
      {
        name: 'Motu 160',
        distance: '160 km',
        elevation: 'Significant — includes Traffords Hill climb',
        time: 'Full day event',
        description: 'A pure cycling challenge combining the 65km mountain bike stage raced alongside Motu Challenge competitors, then a 95km road bike ride back over Traffords Hill and down the Waioeka Gorge to Opotiki. Enter as individual or two-person team.',
      },
      {
        name: 'Duathlon (Long Course)',
        distance: 'Varies',
        elevation: 'Moderate',
        time: 'Half day',
        description: 'A long course duathlon option for those who prefer running and cycling without the kayak stage.',
      },
      {
        name: 'Duathlon (Short Course)',
        distance: 'Varies',
        elevation: 'Moderate',
        time: 'Half day',
        description: 'A shorter duathlon option providing an accessible entry point into multisport racing.',
      },
    ],

    courseTerrain: 'Mountainous / Mixed — Hills, Gravel Roads, River',
    courseSurface: 'Sealed Road, Gravel Road, Trail, River (Kayak)',
    courseTraffic: 'Open Roads with Traffic Management',

    requirements: [
      'Mountain bike in good working order with helmet',
      'Road bike and helmet for road cycling stages',
      'Kayak and paddle for multisport kayak stage (BYO or hire)',
      'Appropriate running shoes for trail and road',
    ],

    inclusions: [
      'Race timing and results',
      'Aid station support',
      'Course marshalling and safety support',
      'Finish at Opotiki Memorial Park',
    ],
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Nelson Women's Triathlon
  // ──────────────────────────────────────────────────────────────────────────
  await updateEvent('Nelson Women\'s Triathlon', 'nelson-women-s-triathlon', {
    description: `The Nelson Women's Triathlon is a beloved annual event designed to encourage women and girls of all ages and abilities to have a go at triathlon. Held at Tahunanui Beach in Nelson, it is organised by the Nelson Triathlon & Multisport Club and has established itself as one of the South Island's leading women-only multisport events, welcoming everyone from complete beginners and new mums to experienced weekend athletes.

The event features an easily manoeuvrable course based at Tahunanui Reserve on Nelson's stunning golden sand beach. The swim leg takes place in the sheltered waters off Tahunanui Beach, with the bike leg riding through the surrounding flat coastal streets and the run following paths around the Tahunanui recreation area. The relaxed, supportive atmosphere and non-intimidating distances make this the perfect introduction to the sport of triathlon.

What sets the Nelson Women's Triathlon apart is its genuine focus on participation over competition. With a training programme offered in the weeks leading up to the event and a course designed to be achievable for anyone, the emphasis is firmly on fun, fitness and community. Sponsored by local businesses, the event brings together the Nelson women's sporting community for a morning of encouragement, achievement and celebration.`,

    highlights: [
      'Women-only triathlon welcoming all ages and abilities at Tahunanui Beach, Nelson',
      'Organised by the Nelson Triathlon & Multisport Club',
      'Sheltered ocean swim off Tahunanui Beach with flat, accessible bike and run courses',
      'Pre-event training programme to build confidence for first-timers',
      'Non-intimidating distances designed for participation over competition',
      'Supportive community atmosphere with local business sponsorship',
    ],

    organizer: 'Nelson Triathlon & Multisport Club',
    organizerWebsite: 'https://nelsontriclub.co.nz',

    courseTerrain: 'Flat — Coastal',
    courseSurface: 'Ocean Swim, Sealed Roads, Paths',

    requirements: [
      'Approved cycling helmet (compulsory for bike leg)',
      'Roadworthy bicycle',
      'Suitable running shoes',
    ],

    inclusions: [
      'Race timing and results',
      'Course marshalling and water safety support',
      'Post-race refreshments and celebration',
    ],
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Manawatu Triathlon Series
  // ──────────────────────────────────────────────────────────────────────────
  await updateEvent('Manawatu Triathlon Series', 'manawatu-triathlon-series', {
    description: `The Manawatu Toyota I Tri'd the Tri Series is a children's and youth triathlon series held annually across five Monday evenings from February to March at Skoglund Park and Freyberg Community Pool in Palmerston North. Organised by the Manawatu Triathlon Club, the series is designed as an accessible and fun introduction to the sport of triathlon for young athletes in the Manawatu region.

The series caters to children from age 4 through to 12 years, with distances carefully scaled to each age group. The youngest participants (4-6 years) complete a short course using the Freyberg indoor teaching pool, while older age groups progress through increasingly challenging swim, cycle and run distances at Skoglund Park. The relaxed, supportive format — spread across five events — allows children to build confidence and skills gradually over the summer season.

What makes the I Tri'd the Tri Series special is its focus on getting young people active and engaged in multisport. With affordable entry fees, family-friendly pricing, and a welcoming club atmosphere, it removes the barriers that might otherwise prevent families from trying triathlon. Many of New Zealand's top triathletes started their journey in exactly this kind of community club series.`,

    highlights: [
      'Children\'s and youth triathlon series for ages 4-12 years',
      'Five-event series running Monday evenings from February to March',
      'Held at Skoglund Park and Freyberg Community Pool, Palmerston North',
      'Age-appropriate distances scaled from indoor pool swims to outdoor courses',
      'Affordable entry with family pricing for 3 or more children',
      'Organised by the Manawatu Triathlon Club with a welcoming community atmosphere',
    ],

    organizer: 'Manawatu Triathlon Club',
    organizerWebsite: 'https://www.triclub.co.nz',
    registrationUrl: 'https://www.triclub.co.nz/events/2026-i-trid-the-tri-series',

    distanceDetails: [
      {
        name: 'Ages 4-6',
        distance: '300m run / 600m cycle / 1 pool length swim',
        elevation: 'Flat',
        time: '15 - 30 min',
        description: 'The youngest age group completes a short run, cycle and one length swim in the Freyberg indoor teaching pool. A gentle and fun introduction to triathlon.',
      },
      {
        name: 'Ages 7',
        distance: '750m run / 1.5km cycle / 25m swim',
        elevation: 'Flat',
        time: '15 - 30 min',
        description: 'Stepping up to an outdoor swim of 25 metres with slightly longer run and cycle legs around Skoglund Park.',
      },
      {
        name: 'Ages 8-9',
        distance: '750m run / 1.5km cycle / 50m swim',
        elevation: 'Flat',
        time: '15 - 30 min',
        description: 'A longer swim distance of 50 metres with the same run and cycle distances as the 7-year-old category.',
      },
      {
        name: 'Ages 10-12',
        distance: '1.5km run / 3km cycle / 100m swim',
        elevation: 'Flat',
        time: '20 - 40 min',
        description: 'The longest distances in the series, with a 100m swim, 3km cycle and 1.5km run. Designed to challenge older children preparing for youth triathlon racing.',
      },
    ],

    courseTerrain: 'Flat',
    courseSurface: 'Pool Swim, Sealed Paths, Grass',

    requirements: [
      'Roadworthy bicycle with working brakes',
      'Approved cycling helmet (compulsory)',
      'Suitable running shoes',
      'Swimwear and goggles',
    ],

    inclusions: [
      'Entry to all 5 events in the series',
      'Race timing and results',
      'Marshalled course',
    ],
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 5. K2 Cycle Classic
  // ──────────────────────────────────────────────────────────────────────────
  await updateEvent('K2 Cycle Classic', 'k2-cycle-classic', {
    description: `The MitoQ K2 is possibly the toughest one-day cycle challenge in the Southern Hemisphere. Organised by ARC Events (Adventure Racing Coromandel), the race takes riders on an epic 192km circuit of the entire Coromandel Peninsula, traversing subtropical forest, Pacific coastlines, rural farmland and the striking pohutukawa-lined shores of the Hauraki Gulf. The event has been a fixture of the New Zealand cycling calendar since the early 2000s.

Named after Kuaotunu — a coastal community on the peninsula — with the "2" representing the approximately 200km distance, the K2 features 2,300 metres of relentless climbing across four distinct stages: Coromandel to Thames (53km), Thames to Tairua via Kopu-Hikuai (53km), Tairua to Whitianga via Coroglen (43km), and Whitianga to Coromandel via Kuaotunu (43km). The course starts and finishes in Coromandel Town, travelling anticlockwise around the peninsula.

Beyond the main 192km K2, the event offers the Tineli K1 (86km from Tairua to Coromandel) and the Nicholas Browne Challenge (43km from Whitianga to Coromandel), named after a rider who completed the challenge while on dialysis. E-Bike categories are available for the K1 and NBC distances. The event attracts everyone from professional elite riders chasing the $1,000 course record prize to weekend warriors and recreational cyclists looking for the ultimate one-day challenge. Founders Keith and Rita Stephenson and Andy Reid have run over 70 events together through ARC Events, attracting over 30,000 competitors.`,

    highlights: [
      'Possibly the toughest one-day cycle challenge in the Southern Hemisphere',
      '192km circuit of the entire Coromandel Peninsula with 2,300m of climbing',
      'Four distinct stages through subtropical forest, coastline, farmland and the Hauraki Gulf',
      'Three distance options: K2 (192km), K1 (86km) and Nicholas Browne Challenge (43km)',
      'E-Bike categories available for K1 and NBC distances',
      '$1,000 prize for setting a new K2 course record (current: 4:52:08 by James Oram, 2021)',
      'Multiple age divisions from Junior through 70+ ("Last of the Summer Wine")',
      'Organised by ARC Events with over 20 years of event management experience',
    ],

    organizer: 'ARC Events (Adventure Racing Coromandel)',
    organizerWebsite: 'https://www.arcevents.co.nz',
    registrationUrl: 'https://k2cycle.co.nz',

    latitude: -36.7611,
    longitude: 175.4963,

    distanceDetails: [
      {
        name: 'MitoQ K2',
        distance: '192 km',
        elevation: '+2,300m',
        time: '5 - 10+ hrs',
        description: 'The flagship event — a full circuit of the Coromandel Peninsula starting and finishing in Coromandel Town. Four stages through diverse terrain including the demanding Kopu-Hikuai climb. Elite Men start at 7:00am, main field at 7:15am, with early starts from 6:00am for riders expecting 9+ hours. Minimum age 18.',
      },
      {
        name: 'Tineli K1',
        distance: '86 km',
        elevation: '+1,200m (approx)',
        time: '3 - 6 hrs',
        description: 'Starting in Tairua at 10:30am and finishing in Coromandel. Covers the northern half of the peninsula through Whitianga and Kuaotunu. Includes Women\'s Elite and E-Bike categories.',
      },
      {
        name: 'Nicholas Browne Challenge (NBC)',
        distance: '43 km',
        elevation: '+600m (approx)',
        time: '1.5 - 3.5 hrs',
        description: 'Starting in Whitianga at 9:30am and finishing in Coromandel. Named after a rider who completed the event while on dialysis. The most accessible distance, including an E-Bike category.',
      },
    ],

    schedule: [
      { time: '3:00 PM (Fri)', description: 'K2 registration opens in Coromandel' },
      { time: '5:00 PM (Fri)', description: 'K1 registration opens in Tairua; NBC registration opens in Whitianga' },
      { time: '5:45 AM', description: 'K2 race briefing in Coromandel' },
      { time: '6:00 AM', description: 'K2 early starts (riders expecting 9+ hours)' },
      { time: '7:00 AM', description: 'K2 Elite Men start' },
      { time: '7:15 AM', description: 'K2 main field start' },
      { time: '9:15 AM', description: 'NBC race briefing in Whitianga' },
      { time: '9:30 AM', description: 'NBC start' },
      { time: '10:20 AM', description: 'K1 race briefing in Tairua' },
      { time: '10:30 AM', description: 'K1 start' },
      { time: '2:00 PM', description: 'Prize giving at Coromandel School Field' },
    ],

    courseTerrain: 'Hilly / Coastal',
    courseSurface: 'Sealed Roads',
    courseTraffic: 'Open Roads with Traffic Management',
    cutoffTime: 'No official cutoff — early starts available for slower riders',

    requirements: [
      'Road bicycle in good mechanical condition',
      'Approved cycling helmet (compulsory)',
      'Minimum age 18 for K2; 16 for K1 and NBC',
      'Medical clearance recommended if health concerns exist',
      'Training on the course beforehand is strongly recommended',
    ],

    inclusions: [
      'Race timing and results',
      'Course marshalling and safety vehicles',
      'Aid stations along the course',
      'Bus transport to start locations for K1 and NBC',
      'Prize giving at Coromandel School Field',
    ],
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Marlborough Sounds Half Marathon (Lochmara Lodge Half Marathon)
  // ──────────────────────────────────────────────────────────────────────────
  await updateEvent('Marlborough Sounds Half Marathon', 'marlborough-sounds-half-marathon', {
    description: `The Lochmara Lodge Half Marathon is one of New Zealand's most unique and scenic running events, following a stunning section of the world-famous Queen Charlotte Track through the heart of the Marlborough Sounds. Organised by Yarrell Events with marketing and event-day support from Marlborough Events, this intimate event is capped at just 200 entrants, creating an exclusive and memorable race experience.

The event day begins with an early morning boat ride from Beachcomber Wharf at Picton Marina, transporting runners to the start line at Anakiwa near Picton. From there, the 22km course follows the Queen Charlotte Track through lush beech forests alive with bellbirds, past picturesque bays and along ridgelines with panoramic views of the Sounds. The trail's undulating profile provides a challenging yet rewarding experience, winding through pristine native bush before the finish at Lochmara Lodge. A 19km walking option is also available for those who prefer a slightly shorter distance.

What makes this event truly special is the full experience — after crossing the finish line at Lochmara Lodge, competitors enjoy a prize-giving ceremony and barbecue in the stunning waterfront setting, before a scenic boat ride returns everyone to Picton around 2:30pm. The combination of world-class trail running, the intimate capped field, boat transfers, and the Lochmara Lodge finish makes this unlike any other half marathon in the country.`,

    highlights: [
      'Stunning course along the world-famous Queen Charlotte Track in the Marlborough Sounds',
      'Intimate event capped at just 200 entrants for an exclusive race experience',
      'Scenic boat transfers from Picton Marina to the start at Anakiwa and back from the finish',
      'Finish at the beautiful waterfront Lochmara Lodge with prize-giving and barbecue',
      'Two distance options: 22km half marathon run and 19km walk',
      'Course through lush beech forests, bellbird-filled bush and picturesque bays',
      'Entry fee includes all boat transfers to and from the event',
    ],

    organizer: 'Yarrell Events',
    organizerWebsite: 'https://www.lochmarahalfmarathon.co.nz',
    registrationUrl: 'https://www.lochmarahalfmarathon.co.nz',

    latitude: -41.2281,
    longitude: 174.0514,

    distanceDetails: [
      {
        name: 'Half Marathon',
        distance: '22 km',
        elevation: 'Undulating — significant trail elevation',
        time: '2 - 4 hrs',
        description: 'The full half marathon distance following the Queen Charlotte Track from Anakiwa to Lochmara Lodge. An undulating trail course through native beech forest, past scenic bays and along ridgelines with views of the Marlborough Sounds.',
      },
      {
        name: 'Walking Option',
        distance: '19 km',
        elevation: 'Undulating — significant trail elevation',
        time: '3.5 - 5.5 hrs',
        description: 'A slightly shorter walking option along the Queen Charlotte Track for those who feel they cannot complete the full half marathon distance. Same stunning scenery and finish at Lochmara Lodge.',
      },
    ],

    schedule: [
      { time: '7:00 AM', description: 'Boat departs Beachcomber Wharf, Picton Marina for Anakiwa' },
      { time: '8:00 AM (approx)', description: 'Race start at Anakiwa' },
      { time: '12:00 PM (approx)', description: 'Prize giving and barbecue at Lochmara Lodge' },
      { time: '2:30 PM', description: 'Boat returns to Picton Marina' },
    ],

    courseTerrain: 'Undulating — Trail / Bush / Coastal',
    courseSurface: 'Trail — Queen Charlotte Track (packed earth, tree roots, some gravel)',
    courseTraffic: 'Off-road — Dedicated Walking/Running Track',

    requirements: [
      'Trail running shoes strongly recommended',
      'Adequate trail running fitness for 22km of undulating terrain',
      'Own water bottle or hydration pack',
    ],

    inclusions: [
      'Boat transfer from Picton to Anakiwa (start)',
      'Boat transfer from Lochmara Lodge back to Picton (finish)',
      'Post-race barbecue at Lochmara Lodge',
      'Prize-giving ceremony',
      'Race timing and results',
    ],
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Gisborne Triathlon Festival
  // ──────────────────────────────────────────────────────────────────────────
  await updateEvent('Gisborne Triathlon Festival', 'gisborne-triathlon-festival', {
    description: `The Gisborne Triathlon Festival is the premier triathlon event on New Zealand's East Coast, held in the sunny seaside city of Gisborne — the first city in the world to see the sun each day. Based out of Midway Beach and the surrounding coastal parks, the festival brings together triathletes of all abilities for a celebration of multisport in one of the country's most scenic and welcoming coastal settings.

Gisborne has a proud triathlon heritage, having hosted the Sovereign Oceania Triathlon Championships and numerous national-level events. The warm waters of Poverty Bay, the flat sealed roads along Centennial Marine Parade, and the running paths around the beachfront and parks make it an ideal venue for triathlon. The ocean swim in the sheltered waters off Midway Beach, combined with the flat coastal bike and run legs, creates fast courses that are accessible to beginners while still challenging for experienced competitors.

The festival atmosphere sets this event apart — with multiple distance options including sprint and shorter Try-a-Tri formats, team entries, and a welcoming community vibe, the Gisborne Triathlon Festival encourages participation from first-timers through to seasoned age-group athletes. The East Coast sunshine, warm hospitality and stunning coastal scenery make this a destination event worth travelling for.`,

    highlights: [
      'Premier triathlon event on New Zealand\'s East Coast, held at Midway Beach, Gisborne',
      'Ocean swim in the sheltered warm waters of Poverty Bay',
      'Flat, fast coastal courses along Centennial Marine Parade',
      'Multiple distance options suitable for beginners through to experienced triathletes',
      'Gisborne — the first city in the world to see the sun — offers warm East Coast hospitality',
      'Team and individual entry options available',
    ],

    courseTerrain: 'Flat — Coastal',
    courseSurface: 'Ocean Swim, Sealed Roads, Paths',

    requirements: [
      'Approved cycling helmet (compulsory for bike leg)',
      'Roadworthy bicycle',
      'Suitable running shoes',
    ],

    inclusions: [
      'Race timing and results',
      'Course marshalling and water safety support',
      'Aid stations on course',
      'Post-race refreshments',
    ],
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Taranaki Cycle Challenge (Tour of Taranaki)
  // ──────────────────────────────────────────────────────────────────────────
  await updateEvent('Taranaki Cycle Challenge', 'taranaki-cycle-challenge', {
    description: `The Tour of Taranaki Cycle Challenge is a legendary road cycling event that takes riders on a striking ride around Taranaki Maunga (Mount Taranaki), one of New Zealand's most iconic volcanic mountains. Starting and finishing at TSB Stadium on Rogan Street in New Plymouth, the event has become one of the most anticipated cycling challenges in the country, drawing riders from across New Zealand to tackle the demanding mountain circuit each year.

The flagship event, the Spark Around the Mountain, covers 148km of varied terrain as it circumnavigates the mighty volcano, with 1,121 metres of elevation gain through rolling farmland, coastal roads and the lush rainforest-clad lower slopes of the mountain. The route passes through some of Taranaki's most scenic countryside, including the renowned Pukeiti Rainforest — home to one of the world's most significant collections of rhododendrons — and offers ever-changing views of the perfectly symmetrical volcanic cone throughout the ride.

For those not ready for the full circuit, the Pukeiti 100km and Pukeiti 50km options offer shorter but equally scenic routes along one of the most beautiful roads in Taranaki. The event is directed by Suzanne McCarthy with course management by Mark Turner. With a 6-hour cutoff for the main event (requiring an average speed of 25 km/hr), the Tour of Taranaki is designed as a genuine challenge for experienced cyclists, earning its reputation as a tough but rewarding day in the saddle around one of the world's most beautiful volcanic landscapes.`,

    highlights: [
      'Legendary road cycling challenge circumnavigating Taranaki Maunga (Mount Taranaki)',
      '148km flagship event with 1,121m of elevation gain around the mountain',
      'Three distance options: 148km Around the Mountain, 100km Pukeiti, and 50km Pukeiti',
      'Stunning route through rainforest, farmland and coastal roads with mountain views throughout',
      'Start and finish at TSB Stadium, New Plymouth',
      '6-hour cutoff for the main event — a genuine challenge for experienced cyclists',
      'Passes through the renowned Pukeiti Rainforest with world-class rhododendron gardens',
    ],

    organizer: 'Tour of Taranaki',
    organizerWebsite: 'https://touroftaranaki.co.nz',
    registrationUrl: 'https://raceroster.com/events/2025/86698/tour-of-taranaki-cycle-challenge',

    distanceDetails: [
      {
        name: 'Spark Around the Mountain',
        distance: '148 km',
        elevation: '+1,121m',
        time: '4 - 6 hrs',
        description: 'The flagship event — a full circuit around Taranaki Maunga through rolling farmland, coastal roads and lush rainforest. Riders power around the mountain tackling 1,121m of elevation. The 7:30am start group has a 6-hour cutoff requiring an average speed of 25 km/hr.',
      },
      {
        name: 'Pukeiti 100',
        distance: '100 km',
        elevation: '+700m (approx)',
        time: '3 - 5 hrs',
        description: 'A 100km ride along one of the most scenic roads in Taranaki, passing through the Pukeiti Rainforest area with stunning mountain views.',
      },
      {
        name: 'Pukeiti 50',
        distance: '50 km',
        elevation: '+350m (approx)',
        time: '1.5 - 3 hrs',
        description: 'The shortest option, offering a challenging but achievable ride through scenic Taranaki countryside. Ideal for those building towards the longer distances.',
      },
    ],

    schedule: [
      { time: '7:00 AM', description: 'First wave start — Around the Mountain (148km)' },
      { time: '7:30 AM', description: 'Second wave start — Around the Mountain (6-hour cutoff group)' },
      { time: 'TBC', description: 'Pukeiti 100km and 50km starts' },
    ],

    courseTerrain: 'Hilly / Volcanic',
    courseSurface: 'Sealed Roads',
    courseTraffic: 'Open Roads with Traffic Management',
    cutoffTime: '6 hours (148km Around the Mountain — 7:30am start group)',

    requirements: [
      'Road bicycle in good mechanical condition',
      'Approved cycling helmet (compulsory)',
      'Adequate fitness for chosen distance',
    ],

    inclusions: [
      'Race timing and results',
      'Course marshalling and safety support',
      'Aid stations along the route',
      'Event village at TSB Stadium, New Plymouth',
    ],
  })

  console.log('\nBatch 4 enrichment complete!')
}

main()
  .catch((e: any) => { console.error('Fatal:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
