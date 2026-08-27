// src/app/admin/test/page.tsx

'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<any>(null);
  const [loginStatus, setLoginStatus] = useState<string>('Not checked');

  useEffect(() => {
    // Check if token exists
    const t = localStorage.getItem('token');
    setToken(t);
    
    if (t) {
      try {
        const parts = t.split('.');
        const payload = JSON.parse(atob(parts[1]));
        setDecoded(payload);
        setLoginStatus('✅ Token found');
      } catch (e) {
        setLoginStatus('❌ Invalid token format');
      }
    } else {
      setLoginStatus('❌ No token found in localStorage');
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@hotel.com',
          password: 'admin123'
        }),
      });

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setLoginStatus('✅ Login successful! Token saved.');
        window.location.reload();
      } else {
        setLoginStatus('❌ Login failed: No token received');
      }
    } catch (error) {
      setLoginStatus('❌ Login error: ' + error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 Token Test Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-2">Status:</h2>
        <div className={`p-2 rounded ${loginStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {loginStatus}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-2">Token in localStorage:</h2>
        <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
          {token || 'No token found'}
        </pre>
      </div>

      {decoded && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold mb-2">Decoded Token:</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
            {JSON.stringify(decoded, null, 2)}
          </pre>
        </div>
      )}

      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Test Login
      </button>
    </div>
  );
}