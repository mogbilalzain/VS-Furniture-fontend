'use client';

import React, { useState } from 'react';
import { config } from '../../lib/config';

const DebugSolutionsAPI = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint, description) => {
    try {
      const apiUrl = config.api.baseURL;
      const fullUrl = `${apiUrl}${endpoint}`;
      
      console.log(`🔄 Testing ${description}: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { error: 'Non-JSON response', response: text.substring(0, 200) };
      }
      
      return {
        status: response.status,
        success: response.ok,
        data: data,
        contentType: contentType
      };
    } catch (error) {
      return {
        status: 'ERROR',
        success: false,
        data: { error: error.message },
        contentType: null
      };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults({});
    
    const endpoints = [
      { path: '/solutions', desc: 'Public Solutions' },
      { path: '/admin/solutions', desc: 'Admin Solutions' },
      { path: '/admin/solutions/available-products', desc: 'Available Products' },
      { path: '/admin/products', desc: 'Admin Products' },
      { path: '/products', desc: 'Public Products' }
    ];
    
    const testResults = {};
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.path, endpoint.desc);
      testResults[endpoint.path] = {
        description: endpoint.desc,
        ...result
      };
    }
    
    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Solutions API Debug Tool</h1>
      
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test All Endpoints'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([endpoint, result]) => (
          <div key={endpoint} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{result.description}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {result.status}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              <strong>Endpoint:</strong> {endpoint}
            </div>
            
            {result.contentType && (
              <div className="text-sm text-gray-600 mb-2">
                <strong>Content-Type:</strong> {result.contentType}
              </div>
            )}
            
            <div className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(results).length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          Click "Test All Endpoints" to start debugging
        </div>
      )}
    </div>
  );
};

export default DebugSolutionsAPI;
