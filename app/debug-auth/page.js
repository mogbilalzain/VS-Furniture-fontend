'use client';

import { useState, useEffect } from 'react';
import { ENV_CONFIG } from '../../environment';

export default function DebugAuth() {
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({});

  useEffect(() => {
    // Get token info on load
    const token = localStorage.getItem('admin_token');
    const userInfo = localStorage.getItem('admin_user');
    
    setTokenInfo({
      token: token ? token.substring(0, 20) + '...' : 'No token',
      tokenLength: token ? token.length : 0,
      userInfo: userInfo ? JSON.parse(userInfo) : null,
      hasToken: !!token
    });
  }, []);

  const testAuth = async () => {
    setLoading(true);
    setResults('Testing authentication...\n\n');

    try {
      const baseURL = ENV_CONFIG.API_BASE_URL;
      const token = localStorage.getItem('admin_token');
      
      setResults(prev => prev + `Base URL: ${baseURL}\n`);
      setResults(prev => prev + `Token exists: ${!!token}\n`);
      setResults(prev => prev + `Token length: ${token ? token.length : 0}\n\n`);

      if (!token) {
        setResults(prev => prev + '❌ No token found. Please login first.\n');
        return;
      }

      // Test 1: Check auth profile
      setResults(prev => prev + '1. Testing auth profile...\n');
      
      const authResponse = await fetch(`${baseURL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setResults(prev => prev + `Auth status: ${authResponse.status}\n`);
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        setResults(prev => prev + `✅ Auth successful: ${JSON.stringify(authData, null, 2)}\n\n`);
      } else {
        const authError = await authResponse.text();
        setResults(prev => prev + `❌ Auth failed: ${authError}\n\n`);
      }

      // Test 2: Test contact endpoint
      setResults(prev => prev + '2. Testing contact endpoint...\n');
      
      const contactResponse = await fetch(`${baseURL}/contact`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setResults(prev => prev + `Contact status: ${contactResponse.status}\n`);
      
      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        setResults(prev => prev + `✅ Contact API successful: ${JSON.stringify(contactData, null, 2)}\n\n`);
      } else {
        const contactError = await contactResponse.text();
        setResults(prev => prev + `❌ Contact API failed: ${contactError}\n\n`);
      }

      // Test 3: Test unread count
      setResults(prev => prev + '3. Testing unread count...\n');
      
      const unreadResponse = await fetch(`${baseURL}/contact/unread-count`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setResults(prev => prev + `Unread count status: ${unreadResponse.status}\n`);
      
      if (unreadResponse.ok) {
        const unreadData = await unreadResponse.json();
        setResults(prev => prev + `✅ Unread count successful: ${JSON.stringify(unreadData, null, 2)}\n\n`);
      } else {
        const unreadError = await unreadResponse.text();
        setResults(prev => prev + `❌ Unread count failed: ${unreadError}\n\n`);
      }

    } catch (error) {
      setResults(prev => prev + `\n❌ Error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const loginFresh = async () => {
    setLoading(true);
    setResults('Attempting fresh login...\n\n');

    try {
      const baseURL = ENV_CONFIG.API_BASE_URL;
      
      // Clear existing tokens
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@vsfurniture.com',
          password: 'admin123'
        })
      });

      const data = await response.json();
      setResults(prev => prev + `Login response status: ${response.status}\n`);
      setResults(prev => prev + `Login response: ${JSON.stringify(data, null, 2)}\n\n`);

      if (response.ok && data.success) {
        localStorage.setItem('admin_token', data.data.token);
        if (data.data.user) {
          localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        }
        setResults(prev => prev + '✅ Login successful! Token saved.\n');
        
        // Update token info
        setTokenInfo({
          token: data.data.token.substring(0, 20) + '...',
          tokenLength: data.data.token.length,
          userInfo: data.data.user,
          hasToken: true
        });
      } else {
        setResults(prev => prev + '❌ Login failed.\n');
      }

    } catch (error) {
      setResults(prev => prev + `Login error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setTokenInfo({
      token: 'No token',
      tokenLength: 0,
      userInfo: null,
      hasToken: false
    });
    setResults('Tokens cleared.\n');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Authentication Debug
      </h1>
      
      {/* Current Status */}
      <div style={{ marginBottom: '2rem', background: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Current Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p><strong>Token:</strong> {tokenInfo.token}</p>
            <p><strong>Token Length:</strong> {tokenInfo.tokenLength}</p>
            <p><strong>Has Token:</strong> {tokenInfo.hasToken ? '✅' : '❌'}</p>
          </div>
          <div>
            <p><strong>User Info:</strong></p>
            <pre style={{ fontSize: '0.75rem', background: '#fff', padding: '0.5rem', borderRadius: '4px' }}>
              {tokenInfo.userInfo ? JSON.stringify(tokenInfo.userInfo, null, 2) : 'No user info'}
            </pre>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={loginFresh}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Fresh Login'}
        </button>
        
        <button
          onClick={testAuth}
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
          {loading ? 'Testing...' : 'Test Auth & API'}
        </button>

        <button
          onClick={clearTokens}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Clear Tokens
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
          Go to Contact Messages
        </button>
      </div>

      {/* Results */}
      <div style={{ 
        background: '#f3f4f6', 
        padding: '1rem', 
        borderRadius: '6px',
        minHeight: '300px',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        whiteSpace: 'pre-wrap'
      }}>
        {results || 'Click "Fresh Login" first, then "Test Auth & API" to see results...'}
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Instructions:
        </h3>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Click "Fresh Login" to get a new token</li>
          <li>Click "Test Auth & API" to verify everything works</li>
          <li>If successful, click "Go to Contact Messages"</li>
          <li>If still failing, check Laravel logs and server status</li>
        </ol>
      </div>
    </div>
  );
}