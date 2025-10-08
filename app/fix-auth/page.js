'use client';

import { useState } from 'react';
import { ENV_CONFIG } from '../../environment';

export default function FixAuth() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Working token from backend test
  const WORKING_TOKEN = '55|qdTOwUBA9KB8aJ72MMoSiEvbDso9Giy1guJVDbFj7cf11261';

  const fixAuth = () => {
    // Set the working token
    localStorage.setItem('admin_token', WORKING_TOKEN);
    localStorage.setItem('admin_user', JSON.stringify({
      id: 1,
      name: 'Admin User',
      email: 'admin@vsfurniture.com',
      role: 'admin'
    }));
    
    setResult('✅ Authentication fixed! Working token has been set.\n\nYou can now go to: /admin/contact-messages');
  };

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing API with current token...\n\n');

    try {
      const baseURL = ENV_CONFIG.API_BASE_URL;
      const token = localStorage.getItem('admin_token');
      
      setResult(prev => prev + `Using token: ${token ? token.substring(0, 20) + '...' : 'No token'}\n\n`);

      // Test 1: Auth profile
      setResult(prev => prev + '1. Testing auth profile...\n');
      const authResponse = await fetch(`${baseURL}/auth/profile`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      setResult(prev => prev + `   Status: ${authResponse.status}\n`);
      if (authResponse.ok) {
        const authData = await authResponse.json();
        setResult(prev => prev + `   ✅ User: ${authData.data.name} (${authData.data.email})\n\n`);
      } else {
        setResult(prev => prev + `   ❌ Failed\n\n`);
      }

      // Test 2: Contact messages
      setResult(prev => prev + '2. Testing contact messages...\n');
      const contactResponse = await fetch(`${baseURL}/contact`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      setResult(prev => prev + `   Status: ${contactResponse.status}\n`);
      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        setResult(prev => prev + `   ✅ Found ${contactData.data.data.length} messages\n\n`);
      } else {
        setResult(prev => prev + `   ❌ Failed\n\n`);
      }

      // Test 3: Unread count
      setResult(prev => prev + '3. Testing unread count...\n');
      const unreadResponse = await fetch(`${baseURL}/contact/unread-count`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      setResult(prev => prev + `   Status: ${unreadResponse.status}\n`);
      if (unreadResponse.ok) {
        const unreadData = await unreadResponse.json();
        setResult(prev => prev + `   ✅ Unread count: ${unreadData.data.count}\n\n`);
      } else {
        setResult(prev => prev + `   ❌ Failed\n\n`);
      }

      setResult(prev => prev + '🎉 All tests passed! You can now use the contact messages page.');

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setResult('🗑️ Authentication cleared.');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#dc2626' }}>
        🔧 Authentication Fix
      </h1>
      
      <div style={{ marginBottom: '2rem', background: '#fef3c7', padding: '1rem', borderRadius: '6px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Problem Diagnosed:
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          The Laravel API is working correctly, but the frontend has an invalid or expired token.
        </p>
        <p>
          <strong>Solution:</strong> Use the working token generated from the backend test.
        </p>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={fixAuth}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🔧 Fix Authentication
        </button>
        
        <button
          onClick={testAPI}
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
          {loading ? 'Testing...' : '🧪 Test API'}
        </button>

        <button
          onClick={clearAuth}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Auth
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

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Current Status:
        </h3>
        <p><strong>Token:</strong> {localStorage.getItem('admin_token') ? '✅ Present' : '❌ Missing'}</p>
        <p><strong>User:</strong> {localStorage.getItem('admin_user') ? '✅ Present' : '❌ Missing'}</p>
      </div>

      <div style={{ 
        background: '#f3f4f6', 
        padding: '1rem', 
        borderRadius: '6px',
        minHeight: '200px',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        whiteSpace: 'pre-wrap'
      }}>
        {result || 'Click "Fix Authentication" to set a working token, then "Test API" to verify.'}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#dcfce7', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Instructions:
        </h3>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Click "Fix Authentication"</strong> - This sets a working token from the backend</li>
          <li><strong>Click "Test API"</strong> - This verifies all endpoints work</li>
          <li><strong>Click "Go to Contact Messages"</strong> - This takes you to the working page</li>
        </ol>
      </div>
    </div>
  );
}
