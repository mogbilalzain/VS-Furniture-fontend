'use client';

import React, { useState, useEffect } from 'react';
import { certificationsAPI } from '../lib/api';

const ProductCertifications = ({ productId }) => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCertifications, setExpandedCertifications] = useState({});

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        console.log('🔍 ProductCertifications: Fetching certifications for product ID:', productId);
        setLoading(true);
        const response = await certificationsAPI.getProductCertifications(productId);
        
        console.log('📥 ProductCertifications: API Response:', response);
        
        if (response.success && response.data) {
          setCertifications(response.data);
          console.log('✅ ProductCertifications: Found', response.data.length, 'certifications');
          // تهيئة جميع الشهادات كمطوية
          const initialExpanded = {};
          response.data.forEach(cert => {
            initialExpanded[cert.id] = false;
          });
          setExpandedCertifications(initialExpanded);
        } else {
          console.log('⚠️ ProductCertifications: No certifications found or API error');
        }
      } catch (err) {
        console.error('❌ ProductCertifications: Error fetching certifications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      console.log('🚀 ProductCertifications: Starting fetch for product ID:', productId);
      fetchCertifications();
    } else {
      console.log('⚠️ ProductCertifications: No productId provided');
    }
  }, [productId]);

  const toggleCertification = (certificationId) => {
    setExpandedCertifications(prev => ({
      ...prev,
      [certificationId]: !prev[certificationId]
    }));
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-red-600">Error loading certifications: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!certifications || certifications.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4" style={{ fontWeight: 'bold'}}>
              Product Certifications
            </h2>
            <p className="text-gray-500">
              No certifications available for this product at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4" style={{ fontWeight: 'bold'}}>
              Product Certifications
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our products proudly carry numerous quality and environmental certifications, 
              highlighting our dedication to sustainable practices and the well-being of everyone we serve.
            </p>
          </div>

          {/* Certifications List */}
          <div className="space-y-4">
            {certifications.map((certification) => (
              <div 
                key={certification.id} 
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Certification Header - Clickable */}
                <button
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-inset"
                  onClick={() => toggleCertification(certification.id)}
                  aria-expanded={expandedCertifications[certification.id]}
                  aria-controls={`certification-${certification.id}-content`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Certification Logo/Icon */}
                      {certification.image_url ? (
                        <div className="w-12 h-12 flex-shrink-0">
                          <img
                            src={certification.image_url}
                            alt={`${certification.title} certification logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback icon */}
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hidden">
                            <svg
                              className="w-6 h-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Certification Title */}
                      <h3 className="text-lg font-medium text-gray-900">
                        {certification.title}
                      </h3>
                    </div>

                    {/* Expand/Collapse Arrow */}
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          expandedCertifications[certification.id] ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Certification Content - Expandable */}
                <div
                  id={`certification-${certification.id}-content`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedCertifications[certification.id]
                      ? 'max-h-96 opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-4 pt-2">
                    {/* Certification Image (larger version) */}
                    {certification.image_url && expandedCertifications[certification.id] && (
                      <div className="mb-4 flex justify-center">
                        <div className="w-32 h-32">
                          <img
                            src={certification.image_url}
                            alt={`${certification.title} certification`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Certification Description */}
                    <div className="text-gray-600 leading-relaxed">
                      {certification.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCertifications;