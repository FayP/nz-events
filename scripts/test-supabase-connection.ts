import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Test Supabase connection with different methods
 */

async function testConnection() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env.local');
    process.exit(1);
  }

  console.log('🔍 Testing Supabase Connection\n');
  console.log('Connection String (hidden):', DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

  // Test 1: Direct connection with timeout
  console.log('\n1️⃣ Testing direct connection with timeout...');
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: DATABASE_URL + (DATABASE_URL.includes('?') ? '&' : '?') + 'connect_timeout=30',
        },
      },
    });
    
    await prisma.$connect();
    console.log('✅ Direct connection successful!');
    const count = await prisma.event.count();
    console.log(`📊 Found ${count} events in database`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.log('❌ Direct connection failed:', error.message);
  }

  // Test 2: Try with connection pooling URL
  console.log('\n2️⃣ Testing with connection pooling URL...');
  const poolerUrl = DATABASE_URL
    .replace('db.', 'aws-0-')
    .replace('.supabase.co:5432', '.pooler.supabase.com:6543')
    .replace('postgres:', 'postgres.');

  console.log('Pooler URL (hidden):', poolerUrl.replace(/:[^:@]*@/, ':****@'));

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: poolerUrl + (poolerUrl.includes('?') ? '&' : '?') + 'connect_timeout=30',
        },
      },
    });
    
    await prisma.$connect();
    console.log('✅ Connection pooling URL works!');
    const count = await prisma.event.count();
    console.log(`📊 Found ${count} events in database`);
    await prisma.$disconnect();
    
    console.log('\n💡 Solution: Use connection pooling URL in your .env.local:');
    console.log(`DATABASE_URL="${poolerUrl}"`);
    process.exit(0);
  } catch (error: any) {
    console.log('❌ Connection pooling also failed:', error.message);
  }

  // Test 3: Check if password needs encoding
  console.log('\n3️⃣ Checking password encoding...');
  const passwordMatch = DATABASE_URL.match(/postgres:([^@]+)@/);
  if (passwordMatch) {
    const password = passwordMatch[1];
    const needsEncoding = /[^a-zA-Z0-9]/.test(password);
    if (needsEncoding) {
      console.log('⚠️  Password contains special characters that may need URL encoding');
      console.log('   Try URL-encoding special characters in your password');
    } else {
      console.log('✅ Password format looks OK');
    }
  }

  console.log('\n📋 Troubleshooting Tips:');
  console.log('1. Check Supabase dashboard - is the project paused?');
  console.log('2. Try restarting your Supabase project in the dashboard');
  console.log('3. Verify the connection string in Supabase Settings > Database');
  console.log('4. Check if your IP needs to be allowlisted (usually not needed)');
  console.log('5. Try the connection pooling URL (port 6543 instead of 5432)');
  process.exit(1);
}

testConnection();

