const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const OpenAI = require('openai').default;
const { PrismaClient } = require('@prisma/client');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

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

async function eventExists(event) {
  const existing = await prisma.event.findFirst({
    where: {
      OR: [
        {
          name: { contains: event.name, mode: 'insensitive' },
          startDate: new Date(event.startDate),
        },
        {
          name: { contains: event.name.split(' ')[0], mode: 'insensitive' },
          startDate: {
            gte: new Date(new Date(event.startDate).getTime() - 7 * 24 * 60 * 60 * 1000),
            lte: new Date(new Date(event.startDate).getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
  });
  return !!existing;
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

async function saveEvent(event) {
  try {
    if (await eventExists(event)) {
      console.log('  Skipping (exists): ' + event.name);
      return false;
    }

    const coords = getCoordinates(event.city);
    const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

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
        source: 'AI_GENERATED',
        status: 'PUBLISHED',
      },
    });

    console.log('  Saved: ' + event.name + ' (' + event.city + ')');
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
  console.log('Date range: ' + getDateRange().start + ' to ' + getDateRange().end + '\n');

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
