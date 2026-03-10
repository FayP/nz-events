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
  // ============================================================
  // 1. Kepler Challenge
  // ============================================================
  await updateEvent('Kepler Challenge', 'kepler-challenge', {
    organizer: 'Kepler Challenge Mountain Run Trust',
    organizerWebsite: 'https://keplerchallenge.co.nz',
    registrationUrl: 'https://keplerchallenge.co.nz/race-entry/',
    website: 'https://keplerchallenge.co.nz',
    description: `The Kepler Challenge is New Zealand's premier mountain running event, following the spectacular 60 km Kepler Track through the heart of Fiordland National Park — a UNESCO World Heritage Area. Held annually on the first Saturday of December, the race starts and finishes at the Control Gates of Lake Te Anau and takes runners on a demanding loop through some of the most breathtaking alpine scenery in the Southern Hemisphere.

First held on 10 December 1988 to celebrate the completion of the Kepler Track, the event was organised by three Fiordland College teachers as a one-off challenge. That inaugural race attracted 149 carefully selected competitors, and the event has grown into one of the most iconic trail races in Australasia. The Kepler Challenge Mountain Run Trust, a registered charity established in 1998, now oversees the event and channels any surplus into local community projects.

The course offers a dramatic mix of terrain: a flat lakeside trail through native beech forest to Brod Bay, a steep climb above the bushline to the exposed alpine ridge of Mount Luxmore, a traverse of the ridgeline with panoramic views of Fiordland's mountains and lakes, a knee-jarring descent via 180-degree switchbacks to Iris Burn Hut, and a final stretch through wetlands on raised boardwalk back to the Control Gates. Nearly 200 local volunteers staff the eleven checkpoints and provide communications, first aid and other services, making this a true community event.`,
    highlights: [
      "New Zealand's premier mountain running event, held annually since 1988",
      'Full 60 km loop of the Kepler Track through Fiordland National Park (UNESCO World Heritage Area)',
      'Stunning alpine ridge traverse with panoramic views of mountains and lakes',
      'Shorter 27 km Luxmore Grunt option for those seeking a challenging half-distance',
      'Organised by the Kepler Challenge Mountain Run Trust — a registered charity supporting local community projects',
      'Nearly 200 local volunteers staff eleven checkpoints along the course',
      'Diverse terrain: lakeside beech forest, exposed alpine ridgeline, steep switchback descents and boardwalk wetlands',
      'Entries open at 6:30 am NZ time on the first Saturday in July each year',
    ],
    distanceDetails: [
      {
        name: 'Kepler Challenge',
        distance: '60 km',
        elevation: '+2,080m / -2,080m',
        time: 'Up to 12 hours',
        description: 'The full Kepler Track loop from the Control Gates of Lake Te Anau. The course takes in lakeside beech forest, a steep climb to the Luxmore Hut alpine zone, an exposed ridgeline traverse with panoramic Fiordland views, a challenging descent via switchbacks to Iris Burn, and boardwalk wetlands back to the finish. Start time 6:00 AM.',
      },
      {
        name: 'Luxmore Grunt',
        distance: '27 km',
        elevation: '+1,100m / -1,100m',
        time: 'Up to 8 hours',
        description: 'An out-and-back course from the Control Gates along the flat lakeside trail to Brod Bay, then climbing steeply through beech forest to the alpine Luxmore Hut before returning the same way. A demanding yet achievable option. Start time 7:00 AM.',
      },
    ],
    schedule: [
      { time: 'Fri 12:00 PM', description: 'Race pack collection opens (until 6:00 PM)' },
      { time: 'Fri Evening', description: 'Compulsory race briefing for all runners' },
      { time: 'Sat 6:00 AM', description: 'Kepler Challenge 60 km start — Control Gates, Lake Te Anau' },
      { time: 'Sat 7:00 AM', description: 'Luxmore Grunt 27 km start — Control Gates, Lake Te Anau' },
      { time: 'Sat 6:00 PM', description: 'Kepler Challenge course closure (12-hour cutoff)' },
      { time: 'Sat 3:00 PM', description: 'Luxmore Grunt course closure (8-hour cutoff)' },
    ],
    courseTerrain: 'Mountainous / Alpine',
    courseSurface: 'Trail — Native Beech Forest, Alpine Ridge, Boardwalk Wetlands',
    courseTraffic: 'Closed Track (DOC permit)',
    cutoffTime: '12 hours (Kepler Challenge); 8 hours (Luxmore Grunt)',
    requirements: [
      'Compulsory gear must be carried at all times — checked at registration before race number is issued',
      'Thermal long-sleeved top and thermal long johns (skins not acceptable)',
      'Waterproof jacket and over-trousers',
      'Warm hat and gloves',
      'Must attend compulsory race briefing on Friday evening',
      'Must register in person on Friday between 12:00 PM and 6:00 PM',
      'Must keep to the marked track at all times — cutting corners may result in disqualification',
      'Transponder must be worn at all times during the event',
      'Strictly one entry per person — entries are non-transferable',
    ],
    inclusions: [
      'Race bib with timing transponder',
      'Eleven checkpoints with water, electrolyte hydration, bananas, oranges, Clif Bars and lollies',
      'First aid and radio communications at every checkpoint',
      'Toilet facilities at most checkpoints',
      'Optional T-shirt, breakfast voucher and reusable cup available at entry',
    ],
  })

  // ============================================================
  // 2. The Goat Adventure Run (NEEDS COORDS)
  // ============================================================
  await updateEvent('The Goat Adventure Run', 'the-goat-adventure-run', {
    organizer: 'Ohakune Events Charitable Trust',
    organizerWebsite: 'https://thegoat.co.nz',
    registrationUrl: 'https://thegoat.co.nz/enter/',
    website: 'https://thegoat.co.nz',
    latitude: -39.20316,
    longitude: 175.53981,
    description: `The Goat Adventure Run is one of New Zealand's most iconic and demanding off-road running events, traversing the rugged western flanks of Mount Ruapehu through the heart of Tongariro National Park — a UNESCO Dual World Heritage Area. The approximately 20 km course runs from the top of Bruce Road at Whakapapa to the Turoa Ski Fields on the Round the Mountain track, with over 1,000 metres of vertical ascent through extraordinarily varied alpine terrain.

Runners experience a remarkable diversity of landscapes in a single race: ancient lava flows and towering scoria formations, mountain beech forest, tussock grasslands and alpine herb fields, cascading waterfalls, the serene alpine Lake Surprise, boulder-strewn rivers, and panoramic views of the volcanic peaks. The notorious "Mama's Mile" — the final gruelling push to the Turoa finish — is a rite of passage for every Goat finisher. Due to the isolated alpine environment, there are no aid stations on the course, making self-sufficiency a core part of the challenge.

Acquired by the Ohakune Events Charitable Trust in 2025, The Goat has built a fiercely loyal following over the years. The event is widely acclaimed as one of New Zealand's premier adventure runs, attracting runners from across the country who gather each January at the base of Mount Ruapehu. The legendary Goat After Party at the Powderhorn Chateau in Ohakune is almost as famous as the race itself.`,
    highlights: [
      'Iconic 20 km alpine adventure run across the western flanks of Mount Ruapehu',
      'Set within Tongariro National Park — a UNESCO Dual World Heritage Area',
      'Over 1,000m of vertical ascent through lava flows, scoria fields, beech forest and alpine meadows',
      'No aid stations — a true self-sufficiency challenge in a remote alpine environment',
      'Course passes Lake Surprise, cascading waterfalls and boulder-strewn rivers',
      'The notorious "Mama\'s Mile" final ascent to the Turoa finish',
      'Finishers receive a special edition medal and event cap',
      'The legendary Goat After Party at the Powderhorn Chateau, Ohakune',
    ],
    distanceDetails: [
      {
        name: 'The Goat',
        distance: '~20 km',
        elevation: '+1,000m',
        time: 'Up to 7.5 hours (course closes 3:30 PM)',
        description: 'The main event — an epic adventure run from the top of Bruce Road at Whakapapa (1,607m) to the Turoa Ski Fields (1,624m) on the Round the Mountain track. The course traverses ancient lava flows, scoria fields, mountain beech forest, tussock grasslands, alpine herb fields, cascading waterfalls and Lake Surprise before the notorious Mama\'s Mile final ascent. No aid stations on course. Wave starts from 8:00 AM. Minimum age 16 years.',
      },
      {
        name: 'The Kid',
        distance: '3.2 km',
        elevation: 'Minimal',
        time: '~30 minutes',
        description: 'A trail run for ages 5-16 through the Mangawhero Forest in Ohakune on an off-road loop track. Starts at 3:50 PM on race day.',
      },
    ],
    schedule: [
      { time: '8:00 AM', description: 'The Goat — Wave 1A departs top of Bruce Road, Whakapapa' },
      { time: '8:54 AM', description: 'The Goat — Final wave (Wave 6C) departs' },
      { time: '3:30 PM', description: 'The Goat — Course closure' },
      { time: '3:50 PM', description: 'The Kid — Start at Mangawhero Forest, Ohakune' },
      { time: '9:00 PM', description: 'The Goat After Party at the Powderhorn Chateau, Ohakune' },
    ],
    courseTerrain: 'Alpine / Volcanic',
    courseSurface: 'Trail — Lava Flows, Scoria, Tussock, Beech Forest, River Crossings',
    cutoffTime: '3:30 PM course closure (approximately 7.5 hours from first wave)',
    requirements: [
      'Eight mandatory gear items must be presented at registration before collecting race number',
      'Drink carrying device (no aid stations on course)',
      'All gear must meet Check Clean Dry standards',
      'Shoes must have been dry for at least 48 hours prior to the race',
      'Minimum age 16 years for The Goat; ages 5-16 for The Kid',
      'Must be self-sufficient — no support crew access on the course',
    ],
    inclusions: [
      'Special edition finishers medal',
      'Event cap',
      'Post-event bus service back to the Powderhorn Chateau',
      'Entry to The Goat After Party at the Powderhorn Chateau',
    ],
  })

  // ============================================================
  // 3. Taranaki Triathlon Festival
  // ============================================================
  await updateEvent('Taranaki Triathlon Festival', 'taranaki-triathlon-festival', {
    organizer: 'Tri Taranaki Ltd',
    organizerWebsite: 'https://www.taranakitri.co.nz',
    registrationUrl: 'https://www.taranakitri.co.nz',
    website: 'https://www.taranakitri.co.nz',
    description: `The Taranaki Triathlon Festival — also known as the Tri Taranaki Festival — is one of New Zealand's premier multisport weekends, held at Ngamotu Beach in New Plymouth against the stunning backdrop of Mount Taranaki. Since 2010, athletes of all levels from around the country and overseas have gathered on the shores of Ngamotu Beach for a festival that spans multiple events across one action-packed weekend.

The festival has hosted the Triathlon New Zealand Sprint Distance Championships and has featured on the World Triathlon Cup circuit, with world-class sprint-distance racing right off Ngamotu Beach. In recent years, the event added the Oceania Junior Championships and Oceania Mixed Relay to its already impressive lineup, cementing its status as a nationally and internationally significant triathlon festival.

With six events spanning one weekend — from the entry-level Taranaki Tri-er designed for first-time participants through to the sprint distance championships — the festival offers something for everyone. The ocean swim off Ngamotu Beach, the multi-lap bike course around Port Taranaki, and the beachfront run course combine to create a spectator-friendly and exciting race venue. The Taranaki Triathlon Club supports the event, encouraging participation from all age groups and fitness levels.`,
    highlights: [
      'Held at Ngamotu Beach, New Plymouth with stunning Mount Taranaki as backdrop',
      'Host of Triathlon NZ Sprint Distance Championships',
      'Featured on the World Triathlon Cup circuit with international-level racing',
      'Multiple events across one weekend — from entry-level to elite racing',
      'Oceania Junior Championships and Mixed Relay on the event programme',
      'Spectator-friendly multi-lap course format',
      'Ocean swim, Port Taranaki bike loop and scenic beachfront run',
    ],
    distanceDetails: [
      {
        name: 'Sprint Distance',
        distance: '25.75 km total',
        elevation: 'Flat to minimal',
        time: '1h - 2h 30m',
        description: '750m swim (1 lap) off Ngamotu Beach, 20km bike (4 laps) around Port Taranaki, 5km run (3 laps) along the beachfront. The headline event of the festival and home to the NZ Sprint Distance Championships.',
      },
      {
        name: 'Taranaki Tri-er',
        distance: '9.9 km total',
        elevation: 'Flat',
        time: '30m - 1h 30m',
        description: '200m swim, 8km bike, 1.7km run. Designed as an entry-level option for first-time triathlon participants — a perfect introduction to the sport.',
      },
    ],
    courseTerrain: 'Flat',
    courseSurface: 'Mixed — Ocean Swim, Sealed Roads, Beachfront Paths',
    courseTraffic: 'Partial Road Closure',
    requirements: [
      'Approved bike helmet (mandatory for all bike legs)',
      'Triathlon NZ one-day licence or current financial membership',
    ],
    inclusions: [
      'Race bib with timing transponder',
      'Transition area access',
      'On-course aid station support',
      'Finisher results',
    ],
  })

  // ============================================================
  // 4. Ironman 70.3 Taupo
  // ============================================================
  await updateEvent('Ironman 70.3 Taupo', 'ironman-70-3-taupo', {
    organizer: 'The IRONMAN Group',
    organizerWebsite: 'https://www.ironman.com',
    registrationUrl: 'https://www.ironman.com/im703-taupo',
    website: 'https://www.ironman.com/im703-taupo',
    description: `The ANZCO Foods IRONMAN 70.3 New Zealand is one of the most iconic half-distance triathlon events in Australasia, staged annually in the stunning lakeside town of Taupo in the heart of the North Island. Participants discover nature's ultimate playground with a pristine freshwater swim in Lake Taupo, a challenging countryside bike course through rolling Waikato farmland, and a stunning lakefront run with views of the volcanic peaks of Tongariro National Park.

The 1.9 km swim takes place in the crystal-clear freshwater of Lake Taupo, starting at the Taupo Yacht Club with legs parallel to the shore before turning down the Waikato River outlet. The 90 km bike course heads out from transition into the rolling farmland surrounding Taupo, featuring approximately 640 metres of elevation gain with rolling hills, punchy climbs, and the infamous "Heartbreak Hill" before a descent back into town. The revamped double-loop course format tests athletes' endurance with repeated climbs on the Broadlands Road. The 21.1 km run is a two-lap course through Taupo township with breathtaking views of Mount Ruapehu, Mount Tongariro, Mount Ngauruhoe and the lake, with a final 1.5 km stretch past transition and down the finishing straight to the roar of the crowd.

Staged alongside the legendary full-distance IRONMAN New Zealand, the event attracts individual athletes and relay teams (2 or 3 person) from around the world. The event base and transition area is at Tongariro North Domain, right in the heart of Taupo. IRONMAN 70.3 New Zealand also offers qualifying slots for the IRONMAN 70.3 World Championship.`,
    highlights: [
      'Iconic half-distance triathlon in the stunning lakeside town of Taupo',
      'Crystal-clear freshwater swim in Lake Taupo — one of the cleanest lakes in the world',
      '90 km bike course with ~640m elevation gain through rolling Waikato farmland',
      'Two-lap run course with panoramic views of three volcanic peaks and Lake Taupo',
      'Staged alongside the legendary full-distance IRONMAN New Zealand',
      'Qualifying slots available for the IRONMAN 70.3 World Championship',
      'Individual and relay team (2 or 3 person) entry options',
      'The infamous "Heartbreak Hill" on the bike course',
    ],
    distanceDetails: [
      {
        name: 'IRONMAN 70.3 (Individual)',
        distance: '113 km total',
        elevation: '~640m (bike)',
        time: 'Up to 8 hours 30 minutes',
        description: '1.9 km swim in Lake Taupo starting from the Yacht Club, 90 km bike through rolling farmland on a double-loop course with Heartbreak Hill, and a 21.1 km two-lap run through Taupo with volcanic peak views. Transition at Tongariro North Domain.',
      },
      {
        name: 'IRONMAN 70.3 (Relay Team)',
        distance: '113 km total',
        elevation: '~640m (bike)',
        time: 'Up to 8 hours 30 minutes',
        description: 'The same 1.9 km swim, 90 km bike and 21.1 km run course, split between a team of 2 or 3 athletes. Each team member completes one or more legs.',
      },
    ],
    courseTerrain: 'Flat to Rolling Hills',
    courseSurface: 'Mixed — Freshwater Lake Swim, Sealed Roads, Footpaths',
    courseTraffic: 'Partial Road Closure',
    cutoffTime: 'Overall: 8 hours 30 minutes; Swim: 1 hour 10 minutes; Swim + Bike: 5 hours 30 minutes',
    requirements: [
      'Approved bike helmet (mandatory)',
      'Road-legal bicycle in good working order',
      'No drafting permitted (non-draft-legal race)',
      'Wetsuit permitted if water temperature is below 24.5°C',
      'Must meet intermediate cutoff times or be removed from course',
    ],
    inclusions: [
      'Race bib with timing chip',
      'Transition area access at Tongariro North Domain',
      'On-course aid stations with nutrition and hydration',
      'Finisher medal',
      'Finisher T-shirt',
      'IRONMAN 70.3 World Championship qualifying slots',
      'Live race tracking',
    ],
  })

  // ============================================================
  // 5. Tour de Vineyards
  // ============================================================
  await updateEvent('Tour de Vineyards', 'tour-de-vineyards', {
    organizer: 'Tour de Vineyards',
    organizerWebsite: 'https://www.tourdevineyards.co.nz',
    registrationUrl: 'https://www.tourdevineyards.co.nz',
    website: 'https://www.tourdevineyards.co.nz',
    description: `The Tour de Vineyards is a road cycling event held around Tasman Bay in the Nelson region of New Zealand's South Island. Traditionally staged over the New Year period, the event takes riders through some of the most picturesque cycling terrain in the country — rolling hills, vineyard-lined plains, coastal roads and the dramatic climb over Takaka Hill that has historically decided the race.

The Nelson wine region, spread over rolling hills and plains lining Tasman Bay, produces an enviable range of premium wines including Pinot Noir, Chardonnay and aromatics. The cycling routes showcase this stunning landscape, passing through nearly 20 tasting rooms scattered amidst gift shops, galleries, garden cafes and breweries. The combination of world-class cycling terrain and the renowned Nelson wine and food scene makes this event unique on the New Zealand cycling calendar.

With a rich history spanning over three decades in the Nelson-Tasman region, the Tour de Vineyards is a celebration of cycling culture in one of the sunniest corners of New Zealand. The event brings together competitive road cyclists and recreational riders alike, all drawn by the combination of challenging courses, breathtaking coastal and rural scenery, and the warmth of the Nelson community.`,
    highlights: [
      'Road cycling event set around the stunning Tasman Bay in the Nelson region',
      'Routes pass through the Nelson wine region with nearly 20 cellar doors and tasting rooms',
      'The decisive Takaka Hill stage — a signature climb of the event',
      'Over three decades of cycling history in the Nelson-Tasman region',
      'Scenic courses through vineyards, orchards, coastal roads and rolling countryside',
      'Held in one of New Zealand\'s sunniest regions during the summer holiday period',
    ],
    courseTerrain: 'Rolling Hills to Mountainous (Takaka Hill)',
    courseSurface: 'Sealed Roads',
    courseTraffic: 'Open Roads with Traffic Management',
  })

  console.log('\nBatch 6 enrichment complete.')
}

main()
  .catch((e: any) => { console.error('Fatal:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
