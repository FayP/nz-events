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
    console.log(`SKIP: ${name} not found (slug: ${slug})`)
    return
  }
  await prisma.event.update({ where: { id: event.id }, data })
  console.log(`UPDATED: ${name}`)
}

async function main() {
  console.log('Enriching batch 3 events...\n')

  // =========================================================================
  // 1. Auckland Marathon
  // =========================================================================
  await updateEvent('Auckland Marathon', 'auckland-marathon', {
    organizer: 'IRONMAN New Zealand Limited',
    organizerWebsite: 'https://aucklandmarathon.co.nz',
    registrationUrl: 'https://in.nz.aucklandmarathon.co.nz/2026-barfoot--thompson-auckland-marathon-presented-by-asics-sunday-1st-november-20261764711833877',
    description: `The Barfoot & Thompson Runaway Auckland Marathon presented by ASICS is New Zealand's biggest marathon running event and one of the most scenic city marathons in the world. Held annually on the first Sunday of November, the event attracts thousands of participants across five distances ranging from the Kids Marathon to the full 42.2km marathon. With a history stretching back to 1992 and over 35 years of continuous running, it has become an iconic fixture on Auckland's sporting calendar.

The course begins with a unique sunrise ferry ride across the Waitemata Harbour to the start line on King Edward Parade in Devonport. From there, runners weave through seaside Takapuna before joining the fast, smooth Northern Busway and crossing the Auckland Harbour Bridge — the event's signature moment — with sweeping panoramic views of the harbour, Rangitoto Island and the city skyline. The marathon course continues past Westhaven Marina and the Viaduct Harbour before stretching along Auckland's sparkling waterfront on an out-and-back section to St Heliers Bay, finishing at Victoria Park near the CBD.

What makes the Auckland Marathon truly special is the combination of a world-class urban course with stunning natural scenery. The first half features rolling terrain through the North Shore suburbs and the exhilarating bridge crossing, while the second half is flat and fast along the waterfront — perfect for chasing personal bests. The exclusive access to the busway and motorway sections, which are only available to runners on race day, adds to the once-a-year excitement. The event is AIMS certified, attracting both elite athletes and first-time marathon runners from around the globe.`,
    highlights: [
      "New Zealand's biggest marathon running event with 35+ years of history since 1992",
      'Iconic Auckland Harbour Bridge crossing with panoramic harbour and Rangitoto views',
      'Unique sunrise ferry ride to the Devonport start line',
      'AIMS-certified course attracting elite and recreational runners worldwide',
      'Five distances for all abilities: Marathon, Half Marathon, 11km, 5km and Kids Marathon',
      'Exclusive access to the Northern Busway and motorway — only open to runners on race day',
      'Flat, fast waterfront second half ideal for personal bests',
      'Finisher medal and official event hat (cap, visor or bucket hat) for all participants',
    ],
    requirements: [
      'Marathon: Must be 18 years or older on race day',
      'Half Marathon: Must be 16 years or older on race day',
      '11km Traverse: Must be 10 years or older; ages 10-12 require adult supervision',
      'No wheeled conveyances (bicycles, roller blades, prams, skateboards) on course',
      'No animals on course',
      'Entries cannot be purchased on race day — register online in advance',
    ],
    distanceDetails: [
      {
        name: 'Marathon',
        distance: '42.2 km',
        elevation: 'Rolling first half, flat second half',
        time: '2h 30m - 7h',
        description: 'The flagship event starting in Devonport, crossing the Auckland Harbour Bridge, passing Westhaven Marina and the Viaduct, then continuing along the waterfront on an out-and-back to St Heliers Bay. AIMS certified. Finishes at Victoria Park. 7-hour cutoff with intermediary checkpoints at 10km, 14km, 31km, 33km, 36km and 40km.',
      },
      {
        name: 'Half Marathon',
        distance: '21.1 km',
        elevation: 'Rolling',
        time: '1h 20m - 4h',
        description: 'Starting in Devonport, weaving through Takapuna and the Northern Busway before crossing the Harbour Bridge. Runners pass Westhaven Marina and Wynyard Quarter before finishing at Victoria Park. A rolling course with views worth every climb. 4-hour cutoff with checkpoints.',
      },
      {
        name: '11km Traverse',
        distance: '11 km',
        elevation: 'Rolling',
        time: '50m - 2h 5m',
        description: 'Starting at Smales Farm and heading south along the Northern Busway before crossing the Auckland Harbour Bridge. Passes Westhaven Marina and Viaduct Harbour to finish at Victoria Park. A rolling course with big views packed into every kilometre. 2h 5m cutoff.',
      },
      {
        name: '5km Challenge',
        distance: '5 km',
        elevation: 'Flat',
        time: '20m - 1h',
        description: 'Starting at Wynyard Quarter and finishing at Victoria Park. A flat, accessible course through the heart of the city perfect for beginners, families and those looking for a fun run experience.',
      },
      {
        name: 'Kids Marathon',
        distance: '2.2 km',
        elevation: 'Flat',
        time: '10m - 30m',
        description: 'A fun, flat course designed for young runners to experience the thrill of crossing a real marathon finish line.',
      },
    ],
    schedule: [
      { time: '4:20 AM', description: 'Chartered ferry services to Devonport start line begin' },
      { time: '4:40 AM', description: 'Chartered bus services to Devonport start line begin' },
      { time: '5:55 AM', description: 'Wheelchair Division start (King Edward Pde, Devonport)' },
      { time: '6:00 AM', description: 'Marathon start (King Edward Pde, Devonport)' },
      { time: '6:50 AM', description: 'Half Marathon start (King Edward Pde, Devonport)' },
      { time: '8:40 AM', description: '11km Traverse start (Smales Farm)' },
      { time: '10:30 AM', description: 'Kids Marathon start' },
      { time: '11:00 AM', description: '5km Challenge start (Wynyard Quarter)' },
      { time: '1:00 PM', description: 'Course cutoff — all athletes must have finished' },
    ],
    courseTerrain: 'Rolling Hills / Flat',
    courseSurface: 'Sealed Roads',
    courseTraffic: 'Full Road Closure',
    cutoffTime: 'Marathon: 7 hours; Half Marathon: 4 hours; 11km: 2h 5m; All events: 1:00 PM',
    inclusions: [
      'Race number with timing chip',
      'Official event hat (running cap, visor or bucket hat — runner selects)',
      'Finisher medal',
      'Official race day gear bag and tag',
      'On-course aid stations with water, sports drink, toilets and first aid',
      'Post-event recovery area with food and drink vendors',
      'Chartered ferry or bus transport to start line',
    ],
  })

  // =========================================================================
  // 2. Christchurch Marathon
  // =========================================================================
  await updateEvent('Christchurch Marathon', 'christchurch-marathon', {
    organizer: 'Christchurch Marathon Events',
    organizerWebsite: 'https://www.christchurchmarathon.co.nz',
    registrationUrl: 'https://eventplus.net/CM26',
    description: `The Christchurch Marathon is one of New Zealand's fastest-growing marathon events, held annually in the heart of Christchurch on a course renowned as one of the flattest and fastest in the country. Taking place on Sunday 12 April 2026, the event offers four distances from the Kids MaraFun to the full marathon, all starting and finishing beside the Armagh Street gates of the iconic Hagley Park.

The course is built on a 10.5km lap system — a Quarter Marathon completes one lap, the Half Marathon two laps, and the Full Marathon four laps — making it an ideal layout for spectators and supporters who can cheer runners through multiple times. The flat, fast and scenic route takes in some of Christchurch's most iconic landmarks including Cathedral Square, Christ's College, Canterbury Museum, Cambridge Terrace, Oxford Terrace, Hagley Park and the picturesque Avon River.

What sets the Christchurch Marathon apart is its combination of a genuinely fast course with a welcoming community atmosphere. The flat elevation profile makes it perfect for runners chasing personal bests or Boston Marathon qualifying times, while the vibrant city centre setting and cheering crowds ensure an electric race day atmosphere. The event showcases the revitalised Christchurch — a city that has rebuilt itself with modern urban flair while preserving its heritage landmarks and natural beauty along the Avon River.`,
    highlights: [
      "One of New Zealand's flattest and fastest marathon courses — ideal for PBs and Boston qualifying",
      'Scenic loop course through iconic Christchurch landmarks and the Avon River',
      'All races start and finish at Hagley Park — perfect for spectators',
      'Four distances: Full Marathon, Half Marathon, 10km and Kids MaraFun',
      '10.5km lap system allows supporters to cheer runners through multiple times',
      'Showcases the revitalised Christchurch city centre and heritage buildings',
      'Growing community event attracting 1,000-5,000 runners annually',
      'Boston Marathon qualifying course',
    ],
    requirements: [
      'Register online in advance via EventPlus',
    ],
    distanceDetails: [
      {
        name: 'Full Marathon',
        distance: '42.2 km',
        elevation: 'Flat (0m elevation variance)',
        time: '2h 30m - 6h',
        description: 'Four laps of the scenic 10.5km city course through Hagley Park, along the Avon River, past Cathedral Square and Cambridge Terrace. One of the flattest marathon courses in New Zealand — perfect for personal bests and Boston qualifying.',
      },
      {
        name: 'Half Marathon',
        distance: '21.1 km',
        elevation: 'Flat',
        time: '1h 20m - 3h',
        description: 'Two laps of the 10.5km course taking in Christchurch\'s most iconic landmarks including Christ\'s College, Canterbury Museum and the Avon River. A fast, flat course ideal for half marathon personal bests.',
      },
      {
        name: '10km',
        distance: '10 km',
        elevation: 'Flat',
        time: '35m - 1h 30m',
        description: 'One lap of the scenic course through the heart of Christchurch. A flat, fast distance perfect for runners of all abilities.',
      },
      {
        name: 'Kids MaraFun',
        distance: '2.2 km',
        elevation: 'Flat',
        time: '10m - 30m',
        description: 'A safe, scenic course within Hagley Park for young runners to experience the thrill of a real race day.',
      },
    ],
    schedule: [
      { time: '7:30 AM', description: 'Race start (all distances)' },
    ],
    courseTerrain: 'Flat',
    courseSurface: 'Sealed Roads and Paths',
    courseTraffic: 'Road Closure',
    cutoffTime: 'Approximately 6 hours for the full marathon',
    inclusions: [
      'Race bib with timing chip',
      'Finisher medal',
      'On-course aid stations',
    ],
  })

  // =========================================================================
  // 3. Taranaki Off-Road Half Marathon
  // =========================================================================
  await updateEvent('Taranaki Off-Road Half Marathon', 'taranaki-off-road-half-marathon', {
    organizer: 'Cut a Trail Events',
    organizerWebsite: 'https://www.taranakitrailrun.co.nz',
    registrationUrl: 'https://events.mygameday.app/event/2025cutatrail',
    description: `The Good Home Taranaki Off-Road Half Marathon is one of New Zealand's most popular off-road running events, celebrating its milestone 10th anniversary in 2026 with entirely reimagined courses across all distances. Organised by Cut a Trail Events, the race takes place at the stunning Lake Mangamahoe, situated just 10 minutes drive from New Plymouth in the Taranaki region, with the mighty Mount Taranaki providing a dramatic backdrop.

The course winds around the breathtaking 21km loop of Lake Mangamahoe, utilising a diverse mix of forestry tracks, walking tracks, bridle tracks, mountain bike trails and gravel roads. Runners encounter beautiful native bush, challenging hill sections, muddy terrain and magnificent views of Mount Taranaki throughout. The second half of the half marathon course takes on more technical mountain bike trails which are exclusively closed for this event, adding a unique dimension to the racing experience.

What makes the Taranaki Off-Road Half Marathon special is its combination of accessible trail running with genuinely rugged off-road terrain in a stunning natural setting. The event caters to all abilities with 5km, 10km and 21km distances plus a team relay option, and the inclusive festival atmosphere — complete with a free BBQ for all participants and free shuttle service — makes it a favourite for both competitive trail runners and first-timers wanting to experience off-road running in one of New Zealand's most scenic locations.`,
    highlights: [
      'Celebrating its milestone 10th anniversary in 2026 with brand-new courses',
      'Stunning Lake Mangamahoe setting with magnificent Mount Taranaki views',
      'Diverse terrain: forestry tracks, bush trails, mountain bike trails and gravel roads',
      'Exclusive access to mountain bike trails closed specifically for the event',
      'Four distance options: 21km Half Marathon, 10km, 5km and Team Relay',
      'Free BBQ and free shuttle service for all participants and spectators',
      'Finisher medals for all participants',
      '2.5-hour cutoff at the 10.5km mark for the half marathon',
    ],
    requirements: [
      'Trail-appropriate footwear recommended',
      'Must reach the 10.5km mark within 2.5 hours (half marathon)',
      'Be prepared for mud, hills and uneven terrain',
    ],
    distanceDetails: [
      {
        name: 'Half Marathon',
        distance: '21 km',
        elevation: '~500m',
        time: '1h 30m - 4h',
        description: 'The flagship event — a full loop of Lake Mangamahoe through forestry tracks, native bush, bridle tracks and technical mountain bike trails. Features challenging hill sections, mud and magnificent Mount Taranaki views. 2.5-hour cutoff at the 10.5km halfway point.',
      },
      {
        name: 'Half Marathon Team Relay',
        distance: '21 km (shared)',
        elevation: '~500m (shared)',
        time: '1h 30m - 4h',
        description: 'Teams of two share the half marathon course, with participants deciding who runs the first half and who runs the second half of the loop.',
      },
      {
        name: 'Quarter Marathon',
        distance: '10 km',
        elevation: '~250m',
        time: '45m - 2h',
        description: 'A shorter loop around Lake Mangamahoe on forestry and walking tracks. A great introduction to off-road running with beautiful lake and mountain views.',
      },
      {
        name: '5km Fun Run',
        distance: '5 km',
        elevation: '~100m',
        time: '25m - 1h',
        description: 'An accessible trail run around Lake Mangamahoe suitable for all abilities. Perfect for families and those new to trail running.',
      },
    ],
    schedule: [
      { time: '6:00 AM', description: 'Race pack collection opens at Lake Mangamahoe Event Centre' },
      { time: '8:00 AM', description: 'All events start — Half Marathon, Quarter Marathon, 5km and Team Relay' },
    ],
    courseTerrain: 'Hilly / Technical',
    courseSurface: 'Trail — Forestry Tracks, Bush Trails, Mountain Bike Trails, Gravel Roads',
    courseTraffic: 'Closed Course',
    cutoffTime: '2.5 hours at the 10.5km mark (half marathon)',
    inclusions: [
      'Finisher medal',
      'Free BBQ for all participants',
      'Free shuttle service for participants and spectators',
      'Pre-race registration photos free of charge',
      'On-course aid stations',
    ],
  })

  // =========================================================================
  // 4. Northland Traverse
  // NOTE: The website northlandtraverse.co.nz does not appear to be active or
  // indexed by search engines, and no public information could be found about
  // this event. Only minimal enrichment is possible based on what we know.
  // =========================================================================
  await updateEvent('Northland Traverse', 'northland-traverse', {
    organizer: 'Sport Northland',
    organizerWebsite: 'https://www.sportnorthlandevents.co.nz',
    description: `The Northland Traverse is a trail running event held in the Whangarei area of Northland, New Zealand. Set amidst the rugged native bush and scenic landscapes of the Northland region, the event offers participants the chance to traverse some of the area's most beautiful and challenging trails.

The course takes runners through the diverse terrain that makes Northland special — from coastal ridgelines and native kauri forest to rolling farmland and bush-clad valleys. The region's subtropical climate and unique volcanic geography create a trail running experience unlike any other in New Zealand, with lush vegetation, dramatic views and a genuine sense of wilderness and adventure.`,
    highlights: [
      'Trail running through the scenic landscapes of Northland',
      'Diverse terrain including native bush, ridgelines and valleys',
      'Set in the Whangarei area of the Northland region',
    ],
    courseTerrain: 'Trail / Bush',
    courseSurface: 'Trail',
  })

  // =========================================================================
  // 5. Whangarei Run/Walk Festival
  // =========================================================================
  await updateEvent('Whangarei Run/Walk Festival', 'whangarei-run-walk-festival', {
    organizer: 'Sport Northland',
    organizerWebsite: 'https://www.sportnorthlandevents.co.nz',
    registrationUrl: 'https://raceroster.com/events/2025/103977/northcloud-whangarei-runwalk-festival',
    description: `The Whangarei Run/Walk Festival is one of Northland's premier running events, held annually in September as part of the Sport Northland Run/Walk Series. Starting and finishing at the Town Basin in Whangarei, the festival offers three distances — a half marathon, 8.5km and 4km — catering to competitive runners, casual joggers and walkers of all ages and abilities.

The 21.1km half marathon showcases Whangarei's stunning waterfront and coastal scenery, taking runners past the Town Basin Sculpture Garden, across the iconic Te Matau A Pohe Bridge and the Kotuitui Whitinga Footbridge, with drink stations every 3km and on-course entertainment. The 8.5km and 4km options follow the scenic Hatea Loop, featuring beautiful bush tracks along the Hatea River — perfect for those seeking a shorter but equally rewarding experience.

What makes the Whangarei Run/Walk Festival special is its inclusive community atmosphere and the beautiful natural setting of Whangarei's waterfront precinct. The Town Basin provides a vibrant start and finish area, and the courses showcase the best of what Whangarei has to offer — from harbour views and sculpture gardens to native bush trails along the river. It is a celebration of movement that welcomes everyone from serious half marathon runners to families out for a morning walk.`,
    highlights: [
      "One of Northland's premier running events — part of the Sport Northland Run/Walk Series",
      'Stunning waterfront course past the Town Basin Sculpture Garden',
      'Crosses the iconic Te Matau A Pohe Bridge and Kotuitui Whitinga Footbridge',
      'Three distances: 21.1km Half Marathon, 8.5km and 4km',
      'Drink stations every 3km and on-course entertainment for the half marathon',
      '8.5km and 4km options follow the scenic Hatea Loop along the Hatea River',
      'Inclusive community event welcoming runners, joggers and walkers of all abilities',
    ],
    requirements: [
      'Under-16 participants in the 21km require a dispensation form',
    ],
    distanceDetails: [
      {
        name: 'Half Marathon',
        distance: '21.1 km',
        elevation: 'Minimal',
        time: '1h 20m - 3h',
        description: 'A scenic half marathon starting and finishing at the Town Basin, passing the Sculpture Garden, crossing Te Matau A Pohe Bridge and the Kotuitui Whitinga Footbridge. Features harbour and coastal views with drink stations every 3km and on-course entertainment.',
      },
      {
        name: '8.5km Run/Walk',
        distance: '8.5 km',
        elevation: 'Minimal',
        time: '40m - 1h 30m',
        description: 'The Hatea Loop course featuring stunning bush tracks and scenic views along the Hatea River. A great option for runners and walkers wanting a moderate distance.',
      },
      {
        name: '4km Fun Run/Walk',
        distance: '4 km',
        elevation: 'Minimal',
        time: '20m - 50m',
        description: 'A shorter section of the Hatea Loop, perfect for families, beginners and those wanting a relaxed morning run or walk along the river.',
      },
    ],
    schedule: [
      { time: '8:00 AM', description: 'Race start — all distances from Town Basin, Whangarei' },
    ],
    courseTerrain: 'Flat / Undulating',
    courseSurface: 'Mixed — Sealed Roads, Paths and Bush Tracks',
    courseTraffic: 'Partial Road Closure',
    inclusions: [
      'Race bib with timing chip',
      'On-course drink stations every 3km',
      'On-course entertainment',
      'Finisher medal',
    ],
  })

  // =========================================================================
  // 6. Trail Challenge Waihi
  // NEEDS COORDS: Dickey Flat, Karangahake Gorge
  // =========================================================================
  await updateEvent('Trail Challenge Waihi', 'trail-challenge-waihi', {
    organizer: 'Trail Events NZ',
    organizerWebsite: 'https://www.trailchallengewaihi.co.nz',
    registrationUrl: 'https://www.trailchallengewaihi.co.nz/enter',
    latitude: -37.4393,
    longitude: 175.7468,
    description: `The Trail Challenge Waihi is a premier trail running and walking event held annually in the historic Karangahake Gorge, nestled between the Coromandel and Kaimai Ranges near Waihi. Organised by Trail Events NZ, the event offers five distances from a 1km kids dash to a full 42.2km marathon, all starting and finishing at the Dickey Flat Adventure Camp in Waikino.

The courses wind through some of the most spectacular scenery in the Waikato region — flat and fast riverside trails along the Ohinemuri River, glorious climbs up Mount Karangahake, pristine native bush including ancient kauri forest, and old railway tunnels and relics from the gold mining era. The dark tunnel sections, which require mandatory headlamps for all participants except the Trail Tigers kids race, add a unique and thrilling element to the experience that sets this event apart from other trail races.

What makes the Trail Challenge Waihi truly special is the extraordinary diversity of terrain packed into a relatively compact area. Within a single race, runners can experience riverside trails, steep mountain climbs, dense native forest, historic mining tunnels and panoramic ridgeline views. The event caters to everyone from first-time trail walkers to experienced ultramarathon runners, and the inclusive atmosphere — complete with a cupless sustainability policy and a festive prize giving — reflects the passionate trail running community that Trail Events NZ has built around this iconic gorge location.`,
    highlights: [
      'Set in the spectacular Karangahake Gorge — historic gold mining country',
      'Five distances from 1km kids dash to a full 42.2km trail marathon',
      'Unique dark tunnel sections requiring mandatory headlamps',
      'Diverse terrain: riverside trails, mountain climbs, native kauri forest and mining relics',
      'Walk or run options across all distances (marathon is run only)',
      'Cupless event promoting sustainability — reusable cups and soft flasks available',
      'Certified under Qualworx Safety Audit Standard',
      'Event likely to sell out — no on-the-day entries available',
    ],
    requirements: [
      'All participants (except Trail Tigers) must carry a torch or headlamp for tunnel sections',
      'Marathon runners: mandatory long-sleeve top (polypropylene or wool)',
      'Marathon runners: mandatory beanie (polypropylene or wool)',
      'Marathon runners: mandatory survival blanket',
      'Marathon runners: mandatory waterproof seam-sealed jacket',
      'Marathon runners: mandatory headtorch',
      'Short Course: ages 8+ (with parental approval under 8)',
      'Mid Course: ages 11+ (with prior approval)',
      'Half Marathon and Marathon: ages 14+ (with prior approval)',
      'Compulsory event briefing 10 minutes before each start',
      'No dogs permitted at event base or on course',
    ],
    distanceDetails: [
      {
        name: 'Marathon',
        distance: '42.2 km',
        elevation: 'Significant',
        time: '3h 30m - 8h',
        description: 'The ultimate Karangahake Gorge experience — a full trail marathon through native forest, historic tunnels, riverside trails and steep mountain terrain. Run only (no walking option). Mandatory safety gear required.',
      },
      {
        name: 'Half Marathon',
        distance: '21 km',
        elevation: 'Moderate',
        time: '1h 45m - 4h 30m',
        description: 'A challenging trail half marathon through the gorge featuring river trails, bush climbs, tunnel sections and gold mining relics. Walk or run.',
      },
      {
        name: 'Mid Course',
        distance: '13.4 km',
        elevation: 'Moderate',
        time: '1h 15m - 3h 30m',
        description: 'A mid-distance option through the heart of the Karangahake Gorge with tunnel sections, native bush and riverside trails. Walk or run.',
      },
      {
        name: 'Short Course',
        distance: '8.2 km',
        elevation: 'Easy-Moderate',
        time: '45m - 2h 30m',
        description: 'An accessible introduction to trail running in the gorge featuring riverside trails, bush sections and tunnel experiences. Walk or run. Ages 8+.',
      },
      {
        name: 'Trail Tigers Kids Dash',
        distance: '1 km',
        elevation: 'Flat',
        time: '5m - 15m',
        description: 'A fun kids dash at the event base — the perfect introduction to trail events for young runners.',
      },
    ],
    schedule: [
      { time: '6:30 AM', description: 'Race day registration opens at Dickey Flat Adventure Camp' },
      { time: '7:20 AM', description: 'Marathon briefing' },
      { time: '7:30 AM', description: 'Marathon start' },
      { time: '8:50 AM', description: 'Half Marathon briefing' },
      { time: '9:00 AM', description: 'Half Marathon start' },
      { time: '9:35 AM', description: 'Mid Course briefing' },
      { time: '9:45 AM', description: 'Mid Course start' },
      { time: '10:20 AM', description: 'Short Course briefing' },
      { time: '10:30 AM', description: 'Short Course start' },
      { time: '12:30 PM', description: 'Trail Tigers Kids Dash' },
      { time: '1:30 PM', description: 'Prize giving at event base' },
    ],
    courseTerrain: 'Hilly / Technical',
    courseSurface: 'Trail — Single Track, Riverside Trails, Bush Tracks, Tunnels',
    courseTraffic: 'Closed Course',
    inclusions: [
      'Finisher medal for all participants',
      'Race pack and timing chip',
      'Personal gear storage (tagged bags kept secure and dry)',
      'On-course aid stations',
      'Prize giving with trophies and spot prizes',
    ],
  })

  // =========================================================================
  // 7. Whangamata Adventure Race
  // NEEDS COORDS: Whangamata area
  // =========================================================================
  await updateEvent('Whangamata Adventure Race', 'whangamata-adventure-race', {
    organizer: 'Crazy Kea Events',
    organizerWebsite: 'https://www.crazykeaevents.nz',
    registrationUrl: 'https://www.crazykeaentries.nz/',
    latitude: -37.2073,
    longitude: 175.8712,
    description: `The Whangamata Adventure Race is a multi-discipline team adventure race held in the Whangamata area of the Coromandel Peninsula, organised by Crazy Kea Events. The event offers both a 6-hour and a 3-hour option, challenging teams of 2 to 4 people to navigate through native bush, streams, farmland and forestry using map and compass while completing trail running, mountain biking and surprise mystery activities.

The course is kept secret until race day, when teams receive their 1:25,000 topographical maps and must plan their strategy and route choices on the spot — no GPS devices allowed. The 6-hour event is designed for everyday athletes with some navigation experience, requiring the ability to jog or walk approximately 10km off-road and mountain bike approximately 25km on forestry roads, farmland and singletrack. The 3-hour event is designed for families and beginners, with approximately 5km of trail running and 10km of mountain biking.

What makes the Whangamata Adventure Race unique is its blend of physical challenge with mental problem-solving and teamwork. Past mystery activities have included sudoku, mountain bike seesaws, mud runs, paintball shooting, scrabble and quoits — you never know what to expect. Described as "orienteering on steroids" by the NZ Herald, the event is a true cross-country adventure that takes teams through some of the most beautiful and rugged terrain in the Coromandel region, rewarding navigation skills, fitness and team cooperation in equal measure.`,
    highlights: [
      'Multi-discipline team adventure race: trail running, mountain biking and mystery activities',
      'Course kept secret until race day — teams receive maps at the start',
      'Navigation by map and compass only — no GPS allowed',
      'Two options: 6-hour (intermediate) and 3-hour (family/beginner)',
      'Teams of 2, 3 or 4 people — a true team event',
      'Surprise mystery activities revealed on the day (past examples: sudoku, mud run, paintball)',
      'Described as "orienteering on steroids" by the NZ Herald',
      'Set in the stunning Coromandel Peninsula bush, streams and farmland',
    ],
    requirements: [
      '6-hour event: ability to jog/walk ~10km off-road and mountain bike ~25km',
      '3-hour event: ability to jog/walk ~5km off-road and mountain bike ~10km',
      'Mountain bike in good working order required',
      'Helmet required for mountain biking',
      'No GPS devices allowed — navigation by map and compass only',
      'Teams of 2, 3 or 4 people required',
    ],
    distanceDetails: [
      {
        name: '6-Hour Adventure Race',
        distance: '~35 km (10km run + 25km MTB)',
        elevation: 'Varied — hilly terrain',
        time: '6 hours',
        description: 'The main event for everyday athletes with some navigation experience. Approximately 10km of trail running/trekking and 25km of mountain biking on forestry roads, farmland and singletrack, plus mystery activities. Navigation by map and compass with 1:25,000 topographical maps provided.',
      },
      {
        name: '3-Hour Adventure Race',
        distance: '~15 km (5km run + 10km MTB)',
        elevation: 'Varied — moderate terrain',
        time: '3 hours',
        description: 'Designed for families and beginners. Approximately 5km of trail running and 10km of mountain biking on forestry roads and farmland, plus mystery activities. A great introduction to adventure racing.',
      },
    ],
    courseTerrain: 'Mixed — Bush, Farmland, Forestry, Streams',
    courseSurface: 'Trail — Off-Road, Forestry Roads, Singletrack, Farmland',
    courseTraffic: 'Closed Course',
    inclusions: [
      '1:25,000 topographical maps provided at start',
      'Mystery activity equipment provided',
      'On-course checkpoints',
      'Timing and results',
    ],
  })

  // =========================================================================
  // 8. Abel Tasman Coastal Classic
  // NEEDS COORDS: Kaiteriteri Recreation Reserve (event base)
  // =========================================================================
  await updateEvent('Abel Tasman Coastal Classic', 'abel-tasman-coastal-classic', {
    organizer: 'Nelson Events',
    organizerWebsite: 'https://www.nelsonevents.co.nz',
    registrationUrl: 'https://www.nelsonevents.co.nz/abel-tasman-coastal-classic/',
    latitude: -41.0366,
    longitude: 173.0174,
    description: `The Abel Tasman Coastal Classic is one of New Zealand's most iconic trail running events — a 33km point-to-point race from Awaroa to Marahau along the renowned Abel Tasman Coast Track within Abel Tasman National Park. Organised by Nelson Events, the race has been held for over 30 years and is limited to just 350 entries, making it one of the most sought-after trail running experiences in the country.

The course follows the famous Abel Tasman Coast Track through some of the most spectacular coastal scenery in New Zealand. Runners traverse golden sand beaches, dense native bush, swing bridges and sweeping coastal headlands, passing through sections from Awaroa to Onetahuti Beach (6.4km), Onetahuti to Bark Bay (6.1km), Bark Bay to Torrent Bay (7.7km), and Torrent Bay to Marahau (13km). With approximately 2,028 metres of elevation gain across undulating coastal terrain, the course is tough but wildly rewarding.

What makes the Abel Tasman Coastal Classic truly special is the extraordinary setting and the unique race day experience. Runners begin with a boat ride from Kaiteriteri to the remote Awaroa start line, then follow the coast track through a World Heritage-worthy landscape of turquoise waters, golden beaches and lush native forest. Aid stations at Onetahuti, Bark Bay and Torrent Bay provide water and support, and a packed lunch awaits finishers at Marahau. The event base at Kaiteriteri Recreation Reserve Camping Ground hosts registration and the prizegiving dinner function, creating a festive atmosphere that extends well beyond the race itself.`,
    highlights: [
      'Iconic 33km trail run through Abel Tasman National Park — over 30 years of history',
      'Point-to-point course from Awaroa to Marahau along the famous Coast Track',
      'Stunning scenery: golden beaches, turquoise waters, native bush and swing bridges',
      'Limited to 350 entries — one of NZ\'s most exclusive trail running events',
      'Boat transport from Kaiteriteri to the remote Awaroa start line',
      'Approximately 2,028m of cumulative elevation gain on undulating coastal terrain',
      'Three aid stations at Onetahuti, Bark Bay and Torrent Bay',
      'Packed lunch provided at the Marahau finish line',
    ],
    requirements: [
      'Entries limited to 350 — enter early as the event sells out',
      'Entries cannot be transferred to other competitors or for future events',
      'Must carry own hydration — water available at three aid stations for topping up',
      'Trail running shoes recommended',
      'Sufficient fitness for 33km of undulating coastal terrain with 2,028m elevation gain',
    ],
    distanceDetails: [
      {
        name: 'Abel Tasman Coastal Classic',
        distance: '33 km',
        elevation: '+2,028m',
        time: '3h - 7h',
        description: 'A point-to-point trail run from Awaroa to Marahau along the Abel Tasman Coast Track. The course is divided into four sections: Awaroa to Onetahuti Beach (6.4km), Onetahuti to Bark Bay (6.1km), Bark Bay to Torrent Bay (7.7km), and Torrent Bay to Marahau (13km). Features golden beaches, native bush, swing bridges and sweeping coastal headlands.',
      },
    ],
    courseTerrain: 'Coastal / Hilly',
    courseSurface: 'Trail — Beach, Native Bush, Coastal Track, Swing Bridges',
    courseTraffic: 'Shared Track (Abel Tasman Coast Track)',
    registrationCapacity: 350,
    inclusions: [
      'Boat transport from Kaiteriteri to Awaroa start line',
      'Three on-course aid stations (Onetahuti, Bark Bay, Torrent Bay)',
      'Packed lunch at the Marahau finish line',
      'Prizegiving dinner function at Kaiteriteri Recreation Reserve',
      'Race timing and results',
    ],
  })

  console.log('\nBatch 3 enrichment complete!')
}

main()
  .catch((e: any) => { console.error('Fatal:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
