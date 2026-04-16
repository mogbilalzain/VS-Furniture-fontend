import React, { useState, useEffect, useCallback, useRef } from 'react';
import { propertiesAPI } from '../lib/api';

const PropertiesFilter = ({ 
  categoryId, 
  categorySlug,
  selectedFilters = {}, 
  onFiltersChange,
  onPropertiesLoaded,
  className = "",
  isCollapsed = false
}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProperties, setExpandedProperties] = useState({});
  const prevFiltersRef = useRef(null);

  useEffect(() => {
    if (categoryId) {
      loadFacetedProperties({});
    }
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    const filtersKey = JSON.stringify(selectedFilters);
    if (prevFiltersRef.current === filtersKey) return;
    prevFiltersRef.current = filtersKey;
    loadFacetedProperties(selectedFilters);
  }, [categoryId, selectedFilters]);

  useEffect(() => {
    if (properties.length > 0) {
      setExpandedProperties(prev => {
        if (Object.keys(prev).length > 0) return prev;
        const initial = {};
        properties.forEach(p => { initial[p.id] = true; });
        return initial;
      });
    }
  }, [properties]);

  const loadFacetedProperties = async (filters) => {
    try {
      if (Object.keys(filters).length === 0) setLoading(true);
      setError(null);
      const response = await propertiesAPI.getFacetedProperties(categoryId, categorySlug, filters);
      if (response.success) {
        const props = response.data.properties || [];
        setProperties(props);
        if (onPropertiesLoaded) onPropertiesLoaded(props);
      } else {
        setError('Failed to load filters');
      }
    } catch (err) {
      console.error('Error loading faceted properties:', err);
      setError('Error loading filters');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpansion = (propertyId) => {
    setExpandedProperties(prev => ({ ...prev, [propertyId]: !prev[propertyId] }));
  };

  const handleValueClick = (propertyName, valueId) => {
    const currentValues = selectedFilters[propertyName] || [];
    const isSelected = currentValues.includes(valueId);
    let newValues;
    if (isSelected) {
      newValues = currentValues.filter(id => id !== valueId);
    } else {
      newValues = [...currentValues, valueId];
    }
    const newFilters = { ...selectedFilters, [propertyName]: newValues };
    if (newValues.length === 0) delete newFilters[propertyName];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getSelectedCount = () => {
    return Object.values(selectedFilters).reduce((total, values) => total + values.length, 0);
  };

  const getValueDisplayName = useCallback((propertyName, valueId) => {
    for (const prop of properties) {
      if (prop.name === propertyName) {
        const val = prop.values.find(v => v.id === valueId);
        return val ? (val.display_name || val.value) : valueId;
      }
    }
    return valueId;
  }, [properties]);

  const visibleProperties = properties.filter(property => {
    const values = property.values || [];
    return values.some(v => v.product_count > 0);
  });

  if (loading && properties.length === 0) {
    return (
      <div className={`${className} ${isCollapsed ? 'hidden' : ''}`}>
        <div className="py-4">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="space-y-2 ml-1">
                  {[1, 2, 3].map(j => (
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
      <div className={`${className} ${isCollapsed ? 'hidden' : ''}`}>
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-2">{error}</p>
          <button 
            onClick={() => loadFacetedProperties(selectedFilters)}
            className="text-sm text-vs-green hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (visibleProperties.length === 0 && !loading) {
    return (
      <div className={`${className} ${isCollapsed ? 'hidden' : ''}`}>
        <p className="text-sm text-gray-400 py-4">No filters available</p>
      </div>
    );
  }

  return (
    <div className={`${className} ${isCollapsed ? 'hidden' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-3 border-b border-gray-200">
        <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">
          Filter
          {getSelectedCount() > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-vs-green text-white text-[10px] font-bold">
              {getSelectedCount()}
            </span>
          )}
        </span>
        {getSelectedCount() > 0 && (
          <button 
            onClick={clearAllFilters}
            className="text-xs text-gray-400 hover:text-black transition-colors underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected filters summary */}
      {getSelectedCount() > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 pb-3 border-b border-gray-100">
          {Object.entries(selectedFilters).map(([propName, valueIds]) =>
            valueIds.map(vid => (
              <button
                key={`${propName}-${vid}`}
                onClick={() => handleValueClick(propName, vid)}
                className="inline-flex items-center gap-1 bg-gray-900 text-white text-xs px-2.5 py-1 hover:bg-gray-700 transition-colors"
              >
                <span>{getValueDisplayName(propName, vid)}</span>
                <svg className="w-3 h-3 ml-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))
          )}
        </div>
      )}

      {/* Property accordion sections (grouped + ungrouped) */}
      <div className="space-y-0">
        {(() => {
          const grouped = {};
          const ungrouped = [];
          visibleProperties.forEach(prop => {
            if (prop.property_group) {
              const gId = prop.property_group.id;
              if (!grouped[gId]) grouped[gId] = { group: prop.property_group, properties: [] };
              grouped[gId].properties.push(prop);
            } else {
              ungrouped.push(prop);
            }
          });
          const sortedGroupKeys = Object.keys(grouped).sort((a, b) =>
            (grouped[a].group.sort_order || 0) - (grouped[b].group.sort_order || 0)
          );

          const renderPropertyAccordion = (property) => {
            const isExpanded = expandedProperties[property.id] ?? true;
            const visibleValues = (property.values || []).filter(v => v.product_count > 0);
            const selectedInProperty = selectedFilters[property.name] || [];

            return (
              <div key={property.id} className="border-b border-gray-100 last:border-b-0">
                <button
                  onClick={() => toggleExpansion(property.id)}
                  className="w-full flex items-center justify-between py-3.5 text-left group"
                >
                  <span className="text-sm font-medium text-gray-800 group-hover:text-black transition-colors">
                    {property.display_name || property.name}
                    {selectedInProperty.length > 0 && (
                      <span className="ml-1.5 text-xs text-vs-green font-semibold">
                        ({selectedInProperty.length})
                      </span>
                    )}
                  </span>
                  <svg 
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="pb-3 space-y-0.5">
                    {visibleValues.map((value) => {
                      const isSelected = selectedInProperty.includes(value.id);
                      return (
                        <button
                          key={value.id}
                          onClick={() => handleValueClick(property.name, value.id)}
                          className={`w-full text-left px-2 py-1.5 text-sm transition-colors flex items-center justify-between group/item ${
                            isSelected
                              ? 'text-black font-semibold'
                              : 'text-gray-600 hover:text-black'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected && (
                              <svg className="w-3 h-3 text-vs-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span>{value.display_name || value.value}</span>
                          </span>
                          <span className={`text-xs tabular-nums ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                            {value.product_count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          };

          return (
            <>
              {sortedGroupKeys.map(gId => {
                const { group, properties: groupProps } = grouped[gId];
                const isGroupExpanded = expandedProperties[`group-${gId}`] ?? true;
                return (
                  <div key={`group-${gId}`} className="border-b border-gray-200">
                    <button
                      onClick={() => setExpandedProperties(prev => ({ ...prev, [`group-${gId}`]: !prev[`group-${gId}`] ?? false }))}
                      className="w-full flex items-center justify-between py-3 text-left bg-gray-50 px-2 -mx-0 group"
                    >
                      <span className="text-xs font-bold tracking-wider uppercase text-gray-500 group-hover:text-gray-700 transition-colors">
                        {group.display_name}
                      </span>
                      <svg 
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isGroupExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isGroupExpanded && (
                      <div className="pl-2">
                        {groupProps.map(renderPropertyAccordion)}
                      </div>
                    )}
                  </div>
                );
              })}
              {ungrouped.map(renderPropertyAccordion)}
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default PropertiesFilter;
