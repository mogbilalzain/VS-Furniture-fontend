'use client';

import { useState } from 'react';
import { ENV_CONFIG } from '../../environment';
import { productsAPI, productPropertiesAPI } from '../../lib/api';
import ApiClient from '../../lib/api';

export default function DebugProductAPI() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testProductAPI = async (productId = 24) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log(`🔍 Testing all product APIs for ID ${productId}...`);
      
      const results = {
        product: null,
        properties: null,
        files: null,
        errors: []
      };

      // Test 1: Product Details
      try {
        console.log('🔍 Testing productsAPI.getById...');
        const productResponse = await productsAPI.getById(productId);
        console.log('✅ Product API Response:', productResponse);
        results.product = productResponse;
      } catch (err) {
        console.error('❌ Product API Error:', err);
        results.errors.push(`Product API: ${err.message}`);
      }

      // Test 2: Product Properties
      try {
        console.log('🔍 Testing productPropertiesAPI.getProductProperties...');
        const propertiesResponse = await productPropertiesAPI.getProductProperties(productId);
        console.log('✅ Properties API Response:', propertiesResponse);
        results.properties = propertiesResponse;
      } catch (err) {
        console.error('❌ Properties API Error:', err);
        results.errors.push(`Properties API: ${err.message}`);
      }

      // Test 3: Product Files (using direct fetch like in the component)
      try {
        console.log('🔍 Testing product files endpoint...');
        const apiUrl = `${ENV_CONFIG.API_BASE_URL}/products/${productId}/files`;
        const filesResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        const filesData = await filesResponse.json();
        console.log('✅ Files API Response:', filesData);
        results.files = filesData;
      } catch (err) {
        console.error('❌ Files API Error:', err);
        results.errors.push(`Files API: ${err.message}`);
      }

      setResult(results);
    } catch (err) {
      console.error('❌ General API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    if (typeof window !== 'undefined') {
      // Clear all possible auth keys
      const keysToRemove = [
        'auth_token',
        'user_role',
        'user_data',
        'login_time',
        'adminToken',
        'loginTime'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Also clear from API client instance
      const apiClient = new ApiClient();
      apiClient.clearToken();
      
      console.log('🧹 Cleared all auth data from localStorage and API client');
      alert('Auth data cleared! Check console for details.');
    }
  };

  const checkStoredData = () => {
    if (typeof window !== 'undefined') {
      const authData = {
        auth_token: localStorage.getItem('auth_token'),
        user_role: localStorage.getItem('user_role'),
        user_data: localStorage.getItem('user_data'),
        login_time: localStorage.getItem('login_time'),
        adminToken: localStorage.getItem('adminToken'),
        loginTime: localStorage.getItem('loginTime'),
      };
      
      console.log('🔍 Current localStorage auth data:', authData);
      setResult({ type: 'localStorage', data: authData });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Product API</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Testing</h2>
          <div className="space-y-4">
            <button
              onClick={() => testProductAPI(24)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {loading ? 'Testing...' : 'Test All Product APIs (ID: 24)'}
            </button>
            
            <button
              onClick={clearAuthData}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium ml-4"
            >
              Clear Auth Data
            </button>
            
            <button
              onClick={checkStoredData}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium ml-4"
            >
              Check Stored Data
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
            <pre className="text-red-700 text-sm overflow-auto">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold mb-2">
              {result.type === 'localStorage' ? 'localStorage Data:' : 'API Result:'}
            </h3>
            <pre className="text-green-700 text-sm overflow-auto bg-white p-4 rounded border">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">Instructions:</h3>
          <ol className="text-blue-700 text-sm list-decimal list-inside space-y-1">
            <li>First, click "Clear Auth Data" to remove any invalid tokens</li>
            <li>Then click "Test All Product APIs" to test all product endpoints for ID 24</li>
            <li>Check the browser console for detailed debugging information</li>
            <li>The test will check: Product Details, Product Properties, and Product Files</li>
            <li>If successful, all API responses should appear below</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
