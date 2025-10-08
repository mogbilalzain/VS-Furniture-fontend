'use client';

import { useState } from 'react';

export default function SimpleImageTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState('54');

  const testImages = async () => {
    setLoading(true);
    setResult('');

    try {
      console.log('🔍 Testing images for product:', productId);
      
      // Test direct fetch
      const response = await fetch(`http://localhost:8000/api/products/${productId}/images`);
      const data = await response.json();
      
      console.log('📥 Response:', data);
      
      if (response.ok && data.success) {
        setResult(`✅ SUCCESS! Found ${data.data.length} images:

${data.data.map((img, i) => 
  `${i + 1}. ID: ${img.id}
     URL: ${img.image_url}
     Alt: ${img.alt_text}
     Primary: ${img.is_primary ? 'Yes' : 'No'}
     Sort: ${img.sort_order}`
).join('\n\n')}

Raw Response:
${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ API Failed:
Status: ${response.status}
Data: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setResult(`❌ ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Simple Image Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Product ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={testImages}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg"
            >
              {loading ? '🔄 Testing...' : '🧪 Test Images'}
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
      </div>
    </div>
  );
}
