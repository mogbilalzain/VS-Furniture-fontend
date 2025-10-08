'use client';

import { useState } from 'react';

export default function FixProductImages() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState('54');

  const fixImages = async () => {
    setLoading(true);
    setResult('');

    try {
      // Step 1: Login as admin
      console.log('🔐 Login as admin...');
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

      const token = loginData.data.token;
      console.log('✅ Login successful');

      // Step 2: Get all images for the product (admin endpoint)
      console.log(`🔍 Getting images for product ${productId}...`);
      const imagesResponse = await fetch(`http://localhost:8000/api/admin/products/${productId}/images`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const imagesData = await imagesResponse.json();
      console.log('📥 Admin images response:', imagesData);

      let resultText = `Product ${productId} Images Status:\n\n`;

      if (imagesResponse.ok && imagesData.success) {
        resultText += `✅ Found ${imagesData.data.length} images via admin API:\n\n`;
        
        imagesData.data.forEach((img, i) => {
          resultText += `${i + 1}. ID: ${img.id}\n`;
          resultText += `   URL: ${img.image_url}\n`;
          resultText += `   Alt: ${img.alt_text}\n`;
          resultText += `   Primary: ${img.is_primary ? 'Yes' : 'No'}\n`;
          resultText += `   Active: ${img.is_active !== false ? 'Yes' : 'No'}\n`;
          resultText += `   Sort: ${img.sort_order}\n\n`;
        });

        // Step 3: Test public endpoint
        console.log('🔍 Testing public endpoint...');
        const publicResponse = await fetch(`http://localhost:8000/api/products/${productId}/images`);
        const publicData = await publicResponse.json();
        console.log('📥 Public images response:', publicData);

        resultText += `\n--- Public API Test ---\n`;
        if (publicResponse.ok && publicData.success) {
          resultText += `✅ Public API returned ${publicData.data.length} images:\n\n`;
          
          publicData.data.forEach((img, i) => {
            resultText += `${i + 1}. ID: ${img.id}, Primary: ${img.is_primary ? 'Yes' : 'No'}\n`;
          });
        } else {
          resultText += `❌ Public API failed: ${publicData.message || 'Unknown error'}\n`;
        }

        // Step 4: Fix inactive images if needed
        const inactiveImages = imagesData.data.filter(img => img.is_active === false);
        if (inactiveImages.length > 0) {
          resultText += `\n--- Fixing Inactive Images ---\n`;
          resultText += `Found ${inactiveImages.length} inactive images. Activating them...\n`;
          
          for (const img of inactiveImages) {
            try {
              const updateResponse = await fetch(`http://localhost:8000/api/admin/products/${productId}/images/${img.id}`, {
                method: 'PUT',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  ...img,
                  is_active: true
                })
              });

              const updateData = await updateResponse.json();
              if (updateResponse.ok && updateData.success) {
                resultText += `✅ Activated image ID: ${img.id}\n`;
              } else {
                resultText += `❌ Failed to activate image ID: ${img.id} - ${updateData.message}\n`;
              }
            } catch (updateError) {
              resultText += `❌ Error updating image ID: ${img.id} - ${updateError.message}\n`;
            }
          }
        }

      } else {
        resultText += `❌ No images found via admin API\n`;
        resultText += `Response: ${JSON.stringify(imagesData, null, 2)}\n`;
      }

      setResult(resultText);

    } catch (error) {
      console.error('❌ Test error:', error);
      setResult(`❌ ERROR: ${error.message}\n\nStack: ${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Fix Product Images</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-gray-600 mb-4">
            This tool will check and fix product images that might not be showing.
          </p>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Product ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={fixImages}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {loading ? '🔄 Fixing...' : '🔧 Check & Fix Images'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">What this tool does:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Checks all images for the product via admin API</li>
            <li>• Tests the public API endpoint that ProductImageGallery uses</li>
            <li>• Activates any inactive images</li>
            <li>• Shows detailed information about each image</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
