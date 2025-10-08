'use client';

import React, { useState } from 'react';
import { ENV_CONFIG } from '../../environment';

export default function TestContactFormPage() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testContactForm = async () => {
    setLoading(true);
    const results = {};

    // Test data
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      contact_number: '+1234567890',
      subject: 'Test Subject',
      message: 'This is a test message from the contact form.',
      questions: 'What are your business hours?'
    };

    try {
      console.log('🔍 Sending test data:', testData);

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', result);

      results.apiTest = {
        success: response.ok && result.success,
        status: response.status,
        message: result.message || 'Unknown response',
        data: result,
        timestamp: new Date().toLocaleTimeString()
      };

      // Test with missing required fields
      const incompleteData = {
        name: 'Test User',
        // Missing email, subject, message
      };

      const response2 = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(incompleteData)
      });

      const result2 = await response2.json();

      results.validationTest = {
        success: !response2.ok, // Should fail validation
        status: response2.status,
        message: result2.message || 'Unknown response',
        errors: result2.errors || null,
        timestamp: new Date().toLocaleTimeString()
      };

    } catch (error) {
      console.error('❌ Test error:', error);
      results.error = {
        success: false,
        message: `Network Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  const testFrontendMapping = () => {
    // Test the frontend to backend field mapping
    const frontendData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      contactNumber: '+1234567890',
      questions: 'What are your services?',
      message: 'I need more information about your products.'
    };

    const backendData = {
      name: frontendData.fullName,
      email: frontendData.email,
      contact_number: frontendData.contactNumber,
      subject: frontendData.questions || 'General Inquiry',
      message: frontendData.message,
      questions: frontendData.questions
    };

    const mappingResults = {
      frontend: frontendData,
      backend: backendData,
      mapping: {
        'fullName → name': frontendData.fullName === backendData.name,
        'email → email': frontendData.email === backendData.email,
        'contactNumber → contact_number': frontendData.contactNumber === backendData.contact_number,
        'questions → subject': frontendData.questions === backendData.subject,
        'message → message': frontendData.message === backendData.message,
        'questions → questions': frontendData.questions === backendData.questions
      }
    };

    setTestResults(prev => ({
      ...prev,
      mappingTest: {
        success: true,
        data: mappingResults,
        timestamp: new Date().toLocaleTimeString()
      }
    }));
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">📧 Contact Form Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">🧪 Test Actions</h2>
        <div className="space-x-4">
          <button
            onClick={testContactForm}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing API...' : 'Test Contact API'}
          </button>
          <button
            onClick={testFrontendMapping}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Field Mapping
          </button>
          <button
            onClick={() => window.location.href = '/contact'}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Go to Contact Page
          </button>
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-6">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3 capitalize">
                {testName.replace(/([A-Z])/g, ' $1').trim()} Results
              </h3>
              
              <div className={`p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center mb-2">
                  <span className={`text-lg mr-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? '✅' : '❌'}
                  </span>
                  <span className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                  {result.timestamp && (
                    <span className="text-gray-500 text-sm ml-auto">
                      {result.timestamp}
                    </span>
                  )}
                </div>
                
                {result.message && (
                  <p className="text-gray-700 mb-2">{result.message}</p>
                )}
                
                {result.status && (
                  <p className="text-gray-600 text-sm mb-2">HTTP Status: {result.status}</p>
                )}
                
                {result.errors && (
                  <div className="mt-2">
                    <p className="text-red-700 font-medium">Validation Errors:</p>
                    <pre className="text-sm text-red-600 bg-red-100 p-2 rounded mt-1">
                      {JSON.stringify(result.errors, null, 2)}
                    </pre>
                  </div>
                )}
                
                {result.data && testName === 'mappingTest' && (
                  <div className="mt-3">
                    <h4 className="font-medium mb-2">Field Mapping:</h4>
                    <div className="space-y-1">
                      {Object.entries(result.data.mapping).map(([mapping, isCorrect]) => (
                        <div key={mapping} className="flex items-center">
                          <span className={`mr-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? '✅' : '❌'}
                          </span>
                          <span className="text-sm">{mapping}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.data && testName === 'apiTest' && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Response Data
                    </summary>
                    <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">📋 Expected Behavior:</h3>
        <ul className="text-yellow-700 space-y-1 text-sm">
          <li>• <strong>API Test:</strong> Should successfully send contact message with all fields</li>
          <li>• <strong>Validation Test:</strong> Should fail when required fields are missing</li>
          <li>• <strong>Field Mapping:</strong> Should correctly map frontend fields to backend fields</li>
          <li>• <strong>Response:</strong> Should return success: true with 201 status code</li>
          <li>• <strong>Admin Notification:</strong> Should send email to admin users (check logs)</li>
        </ul>
      </div>
    </div>
  );
}
