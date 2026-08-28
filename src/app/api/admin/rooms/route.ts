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
    const rooms = await prisma.room.findMany({
      orderBy: { roomNumber: 'asc' },
      include: {
        hotel: {
          select: { name: true, city: true }
        },
        _count: {
          select: { bookings: true }
        }
      }
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
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