import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Migration script to move data from local database to Supabase
 * 
 * Usage:
 * 1. Set DATABASE_URL to your local database
 * 2. Set SUPABASE_DATABASE_URL to your Supabase connection string
 * 3. Run: npx tsx scripts/migrate-to-supabase.ts
 */

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Local database
    },
  },
});

const supabasePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SUPABASE_DATABASE_URL, // Supabase database
    },
  },
});

async function migrate() {
  console.log('🚀 Starting database migration to Supabase...\n');

  try {
    // Test connections
    console.log('🔌 Testing connections...');
    await localPrisma.$connect();
    console.log('✅ Local database connected');

    if (!process.env.SUPABASE_DATABASE_URL) {
      throw new Error('SUPABASE_DATABASE_URL not set in .env.local');
    }

    await supabasePrisma.$connect();
    console.log('✅ Supabase database connected\n');

    // Count existing data
    const localEventCount = await localPrisma.event.count();
    const localContentCount = await localPrisma.eventContent.count();
    
    console.log(`📊 Local database has:`);
    console.log(`   - ${localEventCount} events`);
    console.log(`   - ${localContentCount} event content entries\n`);

    if (localEventCount === 0) {
      console.log('ℹ️  No data to migrate. You can skip this step and just run: npm run db:push');
      await localPrisma.$disconnect();
      await supabasePrisma.$disconnect();
      return;
    }

    // Check Supabase
    const supabaseEventCount = await supabasePrisma.event.count();
    if (supabaseEventCount > 0) {
      console.log(`⚠️  Supabase already has ${supabaseEventCount} events.`);
      console.log('   This script will add new events, but may create duplicates.\n');
    }

    // Migrate events
    console.log('📦 Migrating events...');
    const events = await localPrisma.event.findMany({
      include: {
        content: true,
      },
    });

    let migrated = 0;
    let skipped = 0;

    for (const event of events) {
      try {
        // Check if event already exists
        const existing = await supabasePrisma.event.findUnique({
          where: { id: event.id },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Create event
        await supabasePrisma.event.create({
          data: {
            id: event.id,
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            city: event.city,
            region: event.region,
            country: event.country,
            price: event.price,
            currency: event.currency,
            registrationUrl: event.registrationUrl,
            websiteUrl: event.websiteUrl,
            organizer: event.organizer,
            tags: event.tags,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            // Create content if it exists
            content: event.content
              ? {
                  create: {
                    id: event.content.id,
                    slug: event.content.slug,
                    heroImage: event.content.heroImage,
                    excerpt: event.content.excerpt,
                    fullDescription: event.content.fullDescription,
                    eventDetails: event.content.eventDetails as any,
                    registration: event.content.registration as any,
                    organizerInfo: event.content.organizerInfo as any,
                    seo: event.content.seo as any,
                    tags: event.content.tags as any,
                    createdAt: event.content.createdAt,
                    updatedAt: event.content.updatedAt,
                  },
                }
              : undefined,
          },
        });

        migrated++;
        process.stdout.write(`\r   Migrated ${migrated}/${events.length} events...`);
      } catch (error: any) {
        console.error(`\n❌ Error migrating event ${event.id}: ${error.message}`);
      }
    }

    console.log(`\n\n✅ Migration complete!`);
    console.log(`   - Migrated: ${migrated} events`);
    console.log(`   - Skipped: ${skipped} events (already exist)`);

    // Verify
    const finalCount = await supabasePrisma.event.count();
    console.log(`\n📊 Supabase now has ${finalCount} events`);

    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();

    console.log('\n✅ Done! Your database is now on Supabase.');
  } catch (error: any) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    process.exit(1);
  }
}

migrate();

