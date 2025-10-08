'use client';

import { useState, useRef } from 'react';
import { productImagesAPI } from '../../lib/api';

export default function TestImageUpload() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [productId, setProductId] = useState('54'); // Default to a product ID
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const testImageUpload = async () => {
    if (!selectedFiles.length || !productId) {
      alert('Please select files and enter product ID');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      // Step 1: Login
      console.log('🔐 Step 1: Logging in...');
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
        throw new Error(`Login failed: ${loginData.message}`);
      }

      console.log('✅ Login successful');

      // Step 2: Prepare FormData
      console.log('📸 Step 2: Preparing image data...');
      const formData = new FormData();
      
      selectedFiles.forEach((file, index) => {
        formData.append('images[]', file);
        formData.append(`alt_texts[${index}]`, `Test image ${index + 1}`);
        formData.append(`titles[${index}]`, `Test image ${index + 1}`);
      });

      console.log('📄 FormData prepared with', selectedFiles.length, 'files');

      // Step 3: Test via productImagesAPI
      console.log('🧪 Step 3: Testing via productImagesAPI...');
      console.log('📍 Product ID:', productId);
      
      // Store token in apiClient
      const { apiClient } = await import('../../lib/api');
      apiClient.setToken(loginData.data.token);
      
      const response = await productImagesAPI.admin.uploadImages(productId, formData);
      
      console.log('📥 API Response:', response);

      if (response.success) {
        setResult(`✅ SUCCESS! Images uploaded successfully:

Uploaded ${response.data.length} images:
${response.data.map((img, i) => `${i + 1}. ${img.title || 'Untitled'} (ID: ${img.id})`).join('\n')}

Full response:
${JSON.stringify(response, null, 2)}`);
      } else {
        setResult(`❌ FAILED! Image upload failed:

Error: ${response.message || 'Unknown error'}

Full response:
${JSON.stringify(response, null, 2)}`);
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

  const testDirectAPI = async () => {
    if (!selectedFiles.length || !productId) {
      alert('Please select files and enter product ID');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      // Login first
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
        throw new Error(`Login failed: ${loginData.message}`);
      }

      // Test direct API call
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append('images[]', file);
        formData.append(`alt_texts[${index}]`, `Direct test image ${index + 1}`);
        formData.append(`titles[${index}]`, `Direct test image ${index + 1}`);
      });

      console.log('🧪 Testing direct API call to:', `http://localhost:8000/api/admin/products/${productId}/images`);

      const uploadResponse = await fetch(`http://localhost:8000/api/admin/products/${productId}/images`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${loginData.data.token}`
        },
        body: formData
      });

      console.log('📡 Direct API Response status:', uploadResponse.status);
      const uploadResult = await uploadResponse.json();
      console.log('📄 Direct API Response data:', uploadResult);

      if (uploadResponse.ok && uploadResult.success) {
        setResult(`✅ DIRECT API SUCCESS! Images uploaded:

${uploadResult.data.map((img, i) => `${i + 1}. ${img.title} (ID: ${img.id})`).join('\n')}

Response:
${JSON.stringify(uploadResult, null, 2)}`);
      } else {
        setResult(`❌ DIRECT API FAILED!

Status: ${uploadResponse.status}
Error: ${uploadResult.message || 'Unknown error'}

Response:
${JSON.stringify(uploadResult, null, 2)}`);
      }

    } catch (error) {
      console.error('❌ Direct API error:', error);
      setResult(`❌ DIRECT API ERROR!

${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Image Upload</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter product ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Images</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Selected Files ({selectedFiles.length})</h3>
              <div className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {index + 1}. {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={testImageUpload}
              disabled={loading || !selectedFiles.length || !productId}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {loading ? '🔄 Testing...' : '🧪 Test via productImagesAPI'}
            </button>
            
            <button
              onClick={testDirectAPI}
              disabled={loading || !selectedFiles.length || !productId}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {loading ? '🔄 Testing...' : '🧪 Test Direct API'}
            </button>
          </div>
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
          <ol className="text-blue-700 text-sm list-decimal list-inside space-y-1">
            <li>Enter a valid product ID (default: 54)</li>
            <li>Select one or more image files</li>
            <li>Click "Test via productImagesAPI" to test the API wrapper</li>
            <li>Click "Test Direct API" to test the endpoint directly</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
