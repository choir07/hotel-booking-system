import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.role !== 'ADMIN') {
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }

    return { user };
  } catch (error) {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const hotels = await prisma.hotel.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { rooms: true }
        },
        rooms: {
          select: {
            _count: {
              select: { bookings: true }
            }
          }
        }
      }
    });

    const result = hotels.map(({ rooms, _count, ...hotel }) => ({
      ...hotel,
      _count: {
        rooms: _count.rooms,
        bookings: rooms.reduce((sum, r) => sum + r._count.bookings, 0)
      }
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { hotelId, roomNumber, type, pricePerNight, capacity, isAvailable, amenities } = body;

    if (!hotelId || !roomNumber || !type || pricePerNight == null || capacity == null) {
      return NextResponse.json(
        { error: 'hotelId, roomNumber, type, pricePerNight and capacity are required' },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        hotelId,
        roomNumber,
        type,
        pricePerNight: parseFloat(pricePerNight),
        capacity: parseInt(capacity),
        isAvailable: isAvailable ?? true,
        amenities: amenities || [],
      }
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}