const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { Client } = require('pg');

const connStr = process.env.DATABASE_URL.replace('sslmode=require', 'sslmode=require&uselibpqcompat=true');

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getCanonicalSlug(currentSlug) {
  // Strip trailing timestamp (10-13 digit number at end)
  return currentSlug.replace(/-\d{10,13}$/, '');
}

async function main() {
  const client = new Client({ connectionString: connStr });
  await client.connect();

  // Fetch all events
  const { rows: allEvents } = await client.query(
    'SELECT * FROM "Event" ORDER BY "updatedAt" DESC'
  );
  console.log('Total events:', allEvents.length);

  // Group by canonical slug
  const groups = new Map();
  for (const event of allEvents) {
    const canonical = getCanonicalSlug(event.slug);
    if (!groups.has(canonical)) groups.set(canonical, []);
    groups.get(canonical).push(event);
  }

  console.log('Unique event groups:', groups.size);
  console.log('');

  let updated = 0;
  let merged = 0;
  let deleted = 0;

  // Track all new slugs to detect conflicts
  const usedSlugs = new Set();

  for (const [canonical, events] of groups) {
    // Determine the clean slug for this group
    // Use generateSlug from the best event's name for accuracy
    let cleanSlug = generateSlug(events[0].name);

    // Handle slug conflicts (different events that produce the same slug)
    if (usedSlugs.has(cleanSlug)) {
      let counter = 2;
      while (usedSlugs.has(`${cleanSlug}-${counter}`)) counter++;
      cleanSlug = `${cleanSlug}-${counter}`;
    }
    usedSlugs.add(cleanSlug);

    if (events.length === 1) {
      // Simple case: just update the slug
      const event = events[0];
      const oldSlug = event.slug;

      if (oldSlug !== cleanSlug) {
        await client.query(
          'UPDATE "Event" SET slug = $1, "previousSlugs" = $2, "updatedAt" = NOW() WHERE id = $3',
          [cleanSlug, [oldSlug], event.id]
        );
        console.log('  Updated: ' + oldSlug + ' -> ' + cleanSlug);
        updated++;
      } else {
        console.log('  Already clean: ' + cleanSlug);
      }
    } else {
      // Duplicate group: pick the best record and merge
      console.log('  DUPLICATE GROUP (' + events.length + '): ' + canonical);

      // Score each event by data completeness
      const scored = events.map(e => {
        let score = 0;
        if (e.status === 'PUBLISHED') score += 100;
        if (e.description) score += 10;
        if (e.website) score += 5;
        if (e.latitude) score += 5;
        if (e.images) score += 5;
        if (e.seoTitle) score += 3;
        if (e.distanceDetails) score += 5;
        if (e.courseInfo) score += 3;
        return { event: e, score };
      });
      scored.sort((a, b) => b.score - a.score || new Date(b.event.updatedAt) - new Date(a.event.updatedAt));

      const winner = scored[0].event;
      const losers = scored.slice(1).map(s => s.event);

      // Merge missing fields from losers into winner
      const mergeFields = [
        'description', 'website', 'registrationUrl', 'organizer',
        'organizerWebsite', 'latitude', 'longitude', 'seoTitle',
        'seoDescription', 'courseTerrain', 'courseSurface', 'cutoffTime',
        'images', 'distanceDetails',
      ];

      const updates = {};
      for (const field of mergeFields) {
        if (!winner[field]) {
          for (const loser of losers) {
            if (loser[field]) {
              updates[field] = loser[field];
              break;
            }
          }
        }
      }

      // Collect all old slugs
      const allOldSlugs = events.map(e => e.slug).filter(s => s !== cleanSlug);

      // Use the most future startDate
      const latestDate = events.reduce((latest, e) =>
        new Date(e.startDate) > new Date(latest) ? e.startDate : latest,
        events[0].startDate
      );

      // Build update query for the winner
      const setClauses = ['slug = $1', '"previousSlugs" = $2', '"startDate" = $3', '"updatedAt" = NOW()'];
      const params = [cleanSlug, allOldSlugs, latestDate];
      let paramIdx = 4;

      const jsonFields = ['images', 'distanceDetails', 'price', 'schedule', 'distances'];
      for (const [field, value] of Object.entries(updates)) {
        setClauses.push(`"${field}" = $${paramIdx}`);
        // JSON fields need to be serialized as strings for pg driver
        params.push(jsonFields.includes(field) ? JSON.stringify(value) : value);
        paramIdx++;
      }

      params.push(winner.id);
      await client.query(
        `UPDATE "Event" SET ${setClauses.join(', ')} WHERE id = $${paramIdx}`,
        params
      );

      // Delete losers
      for (const loser of losers) {
        // Delete EventContent first if it exists (even though CASCADE should handle it)
        await client.query('DELETE FROM "EventContent" WHERE "eventId" = $1', [loser.id]);
        await client.query('DELETE FROM "Event" WHERE id = $1', [loser.id]);
        console.log('    Deleted duplicate: ' + loser.name + ' (' + loser.slug + ')');
        deleted++;
      }

      console.log('    Winner: ' + winner.name + ' -> ' + cleanSlug + ' (merged ' + Object.keys(updates).length + ' fields)');
      merged++;
      updated++;
    }
  }

  // Final summary
  const { rows: finalCount } = await client.query('SELECT COUNT(*) FROM "Event"');
  const { rows: cleanCount } = await client.query('SELECT COUNT(*) FROM "Event" WHERE slug !~ \'-[0-9]{10,13}$\'');

  console.log('\n' + '='.repeat(50));
  console.log('Migration Complete');
  console.log('='.repeat(50));
  console.log('Events updated: ' + updated);
  console.log('Duplicate groups merged: ' + merged);
  console.log('Duplicate records deleted: ' + deleted);
  console.log('Total events remaining: ' + finalCount[0].count);
  console.log('Events with clean slugs: ' + cleanCount[0].count);

  // Show all slugs for verification
  const { rows: slugs } = await client.query('SELECT slug, name FROM "Event" ORDER BY slug');
  console.log('\nAll event slugs:');
  slugs.forEach(r => console.log('  ' + r.slug + '  (' + r.name + ')'));

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
