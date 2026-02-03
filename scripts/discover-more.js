const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const OpenAI = require('openai').default;
const { Client } = require('pg');
const crypto = require('crypto');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function generateCuid() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(12).toString('base64url').slice(0, 16).toLowerCase();
  return 'c' + timestamp + random;
}

const connStr = process.env.DATABASE_URL.replace('sslmode=require', 'sslmode=require&uselibpqcompat=true');

const NZ_REGIONS = ['Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Bay of Plenty', 'Otago', 'Manawatu-Whanganui', 'Northland', 'Hawkes Bay', 'Taranaki', 'Southland', 'Nelson', 'Marlborough', 'West Coast', 'Gisborne', 'Tasman'];

const knownLocations = {
  'auckland': { lat: -36.8485, lng: 174.7633 },
  'wellington': { lat: -41.2865, lng: 174.7762 },
  'christchurch': { lat: -43.5321, lng: 172.6362 },
  'hamilton': { lat: -37.7870, lng: 175.2793 },
  'tauranga': { lat: -37.6878, lng: 176.1651 },
  'dunedin': { lat: -45.8788, lng: 170.5028 },
  'queenstown': { lat: -45.0312, lng: 168.6626 },
  'napier': { lat: -39.4928, lng: 176.9120 },
  'rotorua': { lat: -38.1368, lng: 176.2497 },
  'taupo': { lat: -38.6857, lng: 176.0702 },
  'wanaka': { lat: -44.7000, lng: 169.1500 },
  'nelson': { lat: -41.2706, lng: 173.2840 },
  'te anau': { lat: -45.4167, lng: 167.7167 },
  'westport': { lat: -41.7500, lng: 171.6000 },
  'invercargill': { lat: -46.4132, lng: 168.3538 },
  'new plymouth': { lat: -39.0556, lng: 174.0752 },
  'palmerston north': { lat: -40.3523, lng: 175.6082 },
  'gisborne': { lat: -38.6623, lng: 178.0176 },
  'blenheim': { lat: -41.5138, lng: 173.9610 },
  'whangarei': { lat: -35.7275, lng: 174.3166 },
  'cambridge': { lat: -37.8847, lng: 175.4699 },
  'hanmer springs': { lat: -42.5222, lng: 172.8281 },
  'whakatane': { lat: -37.9536, lng: 176.9960 },
  'timaru': { lat: -44.3966, lng: 171.2549 },
  'masterton': { lat: -40.9597, lng: 175.6575 },
};

function getCoordinates(city) {
  const normalized = city.toLowerCase();
  for (const [key, coords] of Object.entries(knownLocations)) {
    if (normalized.includes(key)) return coords;
  }
  return null;
}

