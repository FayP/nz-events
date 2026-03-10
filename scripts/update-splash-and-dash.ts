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
  console.log('Finding Splash and Dash event...\n')

  const event = await prisma.event.findFirst({
    where: {
      name: { contains: 'Splash and Dash', mode: 'insensitive' },
    },
    select: { id: true, name: true, images: true, price: true },
  })

  if (!event) {
    console.error('Splash and Dash event not found!')
    process.exit(1)
  }

  console.log(`Found: ${event.name}`)
  console.log(`Current price: ${JSON.stringify(event.price)}`)
  console.log(`Current images: ${JSON.stringify(event.images, null, 2)}\n`)

  // Remove the bad theme background image and replace with inner banner
  const badImage = 'https://splashanddash.co.nz/wp-content/themes/altitude-pro/images/bg-7.jpg'
  const replacementImage = 'https://splashanddash.co.nz/wp-content/uploads/2019/09/inner_banner_SaD.jpg'
  const currentImages = (event.images as string[]) || []
  const newImages = currentImages.map(img => img === badImage ? replacementImage : img)

  const newPrice = { min: 20, max: 137, currency: 'NZD' }

  console.log('New price:', JSON.stringify(newPrice))
  console.log(`New images: ${JSON.stringify(newImages, null, 2)}\n`)

  await prisma.event.update({
    where: { id: event.id },
    data: {
      images: newImages,
      price: newPrice,
    },
  })

  console.log('Updated successfully!')
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
