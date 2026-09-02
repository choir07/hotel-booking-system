// src/app/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  MapPin, 
  Star, 
  HotelIcon,
  Wifi,
  Coffee,
  Car,
  Utensils,
  Dumbbell,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Heart,
  Menu,
  X,
  ChevronRight,
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
  }[];
}

export default function HomePage() {
  // Get auth from context
  const { user, isAuthenticated, logout } = useAuth();
  
  // Component state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/hotels');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setHotels(data);
      } else {
        setHotels([]);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError('Failed to load hotels. Please try again later.');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hotel.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || hotel.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const cities = Array.from(new Set(hotels.map(h => h.city).filter(Boolean)));

  const getCheapestRoom = (hotel: Hotel) => {
    if (!hotel.rooms || hotel.rooms.length === 0) return null;
    const available = hotel.rooms.filter(r => r.isAvailable);
    if (available.length === 0) return null;
    return Math.min(...available.map(r => r.pricePerNight));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchHotels}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                🏨 HotelBook
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="#hotels" className="text-gray-700 hover:text-blue-600 transition-colors">
                Hotels
              </Link>
              <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {user?.name || 'User'}</span>
                  {user?.role === 'ADMIN' && (
                    <Link 
                      href="/admin" 
                      className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <Link href="/" className="block text-gray-700 hover:text-blue-600">Home</Link>
              <Link href="#hotels" className="block text-gray-700 hover:text-blue-600">Hotels</Link>
              <Link href="#features" className="block text-gray-700 hover:text-blue-600">Features</Link>
              {isAuthenticated ? (
                <>
                  <div className="text-sm text-gray-600">Welcome, {user?.name || 'User'}</div>
                  {user?.role === 'ADMIN' && (
                    <Link href="/admin" className="block text-purple-600">Admin Panel</Link>
                  )}
                  <button onClick={logout} className="block text-red-600">Logout</button>
                </>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover and book amazing hotels around the world. Best prices guaranteed.
            </p>
            
            <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search hotels, cities, or countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <button 
                  onClick={() => document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Search Hotels
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose HotelBook?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: CheckCircle, title: 'Best Price Guarantee', desc: 'We match any lower price' },
              { icon: Clock, title: 'Instant Booking', desc: 'Confirm your stay in seconds' },
              { icon: Shield, title: 'Secure Payments', desc: 'Your data is safe with us' },
              { icon: Heart, title: '24/7 Support', desc: 'We\'re here to help anytime' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hotels Grid */}
      <section id="hotels" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {hotels.length > 0 ? 'Featured Hotels' : 'No Hotels Found'}
            </h2>
            {cities.length > 0 && (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cities</option>
                {cities.map((city: string) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            )}
          </div>

          {filteredHotels.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <HotelIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {hotels.length === 0 ? 'No hotels available at the moment' : 'No hotels found matching your criteria'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHotels.map((hotel) => {
                const cheapestPrice = getCheapestRoom(hotel);
                const availableRooms = hotel.rooms?.filter(r => r.isAvailable).length || 0;
                
                return (
                  <div key={hotel.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative h-56 bg-gray-200">
                      {hotel.image ? (
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50">
                          <HotelIcon className="h-16 w-16 text-blue-300" />
                        </div>
                      )}
                      {hotel.rating && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 font-semibold">{hotel.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                      
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{hotel.city}, {hotel.country}</span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {hotel.description || 'Luxurious accommodation with amazing amenities.'}
                      </p>

                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.slice(0, 3).map((amenity, index) => {
                            const Icon = getAmenityIcon(amenity);
                            return (
                              <span key={index} className="flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                <Icon className="h-3 w-3 mr-1" />
                                {amenity}
                              </span>
                            );
                          })}
                          {hotel.amenities.length > 3 && (
                            <span className="text-xs text-gray-500">+{hotel.amenities.length - 3} more</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          {cheapestPrice ? (
                            <>
                              <span className="text-2xl font-bold text-blue-600">RM{cheapestPrice}</span>
                              <span className="text-gray-500 text-sm"> / night</span>
                              <div className="text-xs text-gray-500">
                                {availableRooms} rooms available
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-500">No rooms available</span>
                          )}
                        </div>
                        <Link
                          href={`/hotel/${hotel.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          Book Now
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Stay?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of happy travelers who found their perfect hotel with us.
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">🏨 HotelBook</h3>
              <p className="text-gray-400">Find and book the best hotels worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="#hotels" className="hover:text-white">Hotels</Link></li>
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2026 HotelBook. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={() => {
            setShowAuthModal(false);
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
}

// Auth Modal Component
function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password }
        : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-600 mb-6">
          {isLogin ? 'Sign in to book your stay' : 'Start your journey with us'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}