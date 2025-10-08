'use client';

import React, { useState, useEffect } from 'react';
import { certificationsAPI } from '@/lib/api';
import { 
  PlusIcon, 
  XMarkIcon,
  CheckIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const ProductCertificationsManager = ({ productId, productName, onClose }) => {
  const [allCertifications, setAllCertifications] = useState([]);
  const [productCertifications, setProductCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [productId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all certifications and product's current certifications
      const [allCertsResponse, productCertsResponse] = await Promise.all([
        certificationsAPI.getAll(),
        certificationsAPI.getProductCertifications(productId)
      ]);

      if (allCertsResponse.success) {
        setAllCertifications(allCertsResponse.data);
      }

      if (productCertsResponse.success) {
        setProductCertifications(productCertsResponse.data.map(cert => cert.id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCertification = async (certificationId) => {
    try {
      setSaving(true);
      
      if (productCertifications.includes(certificationId)) {
        // Remove certification
        await certificationsAPI.admin.detachFromProduct(productId, certificationId);
        setProductCertifications(prev => prev.filter(id => id !== certificationId));
      } else {
        // Add certification
        await certificationsAPI.admin.attachToProduct(productId, certificationId);
        setProductCertifications(prev => [...prev, certificationId]);
      }
    } catch (err) {
      alert('Error updating certification: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Manage Certifications
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Product: {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={saving}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            Click on certifications to add or remove them from this product. 
            Changes are saved automatically.
          </p>
        </div>

        {/* Certifications List */}
        <div className="space-y-3">
          {allCertifications.map((certification) => {
            const isAssigned = productCertifications.includes(certification.id);
            
            return (
              <div
                key={certification.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isAssigned
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${saving ? 'opacity-50 cursor-wait' : ''}`}
                onClick={() => !saving && handleToggleCertification(certification.id)}
              >
                <div className="flex items-center space-x-4">
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isAssigned
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}>
                    {isAssigned && (
                      <CheckIcon className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Certification Image */}
                  {certification.image_url && (
                    <div className="w-12 h-12 flex-shrink-0">
                      <img
                        src={certification.image_url}
                        alt={certification.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Certification Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">
                      {certification.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {certification.description}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {isAssigned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <TagIcon className="h-3 w-3 mr-1" />
                        Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>{productCertifications.length}</strong> certification{productCertifications.length !== 1 ? 's' : ''} assigned to this product
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCertificationsManager;