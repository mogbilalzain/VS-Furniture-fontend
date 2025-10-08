'use client';

import React, { useState, useEffect } from 'react';
import { solutionsAPI } from '../../lib/api';

/**
 * مكون تشخيصي لاختبار نظام الصور في Solutions
 */
const SolutionImageDiagnostic = () => {
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testFile, setTestFile] = useState(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: جلب الحلول
      console.log('🔄 Test 1: Fetching solutions...');
      try {
        const solutionsResponse = await solutionsAPI.getAdminAll();
        results.tests.push({
          name: 'Fetch Solutions',
          status: solutionsResponse.success ? 'PASS' : 'FAIL',
          details: `Found ${solutionsResponse.data?.length || 0} solutions`,
          data: solutionsResponse.data?.slice(0, 2) // أول 2 فقط للتوضيح
        });
      } catch (error) {
        results.tests.push({
          name: 'Fetch Solutions',
          status: 'ERROR',
          details: error.message,
          error
        });
      }

      // Test 2: جلب المنتجات المتاحة
      console.log('🔄 Test 2: Fetching available products...');
      try {
        const productsResponse = await solutionsAPI.getAvailableProducts();
        results.tests.push({
          name: 'Fetch Available Products',
          status: productsResponse.success ? 'PASS' : 'FAIL',
          details: `Found ${productsResponse.data?.length || 0} products`,
          data: productsResponse.data?.slice(0, 2) // أول 2 فقط للتوضيح
        });
      } catch (error) {
        results.tests.push({
          name: 'Fetch Available Products',
          status: 'ERROR',
          details: error.message,
          error
        });
      }

      // Test 3: اختبار رفع صورة (إذا تم اختيار ملف)
      if (testFile) {
        console.log('🔄 Test 3: Testing image upload...');
        try {
          const uploadResponse = await solutionsAPI.uploadImage(testFile, 'gallery');
          results.tests.push({
            name: 'Image Upload Test',
            status: uploadResponse.success ? 'PASS' : 'FAIL',
            details: uploadResponse.success ? 
              `Image uploaded successfully: ${uploadResponse.data?.image_url}` : 
              uploadResponse.message || 'Upload failed',
            data: uploadResponse.data
          });
        } catch (error) {
          results.tests.push({
            name: 'Image Upload Test',
            status: 'ERROR',
            details: error.message,
            error
          });
        }
      } else {
        results.tests.push({
          name: 'Image Upload Test',
          status: 'SKIPPED',
          details: 'No test file selected'
        });
      }

      // Test 4: التحقق من إعدادات API
      console.log('🔄 Test 4: Checking API configuration...');
      const apiConfig = {
        baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'Not configured',
        backendURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'Not configured'
      };
      
      results.tests.push({
        name: 'API Configuration',
        status: apiConfig.baseURL !== 'Not configured' ? 'PASS' : 'WARNING',
        details: 'Environment variables check',
        data: apiConfig
      });

    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      results.tests.push({
        name: 'Diagnostic Process',
        status: 'ERROR',
        details: 'Unexpected error during diagnostic',
        error
      });
    }

    setDiagnosticResults(results);
    setIsRunning(false);
  };

  const resetDiagnostic = () => {
    setDiagnosticResults(null);
    setTestFile(null);
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
      case 'SKIPPED':
        return 'text-gray-600 bg-gray-50 border-gray-200';
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
      case 'SKIPPED':
        return '⏭️';
      default:
        return '❓';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔧 Solutions Image System Diagnostic
        </h2>
        <p className="text-gray-600">
          تشخيص شامل لنظام الصور في Solutions للتأكد من عمله بشكل صحيح
        </p>
      </div>

      {/* Test File Selection */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">اختبار رفع الصور (اختياري)</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setTestFile(e.target.files[0])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {testFile && (
          <p className="mt-2 text-sm text-green-600">
            ✅ Selected: {testFile.name} ({(testFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={runDiagnostic}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Running Diagnostic...
            </>
          ) : (
            <>
              🚀 Run Diagnostic
            </>
          )}
        </button>
        
        {diagnosticResults && (
          <button
            onClick={resetDiagnostic}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            🔄 Reset
          </button>
        )}
      </div>

      {/* Results */}
      {diagnosticResults && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📊 Diagnostic Summary</h3>
            <p className="text-sm text-gray-600">
              Completed: {new Date(diagnosticResults.timestamp).toLocaleString()}
            </p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-600">
                ✅ Passed: {diagnosticResults.tests.filter(t => t.status === 'PASS').length}
              </span>
              <span className="text-red-600">
                ❌ Failed: {diagnosticResults.tests.filter(t => t.status === 'FAIL' || t.status === 'ERROR').length}
              </span>
              <span className="text-yellow-600">
                ⚠️ Warnings: {diagnosticResults.tests.filter(t => t.status === 'WARNING').length}
              </span>
              <span className="text-gray-600">
                ⏭️ Skipped: {diagnosticResults.tests.filter(t => t.status === 'SKIPPED').length}
              </span>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-3">
            {diagnosticResults.tests.map((test, index) => (
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
    </div>
  );
};

export default SolutionImageDiagnostic;
