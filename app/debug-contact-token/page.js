'use client';

import { useState, useEffect } from 'react';
import { ENV_CONFIG } from '../../environment';

export default function DebugContactToken() {
  const [tokenInfo, setTokenInfo] = useState({});
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = () => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    setTokenInfo({
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'No token',
      hasUser: !!user,
      userInfo: user ? JSON.parse(user) : null,
      timestamp: new Date().toISOString()
    });
  };

  const testContactAPI = async () => {
    setLoading(true);
    setTestResult('Testing Contact API...\n\n');

    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setTestResult(prev => prev + '❌ No token found!\n');
        return;
      }

      setTestResult(prev => prev + `✅ Token found: ${token.substring(0, 30)}...\n\n`);

      const baseURL = ENV_CONFIG.API_BASE_URL;
      
      // Test the exact same request as the contact messages page
      const params = new URLSearchParams({
        page: '1',
        limit: '10'
      });

      setTestResult(prev => prev + `🔍 Testing: ${baseURL}/contact?${params}\n`);
      setTestResult(prev => prev + `🔍 Headers: Authorization: Bearer ${token.substring(0, 20)}...\n\n`);

      const response = await fetch(`${baseURL}/contact?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setTestResult(prev => prev + `📡 Response Status: ${response.status}\n`);
      setTestResult(prev => prev + `📡 Response OK: ${response.ok}\n\n`);

      if (response.ok) {
        const data = await response.json();
        setTestResult(prev => prev + `✅ Success! Found ${data.data?.data?.length || 0} messages\n`);
        setTestResult(prev => prev + `📊 Response: ${JSON.stringify(data, null, 2)}\n`);
      } else {
        const errorText = await response.text();
        setTestResult(prev => prev + `❌ Error Response: ${errorText}\n`);
      }

    } catch (error) {
      setTestResult(prev => prev + `❌ Network Error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const setWorkingToken = () => {
    // Use the working token from our previous test
    const workingToken = '55|qdTOwUBA9KB8aJ72MMoSiEvbDso9Giy1guJVDbFj7cf11261';
    localStorage.setItem('admin_token', workingToken);
    localStorage.setItem('admin_user', JSON.stringify({
      id: 1,
      name: 'Admin User',
      email: 'admin@vsfurniture.com',
      role: 'admin'
    }));
    checkToken();
    setTestResult('✅ Working token set! Now test the API.\n');
  };

  const clearToken = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    checkToken();
    setTestResult('🗑️ Token cleared.\n');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        🔍 Contact Messages Token Debug
      </h1>

      {/* Token Status */}
      <div style={{ marginBottom: '2rem', background: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Current Token Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p><strong>Has Token:</strong> {tokenInfo.hasToken ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Token Length:</strong> {tokenInfo.tokenLength}</p>
            <p><strong>Token Preview:</strong> {tokenInfo.tokenPreview}</p>
            <p><strong>Last Check:</strong> {tokenInfo.timestamp}</p>
          </div>
          <div>
            <p><strong>Has User Info:</strong> {tokenInfo.hasUser ? '✅ Yes' : '❌ No'}</p>
            {tokenInfo.userInfo && (
              <div>
                <p><strong>User:</strong> {tokenInfo.userInfo.name}</p>
                <p><strong>Email:</strong> {tokenInfo.userInfo.email}</p>
                <p><strong>Role:</strong> {tokenInfo.userInfo.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={checkToken}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Token Info
        </button>

        <button
          onClick={setWorkingToken}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          ✅ Set Working Token
        </button>
        
        <button
          onClick={testContactAPI}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : '🧪 Test Contact API'}
        </button>

        <button
          onClick={clearToken}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Token
        </button>

        <button
          onClick={() => window.location.href = '/admin/contact-messages'}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          📧 Go to Contact Messages
        </button>
      </div>

      {/* Test Results */}
      <div style={{ 
        background: '#f3f4f6', 
        padding: '1rem', 
        borderRadius: '6px',
        minHeight: '300px',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        whiteSpace: 'pre-wrap'
      }}>
        {testResult || 'Click "Set Working Token" first, then "Test Contact API" to debug the issue.'}
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Debug Steps:
        </h3>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Check if token exists and is valid</li>
          <li>Set a working token if needed</li>
          <li>Test the exact API call that Contact Messages page makes</li>
          <li>Compare results with working pages</li>
          <li>Go to Contact Messages page to verify fix</li>
        </ol>
      </div>
    </div>
  );
}
