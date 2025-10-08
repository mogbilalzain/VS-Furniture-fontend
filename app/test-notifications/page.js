'use client';

import React, { useState } from 'react';
import { authStorage } from '../../lib/localStorage-utils';
import { ENV_CONFIG } from '../../environment';

export default function TestNotificationsPage() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testNotificationAPI = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Check authentication
      const isAuth = authStorage.isAuthenticatedAdmin();
      results.authentication = { 
        success: isAuth, 
        message: isAuth ? 'User is authenticated admin' : 'User is NOT authenticated admin' 
      };

      if (!isAuth) {
        results.warning = { 
          success: false, 
          message: 'Cannot test API without authentication. Please login as admin first.' 
        };
        setTestResults(results);
        setLoading(false);
        return;
      }

      // Test 2: Get token
      const token = authStorage.getToken();
      results.token = { 
        success: !!token, 
        message: token ? `Token found: ${token.substring(0, 20)}...` : 'No token found' 
      };

      if (token) {
        // Test 3: Test unread count API with timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/unread-count`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const data = await response.json();
          results.unreadCount = { 
            success: response.ok && data.success, 
            message: response.ok ? `Unread count: ${data.data?.count || 0}` : `API Error: ${data.message || 'Unknown error'}`,
            status: response.status,
            data: data
          };
        } catch (err) {
          if (err.name === 'AbortError') {
            results.unreadCount = { success: false, message: 'Request timed out (5 seconds)' };
          } else {
            results.unreadCount = { success: false, message: `Network Error: ${err.message}` };
          }
        }

        // Test 4: Test recent messages API
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/recent`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const data = await response.json();
          results.recentMessages = { 
            success: response.ok && data.success, 
            message: response.ok ? `Recent messages: ${data.data?.length || 0} messages` : `API Error: ${data.message || 'Unknown error'}`,
            status: response.status,
            data: data
          };
        } catch (err) {
          if (err.name === 'AbortError') {
            results.recentMessages = { success: false, message: 'Request timed out (5 seconds)' };
          } else {
            results.recentMessages = { success: false, message: `Network Error: ${err.message}` };
          }
        }
      }

    } catch (error) {
      results.error = { success: false, message: `Test Error: ${error.message}` };
    }

    setTestResults(results);
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults({});
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔔 Notifications API Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">🧪 Test Actions</h2>
        <div className="space-x-4">
          <button
            onClick={testNotificationAPI}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Notifications API'}
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Go to Admin Login
          </button>
          <button
            onClick={() => window.location.href = '/admin/dashboard'}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3 capitalize">
                {testName.replace(/([A-Z])/g, ' $1').trim()} Test
              </h3>
              
              <div className={`p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center mb-2">
                  <span className={`text-lg mr-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? '✅' : '❌'}
                  </span>
                  <span className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-2">{result.message}</p>
                
                {result.status && (
                  <p className="text-gray-600 text-sm mb-2">HTTP Status: {result.status}</p>
                )}
                
                {result.data && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Response Data
                    </summary>
                    <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">📋 Expected Behavior:</h3>
        <ul className="text-yellow-700 space-y-1 text-sm">
          <li>• <strong>Authentication:</strong> Should be authenticated as admin</li>
          <li>• <strong>Token:</strong> Should have valid auth token</li>
          <li>• <strong>Unread Count:</strong> Should return count or 401 if unauthorized</li>
          <li>• <strong>Recent Messages:</strong> Should return messages array or 401 if unauthorized</li>
          <li>• <strong>Timeout:</strong> Requests should complete within 5 seconds</li>
          <li>• <strong>No "Failed to fetch":</strong> Should not see network errors</li>
        </ul>
      </div>
    </div>
  );
}
