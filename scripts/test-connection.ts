import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...\n');
    
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Check if tables exist
    try {
      const count = await prisma.event.count();
      console.log(`📊 Found ${count} events in database\n`);
      
      if (count > 0) {
        const sample = await prisma.event.findFirst({
          select: { id: true, name: true, eventType: true }
        });
        if (sample) {
          console.log(`📝 Sample event: ${sample.name} (${sample.eventType})`);
        }
      }
    } catch (error: any) {
      if (error.message?.includes('does not exist')) {
        console.log('⚠️  Tables do not exist yet. Connection is working!\n');
        console.log('💡 Next step: Push your schema with:');
        console.log('   npx prisma db push\n');
      } else {
        throw error;
      }
    }
    
    await prisma.$disconnect();
    console.log('\n✅ All checks passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Database connection failed:\n');
    console.error(error.message);
    
    if (error.message?.includes('P1001')) {
      console.error('\n💡 Tip: Check if your database is accessible and the connection string is correct.');
      console.error('   - Verify the database server is running');
      console.error('   - Check firewall settings');
      console.error('   - Verify the host/port in DATABASE_URL');
    } else if (error.message?.includes('P1000')) {
      console.error('\n💡 Tip: Check your database credentials.');
      console.error('   - Verify username and password in DATABASE_URL');
      console.error('   - Check if the database user has proper permissions');
    } else if (error.message?.includes('SSL') || error.message?.includes('sslmode')) {
      console.error('\n💡 Tip: SSL connection issue.');
      console.error('   - Add ?sslmode=require to your DATABASE_URL for secure connections');
      console.error('   - Example: postgresql://user:pass@host:5432/db?sslmode=require');
    } else if (error.message?.includes('does not exist')) {
      console.error('\n💡 Tip: Database or schema does not exist.');
      console.error('   - Run: npm run db:push');
    }
    
    process.exit(1);
  }
}

testConnection();

