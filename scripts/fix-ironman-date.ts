import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const events = await prisma.event.findMany({
    where: { name: { contains: 'IRONMAN' } },
    select: { id: true, name: true, startDate: true },
  })

  console.log('Current dates:')
  events.forEach((e) => console.log(e.startDate.toISOString(), '|', e.name))

  // IRONMAN NZ 2027 is 6 March — fix both the full and 70.3
  for (const e of events) {
    if (e.name.includes('IRONMAN New Zealand') || e.name.includes('IRONMAN 70.3 New Zealand')) {
      const current = e.startDate
      // Change day from 7 → 6 March
      const fixed = new Date(Date.UTC(
        current.getUTCFullYear(),
        current.getUTCMonth(),
        6, // correct day
        0, 0, 0, 0
      ))
      await prisma.event.update({ where: { id: e.id }, data: { startDate: fixed } })
      console.log(`Fixed: ${e.name} → ${fixed.toISOString()}`)
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
