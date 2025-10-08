'use client';

import { useState, useEffect } from 'react';

const DebugPage = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [apiTests, setApiTests] = useState({});

  const testBackendConnection = async () => {
    const tests = {};
    
    // Test 1: Basic connectivity
    try {
      console.log('Testing basic connectivity...');
      const response = await fetch('http://localhost:8000/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (response.ok) {
        tests.connectivity = { status: 'success', message: 'Backend is reachable' };
      } else {
        tests.connectivity = { status: 'error', message: `HTTP ${response.status}` };
      }
    } catch (error) {
      tests.connectivity = { status: 'error', message: error.message };
    }

    // Test 2: CORS headers
    try {
      console.log('Testing CORS...');
      const response = await fetch('http://localhost:8000/api/categories', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
        },
      });
      
      tests.cors = { 
        status: response.ok ? 'success' : 'error', 
        message: response.ok ? 'CORS is configured' : 'CORS issue detected' 
      };
    } catch (error) {
      tests.cors = { status: 'error', message: error.message };
    }

    // Test 3: API endpoint
    try {
      console.log('Testing API endpoint...');
      const response = await fetch('http://localhost:8000/api/categories');
      const data = await response.json();
      
      tests.api = { 
        status: 'success', 
        message: `API working - ${data.success ? 'Success' : 'Error'}`,
        data: data
      };
    } catch (error) {
      tests.api = { status: 'error', message: error.message };
    }

    setApiTests(tests);
    
    // Overall status
    const hasError = Object.values(tests).some(test => test.status === 'error');
    setBackendStatus(hasError ? 'error' : 'success');
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  const StatusIndicator = ({ status, children }) => (
    <div style={{
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      background: status === 'success' ? '#f0f9ff' : status === 'error' ? '#fef2f2' : '#f9fafb',
      border: `2px solid ${status === 'success' ? '#3b82f6' : status === 'error' ? '#ef4444' : '#d1d5db'}`,
      color: status === 'success' ? '#1e40af' : status === 'error' ? '#dc2626' : '#6b7280'
    }}>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>🔧 Debug Dashboard</h1>
      
      <StatusIndicator status={backendStatus}>
        <h2>Backend Status: {backendStatus === 'checking' ? '🔄 Checking...' : backendStatus === 'success' ? '✅ Online' : '❌ Offline'}</h2>
      </StatusIndicator>

      <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Connection Tests:</h3>
      
      {Object.entries(apiTests).map(([testName, result]) => (
        <StatusIndicator key={testName} status={result.status}>
          <strong style={{ textTransform: 'capitalize' }}>{testName}:</strong> {result.message}
          {result.data && (
            <details style={{ marginTop: '0.5rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Response</summary>
              <pre style={{ 
                marginTop: '0.5rem', 
                padding: '0.5rem', 
                background: 'rgba(0,0,0,0.05)', 
                borderRadius: '4px',
                fontSize: '0.8rem',
                overflow: 'auto'
              }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}
        </StatusIndicator>
      ))}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Quick Fixes:</h3>
        <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
          <li>✅ Make sure Laravel server is running: <code>php artisan serve</code></li>
          <li>✅ Check if backend is accessible: <a href="http://localhost:8000" target="_blank" rel="noopener">http://localhost:8000</a></li>
          <li>✅ Test API directly: <a href="http://localhost:8000/api/categories" target="_blank" rel="noopener">http://localhost:8000/api/categories</a></li>
          <li>✅ Restart Next.js: <code>npm run dev</code></li>
        </ul>
      </div>

      <button 
        onClick={testBackendConnection}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🔄 Re-test Connection
      </button>
    </div>
  );
};

export default DebugPage;