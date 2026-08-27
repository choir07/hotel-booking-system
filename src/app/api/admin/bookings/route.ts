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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { checkInDate: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        room: {
          include: {
            hotel: {
              select: { name: true }
            }
          }
        }
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}