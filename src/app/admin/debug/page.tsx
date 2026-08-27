// src/app/admin/debug/page.tsx

'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);

      if (!storedToken) {
        setError('No token found in localStorage');
        return;
      }

      try {
        const response = await fetch('/api/auth/check', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
        } else {
          setError(data.error || 'Authentication failed');
        }
      } catch (err) {
        setError('Failed to check authentication');
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="font-semibold">Token:</h2>
        <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto">
          {token || 'No token found'}
        </pre>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="font-semibold">User:</h2>
        <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto">
          {user ? JSON.stringify(user, null, 2) : 'No user found'}
        </pre>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          <h2 className="font-semibold">Error:</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}