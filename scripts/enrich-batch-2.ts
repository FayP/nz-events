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
  console.log('Enriching batch 2 events...\n')

  // =========================================================================
  // 1. City2Surf — Christchurch
  // =========================================================================
  await updateEvent('City2Surf', 'city2surf', {
    organizer: 'Star Media',
    organizerWebsite: 'https://starmedia.kiwi',
    registrationUrl: 'https://eventplus.net/CS26',
    description: `The FreshChoice City2Surf is the South Island's largest mass participation event and one of Christchurch's most beloved annual traditions. Inaugurated in 1974, the event has been held almost 50 times and regularly draws over 10,000 participants of all ages who run, jog, walk or push prams from the city centre out to the coast. The event has raised over $5 million for local charities since its inception, with Hato Hone St John serving as the 2026 charity partner.

The 12km course starts at Latimer Square in the Christchurch CBD and follows the Avon River along the scenic Otakaro trail and Avonside Drive, continuing along New Brighton Road before finishing at the City2Surf village at Rawhiti Domain on the coast. The shorter 6km course starts from Porritt Park and joins the main route to share the same festive finish. Both courses are flat, sealed and suitable for all fitness levels — from competitive runners to families with young children.

What makes City2Surf special is its inclusive, carnival atmosphere. It is not just a race but a celebration of community and movement, with on-course entertainment, water stations and a lively finish festival at Rawhiti Domain overlooking New Brighton's foreshore. The event is part of the broader Round the Bays series and remains a highlight of the Canterbury events calendar each March.`,
    highlights: [
      "South Island's largest mass participation event with 10,000+ participants",
      'Iconic Christchurch tradition since 1974 — nearly 50 years of history',
      'Flat, scenic course following the Avon River and Otakaro trail to the coast',
      'Two distance options: 12km (Latimer Square) and 6km (Porritt Park)',
      'Has raised over $5 million for local charities',
      'Open to all — runners, joggers, walkers, families and prams welcome',
      'Festive finish village at Rawhiti Domain with entertainment and celebrations',
    ],
    requirements: [
      'No bicycles, scooters or skateboards on course',
      'Children aged 0-4 years enter free but must be accompanied by an adult',
      'Youth aged 5-11 require a youth entry',
    ],
    distanceDetails: [
      {
        name: '12km Run/Walk',
        distance: '12 km',
        elevation: 'Minimal',
        time: '50 min - 2 hrs',
        description: 'The full City2Surf course from Latimer Square through the city, along the Avon River and Otakaro trail to the finish at Rawhiti Domain on the coast.',
      },
      {
        name: '6km Run/Walk',
        distance: '6 km',
        elevation: 'Minimal',
        time: '30 min - 1h 15m',
        description: 'A shorter option starting from Porritt Park, joining the main 12km route for a festive finish at Rawhiti Domain.',
      },
    ],
    schedule: [
      { time: '9:00 AM', description: '12km run/walk start from Latimer Square' },
      { time: '9:45 AM', description: '6km run/walk start from Porritt Park' },
    ],
    courseTerrain: 'Flat',
    courseSurface: 'Sealed Roads and Paths',
    courseTraffic: 'Road Closure',
    inclusions: [
      'Finisher medal',
      'On-course water stations',
      'On-course toilet stations',
      'On-course entertainment',
      'Finish festival at Rawhiti Domain',
    ],
  })

  // =========================================================================
  // 2. Nelson Half Marathon (The Nelson Half Festival of Running)
  // =========================================================================
  await updateEvent('Nelson Striders Half Marathon', 'nelson-striders-half-marathon', {
    organizer: 'Athletics Nelson',
    organizerWebsite: 'https://athleticsnelson.co.nz',
    registrationUrl: 'https://nelsonhalfmarathon.co.nz/',
    description: `The Nelson Half Festival of Running is one of the South Island's most popular running events, held annually on the first Sunday in November at Saxton Field in Stoke, Nelson. With a history spanning over 45 years, the event has evolved from a small club race into a community favourite that attracts locals and visitors from across New Zealand.

The course is set almost entirely on the walkway systems around Stoke and the Great Taste Trail, showcasing stunning vistas across the Waimea Inlet and the surrounding Nelson landscape. The terrain is flat and scenic, making it an ideal course for runners chasing personal bests as well as casual participants looking for a relaxed run or walk through beautiful surroundings.

The event caters for all levels of ability and fitness with four distance options — the 21.1km half marathon, 10km, 5km and a 2.5km fun run. Whether you are a serious competitor or a family looking for a fun weekend outing, The Nelson Half delivers a well-organised, welcoming event in one of New Zealand's sunniest regions.`,
    highlights: [
      'Over 45 years of running history in the Nelson region',
      'Flat, fast course on walkways and the Great Taste Trail',
      'Stunning views across the Waimea Inlet and Nelson landscape',
      'Four distance options from 2.5km to 21.1km for all fitness levels',
      'Based at Saxton Field — easy access and excellent facilities',
      "Held in one of New Zealand's sunniest regions",
      'Open to both runners and walkers across all distances',
    ],
    requirements: [
      'Half marathon open to participants aged 14 and over',
      'Under 14s may enter shorter distances',
    ],
    distanceDetails: [
      {
        name: 'Half Marathon',
        distance: '21.1 km',
        elevation: 'Minimal',
        time: '1h 20m - 3 hrs',
        description: 'The flagship event — a flat, scenic course on walkways around Stoke and along the Waimea Estuary, starting and finishing at Saxton Field.',
      },
      {
        name: '10km Run/Walk',
        distance: '10 km',
        elevation: 'Minimal',
        time: '40 min - 1h 30m',
        description: 'A popular middle-distance option on the same scenic walkway and trail network around Stoke.',
      },
      {
        name: '5km Run/Walk',
        distance: '5 km',
        elevation: 'Minimal',
        time: '20 min - 50 min',
        description: 'A great introductory distance for newer runners and walkers, using the flat trail network near Saxton Field.',
      },
      {
        name: '2.5km Fun Run',
        distance: '2.5 km',
        elevation: 'Minimal',
        time: '10 min - 30 min',
        description: 'A short, family-friendly distance perfect for young runners and those new to running events.',
      },
    ],
    courseTerrain: 'Flat',
    courseSurface: 'Mixed — Walkways and Great Taste Trail',
    courseTraffic: 'Off-Road Paths',
    inclusions: [
      'Race bib with timing',
      'Post-race refreshments',
    ],
  })

  // =========================================================================
  // 3. Graperide — Blenheim / Marlborough
  // =========================================================================
  await updateEvent('Graperide', 'graperide', {
    organizer: 'Marlborough Cycling Trust',
    organizerWebsite: 'https://www.graperide.co.nz',
    registrationUrl: 'https://www.graperide.co.nz',
    description: `The Forrest GrapeRide is the largest and most popular cycling event in the South Island of New Zealand, set in the heart of the world-renowned Marlborough wine region. Starting and finishing at the award-winning Forrest Wines winery in Renwick, the event takes riders on a spectacular journey through vineyards, coastal landscapes and the stunning Marlborough Sounds.

The standard 101km course heads south from Renwick through Blenheim, then north through Grovetown and Spring Creek to the coastal town of Picton. From there, riders tackle the famously scenic Queen Charlotte Drive — almost 40km of winding road through the Marlborough Sounds — before climbing the 3.4km Mahakipawa Hill and descending into Havelock. The return to Renwick features rolling terrain through the wine country. The shorter 42km Taster course offers the wine country experience without the Sounds, while the 202km Magnum doubles the challenge for the truly ambitious.

Since its inception, the GrapeRide has become a bucket-list event for New Zealand cyclists, combining world-class scenery with the festive atmosphere of a winery finish. Riders are released in groups of approximately 100 based on estimated finishing time, creating a sociable and safe riding experience through some of the most picturesque terrain the country has to offer.`,
    highlights: [
      "South Island's largest and most popular cycling event",
      'Set in the heart of the Marlborough wine region, starting and finishing at Forrest Wines',
      'Three distance options: 42km Taster, 101km Standard, and 202km Magnum',
      'Spectacular 40km section through the Marlborough Sounds on Queen Charlotte Drive',
      'Riders released in manageable groups of ~100 for a safe, sociable experience',
      'Post-ride celebration at the award-winning Forrest Wines winery in Renwick',
      'Stunning mix of vineyards, coastal scenery and rolling countryside',
    ],
    requirements: [
      'Roadworthy bicycle in good mechanical condition',
      'Approved cycling helmet (mandatory)',
      'High-visibility or bright cycling clothing recommended',
      'Spare tube, pump and basic repair kit',
      'Water bottles — carry at least 750ml',
    ],
    distanceDetails: [
      {
        name: 'Magnum',
        distance: '202 km',
        elevation: '~2,400m',
        time: '7 - 12 hrs',
        description: 'The ultimate GrapeRide challenge — two laps of the 101km course through the Marlborough Sounds and wine country for serious endurance cyclists.',
      },
      {
        name: 'Standard',
        distance: '101 km',
        elevation: '~1,200m',
        time: '3.5 - 6 hrs',
        description: 'The classic GrapeRide loop through Blenheim, Picton, the Queen Charlotte Drive, over Mahakipawa Hill to Havelock and back through wine country.',
      },
      {
        name: 'Taster',
        distance: '42 km',
        elevation: '~300m',
        time: '1.5 - 3 hrs',
        description: 'A shorter, relatively flat route through the Marlborough wine region — ideal for less experienced riders or those who want to enjoy the scenery at a relaxed pace.',
      },
    ],
    courseTerrain: 'Rolling Hills / Coastal',
    courseSurface: 'Sealed Roads',
    courseTraffic: 'Open Roads with Traffic Management',
    inclusions: [
      'Timed ride with electronic timing',
      'On-course feed stations',
      'Post-ride food and refreshments at Forrest Wines',
      'Mechanical support vehicles on course',
    ],
  })

  // =========================================================================
  // 4. Rotorua Marathon
  // =========================================================================
  await updateEvent('Rotorua Marathon', 'rotorua-marathon', {
    organizer: 'Events Promotions Ltd',
    organizerWebsite: 'https://www.rotoruamarathon.co.nz',
    registrationUrl: 'https://raceroster.com/events/2026/109657/2026-red-stag-rotorua-marathon',
    description: `The Red Stag Rotorua Marathon is New Zealand's oldest and most iconic marathon, first held in 1965 with just 16 competitors. Now in its 62nd edition, it has grown into the country's biggest marathon event and is World Athletics and AIMS certified. Every May, thousands of runners and walkers descend on Rotorua to take on the famous lap of the lake.

The full marathon course is a unique 42.2km circuit of Lake Rotorua — the lake's circumference is almost exactly marathon distance. Starting at the historic Government Gardens, runners wind through lakeside communities, rolling countryside and past steaming geothermal landscapes. The course showcases a stunning fusion of geothermal terrain, sculpted limestone trails, forest trails and tarmac, passing landmarks including Te Puia's Pohutu Geyser and the Whakarewarewa Forest.

In addition to the full marathon, the event offers an NZCT Half Marathon (21km), a Go Media 12km and a Wai Ariki Hot Springs & Spa 5km, making it accessible to participants of all abilities. The Rotorua Marathon has been run almost every year since 1965 — the sole exception being 1999, when 200mm of rainfall washed out parts of the course overnight. It remains a must-do event for New Zealand runners.`,
    highlights: [
      "New Zealand's oldest marathon — held annually since 1965",
      'World Athletics and AIMS certified marathon course',
      'Unique 42.2km circuit of Lake Rotorua — the lake is almost exactly marathon distance',
      'Stunning geothermal landscapes, forest trails and lakeside scenery',
      'Four distance options from 5km to the full 42.2km marathon',
      'Open to both runners and walkers across all distances',
      'Based at Novotel Rotorua Lakeside with race start from Government Gardens',
    ],
    requirements: [
      'Marathon competitors must reach the 23.5km mark (Ramada Resort) by 1:00 PM',
      'Personal hydration recommended — water stations are provided on course',
    ],
    distanceDetails: [
      {
        name: 'Full Marathon',
        distance: '42.2 km',
        elevation: '~200m',
        time: '3 - 6 hrs',
        description: 'The flagship lap-of-the-lake course starting from Government Gardens, circling Lake Rotorua through lakeside communities, geothermal landscapes and forest trails.',
      },
      {
        name: 'NZCT Half Marathon',
        distance: '21.1 km',
        elevation: '~100m',
        time: '1h 30m - 3 hrs',
        description: 'Starting from Whangamarino School on SH33 at Okere Falls, runners follow the scenic lake edge back to the finish at Government Gardens.',
      },
      {
        name: 'Go Media 12km',
        distance: '12 km',
        elevation: '~60m',
        time: '50 min - 2 hrs',
        description: 'A popular mid-distance option starting from Te Puia, passing the famous Pohutu Geyser and finishing at Government Gardens.',
      },
      {
        name: 'Wai Ariki 5km',
        distance: '5 km',
        elevation: 'Minimal',
        time: '20 min - 1 hr',
        description: 'A short, accessible event starting and finishing at Government Gardens — perfect for newcomers, families and walkers.',
      },
    ],
    schedule: [
      { time: '6:00 AM', description: 'Registration opens at Novotel Rotorua, Lower Tutanekai Street' },
      { time: '7:30 AM', description: 'Registration closes' },
      { time: '7:45 AM', description: 'NZCT Half Marathon start — Whangamarino School, SH33 Okere Falls' },
      { time: '8:00 AM', description: 'Full Marathon start — Government Gardens' },
      { time: '8:15 AM', description: 'Go Media 12km start — Te Puia, Hemo Road' },
      { time: '8:20 AM', description: 'Wai Ariki 5km start — Government Gardens' },
      { time: '11:00 AM', description: 'Podium awards — 12km and 5km' },
      { time: '12:00 PM', description: 'Podium awards — Half Marathon' },
      { time: '2:00 PM', description: 'Podium awards — Full Marathon' },
    ],
    courseTerrain: 'Rolling / Lakeside',
    courseSurface: 'Mixed — Sealed Roads, Limestone Trails, Forest Trails',
    courseTraffic: 'Road Closure and Traffic Management',
    cutoffTime: 'Marathon: must reach 23.5km by 1:00 PM',
    inclusions: [
      'Finisher medal (all distances)',
      'Complimentary drawstring bag',
      'Race bib with timing chip',
      'On-course water stations',
      'Post-race refreshments',
    ],
  })

  // =========================================================================
  // 5. Tour of Southland — Invercargill (NEEDS COORDS)
  // =========================================================================
  await updateEvent('Tour of Southland', 'tour-of-southland', {
    organizer: 'Cycling Southland',
    organizerWebsite: 'https://www.cyclingsouth.org.nz',
    registrationUrl: 'https://www.tourofsouthland.com',
    latitude: -46.4131,
    longitude: 168.3538,
    description: `The SBS Bank Tour of Southland is one of New Zealand's oldest and most prestigious professional road cycling stage races. First held in 1956 when the Mayor of Invercargill fired the starting pistol outside the old Post Office in Dee Street, the Tour has grown from a modest three-day race on gravel roads into a week-long, UCI-registered international event that attracts top riders from New Zealand, Australia and beyond.

More than 100 riders from approximately 18 teams compete over roughly 800km during seven action-packed stages across the spectacular Southland region. The race begins with a prologue time trial around the picturesque Queens Park in Invercargill, with subsequent stages traversing the rolling farmland, coastal roads and mountain passes that make Southland one of New Zealand's most dramatic cycling landscapes. The tour culminates with an individual time trial and a final stage into Invercargill.

The Tour of Southland holds a special place in New Zealand cycling history. It gained UCI status in 2002 as a registered Category 2.2 international tour, and in 1995 it successfully transitioned to a team-based format. The most significant change made it one of the premier development races in Australasian cycling. For 2026, Cycling Southland has confirmed a historic double-tour year — the 69th edition in January and the 70th anniversary edition in November.`,
    highlights: [
      "One of New Zealand's oldest and most prestigious cycling stage races — since 1956",
      'UCI-registered Category 2.2 international tour since 2002',
      '100+ riders from 18 teams racing over 800km across seven stages',
      'Prologue time trial through the picturesque Queens Park, Invercargill',
      'Historic double-tour year in 2026 — 69th and 70th editions',
      'Contests for Yellow Jersey, Sprint Ace, King of the Mountains, Under-23, Teams and Masters',
      'International peloton with riders from New Zealand, Australia, UK and Canada',
      "Deep roots in New Zealand's cycling heritage spanning nearly 70 years",
    ],
    requirements: [
      'UCI-compliant road bicycle',
      'Team registration required — individual entries not accepted',
      'UCI racing licence or national equivalent',
      'Approved cycling helmet (mandatory)',
      'Team uniform required',
    ],
    distanceDetails: [
      {
        name: 'Full Tour',
        distance: '~800 km',
        elevation: 'Significant — varies by stage',
        time: '7 days of racing',
        description: 'Seven stages across the Southland region including a prologue time trial, road stages, and an individual time trial, covering approximately 800km of diverse terrain.',
      },
    ],
    courseTerrain: 'Rolling Hills / Mixed',
    courseSurface: 'Sealed Roads',
    courseTraffic: 'Rolling Road Closure with Police Escort',
    inclusions: [
      'Team accommodation coordination',
      'Mechanical support vehicles',
      'Feed zone support',
      'Daily race results and classifications',
      'Awards ceremony and prizes',
    ],
  })

  // =========================================================================
  // 6. Craters Classic — Taupo
  // =========================================================================
  await updateEvent('Craters Classic', 'craters-classic', {
    organizer: 'Bike Taupo',
    organizerWebsite: 'https://www.biketaupo.org.nz',
    registrationUrl: 'https://www.cratersclassic.co.nz/entry-information',
    description: `The Craters Classic is one of New Zealand's premier mountain biking events, held annually in the world-renowned Craters Mountain Bike Park just 10 minutes north of Taupo. Organised by Bike Taupo — a charity organisation that returns all profits to track building and maintenance — the event showcases some of the best single-track riding in the country on Taupo's famous volcanic pumice trails.

The courses are designed to showcase the 60km single-track network available in Craters MTB Park and the surrounding Huka trails. Taupo's 'White Gold' pumice soils are the secret ingredient — these free-draining volcanic soils create tracks that remain hard, fast and rideable in any weather, a quality not found anywhere else in New Zealand. Trails wind through exotic pine and eucalyptus plantations with stunning views of Lake Taupo and the Waikato River, ranging from easy Grade 2 to advanced Grade 4-5.

The 2026 event offers multiple course options including the Classic (approximately 55km), the Pumice Pacer (~35km), the Aratiatia Adventure (~20km), the Bayleys Classic (~30-35km) and Kids Craters courses. The event uses wave starts and is untimed, emphasising the experience over racing. Based at The Hub on Wairakei Drive with event HQ at Wairakei Resort, the Craters Classic is open to all riders including E-Bike users and is a highlight of the national mountain biking calendar.`,
    highlights: [
      "One of New Zealand's premier mountain biking events",
      "Famous Taupo 'White Gold' pumice trails — rideable in any weather",
      '60km of world-class single track in Craters MTB Park and Huka trails',
      'Multiple course options from 20km to 55km for all skill levels',
      'E-Bikes welcome in all categories',
      'Run by Bike Taupo — all profits fund track building and maintenance',
      'Wave starts with untimed, experience-focused format',
      'Stunning views of Lake Taupo and the Waikato River',
    ],
    requirements: [
      'Mountain bike in good working condition (E-Bikes permitted)',
      'Approved cycling helmet (mandatory)',
      'Appropriate footwear — no open-toed shoes',
      'Water bottle or hydration pack',
      'Riders under 14 must be accompanied by an adult',
    ],
    distanceDetails: [
      {
        name: 'Classic',
        distance: '~55 km',
        elevation: '~800m',
        time: '3 - 5 hrs',
        description: 'The flagship course showcasing the best of Craters MTB Park and Huka trails single-track network through pine and eucalyptus plantations.',
      },
      {
        name: 'Pumice Pacer',
        distance: '~35 km',
        elevation: '~500m',
        time: '2 - 4 hrs',
        description: 'A mid-length course offering a great taste of the pumice single track without the full Classic distance.',
      },
      {
        name: 'Bayleys Classic',
        distance: '~30 km',
        elevation: '~400m',
        time: '2 - 3.5 hrs',
        description: 'A popular option with a minimum recommended age of 14 years, covering quality single track through the Craters network.',
      },
      {
        name: 'Aratiatia Adventure',
        distance: '~20 km',
        elevation: '~250m',
        time: '1.5 - 3 hrs',
        description: 'Starting at The Hub, riders head into Craters MTB Park and traverse around the spectacular Aratiatia Dam.',
      },
      {
        name: 'Kids Craters — Long Course',
        distance: '~11 km',
        elevation: '~100m',
        time: '45 min - 1.5 hrs',
        description: 'The longer kids option through age-appropriate trails in the Craters network. All kids receive a finisher medal.',
      },
      {
        name: 'Kids Craters — Short Course',
        distance: '~7 km',
        elevation: '~50m',
        time: '30 min - 1 hr',
        description: 'A shorter kids course perfect for younger or less experienced riders. All kids receive a finisher medal.',
      },
    ],
    schedule: [
      { time: '12:00 PM (Fri)', description: 'Kids Craters registration opens at The Hub, Wairakei Drive' },
      { time: '4:00 PM (Fri)', description: 'Craters Classic registration opens at Wairakei Resort' },
      { time: '7:00 PM (Fri)', description: 'Friday registration closes' },
      { time: '7:30 AM (Sat)', description: 'Saturday registration opens at Wairakei Resort' },
      { time: '10:00 AM (Sat)', description: 'Saturday registration closes' },
      { time: 'TBC (Sat)', description: 'Craters Classic wave starts begin' },
    ],
    courseTerrain: 'Undulating / Volcanic',
    courseSurface: 'Single Track — Pumice Trails through Pine and Eucalyptus Plantations',
    courseTraffic: 'Off-Road — Closed Course',
    inclusions: [
      'Finisher medal (Kids Craters)',
      'Timed ride with wave starts',
      'On-course marshalling and safety',
      'Post-ride refreshments',
      'Access to Craters MTB Park trail network',
    ],
  })

  // =========================================================================
  // 7. Hawkes Bay Marathon
  // =========================================================================
  await updateEvent('Hawkes Bay Marathon', 'hawkes-bay-marathon', {
    organizer: 'IRONMAN New Zealand',
    organizerWebsite: 'https://hawkesbaymarathon.co.nz',
    registrationUrl: 'https://hawkesbaymarathon.co.nz/entry-info/',
    description: `The ASICS Runaway Hawke's Bay Marathon is one of New Zealand's most scenic running events, set against the stunning backdrop of the Hawke's Bay wine country and coastline. Held annually in May, the event offers a unique course that blends on-road running with the smooth, hard-packed limestone trails of the Hawke's Bay Trails network, finishing at the iconic Elephant Hill Estate & Winery.

The marathon course starts at Anderson Park in Greenmeadows, Napier and heads south on a flat, mixed-terrain course that is 50% smooth limestone Hawke's Bay Trails and 50% sealed roads and paths. Runners wind through the Waitangi Estuary at Clive with ocean views out towards Cape Kidnappers, creating a one-of-a-kind running experience. The half marathon starts on Marine Parade in Napier and joins the marathon route at Waitangi Regional Park. The 10km starts at Evers-Swindell Reserve in Clive. All events share the spectacular finish at Elephant Hill.

Organised by IRONMAN New Zealand, the event is run to a high professional standard with full road support, aid stations and a vibrant finish festival at one of Hawke's Bay's premier wineries. The course is flat and fast, making it an excellent choice for runners targeting personal bests, while the vineyard and coastal scenery make it equally appealing for those simply looking to enjoy a beautiful run.`,
    highlights: [
      'Stunning finish at the iconic Elephant Hill Estate & Winery',
      'Unique mixed-terrain course — 50% limestone trails, 50% sealed roads',
      'Flat, fast course ideal for personal bests',
      'Ocean views towards Cape Kidnappers through the Waitangi Estuary',
      'Four distance options: Marathon, Half Marathon, 10km and Kids Run',
      'Organised by IRONMAN to a professional international standard',
      'Set in the heart of the Hawke\'s Bay wine region',
    ],
    requirements: [
      'Participants must be able to complete the marathon before the 4:00 PM course closure',
      'Headphones may be worn but participants must remain aware of surroundings',
    ],
    distanceDetails: [
      {
        name: 'ASICS Marathon',
        distance: '42.2 km',
        elevation: 'Minimal — flat course',
        time: '3 - 6 hrs',
        description: 'Starting from Anderson Park in Greenmeadows, Napier, the flat mixed-terrain course runs through the Waitangi Estuary with ocean views, finishing at Elephant Hill Estate & Winery.',
      },
      {
        name: 'La Roche Posay Half Marathon',
        distance: '21.1 km',
        elevation: 'Minimal — flat course',
        time: '1h 30m - 3 hrs',
        description: 'Starting on Marine Parade in Napier, joining the marathon course at Waitangi Regional Park for a scenic run to the Elephant Hill finish.',
      },
      {
        name: '10km Run',
        distance: '10 km',
        elevation: 'Minimal — flat course',
        time: '40 min - 1h 30m',
        description: 'Starting at Evers-Swindell Reserve in Clive, a flat course on the Hawke\'s Bay Trails finishing at Elephant Hill Estate & Winery.',
      },
      {
        name: 'Kids Run',
        distance: '3 km',
        elevation: 'Minimal',
        time: '15 min - 30 min',
        description: 'A fun, family-friendly distance for younger runners at the Elephant Hill finish venue.',
      },
    ],
    schedule: [
      { time: '7:30 AM', description: '10km start — Evers-Swindell Reserve, Clive' },
      { time: '8:00 AM', description: 'Half Marathon start — Marine Parade, Napier' },
      { time: '8:20 AM', description: 'Marathon start — Anderson Park, Greenmeadows' },
      { time: '1:30 PM', description: 'Kids Run — Elephant Hill Estate & Winery' },
      { time: '4:00 PM', description: 'Course closure' },
    ],
    courseTerrain: 'Flat',
    courseSurface: 'Mixed — Limestone Trails and Sealed Roads',
    courseTraffic: 'Road Closure and Traffic Management',
    cutoffTime: 'Course closes at 4:00 PM for all distances',
    inclusions: [
      'Finisher medal',
      'Race bib with timing chip',
      'On-course aid stations',
      'Finish festival at Elephant Hill Estate & Winery',
    ],
  })

  // =========================================================================
  // 8. Gisborne Harriers Half Marathon (Gizzy Laser Half Marathon)
  // =========================================================================
  await updateEvent('Gisborne Harriers Half Marathon', 'gisborne-harriers-half-marathon', {
    organizer: 'Gisborne Harriers Club',
    organizerWebsite: 'https://www.gisborneharriers.co.nz',
    registrationUrl: 'https://www.eventbrite.co.nz/o/gisborne-harriers-club-75671498403',
    description: `The Gizzy Laser Half Marathon is Gisborne's premier running event, organised by the Gisborne Harriers Club and sponsored by Laser Electrical and Plumbing. Held annually in November, the event starts and finishes at the beautiful Matawhero Wines winery on the outskirts of Gisborne, combining a quality running event with a relaxed, festive atmosphere.

The course follows the scenic stopbank track along the Waipaoa River, offering flat, fast terrain that is perfect for runners chasing personal bests as well as those simply enjoying a relaxed run or walk through the Gisborne countryside. The flat profile and well-maintained trails make this an excellent event for first-time half marathon runners looking for an achievable, scenic course.

With three distance options — 21km, 10km and 5km — the event caters for runners and walkers of all abilities. The winery finish provides a wonderful post-race atmosphere with live music, spot prizes and a prizegiving at noon. While walkers are welcome across all distances, the event focuses on running placings and does not issue competitive walking results. The Gizzy Laser Half Marathon is a community favourite that showcases the best of Gisborne's rural landscape and warm hospitality.`,
    highlights: [
      'Scenic stopbank course along the Waipaoa River',
      'Flat, fast terrain ideal for personal bests',
      'Start and finish at Matawhero Wines winery',
      'Three distance options: 21km, 10km and 5km',
      'Live music, spot prizes and post-race prizegiving at noon',
      'Welcoming community event open to runners and walkers',
      'Medal for all finishers',
    ],
    requirements: [
      'Walkers welcome but competitive placings are for runners only',
      'No specific gear requirements — suitable running shoes recommended',
    ],
    distanceDetails: [
      {
        name: 'Half Marathon',
        distance: '21 km',
        elevation: 'Minimal — flat course',
        time: '1h 30m - 3 hrs',
        description: 'The main event following the scenic stopbank track along the Waipaoa River, starting and finishing at Matawhero Wines.',
      },
      {
        name: '10km Run/Walk',
        distance: '10 km',
        elevation: 'Minimal — flat course',
        time: '40 min - 1h 30m',
        description: 'A popular middle distance on the flat Waipaoa River stopbank trails, ideal for intermediate runners and walkers.',
      },
      {
        name: '5km Run/Walk',
        distance: '5 km',
        elevation: 'Minimal — flat course',
        time: '20 min - 50 min',
        description: 'A short, accessible distance for beginners, families and those looking for a relaxed run or walk.',
      },
    ],
    schedule: [
      { time: '8:00 AM', description: 'Race start — all distances from Matawhero Wines' },
      { time: '12:00 PM', description: 'Prizegiving, live music and spot prizes at Matawhero Wines' },
    ],
    courseTerrain: 'Flat',
    courseSurface: 'Stopbank Trail / Gravel Path',
    courseTraffic: 'Off-Road — Stopbank Trails',
    inclusions: [
      'Finisher medal',
      'Post-race refreshments at Matawhero Wines',
      'Live music and entertainment',
      'Spot prizes',
    ],
  })

  console.log('\nBatch 2 enrichment complete!')
}

main()
  .catch((e: any) => { console.error('Fatal:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
