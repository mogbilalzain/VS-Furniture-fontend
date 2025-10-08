'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { authStorage } from '../../../lib/localStorage-utils';
import apiClient, { authAPI, productsAPI } from '../../../lib/api';

export default function DebugAuth() {
  const { user, isAuthenticated, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = () => {
    const token = authStorage.getToken();
    const userData = authStorage.getUserData();
    const isAdmin = authStorage.isAuthenticatedAdmin();
    
    setDebugInfo({
      token: token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
      userData: userData,
      isAdmin: isAdmin,
      localStorageKeys: typeof window !== 'undefined' ? Object.keys(localStorage) : [],
      authToken: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
      userRole: typeof window !== 'undefined' ? localStorage.getItem('user_role') : null,
    });
  };

  const testAuthEndpoint = async () => {
    setTestResults(prev => ({ ...prev, profile: 'Loading...' }));
    
    try {
      const response = await authAPI.profile();
      setTestResults(prev => ({ 
        ...prev, 
        profile: `Success: ${JSON.stringify(response, null, 2)}` 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        profile: `Error: ${error.message}` 
      }));
    }
  };

  const testAdminEndpoint = async () => {
    setTestResults(prev => ({ ...prev, adminProducts: 'Loading...' }));
    
    try {
      const response = await productsAPI.getAdminAll({ limit: 1 });
      setTestResults(prev => ({ 
        ...prev, 
        adminProducts: `Success: ${JSON.stringify(response, null, 2)}` 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        adminProducts: `Error: ${error.message}` 
      }));
    }
  };

  const refreshToken = () => {
    loadDebugInfo();
    console.log('🔄 Debug info refreshed');
  };

  const clearAuth = () => {
    authStorage.clearAuth();
    loadDebugInfo();
    console.log('🗑️ Auth cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Authentication Debug Panel</h1>
          
          {/* Auth Context State */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Auth Context State</h2>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm">
              <div>Loading: {loading ? 'true' : 'false'}</div>
              <div>Is Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
              <div>User: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Storage Debug Info</h2>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </div>
            <button 
              onClick={refreshToken}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh Info
            </button>
            <button 
              onClick={clearAuth}
              className="mt-2 ml-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Auth
            </button>
          </div>

          {/* API Client Debug */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">API Client Debug</h2>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm">
              <div>Current Token: {apiClient.getToken() ? apiClient.getToken().substring(0, 20) + '...' : 'null'}</div>
              <div>Base URL: {apiClient.baseURL}</div>
            </div>
          </div>

          {/* Test Endpoints */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Test API Endpoints</h2>
            
            <div className="space-y-4">
              <div>
                <button 
                  onClick={testAuthEndpoint}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-4"
                >
                  Test Auth Profile
                </button>
                {testResults.profile && (
                  <div className="mt-2 bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap">
                    {testResults.profile}
                  </div>
                )}
              </div>

              <div>
                <button 
                  onClick={testAdminEndpoint}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mr-4"
                >
                  Test Admin Products
                </button>
                {testResults.adminProducts && (
                  <div className="mt-2 bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap">
                    {testResults.adminProducts}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Console Logs */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Console Output</h2>
            <p className="text-gray-600">Check browser console (F12) for detailed API request logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}