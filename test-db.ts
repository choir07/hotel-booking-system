import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Successfully connected to PostgreSQL!')
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('📊 PostgreSQL version:', result)
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Failed to connect:', error)
  }
}

testConnection()