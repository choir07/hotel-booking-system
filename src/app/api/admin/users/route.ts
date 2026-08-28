// src/app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    console.log('Auth Header:', authHeader); // Debug log
    
    if (!authHeader) {
      console.log('No Authorization header');
      return NextResponse.json({ error: 'Unauthorized - No Authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token received:', token.substring(0, 30) + '...'); // Debug log
    
    if (!token) {
      console.log('No token found');
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
        userId: string;
        email: string;
        role: string;
      };
      console.log('Token verified:', decoded);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    console.log('User found:', user?.email, 'Role:', user?.role); // Debug log

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'Unauthorized - User not found' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      console.log('User is not admin:', user.role);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    console.log('User is admin, fetching all users...');
    
    // Fetch all users
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${users.length} users`);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
