'use client';

import React, { useState } from 'react';
import FavoriteButton from '../../components/FavoriteButton';
import { useFavorites } from '../../lib/contexts/favorites-context';

export default function TestFavorites() {
  const { favorites, count, loading, initialized, error } = useFavorites();
  
  // Test product data
  const testProduct = {
    id: 999,
    name: 'Test Product',
    image: '/images/placeholder-product.jpg',
    category: { name: 'Test Category' },
    model: 'TEST-001'
  };

  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleToggle = (result, wasFavorite) => {
    addLog(`Toggle result: ${JSON.stringify(result)}, was favorite: ${wasFavorite}`);
  };

  const testLocalStorage = () => {
    try {
      // Test localStorage access
      localStorage.setItem('test', 'value');
      const value = localStorage.getItem('test');
      localStorage.removeItem('test');
      addLog(`✅ localStorage test passed: ${value}`);
    } catch (err) {
      addLog(`❌ localStorage test failed: ${err.message}`);
    }
  };

  const checkFavoritesData = () => {
    try {
      const stored = localStorage.getItem('vs_favorites');
      addLog(`Stored favorites: ${stored || 'null'}`);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        addLog(`Parsed data: ${JSON.stringify(parsed, null, 2)}`);
      }
    } catch (err) {
      addLog(`❌ Error checking favorites: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Favorites Functionality</h1>
      
      {/* Context Status */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-bold mb-2">Context Status:</h2>
        <ul className="space-y-1 text-sm">
          <li>Initialized: {initialized ? '✅' : '❌'}</li>
          <li>Loading: {loading ? '⏳' : '✅'}</li>
          <li>Error: {error || 'None'}</li>
          <li>Count: {count}</li>
          <li>Favorites: {favorites.length}</li>
        </ul>
      </div>

      {/* Test Buttons */}
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="font-bold mb-2">Test Product:</h3>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <img 
              src={testProduct.image} 
              alt={testProduct.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-semibold">{testProduct.name}</h4>
              <p className="text-sm text-gray-600">{testProduct.category.name}</p>
            </div>
            
            {/* Different FavoriteButton variants */}
            <div className="flex items-center gap-2">
              <FavoriteButton 
                product={testProduct}
                variant="icon"
                size="md"
                onToggle={handleToggle}
              />
              <FavoriteButton 
                product={testProduct}
                variant="text"
                size="md"
                onToggle={handleToggle}
              />
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex gap-4">
          <button
            onClick={testLocalStorage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test localStorage
          </button>
          
          <button
            onClick={checkFavoritesData}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Check Favorites Data
          </button>
          
          <button
            onClick={() => setLogs([])}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Current Favorites */}
      {favorites.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2">Current Favorites ({favorites.length}):</h3>
          <ul className="space-y-2">
            {favorites.map((fav, index) => (
              <li key={fav.id || index} className="flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                  ⭐
                </span>
                <span>{fav.name} (ID: {fav.id})</span>
                <span className="text-xs text-gray-500">
                  Added: {new Date(fav.addedAt).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Logs */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
        <h3 className="text-white font-bold mb-2">Debug Logs:</h3>
        <div className="max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Try clicking the favorite buttons above.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
