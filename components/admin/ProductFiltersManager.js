'use client';

import { useState, useEffect } from 'react';
import { filtersAPI } from '../../lib/api';

const ProductFiltersManager = ({ productId, onClose, onSave }) => {
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      setLoading(true);
      const response = await filtersAPI.getAll();
      
      if (response.success) {
        setFilters(response.data || []);
      } else {
        setError('Failed to load filters');
      }
    } catch (err) {
      console.error('Error loading filters:', err);
      setError('Failed to load filters');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (optionId, isChecked) => {
    if (isChecked) {
      setSelectedFilters(prev => [...prev, optionId]);
    } else {
      setSelectedFilters(prev => prev.filter(id => id !== optionId));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await filtersAPI.associateProductFilters(productId, selectedFilters);
      
      if (response.success) {
        onSave();
        onClose();
      } else {
        setError('Failed to save filters');
      }
    } catch (err) {
      console.error('Error saving filters:', err);
      setError('Failed to save filters');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading filters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Manage Product Filters</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="max-h-96 overflow-y-auto space-y-6">
          {filters.map((category) => (
            <div key={category.id} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {category.display_name}
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {category.active_filter_options?.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center space-x-2 space-x-reverse cursor-pointer p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(option.id)}
                      onChange={(e) => handleFilterChange(option.id, e.target.checked)}
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {option.display_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Filters'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFiltersManager;