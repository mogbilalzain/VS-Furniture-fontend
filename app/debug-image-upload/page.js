'use client';

import { useState } from 'react';
import { productImagesAPI } from '../../lib/api';
import { authStorage } from '../../lib/localStorage-utils';

export default function DebugImageUpload() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const debugImageUpload = async () => {
    setLoading(true);
    setLogs([]);

    try {
      addLog('🔍 Starting image upload debug...', 'info');
      
      // Check authentication first
      const token = authStorage.getToken();
      const role = authStorage.getRole();
      const isAdmin = authStorage.isAdmin();
      
      addLog(`🔐 Auth Check: Token=${!!token}, Role=${role}, IsAdmin=${isAdmin}`, 'info');
      
      if (!token || !isAdmin) {
        addLog('❌ Authentication failed - not admin or no token', 'error');
        return;
      }

      // Test product ID
      const productId = 54; // Use existing product
      addLog(`📦 Using product ID: ${productId}`, 'info');

      // Create a test image (1x1 pixel PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, 1, 1);
      
      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'test-image.png', { type: 'image/png' });
      
      addLog(`📸 Created test image: ${file.name} (${file.size} bytes)`, 'info');

      // Prepare FormData
      const formData = new FormData();
      formData.append('images[]', file);
      formData.append('alt_texts[0]', 'Debug test image');
      formData.append('titles[0]', 'Debug test title');
      
      addLog('📄 FormData prepared', 'info');

      // Log FormData contents
      for (let [key, value] of formData.entries()) {
        addLog(`  FormData: ${key} = ${value instanceof File ? `File(${value.name})` : value}`, 'info');
      }

      // Test the API call
      addLog('🧪 Calling productImagesAPI.admin.uploadImages...', 'info');
      
      try {
        const response = await productImagesAPI.admin.uploadImages(productId, formData);
        addLog('📥 API response received', 'success');
        addLog(`Response: ${JSON.stringify(response, null, 2)}`, 'success');
        
        if (response.success) {
          addLog('✅ Image upload successful!', 'success');
        } else {
          addLog(`❌ API returned error: ${response.message}`, 'error');
        }
      } catch (apiError) {
        addLog(`❌ API call failed: ${apiError.message}`, 'error');
        addLog(`Error details: ${apiError.stack}`, 'error');
      }

    } catch (error) {
      addLog(`❌ Debug failed: ${error.message}`, 'error');
      console.error('Debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Debug Image Upload</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-gray-600 mb-4">
            This will create a test image and attempt to upload it using the same method as ProductImagesManager.
          </p>
          
          <button
            onClick={debugImageUpload}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg font-medium"
          >
            {loading ? '🔄 Debugging...' : '🐛 Debug Image Upload'}
          </button>
        </div>

        {logs.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded ${
                    log.type === 'error' ? 'bg-red-50 text-red-700' :
                    log.type === 'success' ? 'bg-green-50 text-green-700' :
                    'bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-xs text-gray-500 mr-2">{log.timestamp}</span>
                  <span className="font-mono">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">Debug Purpose:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Check authentication status</li>
            <li>• Test FormData creation</li>
            <li>• Test API call with detailed logging</li>
            <li>• Identify exact point of failure</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
