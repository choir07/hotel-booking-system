// src/app/admin/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { SaveIcon, RefreshCwIcon, ShieldIcon, BellIcon, DatabaseIcon } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState({
    siteName: 'Hotel Booking System',
    siteEmail: 'admin@hotel.com',
    currency: 'MYR',
    timezone: 'UTC',
    bookingCancellationDays: 7,
  });

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings?')) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Simulate resetting settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Settings reset successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset settings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your hotel booking system settings</p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Email
              </label>
              <input
                type="email"
                value={settings.siteEmail}
                onChange={(e) => setSettings({...settings, siteEmail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MYR">MYR (RM)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancellation Policy (Days)
              </label>
              <input
                type="number"
                value={settings.bookingCancellationDays}
                onChange={(e) => setSettings({...settings, bookingCancellationDays: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of days before check-in to allow free cancellation
              </p>
            </div>
            <div className="flex items-center space-x-4 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <DatabaseIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Database</p>
                <p className="font-medium">PostgreSQL</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <ShieldIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Authentication</p>
                <p className="font-medium">JWT + bcrypt</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <BellIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Version</p>
                <p className="font-medium">1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
