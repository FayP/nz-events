import { PrismaClient } from '@prisma/client'
import { getNextOccurrenceDate } from '../lib/utils/event-dates'

const prisma = new PrismaClient()

async function main() {
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, name: true, startDate: true, city: true },
  })

  const cutoffStart = new Date('2027-01-01T00:00:00Z')
  const cutoffEnd = new Date('2027-03-17T23:59:59Z')

  const filtered = events
    .map((e) => ({ ...e, rolled: getNextOccurrenceDate(e.startDate) }))
    .filter((e) => e.rolled >= cutoffStart && e.rolled <= cutoffEnd)
    .sort((a, b) => a.rolled.getTime() - b.rolled.getTime())

  filtered.forEach((e) => {
    const d = e.rolled
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`
    console.log(`${dateStr} | ${e.name} | ${e.city}`)
  })

  console.log(`\nTotal: ${filtered.length} events`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
