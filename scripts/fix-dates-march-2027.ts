import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const fixes = [
  {
    nameContains: 'Old Ghost Ultra',
    correctDate: new Date('2027-02-20T00:00:00Z'),
    note: 'Official site: 20 February 2027',
  },
  {
    nameContains: 'Gallagher Insurance Challenge',
    correctDate: new Date('2027-02-20T00:00:00Z'),
    note: 'challenge-wanaka.com: SAT 20 FEB 2027',
  },
  {
    nameContains: 'Motatapu',
    correctDate: new Date('2027-03-06T00:00:00Z'),
    note: 'motatapu.com: Saturday 6 March 2027',
  },
]

async function main() {
  for (const fix of fixes) {
    const event = await prisma.event.findFirst({
      where: { name: { contains: fix.nameContains }, status: 'PUBLISHED' },
      select: { id: true, name: true, startDate: true },
    })

    if (!event) {
      console.log(`NOT FOUND: ${fix.nameContains}`)
      continue
    }

    const before = event.startDate.toISOString().substring(0, 10)
    const after = fix.correctDate.toISOString().substring(0, 10)

    await prisma.event.update({
      where: { id: event.id },
      data: { startDate: fix.correctDate },
    })

    console.log(`✅ ${event.name}`)
    console.log(`   ${before} → ${after} (${fix.note})`)
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
