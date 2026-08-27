import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Helper to get user from token
async function getUserIdFromToken() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }
    return decoded.userId
  } catch (error) {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Please login to book a room' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { roomId, checkInDate, checkOutDate } = body

    // Validate required fields
    if (!roomId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate dates
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const now = new Date()

    if (checkIn < now) {
      return NextResponse.json(
        { success: false, error: 'Check-in date cannot be in the past' },
        { status: 400 }
      )
    }

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { success: false, error: 'Check-out date must be after check-in date' },
        { status: 400 }
      )
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    // Check if room is available for these dates
    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: {
          not: 'CANCELLED'
        },
        OR: [
          {
            checkInDate: {
              lte: checkOut,
              gte: checkIn
            }
          },
          {
            checkOutDate: {
              lte: checkOut,
              gte: checkIn
            }
          }
        ]
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Room is already booked for these dates' },
        { status: 409 }
      )
    }

    // Calculate total price
    const days = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / 
      (1000 * 60 * 60 * 24)
    )
    const totalPrice = room.pricePerNight * days

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice,
        status: 'PENDING'
      },
      include: {
        room: {
          include: {
            hotel: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: booking
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromToken()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Please login to view bookings' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { userId }
    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          include: {
            hotel: true
          }
        }
      },
      orderBy: { checkInDate: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: bookings
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}