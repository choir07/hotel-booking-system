// src/app/api/hotels/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`📡 Fetching hotel with ID: ${id}`);

    const hotel = await prisma.hotel.findUnique({
      where: { id: id },
      include: {
        rooms: {
          orderBy: {
            pricePerNight: 'asc',
          },
        },
      },
    });

    if (!hotel) {
      console.log(`❌ Hotel not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Hotel found: ${hotel.name}`);
    return NextResponse.json(hotel);
  } catch (error) {
    console.error('❌ Error fetching hotel:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}