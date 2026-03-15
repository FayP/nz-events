import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const events = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      startDate: {
        gte: new Date('2027-01-01T00:00:00Z'),
        lte: new Date('2027-03-17T23:59:59Z'),
      },
    },
    select: { id: true, name: true, startDate: true, city: true },
    orderBy: { startDate: 'asc' },
  })

  events.forEach((e) => {
    const d = e.startDate
    console.log(`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')} | ${e.name} | ${e.city} | ${e.id}`)
  })

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
