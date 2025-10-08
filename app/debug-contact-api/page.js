'use client';

import { useState, useEffect } from 'react';
import { ENV_CONFIG } from '../../environment';

export default function DebugContactAPI() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint, method = 'GET', body = null) => {
    const baseURL = ENV_CONFIG.API_BASE_URL;
    const token = localStorage.getItem('admin_token');
    
    try {
      const options = {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      };

      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      if (body) {
        options.body = JSON.stringify(body);
      }

      console.log(`Testing: ${method} ${baseURL}${endpoint}`);
      console.log('Headers:', options.headers);
      
      const response = await fetch(`${baseURL}${endpoint}`, options);
      const data = await response.json();
      
      return {
        status: response.status,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        error: error.message,
        status: 'Network Error'
      };
    }
  };

  const runTests = async () => {
    setLoading(true);
    const testResults = {};

    // Test 1: Check if Laravel server is running
    testResults.serverCheck = await testAPI('/');

    // Test 2: Test public contact endpoint (POST)
    testResults.publicContact = await testAPI('/contact', 'POST', {
      name: 'Test User',
      email: 'test@example.com',
      contact_number: '+971501234567',
      subject: 'Test Message',
      message: 'This is a test message from debug page',
      questions: 'This is a test question'
    });

    // Test 3: Test admin contact endpoints
    testResults.adminContactList = await testAPI('/admin/contact');
    testResults.adminContactStats = await testAPI('/admin/contact/stats/overview');
    testResults.adminContactUnread = await testAPI('/admin/contact/unread-count');
    testResults.adminContactRecent = await testAPI('/admin/contact/recent');

    // Test 4: Check auth status
    testResults.authProfile = await testAPI('/auth/profile');

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const formatResult = (result) => {
    return (
      <div style={{ 
        background: result.ok ? '#dcfce7' : '#fee2e2', 
        border: `1px solid ${result.ok ? '#16a34a' : '#dc2626'}`,
        borderRadius: '6px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Status: {result.status} {result.ok ? '✅' : '❌'}
        </div>
        <pre style={{ 
          background: '#f3f4f6', 
          padding: '0.5rem', 
          borderRadius: '4px',
          fontSize: '0.875rem',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Contact API Debug Page
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={runTests}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Running Tests...' : 'Run Tests Again'}
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Environment Info
        </h2>
        <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
          <p><strong>API URL:</strong> {ENV_CONFIG.API_BASE_URL}</p>
          <p><strong>Admin Token:</strong> {localStorage.getItem('admin_token') ? 'Present' : 'Missing'}</p>
          <p><strong>Current Time:</strong> {new Date().toISOString()}</p>
        </div>
      </div>

      {Object.keys(results).length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Test Results
          </h2>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>
              1. Server Check
            </h3>
            {results.serverCheck && formatResult(results.serverCheck)}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>
              2. Public Contact Form (POST /contact)
            </h3>
            {results.publicContact && formatResult(results.publicContact)}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>
              3. Admin Contact List (GET /admin/contact)
            </h3>
            {results.adminContactList && formatResult(results.adminContactList)}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>
              4. Admin Contact Stats (GET /admin/contact/stats/overview)
            </h3>
            {results.adminContactStats && formatResult(results.adminContactStats)}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>
              5. Admin Unread Count (GET /admin/contact/unread-count)
            </h3>
            {results.adminContactUnread && formatResult(results.adminContactUnread)}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>
              6. Admin Recent Messages (GET /admin/contact/recent)
            </h3>
            {results.adminContactRecent && formatResult(results.adminContactRecent)}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>
              7. Auth Profile Check (GET /auth/profile)
            </h3>
            {results.authProfile && formatResult(results.authProfile)}
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem', padding: '1rem', background: '#fef3c7', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Troubleshooting Tips:
        </h3>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Make sure Laravel server is running on port 8000</li>
          <li>Check if you're logged in as admin</li>
          <li>Verify CORS settings in Laravel</li>
          <li>Check browser console for detailed errors</li>
          <li>Ensure database has contact_messages table</li>
        </ul>
      </div>
    </div>
  );
}
