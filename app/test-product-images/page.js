'use client';

import { useState, useEffect } from 'react';
import { productImagesAPI } from '../../lib/api';
import ProductImageGallery from '../../components/ProductImageGallery';

export default function TestProductImages() {
  const [productId, setProductId] = useState('54');
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);

  const testImagesAPI = async () => {
    setLoading(true);
    setApiResult(null);

    try {
      console.log('🔍 Testing productImagesAPI.getProductImages...');
      console.log('📍 Product ID:', productId);
      
      const response = await productImagesAPI.getProductImages(productId);
      console.log('📥 API Response:', response);
      
      setApiResult(response);
      
      // Also get product details
      const productResponse = await fetch(`http://localhost:8000/api/products/${productId}`);
      const productData = await productResponse.json();
      if (productData.success) {
        setProduct(productData.data);
        console.log('📦 Product data:', productData.data);
      }

    } catch (error) {
      console.error('❌ API Error:', error);
      setApiResult({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-test on load
  useEffect(() => {
    testImagesAPI();
  }, [productId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Product Images Display</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: API Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">API Test</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter product ID"
                />
                <button
                  onClick={testImagesAPI}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md"
                >
                  {loading ? '🔄' : '🧪 Test'}
                </button>
              </div>
            </div>

            {apiResult && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">API Result:</h3>
                {apiResult.success ? (
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <div className="text-green-800 font-medium mb-2">
                      ✅ Success! Found {apiResult.data?.length || 0} images
                    </div>
                    {apiResult.data && apiResult.data.length > 0 ? (
                      <div className="space-y-2">
                        {apiResult.data.map((img, index) => (
                          <div key={img.id} className="text-sm bg-white p-2 rounded border">
                            <div><strong>Image {index + 1}:</strong></div>
                            <div>ID: {img.id}</div>
                            <div>URL: {img.image_url}</div>
                            <div>Alt: {img.alt_text}</div>
                            <div>Primary: {img.is_primary ? 'Yes' : 'No'}</div>
                            <div>Sort: {img.sort_order}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-green-700">No images found in response</div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <div className="text-red-800 font-medium mb-2">❌ API Failed</div>
                    <pre className="text-red-700 text-sm overflow-auto">
                      {JSON.stringify(apiResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Component Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Component Test</h2>
            <div className="text-sm text-gray-600 mb-4">
              This shows how ProductImageGallery component renders:
            </div>
            
            {product && (
              <div className="border border-gray-200 rounded p-4">
                <ProductImageGallery 
                  productId={productId} 
                  product={product}
                />
              </div>
            )}
            
            {!product && !loading && (
              <div className="text-gray-500 text-center py-8">
                Product data loading...
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">Debugging Steps:</h3>
          <ol className="text-blue-700 text-sm list-decimal list-inside space-y-1">
            <li>Check if API returns images in the left panel</li>
            <li>Check if ProductImageGallery component displays them in the right panel</li>
            <li>Compare the results to identify where the issue occurs</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}