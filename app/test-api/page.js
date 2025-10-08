'use client';

import { useState, useEffect } from 'react';
import { categoriesAPI, propertiesAPI } from '../../lib/api';
import { ENV_CONFIG } from '../../environment';

export default function TestAPI() {
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing API connection...');
      
      // Test categories API
      const categoriesResponse = await categoriesAPI.getAll();
      console.log('Categories response:', categoriesResponse);
      
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
        
        // Test properties API if we have categories
        if (categoriesResponse.data && categoriesResponse.data.length > 0) {
          const firstCategory = categoriesResponse.data[0];
          console.log('Testing properties for category:', firstCategory.id);
          
          try {
            const propertiesResponse = await propertiesAPI.getCategoryProperties(firstCategory.id);
            console.log('Properties response:', propertiesResponse);
            
            if (propertiesResponse.success) {
              setProperties(propertiesResponse.data.properties || []);
            }
          } catch (propError) {
            console.warn('Properties test failed (this is expected if no properties exist):', propError);
          }
        }
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('API Test Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="space-y-6">
        {/* Status */}
        <div className={`p-4 rounded-lg ${
          loading ? 'bg-yellow-100 text-yellow-800' :
          error ? 'bg-red-100 text-red-800' :
          'bg-green-100 text-green-800'
        }`}>
          {loading ? '🔄 Testing API connection...' :
           error ? `❌ Error: ${error}` :
           '✅ API connection successful!'}
        </div>

        {/* API URL */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">API Configuration:</h3>
          <p><strong>API URL:</strong> {ENV_CONFIG.API_BASE_URL}</p>
          <p><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
        </div>

        {/* Categories Test */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Categories API Test:</h3>
          {categories.length > 0 ? (
            <div>
              <p className="text-green-600 mb-2">✅ Found {categories.length} categories</p>
              <ul className="space-y-1">
                {categories.slice(0, 5).map(category => (
                  <li key={category.id} className="text-sm">
                    • {category.name} (ID: {category.id})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No categories found</p>
          )}
        </div>

        {/* Properties Test */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Properties API Test:</h3>
          {properties.length > 0 ? (
            <div>
              <p className="text-green-600 mb-2">✅ Found {properties.length} properties</p>
              <ul className="space-y-1">
                {properties.slice(0, 5).map(property => (
                  <li key={property.id} className="text-sm">
                    • {property.display_name || property.name} ({property.values?.length || 0} values)
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No properties found (this is normal if none are configured)</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button 
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Again'}
          </button>
          
          <a 
            href="/products" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
          >
            Go to Products
          </a>
        </div>
      </div>
    </div>
  );
}