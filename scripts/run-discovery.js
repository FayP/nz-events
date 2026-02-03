const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const OpenAI = require('openai').default;
const { PrismaClient } = require('@prisma/client');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const NZ_REGIONS = ['Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Bay of Plenty', 'Otago', 'Manawatu-Whanganui', 'Northland', 'Hawkes Bay', 'Taranaki', 'Southland', 'Nelson', 'Marlborough', 'West Coast', 'Gisborne', 'Tasman'];

function getDateRange() {
  const today = new Date();
  const sixMonths = new Date();
  sixMonths.setMonth(today.getMonth() + 6);
  return {
    start: today.toISOString().split('T')[0],
    end: sixMonths.toISOString().split('T')[0],
  };
}

async function discoverEvents(eventType) {
  const dateRange = getDateRange();
  const eventTypeName = eventType === 'BIKING' ? 'cycling' : eventType.toLowerCase();

  let examples = '';
  if (eventType === 'RUNNING') {
    examples = 'Major city marathons (Auckland, Wellington, Christchurch, Dunedin, Rotorua, Queenstown, Hawkes Bay), Half marathons, Round the Bays events, Ultra events (Tarawera, Kepler, Old Ghost Road, Taupo Ultra), Trail runs';
  } else if (eventType === 'BIKING') {
    examples = 'Lake Taupo Cycle Challenge, Tour of Southland, Gran Fondos, Mountain bike events, Gravel rides, Road races';
  } else {
    examples = 'Ironman New Zealand, Ironman 70.3, Challenge Wanaka, Port of Tauranga Half, Sprint and Olympic distance triathlons, Xterra events';
  }

  console.log('Discovering ' + eventTypeName + ' events...');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert on New Zealand ' + eventTypeName + ' events. CRITICAL: Only include events you are CERTAIN exist. Do not hallucinate. Return valid JSON.',
      },
      {
        role: 'user',
        content: `Find all ${eventTypeName} events in New Zealand between ${dateRange.start} and ${dateRange.end}. Only include events you are CONFIDENT exist. Regions: ${NZ_REGIONS.join(', ')}. Include: ${examples}. Return JSON: { "events": [{ "name", "startDate", "city", "region", "eventType": "${eventType}", "distances": [], "website", "description" }] }`
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const data = JSON.parse(response.choices[0].message.content);
  return data.events || [];
}

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function findExistingEvent(event) {
  const slug = generateSlug(event.name);

  // Primary match: exact slug (same event, possibly different year)
  const bySlug = await prisma.event.findUnique({ where: { slug } });
  if (bySlug) return bySlug;

  // Secondary match: fuzzy name + city
  const byName = await prisma.event.findFirst({
    where: {
      name: { contains: event.name, mode: 'insensitive' },
      city: { equals: event.city, mode: 'insensitive' },
    },
  });
  if (byName) return byName;

  return null;
}

// Known NZ coordinates
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
};

function getCoordinates(city) {
  const normalized = city.toLowerCase();
  for (const [key, coords] of Object.entries(knownLocations)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }
  return null;
}

