import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@hotelbook.com';
const ADMIN_PASSWORD = 'ChangeMe123!';
const ADMIN_NAME = 'Admin';

async function main() {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: 'ADMIN', password: hashedPassword },
    });
    console.log(`Promoted existing user to ADMIN: ${updated.email}`);
  } else {
    const created = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: ADMIN_NAME,
        role: 'ADMIN',
      },
    });
    console.log(`Created new admin user: ${created.email}`);
  }

  console.log(`Login with:\n  email: ${ADMIN_EMAIL}\n  password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });