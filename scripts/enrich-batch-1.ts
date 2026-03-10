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
  datasources: { db: { url: getDatabaseUrl() } },
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
  console.log('Enriching batch 1 — 8 events\n')

  // ──────────────────────────────────────────────
  // 1. NZ MTB Rally Nelson
  // ──────────────────────────────────────────────
  await updateEvent('NZ MTB Rally Nelson', 'nz-mtb-rally-nelson', {
    organizer: 'trailAddiction',
    organizerWebsite: 'https://trailaddiction.com/',
    registrationUrl: 'https://nzmtbrally.com/register/',
    website: 'https://nzmtbrally.com/',
    description: `The NZ MTB Rally is a six-day uplift-assisted enduro mountain bike event held annually in Nelson, at the top of New Zealand's South Island. Organised by trailAddiction, the rally takes a field of up to 120 international riders on a circular itinerary through Nelson's world-class trail networks, with a different location each day — including the legendary Wairoa Gorge, Silvan Forest Park, Golden Bay, Cable Bay and the Nelson City Zone. Access is provided by helicopter, boat, and 4x4 vehicles, making trails that are otherwise impossible to reach available to competitors.

Founded in 2024, the rally quickly established itself as one of the most unique mountain bike events in the world. Each day features four to six gravity-biased timed stages connected by scenic backcountry liaisons and fully shuttled uplifts. The format blends competitive enduro racing with an adventure travel experience — after each day's racing, riders return to real beds, hot showers, and communal dinners with unlimited refreshments. The event is as much about camaraderie and exploration as it is about the stopwatch.

The 2026 edition returns to Nelson from 14-21 March. The all-inclusive package covers accommodation, all meals, heli-drops, 4x4 shuttles, boat rides, and on-course support. A self-supported option is available for New Zealand-based riders who prefer to arrange their own logistics. Rally Tours, a non-racing option, was introduced in 2026 for riders who want the full experience without the competitive element.`,
    highlights: [
      'Six days of uplift-assisted enduro racing at a new Nelson trail destination each day',
      'Access exclusive trails via helicopter, boat, and 4x4 — including the legendary Wairoa Gorge',
      'All-inclusive package with accommodation, meals, and unlimited post-ride refreshments',
      'Field capped at 120 riders for an intimate, community-driven experience',
      'Non-racing Rally Tours option introduced in 2026 for those who want to explore without competing',
      'Suitable for solid intermediate riders comfortable on single-black-diamond trails',
      '32 timed stages across the six days through some of the best singletrack in the Southern Hemisphere',
    ],
    requirements: [
      'Enduro or trail mountain bike in good working condition',
      'Full-face helmet (mandatory for all stages)',
      'Knee pads and body armour recommended',
      'Comfortable on single-black-diamond trails and able to manage 4-6 hour riding days',
      'Own bike tools and spares for trail-side repairs',
    ],
    distanceDetails: [
      {
        name: 'NZ MTB Rally (6-day Enduro)',
        distance: 'Varies daily',
        elevation: 'Varies daily (all uplift-assisted)',
        time: '4-6 hours riding per day',
        description:
          'Six days of uplift-assisted enduro racing through Nelson\'s best trail networks, with 4-6 timed gravity stages per day connected by scenic liaisons.',
      },
    ],
    schedule: [
      { time: 'Day 1', description: 'Wairoa Gorge — legendary private bike park built in the 1990s with hand-built technical singletrack' },
      { time: 'Day 2', description: 'Silvan Forest MTB Park — flowy trails with panoramic views of the coastline' },
      { time: 'Day 3', description: 'Golden Bay — backcountry trails accessed by boat and helicopter' },
      { time: 'Day 4', description: 'Cable Bay — coastal enduro trails' },
      { time: 'Day 5', description: 'Nelson City Zone — local trail network' },
      { time: 'Day 6', description: 'Final day of racing and prize giving' },
    ],
    courseTerrain: 'Mountainous / Forest / Coastal',
    courseSurface: 'Singletrack — Hand-built trails, native bush, technical descents',
    inclusions: [
      'Six days of racing with all uplift logistics (helicopter, boat, 4x4)',
      'Accommodation in dorm-style rooms with real beds and hot showers',
      'All meals and nutrition including post-ride BBQ, beers, cider and soft drinks',
      'Event jersey and race pack',
      'On-course mechanical and medical support',
    ],
    registrationCapacity: 120,
  })

  // ──────────────────────────────────────────────
  // 2. Old Ghost Ultra
  // ──────────────────────────────────────────────
  await updateEvent('Old Ghost Ultra', 'old-ghost-ultra', {
    organizer: 'Mokihinui-Lyell Backcountry Trust',
    organizerWebsite: 'https://www.oldghostultra.com/',
    registrationUrl: 'https://www.oldghostultra.com/race-info',
    website: 'https://www.oldghostultra.com/',
    description: `The Old Ghost Ultra is an 85 km ultramarathon run entirely on the Old Ghost Road — New Zealand's longest continuous single-track trail — near Westport on the West Coast of the South Island. The course runs from Seddonville in the north to Lyell Historic Reserve in the south, traversing 2,700 metres of ascent through some of the most remote and dramatic backcountry in the country. Race director Phil Rossiter, who also chairs the Mokihinui-Lyell Backcountry Trust, created the event to showcase this extraordinary trail.

The Old Ghost Road was originally cut in the 1870s during the West Coast gold rush but was never completed. Over a century later it was reopened as a multi-day tramping and mountain biking track. The ultra takes runners through ancient podocarp forest, past historic mining relics, up the legendary 302 Skyline Steps onto an exposed alpine ridge, across the Lyell Range at 1,340 metres, and through the ominously named Boneyard and Hanging Judge sections. The majority of the elevation gain comes in the second half, after competitors have already run the equivalent of a marathon — making the Old Ghost one of the most demanding single-day ultras in Australasia.

Competitors have 17 hours to complete the course, with hard cutoff times enforced at each of the four aid stations: Specimen Point Hut, Stern Valley Hut (halfway), Ghost Lake Hut, and Lyell Saddle Hut (67 km). Runners who miss a cutoff are extracted by helicopter. The entry fee includes bus transport from Westport to the start and from the finish back to Westport, a helicopter drop-bag service to Stern Valley, and food and refreshments at the finish line.`,
    highlights: [
      "85 km on New Zealand's longest continuous single-track trail",
      '2,700 metres of ascent through remote West Coast backcountry',
      'Traverse the historic Old Ghost Road — an unfinished 1870s gold-rush trail',
      'Reach 1,340 metres on the exposed Lyell Range with 15 km above 1,000 metres elevation',
      'Navigate the legendary Skyline Steps, Hanging Judge climb, and Boneyard descent',
      'Helicopter drop-bag service to the mid-race aid station at Stern Valley Hut',
      'Limited field size creates an intimate, community atmosphere in Westport',
      'All transport to start and from finish included in entry',
    ],
    requirements: [
      'Head torch with spare set of batteries',
      'Seam-sealed waterproof jacket',
      'Seam-sealed waterproof long pants',
      'Two thermal long-sleeve tops (or equivalent)',
      'Thermal longs',
      'Thermal beanie/hat',
      'Thermal gloves',
      'Survival/emergency blanket',
      'First aid kit (minimum: 1 roll of tape, 2 gauze pads, 1 gauze bandage)',
      'Personal drinking vessel(s) for aid station hydration — mandatory',
    ],
    distanceDetails: [
      {
        name: 'Old Ghost Ultra',
        distance: '85 km',
        elevation: '+2,700m',
        time: '8 - 17 hrs',
        description:
          'Point-to-point from Seddonville to Lyell Historic Reserve on 100% single-track, crossing the Lyell Range at 1,340m with the majority of climbing in the second half of the race.',
      },
    ],
    schedule: [
      { time: '6:00 PM (Fri)', description: 'Compulsory race briefing at NBS Theatre, Westport' },
      { time: '4:00 AM', description: 'Buses depart NBS Theatre, Westport to start line' },
      { time: '6:00 AM', description: 'Race start at Seddonville (northern end of Old Ghost Road)' },
      { time: '8:00 AM', description: 'Cutoff — Specimen Point Hut aid station' },
      { time: '1:00 PM', description: 'Cutoff — Stern Valley Hut aid station (halfway)' },
      { time: '5:00 PM', description: 'Cutoff — Ghost Lake Hut aid station' },
      { time: '7:30 PM', description: 'Cutoff — Lyell Saddle Hut aid station (67 km)' },
      { time: '11:00 PM', description: 'Final cutoff — Lyell Historic Reserve finish line (17 hrs)' },
      { time: '9:00 AM (Sun)', description: 'Prize giving at NBS Theatre, Westport' },
    ],
    courseTerrain: 'Mountainous / Alpine Ridge / Forest',
    courseSurface: 'Trail — 100% single-track through native bush, alpine tussock and exposed ridge',
    cutoffTime: '17 hours (hard cutoffs at each aid station — helicopter extraction for DNF)',
    inclusions: [
      'Bus transport from Westport to the start line and from the finish back to Westport',
      'Helicopter-assisted drop bag service to Stern Valley Hut',
      'Four staffed aid stations with water, electrolyte drink, bananas and energy food',
      'First aid presence at each checkpoint',
      'Food and beer at the finish line festival',
      'Race pack and event number',
    ],
  })

  // ──────────────────────────────────────────────
  // 3. West Coast Wilderness Trail (Ride the Wilderness)
  // ──────────────────────────────────────────────
  await updateEvent('West Coast Wilderness Trail', 'west-coast-wilderness-trail', {
    organizer: 'West Coast Wilderness Trail Trust',
    organizerWebsite: 'https://westcoastwildernesstrail.co.nz/',
    registrationUrl: 'https://www.ridethewilderness.co.nz/',
    website: 'https://www.ridethewilderness.co.nz/',
    latitude: -42.4503,
    longitude: 171.2079,
    description: `Ride the Wilderness is an annual mountain bike event held on the West Coast Wilderness Trail — one of New Zealand's Great Rides and part of the NZ Cycle Trail network. The event offers four magnificent ride options all finishing in Greymouth, ranging from the 21 km Cruise to the epic 132 km full trail from Ross. The West Coast Wilderness Trail is a Grade 2 ride that showcases the spectacular natural landscapes of the South Island's West Coast, retracing old packhorse tracks, tramlines, railways, water races, and historic bridges linked by flowing singletrack.

The trail itself runs 133 km between Greymouth and the former gold-mining town of Ross, passing through some of the most diverse and dramatic scenery in New Zealand — native podocarp forest, wetlands, lakes, rivers, creeks, boardwalks, historic bridges, reservoirs, and water races dating from the gold-rush era. The course surface is predominantly off-road gravel trail with some Grade 3 on-road sections, making it accessible to a wide range of fitness levels.

With four distance categories — The Epic (Ross to Greymouth, 132 km), The Challenge (Hokitika to Greymouth, 100 km), The Classic (Cowboy Paradise to Greymouth, 64 km), and The Cruise (Kumara to Greymouth, 26 km) — there is something for everyone from seasoned endurance riders to recreational cyclists looking for a scenic adventure. Teams of two or four can enter from Cowboy Paradise or Ross. The event is organised by John Moore and registration is handled through Race Roster.`,
    highlights: [
      'Ride one of New Zealand\'s 23 Great Rides — the West Coast Wilderness Trail',
      'Four distance options from 26 km to 132 km, all finishing in Greymouth',
      'Grade 2 trail accessible to beginners with some intermediate Grade 3 sections',
      'Pass through native podocarp forest, wetlands, lakes, rivers, and historic gold-rush infrastructure',
      'Team options available — enter as an individual, pair, or team of four',
      'Over 120 km of off-road gravel trail through spectacular West Coast scenery',
    ],
    requirements: [
      'Mountain bike or gravel bike suitable for Grade 2-3 off-road riding',
      'Cycle helmet (mandatory)',
      'Water bottle or hydration pack',
      'Basic bike repair kit and spare tube',
      'Weather-appropriate clothing — West Coast conditions can change rapidly',
    ],
    distanceDetails: [
      {
        name: 'The Epic',
        distance: '132 km',
        elevation: 'Moderate (Grade 2-3)',
        time: '6 - 10 hrs',
        description:
          'The full West Coast Wilderness Trail from the historic gold town of Ross to Greymouth, traversing lakes, native bush, wetlands, and historic water races.',
      },
      {
        name: 'The Challenge',
        distance: '100 km',
        elevation: 'Moderate (Grade 2-3)',
        time: '5 - 8 hrs',
        description:
          'From Hokitika to Greymouth through native forest, boardwalks, rivers, and historic bridges along the northern half of the Wilderness Trail.',
      },
      {
        name: 'The Classic',
        distance: '64 km',
        elevation: 'Moderate (Grade 2)',
        time: '3 - 6 hrs',
        description:
          'From Cowboy Paradise to Greymouth through the scenic heart of the trail, including the Kawhaka Pass section with native bush and water races.',
      },
      {
        name: 'The Cruise',
        distance: '26 km',
        elevation: 'Easy (Grade 2)',
        time: '1.5 - 3 hrs',
        description:
          'A shorter scenic ride from Kumara to Greymouth — ideal for recreational riders and families wanting to experience the Wilderness Trail.',
      },
    ],
    schedule: [
      { time: '8:00 AM', description: 'The Epic starts — Ross to Greymouth (132 km)' },
      { time: '9:00 AM', description: 'The Challenge starts — Hokitika to Greymouth (100 km)' },
      { time: '10:00 AM', description: 'The Classic starts — Cowboy Paradise to Greymouth (64 km)' },
      { time: '11:00 AM', description: 'The Cruise starts — Kumara to Greymouth (26 km)' },
    ],
    courseTerrain: 'Flat to Rolling / Forest / Wetlands',
    courseSurface: 'Off-road gravel trail (Grade 2) with some Grade 3 on-road sections',
    courseTraffic: 'Mostly off-road — some shared road sections',
  })

  // ──────────────────────────────────────────────
  // 4. Motatapu
  // ──────────────────────────────────────────────
  await updateEvent('Motatapu', 'motatapu', {
    organizer: 'Motatapu Events',
    organizerWebsite: 'https://motatapu.com/',
    registrationUrl: 'https://raceroster.com/events/2026/107116/motatapu-2026',
    website: 'https://motatapu.com/',
    description: `The Motatapu is an iconic annual mountain bike and trail running event traversing the stunning high-country stations of Motatapu, Soho, and Glencoe between Wanaka and Arrowtown in Central Otago. Held on the first Saturday of March, the event opens private farmland that is closed to the public for the rest of the year, giving participants exclusive access to some of the most breathtaking backcountry terrain in the South Island. The course follows an old travellers' route steeped in New Zealand's gold-rush history, now part of the Te Araroa walking trail.

With over 20 years of history, the Motatapu offers five events across one legendary day: the Rab 52 km Ultra Run with 3,000 m of ascent over four peaks, the Allpress Espresso 42 km Trail Marathon with 1,050 m of climbing, the UDC Finance 15 km Miners Trail with 837 m of ascent, the Mondraker 47 km Mountain Bike with 1,150 m of climbing (e-bike option available), and the Jennian Homes 4 km Junior Trail Run along the Arrow River. All running events start at Glendhu Station near Lake Wanaka and finish at Wilcox Green in historic Arrowtown, while the mountain bike starts at Glendhu Bay.

The Motatapu is renowned for its challenging terrain — exposed tussock ridges, steep saddles, river crossings, and high-country farm tracks — combined with utterly spectacular scenery of snow-capped mountains, alpine lakes, and sweeping valley panoramas. Mandatory gear is strictly enforced, with random checks at the start line and on-course checkpoints, reflecting the serious alpine environment where conditions can shift from scorching heat to snow in a matter of hours.`,
    highlights: [
      'Exclusive access to private high-country stations between Wanaka and Arrowtown — closed to the public year-round',
      'Five events on one day: 52 km Ultra, 42 km Marathon, 15 km Miners Trail, 47 km Mountain Bike, and 4 km Junior Run',
      'The Ultra Run traverses four peaks with 3,000 m of elevation gain to a maximum altitude of 1,270 m',
      'Over 20 years of history following a gold-rush-era travellers route on the Te Araroa trail',
      'Mountain bike course features river crossings, farm tracks, and a technical Grade 3 descent into Macetown',
      'Spectacular Central Otago scenery — snow-capped mountains, alpine lakes, tussock ridges',
      'All events finish in historic Arrowtown with a festival atmosphere at Wilcox Green',
      'E-bike option available for the 47 km Mountain Bike',
    ],
    requirements: [
      'Mandatory gear varies by event — random gear checks at start line',
      'Ultra Runners: all mandatory gear checked at athlete check-in before receiving race number',
      'On-course mandatory gear check at Checkpoint A (Fernburn Hut) for Ultra — one random item',
      'Water vessel, bladder, or reusable cup (aid stations do not provide cups)',
      'Self-sufficient food and drink supply',
      'First aid kit',
      'Weather-appropriate clothing for alpine conditions (possible snow in March)',
      'Mountain bikers: helmet mandatory, bike in good working condition with repair kit',
    ],
    distanceDetails: [
      {
        name: 'Rab Ultra Run',
        distance: '52 km',
        elevation: '+3,000m',
        time: '6 - 14 hrs',
        description:
          'Traverse the Harris Mountain Range over four peaks reaching 1,270 m (Jack Halls Saddle), through exposed tussock ridges, steep saddles, and river crossings on the DOC Motatapu Track.',
      },
      {
        name: 'Allpress Espresso Trail Marathon',
        distance: '42 km',
        elevation: '+1,050m',
        time: '4 - 9 hrs',
        description:
          'Point-to-point from Glendhu Station on Lake Wanaka to Arrowtown with 1,050 m cumulative climb and a highest point of 880 m through high-country farmland.',
      },
      {
        name: 'UDC Finance Miners Trail',
        distance: '15 km',
        elevation: '+837m',
        time: '1.5 - 4 hrs',
        description:
          'A loop from Arrowtown ascending Tobin\'s Track onto Crown Terrace, climbing to 1,052 m through Glencoe Station before a steep descent back through New Chum Gully.',
      },
      {
        name: 'Mondraker Mountain Bike',
        distance: '47 km',
        elevation: '+1,150m',
        time: '2.5 - 7 hrs',
        description:
          'From Glendhu Bay to Arrowtown through river crossings and farm tracks — 30% gravel road, 55% 4WD farm track, finishing with a technical Grade 3 descent from Soho onto the Macetown Track.',
      },
      {
        name: 'Jennian Homes Junior Trail Run',
        distance: '4 km',
        elevation: 'Minimal',
        time: '15 - 45 min',
        description:
          'A loop along the Arrow River Bridges Trail starting and finishing at Wilcox Green, Arrowtown — gentle terrain suitable for young runners.',
      },
    ],
    schedule: [
      { time: '6:30 AM', description: 'Ultra Run start — Glendhu Station' },
      { time: '7:30 AM', description: 'Mountain Bike start — Glendhu Bay' },
      { time: '8:00 AM', description: 'Trail Marathon start — Glendhu Station' },
      { time: '9:00 AM', description: 'Miners Trail start — Wilcox Green, Arrowtown' },
      { time: '10:00 AM', description: 'Junior Trail Run start — Wilcox Green, Arrowtown' },
    ],
    courseTerrain: 'Mountainous / Alpine / High Country',
    courseSurface: 'Mixed — Farm tracks, tussock ridges, gravel roads, singletrack, river crossings',
    courseTraffic: 'Private farmland — fully closed course',
    inclusions: [
      'Finisher medal',
      'Three self-service aid stations with water and electrolyte drink',
      'Bus transport available (bookable during registration)',
      'Finish line festival at Wilcox Green, Arrowtown',
      'Donation to Queenstown Trails Trust included in entry fee',
    ],
  })

  // ──────────────────────────────────────────────
  // 5. The Hillary Trail Ultra
  // ──────────────────────────────────────────────
  await updateEvent('The Hillary Trail Ultra', 'the-hillary-trail-ultra', {
    organizer: 'Lactic Turkey Events',
    organizerWebsite: 'https://www.lacticturkey.co.nz/',
    registrationUrl: 'https://thehillary.co.nz/',
    website: 'https://thehillary.co.nz/',
    description: `The Hillary is a trail ultra running event set on the legendary Hillary Trail in Auckland's Waitakere Ranges, just 30 minutes west of the city centre. Named after Sir Edmund Hillary, the trail traverses 75 km of rugged native bush, dramatic West Coast beaches, and regenerating kauri forest through the Waitakere Ranges Regional Park. The race offers three distances — 80 km, 34 km, and 16 km — all finishing at Muriwai Beach on Auckland's wild West Coast.

First held in 2014, The Hillary was created by Lactic Turkey Events to bring trail runners into one of Auckland's most spectacular natural landscapes. The 80 km ultra starts at the Arataki Visitors Centre and follows the full length of the Hillary Trail through Huia, Whatipu, Karekare, Piha, and Bethells Beach before finishing at Muriwai — adding approximately 5 km to the official trail to account for sections closed for conservation. With over 3,700 m of cumulative climbing, it is one of the most challenging ultras in New Zealand despite its relatively modest distance. The fastest known time is 8 hours 23 minutes.

The 34 km distance starts from Piha and the 16 km from Bethells Beach, with both finishing at Muriwai. All distances traverse a mix of dense native bush, exposed ridgelines, rocky coastal tracks, and black-sand beaches. The terrain is technical and demanding with constant climbing and descending through the forested Waitakere Ranges. The event celebrates the spirit of adventure that Sir Edmund Hillary embodied, with the tagline "Conquer your Everest".`,
    highlights: [
      'Run the legendary Hillary Trail through Auckland\'s Waitakere Ranges to Muriwai Beach',
      'Three distances: 80 km ultra, 34 km, and 16 km — all point-to-point to the coast',
      'Over 3,700 m of cumulative climbing on the 80 km — one of NZ\'s toughest ultras per kilometre',
      'Traverse native kauri bush, dramatic West Coast beaches, and wild coastal ridgelines',
      'Pass through Huia, Whatipu, Karekare, Piha, and Bethells — Auckland\'s most spectacular coastline',
      'Named after Sir Edmund Hillary — "Conquer your Everest"',
      'Just 30 minutes from Auckland CBD, yet feels like deep wilderness',
    ],
    requirements: [
      'Head torch with spare batteries (80 km — likely to finish in the dark)',
      'Waterproof jacket',
      'Personal cup/bottle (minimum 500 ml)',
      'Mobile phone (charged)',
      'Whistle',
      'Trail running shoes with good grip for technical terrain',
    ],
    distanceDetails: [
      {
        name: 'The Hillary Ultra',
        distance: '80 km',
        elevation: '+3,700m',
        time: '8 - 20 hrs',
        description:
          'The full Hillary Trail from Arataki Visitors Centre to Muriwai via Huia, Whatipu, Karekare, Piha and Bethells Beach — relentless climbing through native bush and along dramatic West Coast beaches.',
      },
      {
        name: 'The Hillary 34',
        distance: '34 km',
        elevation: '+1,500m (approx)',
        time: '3.5 - 8 hrs',
        description:
          'From Piha to Muriwai through the northern section of the Hillary Trail, passing Bethells Beach with coastal ridgeline running and dense native bush.',
      },
      {
        name: 'The Hillary 16',
        distance: '16 km',
        elevation: '+600m (approx)',
        time: '1.5 - 4 hrs',
        description:
          'From Bethells Beach to Muriwai — the most accessible distance, featuring coastal trails and native bush on the final section of the Hillary Trail.',
      },
    ],
    courseTerrain: 'Mountainous / Coastal / Forest',
    courseSurface: 'Trail — Native bush, rocky coastal tracks, exposed ridgelines, black-sand beaches',
  })

  // ──────────────────────────────────────────────
  // 6. Hokitika Wildfoods Festival Run
  // ──────────────────────────────────────────────
  await updateEvent('Hokitika Wildfoods Festival Run', 'hokitika-wildfoods-festival-run', {
    organizer: 'Hokitika Wildfoods Festival Trust',
    organizerWebsite: 'https://wildfoods.co.nz/',
    website: 'https://www.wildfoodsrun.co.nz/',
    latitude: -42.7167,
    longitude: 170.9667,
    description: `The Hokitika Wildfoods Festival Run is a running event held in conjunction with the iconic Hokitika Wildfoods Festival on the West Coast of the South Island. Held annually in March, the run takes place on the morning of the festival day, giving participants the chance to earn their wild food indulgence with a run through the scenic coastal town of Hokitika and its surrounds before the festival gates open.

The Hokitika Wildfoods Festival itself is one of New Zealand's most celebrated and eccentric food festivals, started in 1990 by local Claire Bryant to celebrate the unique flavours and wild produce of the West Coast. Over 30 years later, it draws thousands of visitors to sample everything from gourmet wild delicacies to the weird and wonderful. The associated fun run adds a sporting dimension to the festival weekend and has become a popular warm-up event.

Hokitika is a charming West Coast town known for its driftwood-strewn beach, jade (pounamu) carving heritage, and stunning Tasman Sea sunsets. The run offers participants a scenic course through the town and surrounding landscape, with the reward of a full day at one of New Zealand's quirkiest festivals waiting at the finish line.`,
    highlights: [
      'Run before one of New Zealand\'s most iconic and eccentric food festivals',
      'Scenic coastal course through the charming West Coast town of Hokitika',
      'Earn your wild food indulgence — run first, feast on wild delicacies after',
      'Part of the Hokitika Wildfoods Festival weekend — over 30 years of history since 1990',
      'Stunning West Coast scenery with views of the Tasman Sea and Southern Alps',
    ],
    courseTerrain: 'Flat / Coastal',
    courseSurface: 'Sealed Roads',
  })

  // ──────────────────────────────────────────────
  // 7. Port Hills Mountain Bike Challenge
  // ──────────────────────────────────────────────
  await updateEvent('Port Hills Mountain Bike Challenge', 'port-hills-mountain-bike-challenge', {
    organizer: 'Christchurch Adventure Park',
    organizerWebsite: 'https://christchurchadventurepark.com/',
    registrationUrl: 'https://www.porthillsmtb.co.nz/',
    website: 'https://www.porthillsmtb.co.nz/',
    description: `The Port Hills Mountain Bike Challenge is an annual mountain biking event held in the Port Hills of Christchurch, Canterbury, on the South Island of New Zealand. The Port Hills form a dramatic volcanic backdrop to Christchurch and are home to one of the most extensive networks of mountain bike trails in the country, ranging from smooth flowing singletrack to technical descents with panoramic views of the Canterbury Plains, the Pacific Ocean, and the Southern Alps.

The trails of the Port Hills are divided into distinct east and west sections, each offering unique terrain and riding experiences. The extensive trail network encompasses areas such as Godley Head, Victoria Park, and the Christchurch Adventure Park, which has become a world-class mountain biking destination in its own right — notably hosting Crankworx Christchurch. The Port Hills Mountain Bike Challenge draws on this incredible trail resource to create a race that showcases the best riding the area has to offer.

Located just minutes from the Christchurch city centre, the Port Hills offer accessible yet genuinely challenging mountain biking terrain. The volcanic landscape provides a mix of native bush, open tussock, rocky outcrops, and flowing singletrack with stunning 360-degree views. The event caters to a range of abilities and brings together the vibrant Canterbury mountain biking community for a day of competitive and recreational riding.`,
    highlights: [
      'Race on the Port Hills — Christchurch\'s premier mountain biking destination',
      'Spectacular 360-degree views of Canterbury Plains, Pacific Ocean, and Southern Alps',
      'Diverse trail network from flowing singletrack to technical descents',
      'Just minutes from Christchurch city centre — easy access for all riders',
      'Part of one of New Zealand\'s most extensive urban mountain bike trail networks',
      'Volcanic landscape with native bush, tussock, and rocky terrain',
    ],
    requirements: [
      'Mountain bike in good working condition',
      'Cycle helmet (mandatory)',
      'Appropriate protective gear recommended',
      'Water bottle or hydration pack',
      'Basic bike repair kit and spare tube',
    ],
    courseTerrain: 'Rolling Hills / Volcanic',
    courseSurface: 'Trail — Singletrack, rocky outcrops, native bush',
  })

  // ──────────────────────────────────────────────
  // 8. GODZone Adventure Race
  // ──────────────────────────────────────────────
  await updateEvent('GODZone Adventure Race', 'godzone-adventure-race', {
    organizer: 'Pure Adventure Charitable Trust (PACT)',
    organizerWebsite: 'https://godzoneadventure.com/',
    registrationUrl: 'https://godzoneadventure.com/enter/enter-now/',
    website: 'https://godzoneadventure.com/',
    description: `GODZone is New Zealand's premier expedition-length adventure race and one of the most prestigious adventure races in the world. Raced in teams of four, the event takes competitors on a multi-day journey of 550-650+ km through the remote and spectacular wilderness of the South Island, navigating their own route across a course that includes mountain biking, trekking, kayaking, packrafting, ropes work (including abseiling, ascending, tyrolean traverses), coasteering, and other disciplines dictated by the terrain. The winning teams typically finish in around five days, while other teams may take up to eight and a half days.

The event is organised by the Pure Adventure Charitable Trust (PACT), formed by a group of high-profile sportspeople and past competitors including former All Black Richie McCaw, world champion adventure racer Sophie Hart, and race director Adam Fairmaid. Course designer Warren Bates works under the guidance of the race director to create courses that push teams to their absolute limits while showcasing some of the most extraordinary landscapes on Earth. The specific race course and maps remain secret until just hours before the start, adding to the intensity and challenge.

GODZone has been running since 2012 and has visited some of the most iconic locations in the South Island, including Fiordland, Marlborough Sounds, Queenstown, and the West Coast. The event is divided into two categories: GZ Pure (the full expedition race of approximately 700 km) and GZ Pursuit (a shorter format). Teams must be completely self-sufficient between transition areas, carrying all food, clothing, and navigation equipment. The race operates 24 hours a day with no mandatory rest stops — teams must manage their own sleep strategy while racing around the clock.`,
    highlights: [
      'New Zealand\'s premier expedition-length adventure race — 550-650+ km over up to 8.5 days',
      'Teams of four navigate their own route through remote South Island wilderness',
      'Multiple disciplines: mountain biking, trekking, kayaking, packrafting, ropes, coasteering',
      'Course kept secret until hours before the start — true expedition-style navigation',
      'Organised by Pure Adventure Charitable Trust with backing from Richie McCaw and Sophie Hart',
      'Race operates 24 hours a day with no mandatory rest — teams manage their own sleep strategy',
      'GZ Pure and GZ Pursuit categories for different levels of expedition racing',
      'Has visited Fiordland, Marlborough Sounds, Queenstown, and other iconic South Island locations',
    ],
    requirements: [
      'Team of four registered competitors',
      'Personal locator beacon (PLB) per team',
      'Packraft with PFD (buoyancy device) — mandatory when packrafting',
      'Packraft paddles (can be double-bladed) and inflation device',
      'Mountain bike with helmet for each team member',
      'Full set of navigation equipment: maps, compass, GPS',
      'Ropes and harness gear (provided at supervised rope sections)',
      'Complete self-sufficiency between transition areas: food, clothing, first aid',
      'Experience in multi-day adventure racing or equivalent expedition skills',
      'Kayak paddling competence (fleet kayaks provided)',
    ],
    distanceDetails: [
      {
        name: 'GZ Pure',
        distance: '~700 km',
        elevation: 'Extreme — varies by chapter',
        time: '5 - 8.5 days',
        description:
          'The ultimate expedition adventure race — teams navigate approximately 700 km across New Zealand\'s wildest terrain using mountain bikes, packrafts, kayaks, and ropes over up to 8.5 days of non-stop racing.',
      },
      {
        name: 'GZ Pursuit',
        distance: '~350-450 km',
        elevation: 'Extreme — varies by chapter',
        time: '3 - 5 days',
        description:
          'A shorter expedition format with canoeing instead of packrafting, designed as an entry point to expedition-length adventure racing while still covering hundreds of kilometres of wilderness.',
      },
    ],
    courseTerrain: 'Extreme Wilderness — Alpine, Forest, Coastal, River',
    courseSurface: 'Mixed — Off-trail wilderness, rivers, ocean, trails, roads',
    courseTraffic: 'Wilderness — no traffic management (self-navigated)',
    inclusions: [
      'World-class expedition adventure racing course with full safety infrastructure',
      'Fleet kayaks provided (AR Duo kayaks)',
      'Supervised rope sections with professional safety crew',
      'Support crew vehicle and bike transport logistics between transitions',
      'Satellite tracking for each team',
      'Race headquarters with team communication and leaderboard',
    ],
  })

  console.log('\nBatch enrichment complete!')
}

main()
  .catch((e: any) => {
    console.error('Fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
