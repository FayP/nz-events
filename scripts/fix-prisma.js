// Fix Prisma client path for Prisma 7
const fs = require('fs')
const path = require('path')

const prismaClientPath = path.join(__dirname, '../node_modules/@prisma/client')
const prismaGeneratedPath = path.join(__dirname, '../node_modules/.prisma/client')
const targetPath = path.join(prismaClientPath, '.prisma/client/default')

// Create directory structure
const targetDir = path.dirname(targetPath)
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

// Copy generated client to expected location
if (fs.existsSync(prismaGeneratedPath)) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true })
  }
  fs.cpSync(prismaGeneratedPath, targetPath, { recursive: true })
  
  // Create index.js that exports from client.ts
  const indexPath = path.join(targetPath, 'index.js')
  fs.writeFileSync(indexPath, "module.exports = require('./client')\n")
  
  console.log('✅ Fixed Prisma client path')
} else {
  console.log('⚠️  Prisma client not generated yet. Run: npm run db:generate')
}

