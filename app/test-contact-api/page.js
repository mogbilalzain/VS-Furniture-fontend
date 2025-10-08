'use client';

import { useState } from 'react';
import { ENV_CONFIG } from '../../environment';

export default function TestContactAPI() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      const baseURL = ENV_CONFIG.API_BASE_URL;
      const token = localStorage.getItem('admin_token');
      
      console.log('Base URL:', baseURL);
      console.log('Token exists:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');

      // Test 1: Check server
      setResult(prev => prev + '\n\n1. Testing server connection...');
      
      const serverResponse = await fetch(`${baseURL}/`);
      setResult(prev => prev + `\nServer status: ${serverResponse.status}`);

      // Test 2: Test contact messages endpoint
      setResult(prev => prev + '\n\n2. Testing contact messages endpoint...');
      
      const contactResponse = await fetch(`${baseURL}/admin/contact`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setResult(prev => prev + `\nContact API status: ${contactResponse.status}`);
      
      const contactData = await contactResponse.json();
      setResult(prev => prev + `\nContact API response: ${JSON.stringify(contactData, null, 2)}`);

      // Test 3: Test auth endpoint
      setResult(prev => prev + '\n\n3. Testing auth endpoint...');
      
      const authResponse = await fetch(`${baseURL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setResult(prev => prev + `\nAuth status: ${authResponse.status}`);
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        setResult(prev => prev + `\nAuth response: ${JSON.stringify(authData, null, 2)}`);
      } else {
        const authError = await authResponse.text();
        setResult(prev => prev + `\nAuth error: ${authError}`);
      }

    } catch (error) {
      setResult(prev => prev + `\n\nError: ${error.message}`);
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = async () => {
    setLoading(true);
    setResult('Attempting admin login...');

    try {
      const baseURL = ENV_CONFIG.API_BASE_URL;
      
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@admin.com',
          password: 'admin123'
        })
      });

      const data = await response.json();
      setResult(prev => prev + `\nLogin response: ${JSON.stringify(data, null, 2)}`);

      if (response.ok && data.success) {
        localStorage.setItem('admin_token', data.data.token);
        setResult(prev => prev + '\n✅ Login successful! Token saved.');
      } else {
        setResult(prev => prev + '\n❌ Login failed.');
      }

    } catch (error) {
      setResult(prev => prev + `\nLogin error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Contact API Test
      </h1>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={loginAsAdmin}
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
          {loading ? 'Loading...' : 'Login as Admin'}
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
          {loading ? 'Testing...' : 'Test API'}
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('admin_token');
            setResult('Token cleared.');
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Clear Token
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Current Status:</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>API URL: {ENV_CONFIG.API_BASE_URL}</li>
          <li>Token: {localStorage.getItem('admin_token') ? '✅ Present' : '❌ Missing'}</li>
        </ul>
      </div>

      <div style={{ 
        background: '#f3f4f6', 
        padding: '1rem', 
        borderRadius: '6px',
        minHeight: '300px',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        whiteSpace: 'pre-wrap'
      }}>
        {result || 'Click "Login as Admin" first, then "Test API" to see results...'}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Instructions:
        </h3>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>First click "Login as Admin" to authenticate</li>
          <li>Then click "Test API" to test the contact messages endpoint</li>
          <li>Check the results to see what's happening</li>
          <li>Make sure Laravel server is running on port 8000</li>
        </ol>
      </div>
    </div>
  );
}
