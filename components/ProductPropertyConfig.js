'use client';

import { useState, useEffect } from 'react';
import { productPropertiesAPI } from '../lib/api';

export default function ProductPropertyConfig({ productId, categoryId }) {
  const [properties, setProperties] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await productPropertiesAPI.getProductProperties(productId);

      if (res.success) {
        const prodProps = res.data?.properties || [];
        setProperties(prodProps);

        const initialExpanded = {};
        const groups = new Set();
        prodProps.forEach(p => {
          if (p.property_group) groups.add(p.property_group.id);
        });
        groups.forEach(gId => { initialExpanded[gId] = true; });
        initialExpanded['__ungrouped__'] = true;
        setExpandedGroups(initialExpanded);
      }
    } catch (err) {
      console.error('Error loading property config:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  if (!productId) return null;

  const grouped = {};
  const ungrouped = [];
  properties.forEach(prop => {
    if (prop.property_group) {
      const gId = prop.property_group.id;
      if (!grouped[gId]) grouped[gId] = { group: prop.property_group, properties: [] };
      grouped[gId].properties.push(prop);
    } else {
      ungrouped.push(prop);
    }
  });

  const sortedGroupKeys = Object.keys(grouped).sort(
    (a, b) => (grouped[a].group.sort_order || 0) - (grouped[b].group.sort_order || 0)
  );

  const hasProperties = properties.length > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-100 rounded w-full"></div>
          <div className="space-y-3 mt-6">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasProperties) return null;

  const renderPropertyValues = (property) => {
    const values = property.values || [];
    if (values.length === 0) return null;

    return (
      <div key={property.property_id} className="mb-4">
        <label className="block text-xs text-gray-500 mb-1.5">
          {(property.property_display_name || property.property_name).toLowerCase()}
        </label>
        <div className="relative">
          <select
            defaultValue={values[0]?.id || ''}
            className="w-full appearance-none bg-white border-2 border-gray-200 rounded-none px-4 py-3 pr-10 text-sm font-medium text-gray-900 focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
          >
            {values.map(v => (
              <option key={v.id} value={v.id}>
                {(v.display_name || v.value).toLowerCase()}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const renderGroupSection = (groupId, groupData) => {
    const isExpanded = expandedGroups[groupId] ?? true;
    return (
      <div key={`group-${groupId}`} className="bg-gray-50 rounded-lg mb-4 overflow-hidden">
        <button
          onClick={() => toggleGroup(groupId)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
        >
          <span className="text-base font-bold text-gray-900">
            {groupData.group.display_name}
          </span>
          <span className="text-gray-400 text-xl leading-none select-none">
            {isExpanded ? '\u2013' : '+'}
          </span>
        </button>
        {isExpanded && (
          <div className="px-4 pb-4">
            {groupData.properties.map(renderPropertyValues)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h4 className="text-lg font-bold text-gray-900 mb-2">
        Adjust configuration
      </h4>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Not all options shown are available for all products &ndash; please contact us if you have any questions.
      </p>

      {sortedGroupKeys.map(gId => renderGroupSection(gId, grouped[gId]))}

      {ungrouped.length > 0 && (
        <div className="mt-2">
          {ungrouped.map(renderPropertyValues)}
        </div>
      )}
    </div>
  );
}
