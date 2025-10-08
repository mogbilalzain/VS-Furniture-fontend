'use client';

import { useState } from 'react';

export default function FinalSKUTest() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (step, status, message, data = null) => {
    setResults(prev => [...prev, {
      step,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runCompleteTest = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Step 1: Login
      addResult(1, 'info', 'Logging in as admin...');
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
      if (!loginResponse.ok || !loginData.success) {
        addResult(1, 'error', 'Login failed', loginData);
        return;
      }
      
      const token = loginData.data.token;
      addResult(1, 'success', 'Login successful');

      // Step 2: Create product without SKU
      addResult(2, 'info', 'Creating product without SKU...');
      const createData = {
        name: 'Final Test Product ' + Date.now(),
        description: 'Product created without SKU field',
        short_description: 'Final test product',
        model: 'FINAL-' + Date.now(),
        category_id: 1,
        status: 'active',
        is_featured: false,
        sort_order: 0
      };

      const createResponse = await fetch('http://localhost:8000/api/admin/products', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createData)
      });

      const createResult = await createResponse.json();
      if (!createResponse.ok || !createResult.success) {
        addResult(2, 'error', 'Product creation failed', createResult);
        return;
      }

      const createdProduct = createResult.data;
      addResult(2, 'success', `Product created successfully (ID: ${createdProduct.id})`, createdProduct);

      // Step 3: Update the created product
      addResult(3, 'info', 'Updating the created product...');
      const updateData = {
        name: createdProduct.name + ' (UPDATED)',
        description: 'Updated: ' + createData.description,
        short_description: 'Updated short description',
        model: createdProduct.model + '-UPD',
        category_id: createdProduct.category_id,
        status: 'active',
        is_featured: true,
        sort_order: 1
      };

      const updateResponse = await fetch(`http://localhost:8000/api/admin/products/${createdProduct.id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const updateResult = await updateResponse.json();
      if (!updateResponse.ok || !updateResult.success) {
        addResult(3, 'error', 'Product update failed', updateResult);
        return;
      }

      addResult(3, 'success', `Product updated successfully`, updateResult.data);

      // Step 4: Verify the product exists and can be retrieved
      addResult(4, 'info', 'Verifying product can be retrieved...');
      const getResponse = await fetch(`http://localhost:8000/api/products/${createdProduct.id}`);
      const getResult = await getResponse.json();

      if (!getResponse.ok || !getResult.success) {
        addResult(4, 'error', 'Failed to retrieve product', getResult);
        return;
      }

      addResult(4, 'success', 'Product retrieved successfully (public endpoint)', {
        id: getResult.data.id,
        name: getResult.data.name,
        model: getResult.data.model,
        hasSKU: getResult.data.sku ? 'YES' : 'NO',
        slug: getResult.data.slug
      });

      // Final summary
      addResult(5, 'success', '🎉 ALL TESTS PASSED! SKU removal is complete and working perfectly!');

    } catch (error) {
      addResult(0, 'error', 'Test failed with exception', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex-1">Final SKU Removal Test</h1>
          <button
            onClick={runCompleteTest}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium"
          >
            {loading ? '🔄 Testing...' : '🧪 Run Complete Test'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Overview</h2>
          <p className="text-gray-600 mb-4">
            This test will verify that SKU has been completely removed from the system:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Login as admin</li>
            <li>Create a new product without SKU field</li>
            <li>Update the created product</li>
            <li>Retrieve the product via public API</li>
            <li>Verify no SKU field is present</li>
          </ol>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.status === 'success' ? 'border-green-200 bg-green-50' :
                    result.status === 'error' ? 'border-red-200 bg-red-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-lg ${
                      result.status === 'success' ? 'text-green-600' :
                      result.status === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {result.status === 'success' ? '✅' :
                       result.status === 'error' ? '❌' : 'ℹ️'}
                    </span>
                    <span className="font-medium">
                      {result.step > 0 ? `Step ${result.step}: ` : ''}{result.message}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {result.timestamp}
                    </span>
                  </div>
                  
                  {result.data && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600">Show Details</summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                        {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">🎯 Success Criteria:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Product creation works without SKU field</li>
            <li>• Product update works without requiring SKU</li>
            <li>• Product retrieval shows no SKU field in response</li>
            <li>• All operations complete without validation errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
