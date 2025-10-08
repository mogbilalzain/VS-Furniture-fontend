import React, { useState, useEffect } from 'react';
import { propertiesAPI } from '../lib/api';

const PropertiesFilter = ({ 
  categoryId, 
  selectedFilters = {}, 
  onFiltersChange,
  className = "",
  isCollapsed = false
}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProperties, setExpandedProperties] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (categoryId) {
      loadCategoryProperties();
    }
  }, [categoryId]);

  // Initialize all properties as expanded when properties are loaded
  useEffect(() => {
    if (properties.length > 0) {
      const initialExpanded = {};
      properties.forEach(property => {
        initialExpanded[property.id] = true; // Start with all properties expanded
      });
      setExpandedProperties(initialExpanded);
    }
  }, [properties]);

  const togglePropertyExpansion = (propertyId) => {
    setExpandedProperties(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  const loadCategoryProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await propertiesAPI.getCategoryProperties(categoryId);
      
      if (response.success) {
        setProperties(response.data.properties || []);
      } else {
        setError('Failed to load category properties');
      }
    } catch (err) {
      console.error('Error loading category properties:', err);
      setError('Error loading properties');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyChange = (propertyName, valueId, checked) => {
    const currentValues = selectedFilters[propertyName] || [];
    
    let newValues;
    if (checked) {
      newValues = [...currentValues, valueId];
    } else {
      newValues = currentValues.filter(id => id !== valueId);
    }
    
    const newFilters = {
      ...selectedFilters,
      [propertyName]: newValues
    };
    
    // Remove empty properties
    if (newValues.length === 0) {
      delete newFilters[propertyName];
    }
    
    onFiltersChange(newFilters);
  };

  const handleRadioChange = (propertyName, valueId) => {
    const newFilters = {
      ...selectedFilters,
      [propertyName]: [valueId]
    };
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getSelectedCount = () => {
    return Object.values(selectedFilters).reduce((total, values) => total + values.length, 0);
  };

  // Filter values based on search term
  const getFilteredValues = (values) => {
    if (!searchTerm.trim()) {
      return values;
    }
    return values.filter(value => 
      (value.display_name || value.value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                      <div className="h-3 bg-gray-200 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="text-center text-red-600">
          <p className="mb-2">{error}</p>
          <button 
            onClick={loadCategoryProperties}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <p className="text-gray-500 text-center">No properties available for this category</p>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg ${className} ${isCollapsed ? 'hidden' : ''}`}>
      {/* Search Box */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search in category
        </label>
        <div className="relative flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder=""
            className="flex-1 px-3 py-2 border border-gray-300 border-r-0 focus:outline-none focus:border-gray-400"
          />
          <button 
            className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 border border-yellow-400 transition-colors flex items-center justify-center"
            onClick={() => {/* Search functionality already handled by onChange */}}
          >
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Filter Products
          {getSelectedCount() > 0 && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {getSelectedCount()}
            </span>
          )}
        </h3>
        {getSelectedCount() > 0 && (
          <button 
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {properties.filter(property => {
          const filteredValues = getFilteredValues(property.values || []);
          return !searchTerm.trim() || filteredValues.length > 0;
        }).length === 0 && searchTerm.trim() ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 text-sm">No filters found for "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-800 text-sm mt-2"
            >
              Clear search
            </button>
          </div>
        ) : (
          properties.map((property) => {
            const isExpanded = expandedProperties[property.id];
            const filteredValues = getFilteredValues(property.values || []);
            
            // Hide property if no values match search term
            if (searchTerm.trim() && filteredValues.length === 0) {
              return null;
            }
            
            return (
            <div key={property.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <button
                onClick={() => togglePropertyExpansion(property.id)}
                className="w-full flex items-center justify-between py-3 text-left font-medium text-gray-800 hover:text-gray-600 transition-colors group"
              >
                <span className="flex items-center text-sm">
                  {property.display_name || property.name}
                  {property.is_required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 text-gray-500 group-hover:text-gray-700 ${isExpanded ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            
            {isExpanded && (
              <div className="space-y-1 max-h-48 overflow-y-auto pl-2 animate-slideDown">
                {filteredValues.map((value) => {
                  const isSelected = selectedFilters[property.name]?.includes(value.id) || false;
                  
                  return (
                    <label 
                      key={value.id} 
                      className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors group"
                    >
                      <input
                        type={property.input_type === 'radio' ? 'radio' : 'checkbox'}
                        name={property.input_type === 'radio' ? property.name : undefined}
                        checked={isSelected}
                        onChange={(e) => {
                          if (property.input_type === 'radio') {
                            handleRadioChange(property.name, value.id);
                          } else {
                            handlePropertyChange(property.name, value.id, e.target.checked);
                          }
                        }}
                        className="mr-3 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700 flex-1 group-hover:text-gray-900">
                        {value.display_name || value.value}
                      </span>
                      {value.product_count !== undefined && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {value.product_count}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            </div>
          );
        }))}
      </div>

      {/* Additional info */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Select multiple properties for more accurate results
        </p>
      </div>
    </div>
  );
};

export default PropertiesFilter;