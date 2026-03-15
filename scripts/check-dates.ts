import { PrismaClient } from '@prisma/client'
import { getNextOccurrenceDate } from '../lib/utils/event-dates'

const prisma = new PrismaClient()

async function main() {
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    select: { name: true, startDate: true },
    orderBy: { startDate: 'asc' },
    take: 20,
  })

  console.log('\nRaw DB date vs rendered date (NZ local):\n')
  events.forEach((e) => {
    const rolled = getNextOccurrenceDate(e.startDate)
    const rendered = rolled.toLocaleDateString('en-NZ', {
      day: 'numeric', month: 'long', year: 'numeric',
      timeZone: 'Pacific/Auckland',
    })
    const utc = rolled.toISOString()
    console.log(`${rendered.padEnd(25)} | UTC: ${utc.substring(0, 10)} | ${e.name}`)
  })

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
