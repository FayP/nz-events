const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { Client } = require('pg');

const connStr = process.env.DATABASE_URL.replace('sslmode=require', 'sslmode=require&uselibpqcompat=true');

const updates = [
  {
    name: 'Taupo Ultra',
    website: 'https://www.taupoultra.co.nz/',
    images: [
      'https://images.squarespace-cdn.com/content/v1/5c0626333917ee5093be5ad5/1562828588078-61A31CKQEVIS5CHURFQQ/TAUPO_ULTRA_2018_010481.jpg',
      'https://images.squarespace-cdn.com/content/v1/5c0626333917ee5093be5ad5/1562828484508-YW9TVPNSF3X78NHP1TTL/TAUPO_ULTRA_2017_008158.jpg',
      'https://images.squarespace-cdn.com/content/v1/5c0626333917ee5093be5ad5/1562828556918-UU6E8R4MVF9WBPWC6PQZ/TAUPO_ULTRA_2016_005742.jpg',
    ],
  },
  {
    name: 'K2 Cycle Classic',
    website: 'https://k2cycle.co.nz/',
    images: [
      'https://k2cycle.co.nz/storage/app/media/race-photos/slide_show/slide1.jpg',
      'https://k2cycle.co.nz/storage/app/media/race-photos/slide_show/slide10.jpg',
      'https://k2cycle.co.nz/storage/app/media/race-photos/slide_show/slide7.jpg',
      'https://k2cycle.co.nz/storage/app/media/race-photos/home_about.jpg',
      'https://k2cycle.co.nz/storage/app/media/race-photos/DSC08515bsportzhub_com.jpg',
    ],
  },
  {
    name: 'The Goat Adventure Run',
    website: 'https://thegoat.co.nz/',
    images: [
      'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_2048,h_1366/https://thegoat.co.nz/wp-content/uploads/2025/04/Goat-Hero-Image.png',
    ],
  },
  {
    name: 'Ironman 70.3 Taupo',
    website: 'https://www.ironman.com/im703-taupo',
    images: [
      'https://www.lovetaupo.com/media/2958198/ironman-new-zealand-swim-dawn-crowd-start-events-lake.jpg',
      'https://www.lovetaupo.com/media/2958195/ironman-new-zealand-man-road-cycling-bike-events.jpg',
      'https://www.lovetaupo.com/media/2961868/imnz-2014-18-1-large-2.jpg',
    ],
  },
  {
    name: 'Waihi Gold Rush',
    // This event name is likely hallucinated by GPT - the real event is "Trail Challenge Waihi"
    // Update with Trail Challenge Waihi images since it's the actual Waihi trail run
    website: 'https://www.trailchallengewaihi.co.nz/',
    newName: 'Trail Challenge Waihi',
    images: [
      'https://images.squarespace-cdn.com/content/v1/5bfbc7378f513002f88f034b/1543291236490-WRX68QJ9QT7ZXNGMWIDV/XTERRA_WAIHI_2017_015639.jpg',
      'https://images.squarespace-cdn.com/content/v1/5bfbc7378f513002f88f034b/1761028713888-894JCDLVPP71HZYZOUQD/2242_020955.jpg',
      'https://images.squarespace-cdn.com/content/v1/5bfbc7378f513002f88f034b/1543291259949-8DJ99LCFGQ7HUEEQM4O3/XTERRA_WAIHI_2017_009450.jpg',
      'https://images.squarespace-cdn.com/content/v1/5bfbc7378f513002f88f034b/1761028770305-YF49QH5QT4RGBSXKSS8W/1815_000629.jpg',
      'https://images.squarespace-cdn.com/content/v1/5bfbc7378f513002f88f034b/1543291586553-3G6Q7OIKA1A8Y35L8LKP/XTERRA_WAIHI_2017_014613.jpg',
    ],
  },
  {
    name: 'Crater to Lake',
    // The real Taupo MTB event is the Craters Classic
    website: 'https://www.cratersclassic.co.nz/',
    newName: 'Craters Classic',
    images: [
      'https://images.squarespace-cdn.com/content/v1/646e8651bb5e9969c2775aa3/0c287ec2-1458-453e-91e1-099b28af2160/Race-9.jpg',
    ],
  },
  {
    name: 'Abel Tasman Coastal Classic',
    website: 'https://www.nelsonevents.co.nz/abel-tasman-coastal-classic/',
    images: [], // Website is down
  },
  {
    name: 'Kerikeri Half Marathon',
    website: 'https://www.kerikerihalfmarathon.co.nz/',
    images: [], // Website refused connection
  },
  {
    name: 'Motu Challenge',
    website: 'https://www.motuchallenge.co.nz/',
    images: [], // Website is down
  },
  {
    name: 'Nelson Mountain Bike Festival',
    website: 'https://nelsonmtb.club/mtb-events/',
    newName: 'NZ MTB Rally Nelson',
    images: [
      'https://nzmtbrally.com/wp-content/uploads/2023/07/h1-nz-mtb-enduro-races-1024x683.jpg',
    ],
  },
  {
    name: 'Timaru Ten Thousand',
    website: 'https://timaruten.nz/',
    newName: 'Timaru Ten',
    images: [], // Only logos found, lazy-loaded images
  },
  {
    name: 'Hillary Trail Run',
    website: 'https://www.runningcalendar.co.nz/event/the-hillary/',
    newName: 'The Hillary Trail Ultra',
    images: [], // Event currently on hiatus
  },
];

async function main() {
  const client = new Client({ connectionString: connStr });
  await client.connect();

  let updated = 0;
  for (const u of updates) {
    const sets = [];
    const params = [];
    let paramIdx = 1;

    if (u.images && u.images.length > 0) {
      sets.push(`images = $${paramIdx}`);
      params.push(JSON.stringify(u.images));
      paramIdx++;
    }

    if (u.website) {
      sets.push(`website = $${paramIdx}`);
      params.push(u.website);
      paramIdx++;
    }

    if (u.newName) {
      sets.push(`name = $${paramIdx}`);
      params.push(u.newName);
      paramIdx++;
      // Also update slug
      const newSlug = u.newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
      sets.push(`slug = $${paramIdx}`);
      params.push(newSlug);
      paramIdx++;
    }

    if (sets.length === 0) continue;

    sets.push(`"updatedAt" = NOW()`);
    params.push(u.name);

    const query = `UPDATE "Event" SET ${sets.join(', ')} WHERE name = $${paramIdx}`;
    const result = await client.query(query, params);

    if (result.rowCount > 0) {
      console.log('Updated: ' + u.name + (u.newName ? ' -> ' + u.newName : '') + (u.images && u.images.length > 0 ? ' [' + u.images.length + ' images]' : ' [website only]'));
      updated++;
    } else {
      console.log('Not found: ' + u.name);
    }
  }

  console.log('\nTotal updated: ' + updated);

  // Show remaining events without images
  const remaining = await client.query('SELECT name, city, website FROM "Event" WHERE images IS NULL ORDER BY "eventType", name');
  console.log('\nEvents still without images: ' + remaining.rows.length);
  remaining.rows.forEach(r => console.log('  ' + r.name + ' (' + r.city + ')'));

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
