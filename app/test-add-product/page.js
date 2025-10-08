'use client';

import { useState } from 'react';
import { productsAPI, categoriesAPI } from '../../lib/api';
import { authStorage } from '../../lib/localStorage-utils';

export default function TestAddProduct() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [testData, setTestData] = useState({
    name: 'Test Product ' + Date.now(),
    description: 'This is a test product created by the automated test',
    short_description: 'Test product for verification',
    model: 'TEST-' + Date.now(),
    category_id: '',
    status: 'active',
    is_featured: false,
    sort_order: 0
  });

  const loadCategories = async () => {
    try {
      console.log('🔍 Loading categories...');
      const response = await categoriesAPI.getAll();
      console.log('📦 Categories response:', response);
      
      if (response.success && response.data.length > 0) {
        setCategories(response.data);
        setTestData(prev => ({
          ...prev,
          category_id: response.data[0].id // Use first category
        }));
        console.log('✅ Categories loaded, using first category:', response.data[0]);
      } else {
        throw new Error('No categories found');
      }
    } catch (err) {
      console.error('❌ Error loading categories:', err);
      throw err;
    }
  };

  const checkAuth = () => {
    const authInfo = {
      hasToken: !!authStorage.getToken(),
      role: authStorage.getRole(),
      isAuthenticated: authStorage.isAuthenticated(),
      isAdmin: authStorage.isAdmin(),
      isAuthenticatedAdmin: authStorage.isAuthenticatedAdmin()
    };
    
    console.log('🔐 Auth check:', authInfo);
    
    if (!authInfo.isAuthenticatedAdmin) {
      throw new Error(`Not authenticated as admin. Auth status: ${JSON.stringify(authInfo)}`);
    }
    
    return authInfo;
  };

  const testDirectAPI = async () => {
    try {
      const token = authStorage.getToken();
      console.log('🧪 Testing direct API call...');
      console.log('🔑 Token:', token ? token.substring(0, 30) + '...' : 'null');
      
      const response = await fetch('http://localhost:8000/api/admin/products', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...testData,
          name: testData.name + ' (Direct API)'
        })
      });
      
      console.log('📡 Direct API Response:', response.status, response.statusText);
      const data = await response.json();
      console.log('📄 Direct API Data:', data);
      
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      console.error('❌ Direct API Error:', error);
      throw error;
    }
  };

  const testProductsAPI = async () => {
    try {
      console.log('🧪 Testing productsAPI.create...');
      console.log('📄 Test data:', testData);
      
      const response = await productsAPI.create({
        ...testData,
        name: testData.name + ' (ProductsAPI)'
      });
      
      console.log('📦 ProductsAPI Response:', response);
      return response;
    } catch (error) {
      console.error('❌ ProductsAPI Error:', error);
      throw error;
    }
  };

  const runFullTest = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const testResults = {
        timestamp: new Date().toISOString(),
        steps: []
      };

      // Step 1: Check Authentication
      console.log('🔍 Step 1: Checking authentication...');
      try {
        const authInfo = checkAuth();
        testResults.steps.push({
          step: 1,
          name: 'Authentication Check',
          status: 'success',
          data: authInfo
        });
      } catch (authError) {
        testResults.steps.push({
          step: 1,
          name: 'Authentication Check',
          status: 'error',
          error: authError.message
        });
        throw authError;
      }

      // Step 2: Load Categories
      console.log('🔍 Step 2: Loading categories...');
      try {
        await loadCategories();
        testResults.steps.push({
          step: 2,
          name: 'Load Categories',
          status: 'success',
          data: { categoriesCount: categories.length }
        });
      } catch (catError) {
        testResults.steps.push({
          step: 2,
          name: 'Load Categories',
          status: 'error',
          error: catError.message
        });
        throw catError;
      }

      // Step 3: Test Direct API Call
      console.log('🔍 Step 3: Testing direct API call...');
      try {
        const directResult = await testDirectAPI();
        testResults.steps.push({
          step: 3,
          name: 'Direct API Call',
          status: directResult.success ? 'success' : 'error',
          data: directResult
        });
      } catch (directError) {
        testResults.steps.push({
          step: 3,
          name: 'Direct API Call',
          status: 'error',
          error: directError.message
        });
      }

      // Step 4: Test ProductsAPI
      console.log('🔍 Step 4: Testing ProductsAPI...');
      try {
        const apiResult = await testProductsAPI();
        testResults.steps.push({
          step: 4,
          name: 'ProductsAPI Call',
          status: apiResult.success ? 'success' : 'error',
          data: apiResult
        });
      } catch (apiError) {
        testResults.steps.push({
          step: 4,
          name: 'ProductsAPI Call',
          status: 'error',
          error: apiError.message
        });
      }

      // Final Results
      const successfulSteps = testResults.steps.filter(step => step.status === 'success').length;
      const totalSteps = testResults.steps.length;
      
      testResults.summary = {
        successful: successfulSteps,
        total: totalSteps,
        success: successfulSteps === totalSteps,
        message: successfulSteps === totalSteps ? 
          '🎉 All tests passed! Product creation is working.' :
          `⚠️ ${successfulSteps}/${totalSteps} tests passed. Check failed steps.`
      };

      console.log('✅ Test completed:', testResults);
      setResult(testResults);

    } catch (error) {
      console.error('❌ Test failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex-1">Test Add Product</h1>
          <button
            onClick={runFullTest}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium"
          >
            {loading ? '🔄 Testing...' : '🧪 Run Full Test'}
          </button>
        </div>

        {/* Test Data Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={testData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={testData.model}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
              <input
                type="text"
                name="category_id"
                value={testData.category_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
            <pre className="text-red-700 text-sm overflow-auto">{error}</pre>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Test Results</h3>
              <div className={`text-lg font-medium ${result.summary.success ? 'text-green-600' : 'text-yellow-600'}`}>
                {result.summary.message}
              </div>
            </div>

            <div className="space-y-4">
              {result.steps.map((step) => (
                <div
                  key={step.step}
                  className={`border rounded-lg p-4 ${
                    step.status === 'success' ? 'border-green-200 bg-green-50' :
                    step.status === 'error' ? 'border-red-200 bg-red-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Step {step.step}: {step.name}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      step.status === 'success' ? 'bg-green-100 text-green-800' :
                      step.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  
                  {step.error && (
                    <div className="text-red-700 text-sm mb-2">
                      <strong>Error:</strong> {step.error}
                    </div>
                  )}
                  
                  {step.data && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600">Show Details</summary>
                      <pre className="mt-2 bg-white p-2 rounded border overflow-auto max-h-40">
                        {JSON.stringify(step.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Test completed at: {result.timestamp}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
