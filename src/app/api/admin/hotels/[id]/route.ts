// src/app/api/admin/hotels/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      email: string;
      role: string;
    };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, address, city, country, description, rating } = body;

    const hotel = await prisma.hotel.update({
      where: { id: params.id },
      data: {
        name,
        address,
        city,
        country,
        description,
        rating: rating ? parseFloat(rating) : null,
      }
    });

    return NextResponse.json(hotel);
  } catch (error) {
    console.error('Error updating hotel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      email: string;
      role: string;
    };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.hotel.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}