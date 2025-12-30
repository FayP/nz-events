// Index all existing events in Elasticsearch
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { indexEvent, initializeElasticsearchIndex } from '../lib/elasticsearch';

async function indexAllEvents() {
  console.log('🚀 Starting to index all events in Elasticsearch...\n');

  try {
    // Initialize index if needed
    console.log('🔧 Initializing Elasticsearch index...');
    await initializeElasticsearchIndex();
    console.log('✅ Index ready\n');

    // Fetch all published events
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    console.log(`📊 Found ${events.length} events to index\n`);

    if (events.length === 0) {
      console.log('⚠️  No events found to index');
      await prisma.$disconnect();
      return;
    }

    let indexed = 0;
    let failed = 0;

    for (const event of events) {
      try {
        await indexEvent(event);
        indexed++;
        process.stdout.write(`\r   Indexed ${indexed}/${events.length} events...`);
      } catch (error: any) {
        console.error(`\n❌ Error indexing event ${event.id}: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n\n✅ Indexing complete!`);
    console.log(`   - Successfully indexed: ${indexed} events`);
    if (failed > 0) {
      console.log(`   - Failed: ${failed} events`);
    }

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

indexAllEvents();

