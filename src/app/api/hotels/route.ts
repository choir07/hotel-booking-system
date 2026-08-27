// src/app/api/hotels/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    console.log('📡 Fetching hotels...');

    // Build where clause
    const whereClause: any = {};

    if (city) {
      whereClause.city = city;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    const hotels = await prisma.hotel.findMany({
      where: whereClause,
      include: {
        rooms: {
          where: { isAvailable: true },
          select: {
            id: true,
            roomNumber: true,
            type: true,
            pricePerNight: true,
            capacity: true,
            isAvailable: true,
          }
        }
      },
      orderBy: {
        rating: 'desc',
      },
    });

    console.log(`✅ Found ${hotels.length} hotels`);

    return NextResponse.json(hotels);
  } catch (error) {
    console.error('❌ Error fetching hotels:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}