/**
 * Scrape event images from a URL
 */
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

    const metaImages = [];
    for (const m of html.matchAll(/(?:property|name)=["']og:image(?::url)?["']\s+content=["']([^"']+)["']/gi)) metaImages.push(m[1]);
    for (const m of html.matchAll(/content=["']([^"']+)["']\s+(?:property|name)=["']og:image(?::url)?["']/gi)) metaImages.push(m[1]);

    const contentImages = [];
    for (const m of html.matchAll(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["'][^>]*>/gi)) {
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

/**
 * Source images from event website, falling back to Unsplash
 */
async function sourceImages(eventType, city, website, registrationUrl) {
  // Try scraping the event's own website first
  const urls = [website, registrationUrl].filter(Boolean);
  for (const url of urls) {
    const scraped = await scrapeImagesFromUrl(url);
    if (scraped.length > 0) return scraped.slice(0, 5);
  }

  // Fall back to Unsplash if configured
  if (!UNSPLASH_ACCESS_KEY) return [];
  const sportName = eventType === 'BIKING' ? 'cycling' : eventType.toLowerCase();
  const queries = [
    `${sportName} ${city} New Zealand`,
    `${sportName} New Zealand`,
    `${sportName} race`,
  ];
  for (const query of queries) {
    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.results && data.results.length >= 3) {
        return data.results.map(photo => photo.urls.regular);
      }
    } catch {
      // Continue to next query
    }
  }
  return [];
}

async function saveEvent(event) {
  try {
    const existing = await findExistingEvent(event);

    if (existing) {
      // UPDATE existing event with new year's data
      const updateData = {
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : null,
      };

      // Only overwrite if new data is more complete
      if (event.description && event.description.length > 50 && (!existing.description || existing.description.length < event.description.length)) {
        updateData.description = event.description;
      }
      if (event.website && !existing.website) updateData.website = event.website;
      if (event.distances && event.distances.length && (!existing.distances || existing.distances.length === 0)) {
        updateData.distances = event.distances;
      }

      // Source images if existing event has none
      if (!existing.images) {
        console.log('  Sourcing images for: ' + event.name);
        const images = await sourceImages(event.eventType, event.city, event.website, event.registrationUrl);
        if (images.length > 0) updateData.images = images;
      }

      await prisma.event.update({
        where: { id: existing.id },
        data: updateData,
      });

      console.log('  Updated: ' + event.name + ' (new date: ' + event.startDate + ')');
      return true;
    }

    // CREATE new event
    const coords = getCoordinates(event.city);
    const baseSlug = generateSlug(event.name);
    let slug = baseSlug;
    let counter = 2;
    while (true) {
      const ex = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
      if (!ex) break;
      slug = baseSlug + '-' + counter;
      counter++;
    }

    // Source images from event website, falling back to Unsplash
    console.log('  Sourcing images for: ' + event.name);
    const images = await sourceImages(event.eventType, event.city, event.website, event.registrationUrl);

    await prisma.event.create({
      data: {
        name: event.name,
        slug: slug,
        description: event.description || null,
        eventType: event.eventType,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : null,
        location: event.location || event.city,
        city: event.city,
        region: event.region,
        latitude: coords ? coords.lat : null,
        longitude: coords ? coords.lng : null,
        website: event.website || null,
        distances: event.distances || [],
        images: images.length > 0 ? images : null,
        source: 'AI_GENERATED',
        status: 'PUBLISHED',
      },
    });

    console.log('  Saved: ' + event.name + ' (' + event.city + ')' + (images.length > 0 ? ' [' + images.length + ' images]' : ' [fallback]'));
    return true;
  } catch (error) {
    console.log('  Error saving ' + event.name + ': ' + error.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Starting Full Event Discovery');
  console.log('='.repeat(50));
  console.log('Date range: ' + getDateRange().start + ' to ' + getDateRange().end);
  console.log('Unsplash: ' + (UNSPLASH_ACCESS_KEY ? 'enabled' : 'disabled (no UNSPLASH_ACCESS_KEY)') + '\n');

  const eventTypes = ['RUNNING', 'BIKING', 'TRIATHLON'];
  let totalDiscovered = 0;
  let totalSaved = 0;

  for (const eventType of eventTypes) {
    console.log('\n' + '-'.repeat(40));
    const events = await discoverEvents(eventType);
    totalDiscovered += events.length;
    console.log('Found ' + events.length + ' ' + eventType + ' events\n');

    for (const event of events) {
      const saved = await saveEvent(event);
      if (saved) totalSaved++;
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Discovery Complete!');
  console.log('='.repeat(50));
  console.log('Total discovered: ' + totalDiscovered);
  console.log('Total saved: ' + totalSaved);
  console.log('Skipped (duplicates): ' + (totalDiscovered - totalSaved));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
