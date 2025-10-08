'use client';

import { useState, useEffect } from 'react';
import { filtersAPI } from '../lib/api';

const ProductFilters = ({ 
  onFiltersChange,
  selectedFilters = {},
  searchQuery = '',
  onSearchChange,
  className = '',
  isCollapsed = false 
}) => {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Load filters
  useEffect(() => {
    loadFilters();
  }, []);

  // Initialize all categories as collapsed when filters are loaded
  useEffect(() => {
    if (filters.length > 0) {
      const initialExpanded = {};
      filters.forEach(filter => {
        initialExpanded[filter.id] = false; // Start with all categories collapsed
      });
      setExpandedCategories(initialExpanded);
    }
  }, [filters]);

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

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

  const handleFilterChange = (categoryName, optionValue, isChecked) => {
    const currentCategoryFilters = selectedFilters[categoryName] || [];
    
    let newCategoryFilters;
    if (isChecked) {
      newCategoryFilters = [...currentCategoryFilters, optionValue];
    } else {
      newCategoryFilters = currentCategoryFilters.filter(value => value !== optionValue);
    }

    const newFilters = {
      ...selectedFilters,
      [categoryName]: newCategoryFilters.length > 0 ? newCategoryFilters : undefined
    };

    // Remove empty filter categories
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key] || newFilters[key].length === 0) {
        delete newFilters[key];
      }
    });

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + (filters?.length || 0), 0);
  };

  const getCategorySelectedCount = (categoryName) => {
    return selectedFilters[categoryName]?.length || 0;
  };

  const toggleAllCategories = () => {
    const allExpanded = Object.values(expandedCategories).every(expanded => expanded);
    const newState = {};
    filters.forEach(filter => {
      newState[filter.id] = !allExpanded;
    });
    setExpandedCategories(newState);
  };

  const areAllCategoriesExpanded = () => {
    return Object.values(expandedCategories).every(expanded => expanded);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="space-y-2 ml-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-3 bg-gray-100 rounded w-3/4"></div>
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
            >
              <span>Filters</span>
            <svg
              className={`w-5 h-5 transform transition-transform ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear All ({getActiveFiltersCount()})
              </button>
            )}
            
            <button
              onClick={toggleAllCategories}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              title={areAllCategoriesExpanded() ? "Collapse all" : "Expand all"}
            >
              {areAllCategoriesExpanded() ? "Collapse all" : "Expand all"}
            </button>
          </div>
        </div>
      </div>

      {/* Search in Category */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search in category
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search products..."
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Filter Categories */}
      {!collapsed && (
        <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
          {filters.map((category) => {
            const isExpanded = expandedCategories[category.id];
            
            return (
              <div key={category.id} className="space-y-3">
                <button
                  onClick={() => toggleCategoryExpansion(category.id)}
                  className="w-full font-medium text-gray-900 flex items-center justify-between hover:text-gray-700 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md p-2 -m-2"
                >
                  <span className="flex items-center space-x-2">
                    <span>{category.display_name}</span>
                    {getCategorySelectedCount(category.name) > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {getCategorySelectedCount(category.name)}
                      </span>
                    )}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div className="space-y-2 text-sm animate-slideDown">
                    {(category.active_filter_options || category.activeFilterOptions)?.map((option) => {
                      const isSelected = selectedFilters[category.name]?.includes(option.value) || false;
                      
                      return (
                        <label
                          key={option.id}
                          className="flex items-center space-x-3 space-x-reverse cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                        >
                          <input
                            type={category.input_type === 'radio' ? 'radio' : 'checkbox'}
                            name={category.input_type === 'radio' ? category.name : undefined}
                            checked={isSelected}
                            onChange={(e) => handleFilterChange(category.name, option.value, e.target.checked)}
                            className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="flex-1 text-gray-700">
                            {option.display_name}
                            {option.product_count > 0 && (
                              <span className="text-gray-400 ml-1">({option.product_count})</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;