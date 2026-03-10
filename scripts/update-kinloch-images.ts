import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

import { PrismaClient } from '@prisma/client'

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not found')
  return url.includes('?') ? `${url}&pgbouncer=true` : `${url}?pgbouncer=true`
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

async function main() {
  console.log('Updating Kinloch Triathlon Festival images...\n')

  const event = await prisma.event.findFirst({
    where: { slug: 'kinloch-triathlon-festival' },
    select: { id: true, name: true, images: true },
  })

  if (!event) {
    console.error('Event not found!')
    process.exit(1)
  }

  console.log(`Found: ${event.name}`)
  console.log(`Current images: ${JSON.stringify(event.images, null, 2)}\n`)

  const newImages = [
    // Swimmer exiting Lake Taupo - Kian Weston leads out of the water
    'https://images.squarespace-cdn.com/content/v1/6792f71cdcea5b5f10ce8654/6bacc01a-5e74-4018-8638-73ff7a816cee/250220-KinlochTri1.jpg',
    // Winner crossing finish - Ollie Brazier wins the Erin Baker race
    'https://images.squarespace-cdn.com/content/v1/6792f71cdcea5b5f10ce8654/e755abb0-63fe-4bbf-89a5-eb8704e93b21/250220-KinlochTri2.jpeg',
    // Athletes racing - Pipi Hunter and Rory Patterson
    'https://images.squarespace-cdn.com/content/v1/6792f71cdcea5b5f10ce8654/35f7475e-7dcc-483f-a636-fa16fd854fff/250220-KinlochTri3.jpg',
    // Event photo from 2023 festival
    'https://d2ohemy4ov0nsr.cloudfront.net/images/TSTAUPO/s61UkvtibxtnZhPFfd7zPHTe.jpg',
  ]

  console.log(`New images: ${JSON.stringify(newImages, null, 2)}\n`)

  await prisma.event.update({
    where: { id: event.id },
    data: { images: newImages },
  })

  console.log(`Updated successfully! Replaced ${(event.images as string[]).length} images with ${newImages.length} actual event photos.`)
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
