'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../../lib/api';
import { authStorage } from '../../../lib/localStorage-utils';

export default function AdminReLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@vs.com');
  const [password, setPassword] = useState('password');
  const [debugInfo, setDebugInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Attempting admin login...');
      setDebugInfo('Attempting login...');
      
      const response = await authAPI.login({
        email: email,
        password: password
      });
      
      console.log('📥 Login response:', response);
      setDebugInfo(`Response: ${JSON.stringify(response, null, 2)}`);
      
      if (response.success) {
        console.log('✅ Login successful!');
        alert('✅ Login successful! Redirecting to admin dashboard...');
        router.push('/admin/products');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const clearAuthAndRetry = () => {
    authStorage.clearAuth();
    console.log('🗑️ Auth data cleared');
    alert('Auth data cleared. Try logging in again.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Re-Login</h1>
        
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded text-sm">
          <p className="font-semibold">Session Expired</p>
          <p>Your authentication session has expired. Please login again to continue.</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={clearAuthAndRetry}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Clear Auth Data & Retry
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={() => router.push('/admin/debug-auth')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Debug Authentication
          </button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            {debugInfo}
          </div>
        )}
      </div>
    </div>
  );
}