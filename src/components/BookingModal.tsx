'use client'

import { useState, useEffect } from 'react'

interface Room {
  id: string
  roomNumber: string
  type: string
  pricePerNight: number
  capacity: number
}

interface Hotel {
  id: string
  name: string
  city: string
  rooms: Room[]
}

interface BookingModalProps {
  hotel: Hotel
  room: Room
  isOpen: boolean
  onClose: () => void
  onBookingSuccess: () => void
  onOpenAuth: () => void
  isLoggedIn: boolean  // Add this prop
}

export default function BookingModal({ 
  hotel, 
  room, 
  isOpen, 
  onClose, 
  onBookingSuccess,
  onOpenAuth,
  isLoggedIn  // Receive from parent
}: BookingModalProps) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCheckIn('')
      setCheckOut('')
      setError('')
    }
  }, [isOpen])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if logged in
    if (!isLoggedIn) {
      setError('Please login to book a room')
      setLoading(false)
      onOpenAuth()
      return
    }

    try {
      // Validate dates
      if (!checkIn || !checkOut) {
        throw new Error('Please select both check-in and check-out dates')
      }

      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)

      if (checkInDate >= checkOutDate) {
        throw new Error('Check-out date must be after check-in date')
      }

      if (checkInDate < new Date()) {
        throw new Error('Check-in date cannot be in the past')
      }

      console.log('📤 Creating booking:', { roomId: room.id, checkIn, checkOut })

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: room.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
        }),
      })

      const data = await response.json()
      console.log('📥 Booking response:', data)

      if (response.status === 401) {
        // Not authenticated
        setError('Please login to book a room')
        onOpenAuth()
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed')
      }

      alert(`✅ Booking confirmed!\n\nHotel: ${hotel.name}\nRoom: ${room.roomNumber}\nCheck-in: ${new Date(checkIn).toLocaleDateString()}\nCheck-out: ${new Date(checkOut).toLocaleDateString()}\nTotal: $${data.data.totalPrice}`)
      
      onBookingSuccess()
      onClose()
      
      setCheckIn('')
      setCheckOut('')
      
    } catch (err: any) {
      console.error('❌ Booking error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const getMinCheckOut = () => {
    if (checkIn) {
      const date = new Date(checkIn)
      date.setDate(date.getDate() + 1)
      return date.toISOString().split('T')[0]
    }
    return todayStr
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Book Room</h2>
            <p className="text-gray-600 text-sm">
              {hotel.name} - Room {room.roomNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {!isLoggedIn && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm font-medium">
              ⚠️ Please login to book this room
            </p>
            <button
              onClick={() => {
                onClose()
                onOpenAuth()
              }}
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Sign In / Register
            </button>
          </div>
        )}

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Room Type:</span>
            <span className="font-medium">{room.type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Capacity:</span>
            <span className="font-medium">{room.capacity} guests</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price:</span>
            <span className="font-bold text-blue-600">${room.pricePerNight}/night</span>
          </div>
        </div>

        <form onSubmit={handleBooking}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value)
                  if (checkOut && new Date(e.target.value) >= new Date(checkOut)) {
                    setCheckOut('')
                  }
                }}
                min={todayStr}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                disabled={!isLoggedIn}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={getMinCheckOut()}
                required
                disabled={!checkIn || !isLoggedIn}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !checkIn || !checkOut || !isLoggedIn}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          {isLoggedIn 
            ? 'You\'ll receive a confirmation with details'
            : 'Sign in to complete your booking'}
        </p>
      </div>
    </div>
  )
}