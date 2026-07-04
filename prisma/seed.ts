import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123'

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPassword,
    },
  })
  console.log('Admin user seeded:', admin)
}

main()
  .catch((e) => {
    console.error(e)
    throw e // process.exitを使わずに、エラーを投げて安全に終了させます
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



