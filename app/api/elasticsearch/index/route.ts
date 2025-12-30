// API endpoint to index all events in Elasticsearch
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { indexEvent, initializeElasticsearchIndex } from '@/lib/elasticsearch';

export async function GET(request: Request) {
  // Allow GET for easier testing via browser
  return POST(request);
}

export async function POST(request: Request) {
  try {
    // Optional: Add authentication check here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.INDEX_API_KEY}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🚀 Starting to index all events...');

    // Initialize index if needed
    await initializeElasticsearchIndex();

    // Fetch all published events
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    console.log(`📊 Found ${events.length} events to index`);

    if (events.length === 0) {
      return NextResponse.json({
        message: 'No events found to index',
        indexed: 0,
        total: 0,
      });
    }

    let indexed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        await indexEvent(event);
        indexed++;
      } catch (error: any) {
        console.error(`Error indexing event ${event.id}:`, error.message);
        failed++;
        errors.push(`Event ${event.id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      message: 'Indexing complete',
      indexed,
      failed,
      total: events.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Indexing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to index events' },
      { status: 500 }
    );
  }
}

