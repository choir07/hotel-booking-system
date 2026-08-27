// src/app/hotel/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Star,
  ArrowLeft,
  CheckCircle,
  XCircle,
  HotelIcon,
  Wifi,
  Coffee,
  Car,
  Utensils,
  Dumbbell,
  Sparkles,
  X,
  UserIcon,
  AlertCircle
} from 'lucide-react';

interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description: string | null;
  rating: number | null;
  image: string | null;
  amenities: string[];
  rooms: {
    id: string;
    roomNumber: string;
    type: string;
    pricePerNight: number;
    capacity: number;
    isAvailable: boolean;
    amenities: string[];
  }[];
}

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Auth state - initialized from localStorage
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('🔍 [Hotel Page] Token found:', !!token);
        
        if (!token) {
          console.log('❌ No token');
          setIsAuthenticated(false);
          setUser(null);
          setAuthLoading(false);
          return;
        }

        const response = await fetch('/api/auth/check', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('🔍 [Hotel Page] Auth status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ [Hotel Page] User:', data.user);
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          console.log('❌ Auth failed');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch hotel
  useEffect(() => {
    if (params.id) {
      fetchHotel();
    }
  }, [params.id]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/hotels/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Hotel not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setHotel(data);
    } catch (error: any) {
      console.error('Error fetching hotel:', error);
      setError(error.message || 'Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    console.log('🔄 Booking clicked - isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!selectedRoom) {
      alert('Please select a room first');
      return;
    }
    setShowBookingModal(true);
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      'WiFi': Wifi,
      'Pool': HotelIcon,
      'Restaurant': Utensils,
      'Gym': Dumbbell,
      'Parking': Car,
      'Spa': Sparkles,
      'Bar': Coffee,
    };
    return icons[amenity] || HotelIcon;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <HotelIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The hotel you\'re looking for doesn\'t exist.'}</p>
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const availableRooms = hotel.rooms?.filter(r => r.isAvailable) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Hotels
            </Link>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <UserIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">{user?.name || user?.email || 'User'}</span>
                </div>
              ) : (
                <Link 
                  href="/admin/login" 
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hotel Images */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="h-96 bg-gray-200 relative">
            {hotel.image ? (
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50">
                <HotelIcon className="h-32 w-32 text-blue-300" />
              </div>
            )}
            {hotel.rating && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center shadow-lg">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-2 font-semibold text-lg">{hotel.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hotel Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Hotel</h2>
              <p className="text-gray-600 leading-relaxed">
                {hotel.description || 'Experience luxury and comfort at this beautiful hotel.'}
              </p>
            </div>

            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {hotel.amenities.map((amenity, index) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div key={index} className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Room Selection Sidebar */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Rooms</h2>
              
              {availableRooms.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                  <p className="text-gray-600">No rooms available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedRoom === room.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-400'
                      }`}
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">Room {room.roomNumber}</h3>
                          <p className="text-sm text-gray-600">{room.type}</p>
                          <p className="text-sm text-gray-600">Capacity: {room.capacity} guests</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600">${room.pricePerNight}</p>
                          <p className="text-xs text-gray-500">/ night</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!selectedRoom || availableRooms.length === 0}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isAuthenticated ? 'Sign in to Book' : !selectedRoom ? 'Select a Room' : 'Book Now'}
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Please sign in to book a room
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && hotel && (
        <BookingModal
          hotel={hotel}
          roomId={selectedRoom}
          user={user}
          isAuthenticated={isAuthenticated}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            fetchHotel();
          }}
        />
      )}
    </div>
  );
}

// Booking Modal Component
function BookingModal({ hotel, roomId, user, isAuthenticated, onClose, onSuccess }: any) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const room = hotel.rooms?.find((r: any) => r.id === roomId);
  
  const nights = checkIn && checkOut 
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalPrice = room ? room.pricePerNight * nights : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login first');
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId,
          checkInDate: new Date(checkIn).toISOString(),
          checkOutDate: new Date(checkOut).toISOString(),
          totalPrice,
          guestName: user?.name || 'Guest',
          guestEmail: user?.email || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      alert('🎉 Booking confirmed successfully!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Please Login</h3>
          <p className="text-gray-600 mb-6">You need to be logged in to book a room.</p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <Link
              href="/admin/login"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Booking</h2>
        <p className="text-gray-600 mb-4">
          {hotel?.name} - Room {room?.roomNumber}
        </p>

        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4 flex items-center">
          <UserIcon className="h-4 w-4 mr-2" />
          Booking as: {user.name || user.email || 'User'}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {nights > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nights</span>
                <span className="font-medium">{nights}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per night</span>
                <span className="font-medium">${room?.pricePerNight}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">${totalPrice}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || nights === 0}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}