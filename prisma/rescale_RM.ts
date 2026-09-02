/**
 * prisma/rescale-prices-myr.ts
 
 *
 * Run with:
 *   npx tsx prisma/rescale-prices-myr.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Realistic MYR/night bands by room type, based on typical Malaysian
// hotel pricing (budget guesthouse through upscale suite).
const MYR_BANDS: Record<string, [number, number]> = {
  STANDARD: [80, 150],
  SINGLE: [60, 120],
  DOUBLE: [100, 200],
  DELUXE: [180, 350],
  SUITE: [350, 750],
};

function newPriceFor(type: string): number {
  const [min, max] = MYR_BANDS[type] ?? [100, 300];
  return randomInt(min, max);
}

function nightsBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

async function main() {
  const rooms = await prisma.room.findMany({
    select: { id: true, type: true, pricePerNight: true },
  });

  console.log(`Found ${rooms.length} rooms to rescale.`);

  let roomsUpdated = 0;
  for (const room of rooms) {
    const newPrice = newPriceFor(room.type);
    await prisma.room.update({
      where: { id: room.id },
      data: { pricePerNight: newPrice },
    });
    roomsUpdated++;
  }

  console.log(`Rescaled ${roomsUpdated} room prices.`);

  // Recalculate totalPrice for any existing bookings so they stay
  // consistent with each room's new pricePerNight.
  const bookings = await prisma.booking.findMany({
    select: { id: true, checkInDate: true, checkOutDate: true, roomId: true },
  });

  console.log(`Found ${bookings.length} bookings to recheck.`);

  let bookingsUpdated = 0;
  for (const booking of bookings) {
    const room = await prisma.room.findUnique({
      where: { id: booking.roomId },
      select: { pricePerNight: true },
    });
    if (!room) continue;

    const nights = nightsBetween(new Date(booking.checkInDate), new Date(booking.checkOutDate));
    const newTotal = room.pricePerNight * nights;

    await prisma.booking.update({
      where: { id: booking.id },
      data: { totalPrice: newTotal },
    });
    bookingsUpdated++;
  }

  console.log(`Recalculated totalPrice for ${bookingsUpdated} bookings.`);
  console.log('\nDone. All prices now in MYR bands.');
}

main()
  .catch((e) => {
    console.error('Rescale failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });