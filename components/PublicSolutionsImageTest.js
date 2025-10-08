'use client';

import React, { useState, useEffect } from 'react';
import { solutionsAPI } from '../lib/api';
import { ENV_CONFIG } from '../environment/index.js';

/**
 * مكون اختبار سريع لصور الحلول في الصفحات العامة
 */
const PublicSolutionsImageTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-product.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const backendBaseUrl = ENV_CONFIG.API_BASE_URL.replace('/api', '');
    return `${backendBaseUrl}${imagePath}`;
  };

  const runImageTest = async () => {
    setIsRunning(true);
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: جلب الحلول العامة
      console.log('🔄 Testing public solutions API...');
      try {
        const response = await solutionsAPI.getAll({ per_page: '3' });
        
        results.tests.push({
          name: 'Public Solutions API',
          status: response.success ? 'PASS' : 'FAIL',
          details: response.success ? 
            `Successfully loaded ${response.data?.length || 0} solutions` :
            'Failed to load solutions',
          data: response.data?.slice(0, 1) // First solution for inspection
        });

        // Test 2: فحص روابط الصور
        if (response.success && response.data?.length > 0) {
          const firstSolution = response.data[0];
          const imageTests = [];

          // Test cover_image
          if (firstSolution.cover_image) {
            const generatedUrl = getImageUrl(firstSolution.cover_image);
            imageTests.push({
              type: 'cover_image (relative)',
              original: firstSolution.cover_image,
              generated: generatedUrl,
              isValidUrl: generatedUrl.startsWith('http')
            });
          }

          // Test cover_image_url
          if (firstSolution.cover_image_url) {
            imageTests.push({
              type: 'cover_image_url (full)',
              original: firstSolution.cover_image_url,
              generated: firstSolution.cover_image_url,
              isValidUrl: firstSolution.cover_image_url.startsWith('http')
            });
          }

          results.tests.push({
            name: 'Image URL Generation',
            status: imageTests.length > 0 ? 'PASS' : 'WARNING',
            details: `Tested ${imageTests.length} image URLs`,
            data: imageTests
          });
        }

        // Test 3: فحص API Configuration
        const envConfig = {
          environment: ENV_CONFIG.ENVIRONMENT,
          api_base_url: ENV_CONFIG.API_BASE_URL,
          backend_url: ENV_CONFIG.API_BASE_URL.replace('/api', ''),
          debug_mode: ENV_CONFIG.DEBUG_MODE
        };

        results.tests.push({
          name: 'Environment Configuration',
          status: 'INFO',
          details: 'Current environment settings',
          data: envConfig
        });

      } catch (error) {
        results.tests.push({
          name: 'Public Solutions API',
          status: 'ERROR',
          details: error.message,
          error
        });
      }

    } catch (error) {
      console.error('❌ Test failed:', error);
      results.tests.push({
        name: 'Image Test Process',
        status: 'ERROR',
        details: 'Unexpected error during testing',
        error
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'FAIL':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'ERROR':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'INFO':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS':
        return '✅';
      case 'FAIL':
        return '❌';
      case 'ERROR':
        return '🚨';
      case 'WARNING':
        return '⚠️';
      case 'INFO':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🖼️ Public Solutions Image Test
        </h2>
        <p className="text-gray-600">
          اختبار سريع لتحقق من عمل الصور في الصفحات العامة للحلول
        </p>
      </div>

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={runImageTest}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Running Test...
            </>
          ) : (
            <>
              🧪 Run Image Test
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {testResults && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📊 Test Summary</h3>
            <p className="text-sm text-gray-600">
              Completed: {new Date(testResults.timestamp).toLocaleString()}
            </p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-600">
                ✅ Passed: {testResults.tests.filter(t => t.status === 'PASS').length}
              </span>
              <span className="text-red-600">
                ❌ Failed: {testResults.tests.filter(t => t.status === 'FAIL' || t.status === 'ERROR').length}
              </span>
              <span className="text-yellow-600">
                ⚠️ Warnings: {testResults.tests.filter(t => t.status === 'WARNING').length}
              </span>
              <span className="text-blue-600">
                ℹ️ Info: {testResults.tests.filter(t => t.status === 'INFO').length}
              </span>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-3">
            {testResults.tests.map((test, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <span>{getStatusIcon(test.status)}</span>
                    {test.name}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                </div>
                
                <p className="text-sm mb-2">{test.details}</p>
                
                {/* Show data if available */}
                {test.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium mb-2">
                      📄 View Details
                    </summary>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
                
                {/* Show error if available */}
                {test.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-red-600 mb-2">
                      🚨 Error Details
                    </summary>
                    <pre className="bg-red-100 p-2 rounded text-xs overflow-auto max-h-40 text-red-800">
                      {test.error.message}
                      {test.error.stack && `\n\nStack:\n${test.error.stack}`}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">🔗 Quick Test Links</h3>
        <div className="space-y-2 text-sm">
          <div>
            <a href="/solutions" target="_blank" className="text-blue-600 hover:underline">
              📄 Public Solutions Page
            </a>
            <span className="text-gray-500 ml-2">- Test image display on main page</span>
          </div>
          <div>
            <a href="/admin/solutions" target="_blank" className="text-blue-600 hover:underline">
              🔧 Admin Solutions Page
            </a>
            <span className="text-gray-500 ml-2">- Test admin image management</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSolutionsImageTest;
