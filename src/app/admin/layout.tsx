// src/app/admin/layout.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboardIcon,
  HotelIcon,
  BedIcon,
  CalendarIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  XIcon
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboardIcon },
  { name: 'Hotels', href: '/admin/hotels', icon: HotelIcon },
  { name: 'Rooms', href: '/admin/rooms', icon: BedIcon },
  { name: 'Bookings', href: '/admin/bookings', icon: CalendarIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use localStorage (not sessionStorage)
        const token = localStorage.getItem('token');
        
        console.log('🔍 Admin Layout - Token:', token ? token.substring(0, 30) + '...' : 'No token');
        
        if (!token) {
          console.log('❌ No token found, redirecting to login');
          router.push('/admin/login');
          return;
        }

        const response = await fetch('/api/auth/check', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.log('❌ Auth check failed:', response.status);
          localStorage.removeItem('token');
          router.push('/admin/login');
          return;
        }

        const data = await response.json();
        console.log('✅ Auth check successful:', data.user?.email);
        
        if (data.user?.role !== 'ADMIN') {
          console.log('❌ User is not admin:', data.user?.role);
          localStorage.removeItem('token');
          router.push('/admin/login');
          return;
        }

        setUser(data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        localStorage.removeItem('token');
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-40 flex">
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-300 ease-in-out`}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-bold text-gray-800">Hotel Admin</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOutIcon className="h-5 w-5 mr-3" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white shadow-lg">
          <div className="flex items-center justify-center h-16 border-b">
            <h1 className="text-xl font-bold text-gray-800">🏨 Hotel Admin</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOutIcon className="h-5 w-5 mr-3" />
              Logout
            </button>
          </nav>
          <div className="p-4 border-t">
            <p className="text-sm text-gray-600">{user?.email}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="lg:hidden">
          <div className="bg-white shadow-sm">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-bold text-gray-800">Hotel Admin</h1>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}