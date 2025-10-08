'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { authStorage } from '../../lib/localStorage-utils';
import { apiClient } from '../../lib/api';

export default function DebugAdminAuth() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const { user, isAuthenticated, isLoading } = useAuth();

  const refreshDebugInfo = () => {
    const info = {
      // From authStorage
      authStorage: authStorage.getDebugInfo(),
      // From auth context
      authContext: {
        user,
        isAuthenticated,
        isLoading,
        userRole: user?.role
      },
      // From apiClient
      apiClient: {
        hasToken: !!apiClient.token,
        tokenPreview: apiClient.token ? apiClient.token.substring(0, 30) + '...' : 'null'
      },
      // From localStorage directly
      localStorage: {
        auth_token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : 'N/A',
        user_role: typeof window !== 'undefined' ? localStorage.getItem('user_role') : 'N/A',
        user_data: typeof window !== 'undefined' ? localStorage.getItem('user_data') : 'N/A',
        login_time: typeof window !== 'undefined' ? localStorage.getItem('login_time') : 'N/A'
      },
      // Tests
      tests: {
        isAuthenticated: authStorage.isAuthenticated(),
        isAdmin: authStorage.isAdmin(),
        isAuthenticatedAdmin: authStorage.isAuthenticatedAdmin()
      },
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo(info);
    console.log('🔍 Debug Auth Info:', info);
  };

  useEffect(() => {
    refreshDebugInfo();
  }, [user, isAuthenticated, isLoading, refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    refreshDebugInfo();
  };

  const handleClearAuth = () => {
    authStorage.clearAuth();
    apiClient.setToken(null);
    alert('Auth data cleared! Refresh to see changes.');
    refreshDebugInfo();
  };

  const testAdminAPI = async () => {
    try {
      console.log('🔍 Testing admin API call...');
      const response = await fetch('http://localhost:8000/api/admin/products', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.token}`
        }
      });
      
      console.log('📡 API Response:', response.status, response.statusText);
      const data = await response.json();
      console.log('📄 API Data:', data);
      
      alert(`API Test Result: ${response.status} - ${response.ok ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error('❌ API Test Error:', error);
      alert(`API Test Error: ${error.message}`);
    }
  };

  if (!debugInfo) {
    return <div className="p-8">Loading debug info...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex-1">Admin Auth Debug</h1>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleClearAuth}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            🗑️ Clear Auth
          </button>
          <button
            onClick={testAdminAPI}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            🧪 Test Admin API
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auth Storage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Auth Storage</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Has Token:</strong> <span className={debugInfo.authStorage.hasToken ? 'text-green-600' : 'text-red-600'}>{debugInfo.authStorage.hasToken ? 'Yes' : 'No'}</span></div>
              <div><strong>Role:</strong> <span className="font-mono">{debugInfo.authStorage.role || 'null'}</span></div>
              <div><strong>Is Authenticated:</strong> <span className={debugInfo.authStorage.isAuthenticated ? 'text-green-600' : 'text-red-600'}>{debugInfo.authStorage.isAuthenticated ? 'Yes' : 'No'}</span></div>
              <div><strong>Is Admin:</strong> <span className={debugInfo.authStorage.isAdmin ? 'text-green-600' : 'text-red-600'}>{debugInfo.authStorage.isAdmin ? 'Yes' : 'No'}</span></div>
              <div><strong>Login Time:</strong> <span className="font-mono text-xs">{debugInfo.authStorage.loginTime || 'null'}</span></div>
              <div><strong>Session Expired:</strong> <span className={debugInfo.authStorage.sessionExpired ? 'text-red-600' : 'text-green-600'}>{debugInfo.authStorage.sessionExpired ? 'Yes' : 'No'}</span></div>
            </div>
          </div>

          {/* Auth Context */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Auth Context</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Is Authenticated:</strong> <span className={debugInfo.authContext.isAuthenticated ? 'text-green-600' : 'text-red-600'}>{debugInfo.authContext.isAuthenticated ? 'Yes' : 'No'}</span></div>
              <div><strong>Is Loading:</strong> <span className={debugInfo.authContext.isLoading ? 'text-yellow-600' : 'text-green-600'}>{debugInfo.authContext.isLoading ? 'Yes' : 'No'}</span></div>
              <div><strong>User Role:</strong> <span className="font-mono">{debugInfo.authContext.userRole || 'null'}</span></div>
              <div><strong>User Object:</strong></div>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(debugInfo.authContext.user, null, 2)}
              </pre>
            </div>
          </div>

          {/* API Client */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">API Client</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Has Token:</strong> <span className={debugInfo.apiClient.hasToken ? 'text-green-600' : 'text-red-600'}>{debugInfo.apiClient.hasToken ? 'Yes' : 'No'}</span></div>
              <div><strong>Token Preview:</strong> <span className="font-mono text-xs">{debugInfo.apiClient.tokenPreview}</span></div>
            </div>
          </div>

          {/* localStorage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">localStorage</h2>
            <div className="space-y-2 text-sm">
              <div><strong>auth_token:</strong> <span className="font-mono text-xs">{debugInfo.localStorage.auth_token ? debugInfo.localStorage.auth_token.substring(0, 30) + '...' : 'null'}</span></div>
              <div><strong>user_role:</strong> <span className="font-mono">{debugInfo.localStorage.user_role || 'null'}</span></div>
              <div><strong>user_data:</strong></div>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-24">
                {debugInfo.localStorage.user_data || 'null'}
              </pre>
              <div><strong>login_time:</strong> <span className="font-mono text-xs">{debugInfo.localStorage.login_time || 'null'}</span></div>
            </div>
          </div>

          {/* Tests */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Test Results</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">isAuthenticated()</div>
                <div className={`text-2xl ${debugInfo.tests.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {debugInfo.tests.isAuthenticated ? '✅' : '❌'}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">isAdmin()</div>
                <div className={`text-2xl ${debugInfo.tests.isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                  {debugInfo.tests.isAdmin ? '✅' : '❌'}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">isAuthenticatedAdmin()</div>
                <div className={`text-2xl ${debugInfo.tests.isAuthenticatedAdmin ? 'text-green-600' : 'text-red-600'}`}>
                  {debugInfo.tests.isAuthenticatedAdmin ? '✅' : '❌'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <div className="text-xs text-gray-600">
            Last updated: {debugInfo.timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}
