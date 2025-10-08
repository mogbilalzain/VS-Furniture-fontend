'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { categoriesAPI, productsAPI, propertiesAPI } from '@/lib/api';

export default function TestAuthPage() {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (testName, success, message, details = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      testName,
      success,
      message,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const runAuthTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Check authentication status
    addTestResult(
      'Authentication Status',
      isAuthenticated,
      isAuthenticated ? 'User is authenticated' : 'User is not authenticated',
      { user: user ? { id: user.id, email: user.email, role: user.role } : null }
    );

    // Test 2: Check localStorage token
    const token = localStorage.getItem('auth_token');
    addTestResult(
      'LocalStorage Token',
      !!token,
      token ? 'Token found in localStorage' : 'No token in localStorage',
      { token: token ? token.substring(0, 30) + '...' : null }
    );

    // Test 3: Test admin categories endpoint
    try {
      console.log('🧪 Testing admin categories endpoint...');
      const response = await categoriesAPI.getAdminAll();
      addTestResult(
        'Admin Categories GET',
        true,
        'Successfully fetched admin categories',
        { data: response.data?.length || 0 }
      );
    } catch (error) {
      addTestResult(
        'Admin Categories GET',
        false,
        `Failed to fetch admin categories: ${error.message}`,
        { error: error.message, status: error.status }
      );
    }

    // Test 4: Test admin properties endpoint
    try {
      console.log('🧪 Testing admin properties endpoint...');
      const response = await propertiesAPI.getAll();
      addTestResult(
        'Admin Properties GET',
        true,
        'Successfully fetched admin properties',
        { data: response.data?.length || 0 }
      );
    } catch (error) {
      addTestResult(
        'Admin Properties GET',
        false,
        `Failed to fetch admin properties: ${error.message}`,
        { error: error.message, status: error.status }
      );
    }

    // Test 5: Test admin products endpoint
    try {
      console.log('🧪 Testing admin products endpoint...');
      const response = await productsAPI.getAdminAll();
      addTestResult(
        'Admin Products GET',
        true,
        'Successfully fetched admin products',
        { data: response.data?.length || 0 }
      );
    } catch (error) {
      addTestResult(
        'Admin Products GET',
        false,
        `Failed to fetch admin products: ${error.message}`,
        { error: error.message, status: error.status }
      );
    }

    // Test 6: Test creating a category (POST)
    try {
      console.log('🧪 Testing category creation...');
      const testCategory = {
        name: `Test Category ${Date.now()}`,
        description: 'Test category for authentication testing',
        slug: `test-category-${Date.now()}`
      };
      const response = await categoriesAPI.create(testCategory);
      addTestResult(
        'Category Creation POST',
        true,
        'Successfully created test category',
        { categoryId: response.data?.id }
      );
    } catch (error) {
      addTestResult(
        'Category Creation POST',
        false,
        `Failed to create category: ${error.message}`,
        { error: error.message, status: error.status }
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔐 Admin Authentication Test
          </h1>

          <div className="mb-6">
            <button
              onClick={runAuthTests}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Running Tests...' : 'Run Authentication Tests'}
            </button>
          </div>

          <div className="space-y-4">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    {result.success ? '✅' : '❌'} {result.testName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                {result.details && (
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>

          {testResults.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-8">
              Click "Run Authentication Tests" to start testing
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 