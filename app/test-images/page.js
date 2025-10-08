'use client';

import { useState, useEffect } from 'react';
import { certificationsAPI } from '../../lib/api';

export default function TestImages() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      const response = await certificationsAPI.getAll();
      if (response.success) {
        setCertifications(response.data);
      }
    } catch (error) {
      console.error('Error loading certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Test Images</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert) => (
          <div key={cert.id} className="border p-4 rounded">
            <h3 className="font-semibold mb-2">{cert.title}</h3>
            <p className="text-sm text-gray-600 mb-4">ID: {cert.id}</p>
            
            {cert.image_url ? (
              <div className="space-y-4">
                {/* Original URL */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Original URL:</p>
                  <p className="text-xs break-all bg-gray-100 p-2 rounded">{cert.image_url}</p>
                </div>
                
                {/* Image Display */}
                <div className="w-32 h-32 border">
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-full h-full object-contain"
                    onLoad={() => console.log(`✅ Image loaded: ${cert.title}`)}
                    onError={(e) => {
                      console.error(`❌ Image failed: ${cert.title}`, e);
                      e.target.style.border = '2px solid red';
                    }}
                  />
                </div>
                
                {/* Test Direct Access */}
                <div>
                  <a 
                    href={cert.image_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-xs"
                  >
                    Test Direct Access
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No image URL</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}