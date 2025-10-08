'use client';

import { useState } from 'react';
import { ENV_CONFIG } from '../../environment';

export default function AuthTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    setResult('Testing authentication step by step...\n\n');

    try {
      const baseURL = ENV_CONFIG.API_BASE_URL;
      
      // Step 1: Login to get fresh token
      setResult(prev => prev + '1. Logging in to get fresh token...\n');
      
      const loginResponse = await fetch(`${baseURL}/auth/login`, {
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

      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }

      const loginData = await loginResponse.json();
      if (!loginData.success) {
        throw new Error('Login response not successful');
      }

      const token = loginData.data.token;
      setResult(prev => prev + `   ✅ Login successful! Token: ${token.substring(0, 30)}...\n\n`);

      // Step 2: Test auth profile
      setResult(prev => prev + '2. Testing auth profile...\n');
      
      const authResponse = await fetch(`${baseURL}/auth/profile`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setResult(prev => prev + `   Auth profile status: ${authResponse.status}\n`);
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        setResult(prev => prev + `   ✅ Auth works: ${authData.data.name} (${authData.data.role})\n\n`);
      } else {
        const authError = await authResponse.text();
        setResult(prev => prev + `   ❌ Auth failed: ${authError}\n\n`);
      }

      // Step 3: Test protected contact endpoint
      setResult(prev => prev + '3. Testing protected contact endpoint...\n');
      
      const contactResponse = await fetch(`${baseURL}/contact`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setResult(prev => prev + `   Contact endpoint status: ${contactResponse.status}\n`);
      
      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        setResult(prev => prev + `   ✅ Contact endpoint works! Found ${contactData.data?.data?.length || 0} messages\n\n`);
        
        // Save working token
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(loginData.data.user));
        
        setResult(prev => prev + '🎉 SUCCESS! Authentication is now working!\n');
        setResult(prev => prev + 'Token saved to localStorage. You can now use /admin/contact-messages\n');
        
      } else {
        const contactError = await contactResponse.text();
        setResult(prev => prev + `   ❌ Contact endpoint failed: ${contactError}\n\n`);
        
        // Check Laravel logs for more info
        setResult(prev => prev + '💡 Check Laravel logs for AdminMiddleware debug info:\n');
        setResult(prev => prev + '   Run: Get-Content storage/logs/laravel.log | Select-Object -Last 20\n');
      }

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const checkLogs = () => {
    setResult('To check Laravel logs, run this command in the Laravel directory:\n\n');
    setResult(prev => prev + 'Get-Content storage/logs/laravel.log | Select-Object -Last 20\n\n');
    setResult(prev => prev + 'This will show the AdminMiddleware debug information.');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#dc2626' }}>
        🔐 Authentication Test & Fix
      </h1>
      
      <div style={{ marginBottom: '2rem', background: '#fef3c7', padding: '1rem', borderRadius: '6px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          What We Know:
        </h2>
        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
          <li>✅ Laravel API works (proven by /working-contact)</li>
          <li>✅ Database works (proven by /working-contact)</li>
          <li>✅ Contact Controller works (proven by /working-contact)</li>
          <li>❌ Authentication middleware has issues</li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={testAuth}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            background: loading ? '#9ca3af' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}
        >
          {loading ? 'Testing...' : '🔐 Test Authentication'}
        </button>
        
        <button
          onClick={checkLogs}
          style={{
            padding: '1rem 2rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          📋 Check Laravel Logs
        </button>

        <button
          onClick={() => window.location.href = '/working-contact'}
          style={{
            padding: '1rem 2rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          ✅ See Working Version
        </button>

        <button
          onClick={() => window.location.href = '/admin/contact-messages'}
          style={{
            padding: '1rem 2rem',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔒 Try Protected Version
        </button>
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
        {result || 'Click "Test Authentication" to diagnose and fix the authentication issue.'}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#dcfce7', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Next Steps:
        </h3>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Click "Test Authentication" to get a fresh login</li>
          <li>If it works, go to "Try Protected Version"</li>
          <li>If it fails, check "Laravel Logs" for debug info</li>
          <li>Compare with "Working Version" to see the difference</li>
        </ol>
      </div>
    </div>
  );
}