function getDateRange() {
  const today = new Date();
  const end = new Date();
  end.setMonth(today.getMonth() + 12);
  return { start: today.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

const skipPatterns = [
  'logo', 'icon', 'favicon', 'avatar', 'badge', 'sponsor', 'payment',
  'visa', 'mastercard', '1x1', 'pixel', 'tracking', 'widget', 'arrow',
  'button', 'dummy', 'transparent', 'placeholder', 'blank', 'spacer',
];

function isEventImage(imgUrl, tag) {
  const lower = imgUrl.toLowerCase();
  if (skipPatterns.some(p => lower.includes(p))) return false;
  const sizeInUrl = lower.match(/[-_](\d+)x(\d+)/);
  if (sizeInUrl && parseInt(sizeInUrl[1]) <= 200 && parseInt(sizeInUrl[2]) <= 200) return false;
  if (tag) {
    const wMatch = tag.match(/width=["']?(\d+)/i);
    const hMatch = tag.match(/height=["']?(\d+)/i);
    if (wMatch && parseInt(wMatch[1]) < 200) return false;
    if (hMatch && parseInt(hMatch[1]) < 200) return false;
  }
  return true;
}

async function scrapeImagesFromUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const html = await res.text();

    const metaImages = [];
    for (const m of html.matchAll(/(?:property|name)=["']og:image(?::url)?["']\s+content=["']([^"']+)["']/gi)) metaImages.push(m[1]);
    for (const m of html.matchAll(/content=["']([^"']+)["']\s+(?:property|name)=["']og:image(?::url)?["']/gi)) metaImages.push(m[1]);

    const contentImages = [];
    for (const m of html.matchAll(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)[^>]*>/gi)) {
      if (isEventImage(m[1], m[0])) contentImages.push(m[1]);
    }
    for (const m of html.matchAll(/<source[^>]+srcset=["']([^"',\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"',\s]*)?)/gi)) {
      if (isEventImage(m[1], m[0])) contentImages.push(m[1]);
    }
    for (const m of html.matchAll(/background(?:-image)?:\s*url\(["']?([^"')]+\.(?:jpg|jpeg|png|webp)(?:\?[^"')]*)?)/gi)) {
      if (isEventImage(m[1])) contentImages.push(m[1]);
    }

    const baseUrl = new URL(url);
    const seen = new Set();
    const resolved = [];
    for (const img of [...metaImages, ...contentImages]) {
      try {
        const full = new URL(img, baseUrl).href;
        if (full.startsWith('data:') || full.endsWith('.svg')) continue;
        const key = full.split('?')[0];
        if (seen.has(key)) continue;
        seen.add(key);
        resolved.push(full);
      } catch { continue; }
    }
    return resolved;
  } catch {
    return [];
  }
}

async function sourceImages(eventType, city, website) {
  if (website) {
    const scraped = await scrapeImagesFromUrl(website);
    if (scraped.length > 0) return scraped.slice(0, 5);
  }
  return [];
}

async function discoverEvents(eventType, existingNames) {
  const dateRange = getDateRange();
  const eventTypeName = eventType === 'BIKING' ? 'cycling' : eventType.toLowerCase();

  const excludeList = existingNames.join(', ');

  let hints = '';
  if (eventType === 'RUNNING') {
    hints = `Include: fun runs, trail runs, ultra marathons, half marathons, marathons, 10km races, 5km fun runs, park runs events, cross-country events, obstacle course runs, staircase/vertical runs, relay events, charity runs.
Think about events in smaller towns too: Whangarei, Gisborne, New Plymouth, Palmerston North, Timaru, Whakatane, Cambridge, Masterton, Hanmer Springs, etc.
Well-known events: Taupo Ultra, Abel Tasman Coastal Run, Motatapu, Hillary Trail, Paataka Farmlands Marathon, City2Surf, Goat Endurance Run, Waihi Gold Rush.`;
  } else if (eventType === 'BIKING') {
    hints = `Include: road races, gran fondos, criteriums, mountain bike events, gravel rides, multi-day tours, BMX events, cyclocross, enduro mountain bike, downhill races.
Think about events in smaller towns too.
Well-known events: Pioneer MTB, Graperide, K2 Cycle Classic, Contact Tour of Southland, Crater to Lake, NZ Cycle Classic, Cape Reinga to Bluff challenges, Port Hills MTB.`;
  } else {
    hints = `Include: ironman, half ironman, olympic distance, sprint distance, aquathon, duathlon, off-road triathlon, swim-run, multisport events.
Think about events in smaller towns too.
Well-known events: Wanaka Challenge, Coast to Coast, Kathmandu Coast to Coast, Motatapu Off-Road Triathlon, Xterra events, GODZone adventure race.`;
  }

  console.log('Discovering ' + eventTypeName + ' events...');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert on New Zealand ${eventTypeName} events and races. You have comprehensive knowledge of events across ALL regions of New Zealand, including smaller regional events. CRITICAL: Only include events you are CERTAIN exist as real, established events. Do not hallucinate or make up events. Return valid JSON.`,
      },
      {
        role: 'user',
        content: `Find at least 10-15 ${eventTypeName} events in New Zealand scheduled between ${dateRange.start} and ${dateRange.end}.

IMPORTANT: Do NOT include any of these events (we already have them): ${excludeList}

Regions to cover: ${NZ_REGIONS.join(', ')}

${hints}

Return JSON: { "events": [{ "name": "string", "startDate": "YYYY-MM-DD", "city": "string", "region": "string", "eventType": "${eventType}", "distances": ["string"], "website": "string or null", "description": "string" }] }

Try to include events from regions/cities not yet covered. We want geographic diversity across New Zealand.`
      },
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const data = JSON.parse(response.choices[0].message.content);
  return data.events || [];
}

async function main() {
  const client = new Client({ connectionString: connStr });
  await client.connect();

  // Get existing event names
  const existing = await client.query('SELECT name FROM "Event"');
  const existingNames = existing.rows.map(r => r.name);

  console.log('='.repeat(50));
  console.log('Discovering More Events');
  console.log('='.repeat(50));
  console.log('Existing events: ' + existingNames.length);
  console.log('Date range: ' + getDateRange().start + ' to ' + getDateRange().end + '\n');

  const eventTypes = ['RUNNING', 'BIKING', 'TRIATHLON'];
  let totalDiscovered = 0;
  let totalSaved = 0;
  const newHostnames = new Set();

  for (const eventType of eventTypes) {
    console.log('\n' + '-'.repeat(40));
    const events = await discoverEvents(eventType, existingNames);
    totalDiscovered += events.length;
    console.log('Found ' + events.length + ' ' + eventType + ' events\n');

    for (const event of events) {
      // Check for duplicates
      const dupeCheck = await client.query(
        `SELECT id FROM "Event" WHERE LOWER(name) LIKE $1 AND "startDate" BETWEEN $2 AND $3`,
        [
          '%' + event.name.split(' ')[0].toLowerCase() + '%',
          new Date(new Date(event.startDate).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          new Date(new Date(event.startDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        ]
      );

      if (dupeCheck.rows.length > 0) {
        console.log('  Skipping (exists): ' + event.name);
        continue;
      }

      // Normalize eventType to valid enum values
      const validTypes = ['RUNNING', 'BIKING', 'TRIATHLON'];
      const normalizedType = validTypes.includes(event.eventType) ? event.eventType : eventType;

      // Source images
      console.log('  Sourcing images for: ' + event.name + (event.website ? ' (' + event.website + ')' : ''));
      const images = await sourceImages(normalizedType, event.city, event.website);

      // Track new hostnames for next.config.ts
      for (const img of images) {
        try { newHostnames.add(new URL(img).hostname); } catch {}
      }

      const coords = getCoordinates(event.city);
      const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
      const id = generateCuid();

      try {
        await client.query(
          `INSERT INTO "Event" (id, name, slug, description, "eventType", "startDate", location, city, region, latitude, longitude, website, distances, images, source, status, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())`,
          [
            id,
            event.name,
            slug,
            event.description || null,
            normalizedType,
            new Date(event.startDate),
            event.location || event.city,
            event.city,
            event.region,
            coords ? coords.lat : null,
            coords ? coords.lng : null,
            event.website || null,
            JSON.stringify(event.distances || []),
            images.length > 0 ? JSON.stringify(images) : null,
            'AI_GENERATED',
            'PUBLISHED',
          ]
        );
        totalSaved++;
        console.log('  Saved: ' + event.name + ' (' + event.city + ')' + (images.length > 0 ? ' [' + images.length + ' images]' : ' [no images]'));
      } catch (error) {
        console.log('  Error saving ' + event.name + ': ' + error.message);
      }

      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Discovery Complete!');
  console.log('='.repeat(50));
  console.log('Total discovered: ' + totalDiscovered);
  console.log('Total saved: ' + totalSaved);
  console.log('Skipped (duplicates): ' + (totalDiscovered - totalSaved));

  if (newHostnames.size > 0) {
    console.log('\nNew image hostnames to add to next.config.ts:');
    for (const h of newHostnames) console.log('  ' + h);
  }

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
