'use client';

import { useState } from 'react';

export default function TestDownload() {
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState('');

  const testDownload = async () => {
    try {
      setDownloading(true);
      setResult('Starting download...');
      
      const response = await fetch('http://localhost:8000/api/products/1/files/1/download', {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'test-file.pdf';
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        setResult('✅ Download successful!');
      } else {
        const errorText = await response.text();
        setResult(`❌ Download failed: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      setResult(`❌ Error: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const testAPI = async () => {
    try {
      setResult('Testing API...');
      
      const response = await fetch('http://localhost:8000/api/products/1/files', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      setResult(`API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      setResult(`❌ API Error: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test File Download</h1>
      
      <div className="space-y-4">
        <button
          onClick={testAPI}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test API
        </button>
        
        <button
          onClick={testDownload}
          disabled={downloading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {downloading ? 'Downloading...' : 'Test Download'}
        </button>
      </div>
      
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
}
