// src/app/api/admin/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
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

    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all rooms and their booking status for today
    const allRooms = await prisma.room.findMany({
      include: {
        bookings: {
          where: {
            OR: [
              {
                checkInDate: { lte: today },
                checkOutDate: { gt: today },
                status: { in: ['CONFIRMED', 'CHECKED_IN'] }
              }
            ]
          }
        }
      }
    });

    // Calculate occupied rooms for today
    const occupiedRooms = allRooms.filter(room => room.bookings.length > 0).length;
    const totalRooms = allRooms.length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Fetch dashboard data
    const [
      totalHotels,
      totalBookings,
      totalUsers,
      revenue,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      checkedInBookings,
      checkedOutBookings,
      recentBookings
    ] = await Promise.all([
      prisma.hotel.count(),
      prisma.booking.count(),
      prisma.user.count(),
      prisma.booking.aggregate({
        where: { 
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] }
        },
        _sum: { totalPrice: true }
      }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({ where: { status: 'CHECKED_IN' } }),
      prisma.booking.count({ where: { status: 'CHECKED_OUT' } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          room: {
            include: {
              hotel: true
            }
          }
        }
      })
    ]);

    // Get popular hotels with booking counts
    const allHotels = await prisma.hotel.findMany({
      include: {
        rooms: {
          include: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] }
              }
            }
          }
        }
      }
    });

    const popularHotels = allHotels
      .map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        rating: hotel.rating,
        image: hotel.image,
        bookingCount: hotel.rooms.reduce((acc, room) => acc + room.bookings.length, 0)
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);

    const dashboardData = {
      totalHotels,
      totalRooms,
      totalBookings,
      totalUsers,
      revenue: revenue._sum.totalPrice || 0,
      occupancyRate,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      checkedInBookings,
      checkedOutBookings,
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        guestName: booking.guestName || booking.user?.name || 'Guest',
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalPrice: booking.totalPrice,
        status: booking.status,
        hotelName: booking.room?.hotel?.name || 'Unknown Hotel',
        roomNumber: booking.room?.roomNumber || 'N/A'
      })),
      popularHotels: popularHotels.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        rating: hotel.rating,
        image: hotel.image,
        bookingCount: hotel.bookingCount
      }))
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}