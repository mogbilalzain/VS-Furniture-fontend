'use client';

import React, { useState, useEffect } from 'react';
import { config } from '../../lib/config';

export default function DebugHomepageAPI() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = config.api.baseURL;
      const fullUrl = `${apiUrl}/homepage-content?section=real_spaces`;
      
      console.log('Testing API URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const responseInfo = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
      };

      console.log('Response info:', responseInfo);

      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setResult({
          type: 'json',
          responseInfo,
          data
        });
      } else {
        const text = await response.text();
        setResult({
          type: 'text',
          responseInfo,
          data: text.substring(0, 1000) // First 1000 chars
        });
      }
    } catch (err) {
      console.error('API Test Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Homepage API Debug</h1>
      
      <div className="mb-4">
        <p><strong>API Base URL:</strong> {config.api.baseURL}</p>
        <p><strong>Test URL:</strong> {config.api.baseURL}/homepage-content?section=real_spaces</p>
      </div>

      <button 
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Response Info:</h3>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(result.responseInfo, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Response Data ({result.type}):</h3>
            <pre className="text-sm overflow-x-auto max-h-96 overflow-y-auto">
              {result.type === 'json' 
                ? JSON.stringify(result.data, null, 2)
                : result.data
              }
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
