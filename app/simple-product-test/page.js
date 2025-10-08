'use client';

import { useState } from 'react';

export default function SimpleProductTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAddProduct = async () => {
    setLoading(true);
    setResult('');

    try {
      // First, login as admin
      console.log('🔐 Step 1: Logging in as admin...');
      const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });

      const loginData = await loginResponse.json();
      console.log('📥 Login response:', loginData);

      if (!loginResponse.ok || !loginData.success) {
        throw new Error(`Login failed: ${loginData.message || 'Unknown error'}`);
      }

      const token = loginData.data.token;
      console.log('✅ Login successful, token received');

      // Get categories
      console.log('📦 Step 2: Getting categories...');
      const categoriesResponse = await fetch('http://localhost:8000/api/categories', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const categoriesData = await categoriesResponse.json();
      console.log('📦 Categories response:', categoriesData);

      if (!categoriesResponse.ok || !categoriesData.success || !categoriesData.data.length) {
        throw new Error('No categories found');
      }

      const firstCategory = categoriesData.data[0];
      console.log('✅ Using category:', firstCategory.name, 'ID:', firstCategory.id);

      // Create product
      console.log('🆕 Step 3: Creating product...');
      const productData = {
        name: 'Test Product ' + Date.now(),
        description: 'This is a test product created automatically',
        short_description: 'Test product',
        model: 'TEST-' + Date.now(),
        category_id: firstCategory.id,
        status: 'active',
        is_featured: false,
        sort_order: 0
      };

      console.log('📄 Product data:', productData);

      const createResponse = await fetch('http://localhost:8000/api/admin/products', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const createData = await createResponse.json();
      console.log('📥 Create response status:', createResponse.status);
      console.log('📥 Create response data:', createData);

      if (createResponse.ok && createData.success) {
        setResult(`✅ SUCCESS! Product created successfully:
        
Product ID: ${createData.data.id}
Name: ${createData.data.name}
Model: ${createData.data.model}
Category: ${createData.data.category?.name || 'N/A'}
Status: ${createData.data.status}

Full response:
${JSON.stringify(createData, null, 2)}`);
      } else {
        setResult(`❌ FAILED! Product creation failed:

Status: ${createResponse.status}
Error: ${createData.message || 'Unknown error'}

Full response:
${JSON.stringify(createData, null, 2)}`);
      }

    } catch (error) {
      console.error('❌ Test error:', error);
      setResult(`❌ ERROR! Test failed:

${error.message}

Stack trace:
${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Simple Product Creation Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-gray-600 mb-4">
            This test will:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-6">
            <li>Login as admin using default credentials</li>
            <li>Get available categories</li>
            <li>Create a new test product</li>
            <li>Display the results</li>
          </ol>
          
          <button
            onClick={testAddProduct}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium"
          >
            {loading ? '🔄 Testing...' : '🧪 Run Test'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">Instructions:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Make sure Laravel server is running on port 8000</li>
            <li>• Make sure you have admin user with username: admin, password: admin123</li>
            <li>• Make sure you have at least one category in the database</li>
            <li>• Check browser console for detailed logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
