'use client';

import React, { useState, useEffect } from 'react';
import { authStorage } from '../../lib/localStorage-utils';
import { ENV_CONFIG } from '../../environment';

export default function TestTokenFixPage() {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get debug info on page load
    const info = authStorage.getDebugInfo();
    setDebugInfo(info);
    console.log('🔍 Auth Debug Info:', info);
  }, []);

  const testContactAPI = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Check authentication
      const isAuth = authStorage.isAuthenticatedAdmin();
      results.isAuthenticated = { success: isAuth, message: isAuth ? 'User is authenticated admin' : 'User is NOT authenticated admin' };

      // Test 2: Get token
      const token = authStorage.getToken();
      results.getToken = { success: !!token, message: token ? `Token found: ${token.substring(0, 20)}...` : 'No token found' };

      if (token) {
        // Test 3: Test unread count API
        try {
          const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/unread-count`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();
          results.unreadCount = { 
            success: response.ok && data.success, 
            message: response.ok ? `Unread count: ${data.data?.count || 0}` : `API Error: ${data.message || 'Unknown error'}`,
            status: response.status
          };
        } catch (err) {
          results.unreadCount = { success: false, message: `Network Error: ${err.message}` };
        }

        // Test 4: Test contact list API
        try {
          const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact?limit=1`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();
          results.contactList = { 
            success: response.ok && data.success, 
            message: response.ok ? `Contact list: ${data.data?.data?.length || 0} messages` : `API Error: ${data.message || 'Unknown error'}`,
            status: response.status
          };
        } catch (err) {
          results.contactList = { success: false, message: `Network Error: ${err.message}` };
        }
      }

    } catch (error) {
      results.error = { success: false, message: `Test Error: ${error.message}` };
    }

    setTestResults(results);
    setLoading(false);
  };

  const clearAndReload = () => {
    // Clear all auth data
    authStorage.clearAuth();
    // Reload page
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔧 Token Fix Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">📊 Current Auth Status</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Has Token:</strong> <span className={debugInfo.hasToken ? 'text-green-600' : 'text-red-600'}>{debugInfo.hasToken ? '✅ Yes' : '❌ No'}</span></p>
          <p><strong>Role:</strong> <span className={debugInfo.role === 'admin' ? 'text-green-600' : 'text-red-600'}>{debugInfo.role || 'None'}</span></p>
          <p><strong>Is Authenticated:</strong> <span className={debugInfo.isAuthenticated ? 'text-green-600' : 'text-red-600'}>{debugInfo.isAuthenticated ? '✅ Yes' : '❌ No'}</span></p>
          <p><strong>Is Admin:</strong> <span className={debugInfo.isAdmin ? 'text-green-600' : 'text-red-600'}>{debugInfo.isAdmin ? '✅ Yes' : '❌ No'}</span></p>
          <p><strong>Login Time:</strong> {debugInfo.loginTime || 'None'}</p>
          <p><strong>Session Expired:</strong> <span className={debugInfo.sessionExpired ? 'text-red-600' : 'text-green-600'}>{debugInfo.sessionExpired ? '❌ Yes' : '✅ No'}</span></p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">🧪 API Tests</h2>
        <button
          onClick={testContactAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
        >
          {loading ? 'Testing...' : 'Run API Tests'}
        </button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-3">
            {Object.entries(testResults).map(([key, result]) => (
              <div key={key} className={`p-3 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold">{key}:</h3>
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>{result.message}</p>
                {result.status && <p className="text-gray-600 text-sm">Status: {result.status}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">🔄 Actions</h2>
        <div className="space-x-4">
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Go to Admin Login
          </button>
          <button
            onClick={() => window.location.href = '/admin/contact-messages'}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Go to Contact Messages
          </button>
          <button
            onClick={clearAndReload}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Auth & Reload
          </button>
        </div>
      </div>
    </div>
  );
}
