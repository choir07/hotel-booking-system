// src/app/admin/rooms/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, HotelIcon, BedIcon } from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  isAvailable: boolean;
  hotel: {
    name: string;
    city: string;
  };
  _count?: {
    bookings: number;
  };
}

export default function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/rooms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      fetchRooms();
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (filter === 'available') return room.isAvailable;
    if (filter === 'unavailable') return !room.isAvailable;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-600">Manage all rooms across your hotels</p>
        </div>
        <button
          onClick={() => {
            setEditingRoom(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        {['all', 'available', 'unavailable'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Room {room.roomNumber}
                  </h3>
                  <p className="text-sm text-gray-600">{room.hotel?.name || 'Unknown Hotel'}</p>
                  <p className="text-xs text-gray-500">{room.hotel?.city || ''}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  room.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {room.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{room.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{room.capacity} guests</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-blue-600">${room.pricePerNight}/night</span>
                </div>
                {room._count && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Bookings:</span>
                    <span className="font-medium">{room._count.bookings}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => toggleAvailability(room.id, room.isAvailable)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    room.isAvailable
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {room.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button
                  onClick={() => {
                    setEditingRoom(room);
                    setShowModal(true);
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <BedIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No rooms found</p>
        </div>
      )}

      {/* Room Modal */}
      {showModal && (
        <RoomModal
          room={editingRoom}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchRooms();
          }}
        />
      )}
    </div>
  );
}

// Room Modal Component
function RoomModal({ room, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    roomNumber: room?.roomNumber || '',
    type: room?.type || 'STANDARD',
    pricePerNight: room?.pricePerNight || '',
    capacity: room?.capacity || '',
    hotelId: room?.hotelId || '',
    isAvailable: room?.isAvailable ?? true,
  });
  const [hotels, setHotels] = useState<any[]>([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/hotels', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setHotels(data);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      }
    };
    fetchHotels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = room 
        ? `/api/admin/rooms/${room.id}`
        : '/api/admin/rooms';
      
      await fetch(url, {
        method: room ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          pricePerNight: parseFloat(formData.pricePerNight),
          capacity: parseInt(formData.capacity),
        })
      });
      onSave();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {room ? 'Edit Room' : 'Add New Room'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotel
              </label>
              <select
                required
                value={formData.hotelId}
                onChange={(e) => setFormData({...formData, hotelId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name} - {hotel.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number
              </label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="STANDARD">Standard</option>
                <option value="DELUXE">Deluxe</option>
                <option value="SUITE">Suite</option>
                <option value="DOUBLE">Double</option>
                <option value="SINGLE">Single</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Per Night ($)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (Guests)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Available for booking
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {room ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}