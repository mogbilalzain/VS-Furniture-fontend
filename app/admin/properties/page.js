'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '../../../lib/localStorage-utils';
import { propertiesAPI, categoriesAPI } from '../../../lib/api';

const PropertiesPage = () => {
  const router = useRouter();
  
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Property modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    property_group_id: '',
    name: '',
    display_name: '',
    description: '',
    input_type: 'select',
    is_required: false,
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Group modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupModalLoading, setGroupModalLoading] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    category_id: '',
    name: '',
    display_name: '',
    sort_order: 0,
    is_active: true
  });
  const [groupFormErrors, setGroupFormErrors] = useState({});

  // Tab state
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      router.replace('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesResponse, propertiesResponse, groupsResponse] = await Promise.all([
        categoriesAPI.getAll(),
        propertiesAPI.getAll(),
        propertiesAPI.getAllPropertyGroups()
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }
      if (propertiesResponse.success) {
        setProperties(propertiesResponse.data || []);
      }
      if (groupsResponse.success) {
        setPropertyGroups(groupsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // --- Property handlers ---

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.category_id) errors.category_id = 'Category is required';
    if (!formData.name.trim()) errors.name = 'Property name is required';
    if (!formData.display_name.trim()) errors.display_name = 'Display name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      property_group_id: '',
      name: '',
      display_name: '',
      description: '',
      input_type: 'select',
      is_required: false,
      is_active: true
    });
    setFormErrors({});
    setSelectedProperty(null);
  };

  const handleAddProperty = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setFormData({
      category_id: property.category?.id || property.category_id || '',
      property_group_id: property.property_group_id || '',
      name: property.name || '',
      display_name: property.display_name || '',
      description: property.description || '',
      input_type: property.input_type || 'select',
      is_required: property.is_required || false,
      is_active: property.is_active !== undefined ? property.is_active : true
    });
    setShowModal(true);
  };

  const handleSaveProperty = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setModalLoading(true);
      setError(null);

      const payload = {
        ...formData,
        property_group_id: formData.property_group_id || null
      };

      let response;
      if (selectedProperty) {
        response = await propertiesAPI.update(selectedProperty.id, payload);
      } else {
        response = await propertiesAPI.create(payload);
      }

      if (response.success) {
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        if (response.errors) setFormErrors(response.errors);
        setError(response.message || 'Failed to save property');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      setError('An error occurred while saving the property');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property? This will also delete all its values.')) return;
    try {
      setLoading(true);
      const response = await propertiesAPI.delete(propertyId);
      if (response.success) {
        await loadData();
      } else {
        setError(response.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      setError('An error occurred while deleting the property');
    } finally {
      setLoading(false);
    }
  };

  // --- Group handlers ---

  const handleGroupInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGroupFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'sort_order' ? parseInt(value) || 0 : value)
    }));
    if (groupFormErrors[name]) {
      setGroupFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateGroupForm = () => {
    const errors = {};
    if (!groupFormData.category_id) errors.category_id = 'Category is required';
    if (!groupFormData.name.trim()) errors.name = 'Group name is required';
    if (!groupFormData.display_name.trim()) errors.display_name = 'Display name is required';
    setGroupFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetGroupForm = () => {
    setGroupFormData({
      category_id: '',
      name: '',
      display_name: '',
      sort_order: 0,
      is_active: true
    });
    setGroupFormErrors({});
    setSelectedGroup(null);
  };

  const handleAddGroup = () => {
    resetGroupForm();
    setShowGroupModal(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setGroupFormData({
      category_id: group.category_id || '',
      name: group.name || '',
      display_name: group.display_name || '',
      sort_order: group.sort_order || 0,
      is_active: group.is_active !== undefined ? group.is_active : true
    });
    setShowGroupModal(true);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!validateGroupForm()) return;

    try {
      setGroupModalLoading(true);
      setError(null);

      let response;
      if (selectedGroup) {
        response = await propertiesAPI.updatePropertyGroup(selectedGroup.id, groupFormData);
      } else {
        response = await propertiesAPI.createPropertyGroup(groupFormData.category_id, groupFormData);
      }

      if (response.success) {
        await loadData();
        setShowGroupModal(false);
        resetGroupForm();
      } else {
        if (response.errors) setGroupFormErrors(response.errors);
        setError(response.message || 'Failed to save property group');
      }
    } catch (error) {
      console.error('Error saving group:', error);
      setError('An error occurred while saving the property group');
    } finally {
      setGroupModalLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this group? Properties in this group will become ungrouped.')) return;
    try {
      setLoading(true);
      const response = await propertiesAPI.deletePropertyGroup(groupId);
      if (response.success) {
        await loadData();
      } else {
        setError(response.message || 'Failed to delete property group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('An error occurred while deleting the property group');
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering & grouping ---

  const filteredProperties = properties.filter(property => {
    const catId = property.category?.id || property.category_id;
    const matchesCategory = selectedCategory === 'all' || catId == selectedCategory;
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedProperties = filteredProperties.reduce((acc, property) => {
    const categoryId = property.category?.id || property.category_id || 'uncategorized';
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(property);
    return acc;
  }, {});

  const filteredGroups = propertyGroups.filter(group => {
    const matchesCategory = selectedCategory === 'all' || group.category_id == selectedCategory;
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedGroupsByCategory = filteredGroups.reduce((acc, group) => {
    const categoryId = group.category_id || 'uncategorized';
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(group);
    return acc;
  }, {});

  const getCategoryName = (categoryId) => {
    if (categoryId === 'uncategorized') return 'Uncategorized';
    const category = categories.find(c => c.id == categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  const getGroupName = (groupId) => {
    const group = propertyGroups.find(g => g.id == groupId);
    return group ? group.display_name : null;
  };

  const groupsForCategory = (categoryId) => {
    return propertyGroups.filter(g => g.category_id == categoryId);
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '0.75rem',
    border: `2px solid ${hasError ? '#dc2626' : '#e5e7eb'}`,
    borderRadius: '8px',
    fontSize: '0.875rem'
  });

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.5rem'
  };

  if (loading && properties.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="admin-properties" style={{ fontFamily: "'Quasimoda', 'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Properties Management
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
            Manage category properties, groups, and their settings
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleAddGroup}
            style={{
              background: '#f0f9ff',
              color: '#0369a1',
              border: '2px solid #bae6fd',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fas fa-layer-group"></i>
            Add Group
          </button>
          <button
            onClick={handleAddProperty}
            style={{
              background: '#FFD700',
              color: '#2c2c2c',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fas fa-plus"></i>
            Add Property
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('properties')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'properties' ? '2px solid #FFD700' : '2px solid transparent',
            color: activeTab === 'properties' ? '#111827' : '#6b7280',
            marginBottom: '-2px'
          }}
        >
          <i className="fas fa-cogs" style={{ marginRight: '0.5rem' }}></i>
          Properties ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'groups' ? '2px solid #0369a1' : '2px solid transparent',
            color: activeTab === 'groups' ? '#111827' : '#6b7280',
            marginBottom: '-2px'
          }}
        >
          <i className="fas fa-layer-group" style={{ marginRight: '0.5rem' }}></i>
          Property Groups ({propertyGroups.length})
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={inputStyle(false)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or display name..."
              style={inputStyle(false)}
            />
          </div>
        </div>
      </div>

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {Object.keys(groupedProperties).length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              <i className="fas fa-cogs" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>No properties found</h3>
              <p style={{ fontSize: '0.875rem' }}>
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start by adding your first property'}
              </p>
            </div>
          ) : (
            Object.keys(groupedProperties).map(categoryId => (
              <div key={categoryId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ background: '#f9fafb', padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{
                    fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0,
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <i className="fas fa-folder"></i>
                    {getCategoryName(categoryId)}
                    <span style={{
                      background: '#e5e7eb', color: '#6b7280',
                      padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem'
                    }}>
                      {groupedProperties[categoryId].length}
                    </span>
                  </h3>
                </div>
                <div>
                  {groupedProperties[categoryId].map(property => (
                    <div
                      key={property.id}
                      style={{
                        padding: '1.5rem', borderBottom: '1px solid #f3f4f6',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'start'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                            {property.display_name}
                          </h4>
                          <span style={{
                            background: property.is_active ? '#dcfce7' : '#fef2f2',
                            color: property.is_active ? '#166534' : '#dc2626',
                            padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem'
                          }}>
                            {property.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {property.is_required && (
                            <span style={{
                              background: '#fef3c7', color: '#92400e',
                              padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem'
                            }}>Required</span>
                          )}
                          <span style={{
                            background: '#e0e7ff', color: '#3730a3',
                            padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem'
                          }}>
                            {property.input_type}
                          </span>
                          {property.property_group && (
                            <span style={{
                              background: '#f0f9ff', color: '#0369a1',
                              padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem',
                              border: '1px solid #bae6fd'
                            }}>
                              <i className="fas fa-layer-group" style={{ marginRight: '0.25rem', fontSize: '0.625rem' }}></i>
                              {property.property_group.display_name}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
                          Name: <code style={{ background: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '4px' }}>
                            {property.name}
                          </code>
                          {property.values_count !== undefined && (
                            <span style={{ marginLeft: '1rem' }}>
                              Values: <strong>{property.active_values_count || 0}</strong>/{property.values_count || 0}
                            </span>
                          )}
                        </p>
                        {property.description && (
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                            {property.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditProperty(property)}
                          style={{
                            background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe',
                            borderRadius: '6px', padding: '0.5rem', fontSize: '0.875rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                          }}
                          title="Edit Property"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          style={{
                            background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                            borderRadius: '6px', padding: '0.5rem', fontSize: '0.875rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                          }}
                          title="Delete Property"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {Object.keys(groupedGroupsByCategory).length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              <i className="fas fa-layer-group" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>No property groups found</h3>
              <p style={{ fontSize: '0.875rem' }}>
                Property groups allow you to organize related properties together (e.g. "Frame" group with "Size" and "Color" properties).
              </p>
            </div>
          ) : (
            Object.keys(groupedGroupsByCategory).map(categoryId => (
              <div key={categoryId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ background: '#f9fafb', padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{
                    fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0,
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <i className="fas fa-folder"></i>
                    {getCategoryName(categoryId)}
                    <span style={{
                      background: '#e5e7eb', color: '#6b7280',
                      padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem'
                    }}>
                      {groupedGroupsByCategory[categoryId].length}
                    </span>
                  </h3>
                </div>
                <div>
                  {groupedGroupsByCategory[categoryId].map(group => (
                    <div
                      key={group.id}
                      style={{
                        padding: '1.5rem', borderBottom: '1px solid #f3f4f6',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'start'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                            <i className="fas fa-layer-group" style={{ color: '#0369a1', marginRight: '0.5rem' }}></i>
                            {group.display_name}
                          </h4>
                          <span style={{
                            background: group.is_active ? '#dcfce7' : '#fef2f2',
                            color: group.is_active ? '#166534' : '#dc2626',
                            padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem'
                          }}>
                            {group.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span style={{
                            background: '#f0f9ff', color: '#0369a1',
                            padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem'
                          }}>
                            {group.properties_count || 0} properties
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                          Name: <code style={{ background: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '4px' }}>
                            {group.name}
                          </code>
                          <span style={{ marginLeft: '1rem' }}>
                            Sort: {group.sort_order}
                          </span>
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditGroup(group)}
                          style={{
                            background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe',
                            borderRadius: '6px', padding: '0.5rem', fontSize: '0.875rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                          }}
                          title="Edit Group"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          style={{
                            background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                            borderRadius: '6px', padding: '0.5rem', fontSize: '0.875rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                          }}
                          title="Delete Group"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Property Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '2rem',
            width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                {selectedProperty ? 'Edit Property' : 'Add New Property'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#6b7280', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProperty}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Category */}
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange}
                    style={inputStyle(formErrors.category_id)}>
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {formErrors.category_id && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.category_id}</div>
                  )}
                </div>

                {/* Property Group */}
                <div>
                  <label style={labelStyle}>Property Group (Optional)</label>
                  <select name="property_group_id" value={formData.property_group_id} onChange={handleInputChange}
                    style={inputStyle(false)}>
                    <option value="">No group (ungrouped)</option>
                    {formData.category_id && groupsForCategory(formData.category_id).map(group => (
                      <option key={group.id} value={group.id}>{group.display_name}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>
                    Assign this property to a group to organize related properties together.
                  </p>
                </div>

                {/* Name and Display Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Property Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                      placeholder="e.g., type" style={inputStyle(formErrors.name)} />
                    {formErrors.name && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.name}</div>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Display Name *</label>
                    <input type="text" name="display_name" value={formData.display_name} onChange={handleInputChange}
                      placeholder="e.g., Type" style={inputStyle(formErrors.display_name)} />
                    {formErrors.display_name && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.display_name}</div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange}
                    placeholder="Property description..." rows={3}
                    style={{ ...inputStyle(false), resize: 'vertical' }} />
                </div>

                {/* Input Type */}
                <div>
                  <label style={labelStyle}>Input Type</label>
                  <select name="input_type" value={formData.input_type} onChange={handleInputChange}
                    style={inputStyle(false)}>
                    <option value="select">Select (Dropdown)</option>
                    <option value="checkbox">Checkbox (Multiple)</option>
                    <option value="text">Text Input</option>
                    <option value="number">Number Input</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="is_required" checked={formData.is_required} onChange={handleInputChange} />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Required</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Active</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{
                    background: '#f3f4f6', color: '#374151', border: 'none',
                    borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '0.875rem', cursor: 'pointer'
                  }}>
                  Cancel
                </button>
                <button type="submit" disabled={modalLoading}
                  style={{
                    background: modalLoading ? '#9ca3af' : '#FFD700', color: '#2c2c2c',
                    border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem', fontWeight: 600, cursor: modalLoading ? 'not-allowed' : 'pointer'
                  }}>
                  {modalLoading ? (
                    <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Saving...</>
                  ) : (
                    <><i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>{selectedProperty ? 'Update Property' : 'Create Property'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Group Modal */}
      {showGroupModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '2rem',
            width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                <i className="fas fa-layer-group" style={{ color: '#0369a1', marginRight: '0.5rem' }}></i>
                {selectedGroup ? 'Edit Property Group' : 'Add New Property Group'}
              </h2>
              <button
                onClick={() => { setShowGroupModal(false); resetGroupForm(); }}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#6b7280', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveGroup}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Category */}
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select name="category_id" value={groupFormData.category_id} onChange={handleGroupInputChange}
                    disabled={!!selectedGroup}
                    style={{ ...inputStyle(groupFormErrors.category_id), opacity: selectedGroup ? 0.6 : 1 }}>
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {groupFormErrors.category_id && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{groupFormErrors.category_id}</div>
                  )}
                </div>

                {/* Name and Display Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Group Name *</label>
                    <input type="text" name="name" value={groupFormData.name} onChange={handleGroupInputChange}
                      placeholder="e.g., frame" style={inputStyle(groupFormErrors.name)} />
                    {groupFormErrors.name && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{groupFormErrors.name}</div>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Display Name *</label>
                    <input type="text" name="display_name" value={groupFormData.display_name} onChange={handleGroupInputChange}
                      placeholder="e.g., Frame" style={inputStyle(groupFormErrors.display_name)} />
                    {groupFormErrors.display_name && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{groupFormErrors.display_name}</div>
                    )}
                  </div>
                </div>

                {/* Sort Order and Active */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                  <div>
                    <label style={labelStyle}>Sort Order</label>
                    <input type="number" name="sort_order" value={groupFormData.sort_order} onChange={handleGroupInputChange}
                      min="0" style={inputStyle(false)} />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0' }}>
                      <input type="checkbox" name="is_active" checked={groupFormData.is_active} onChange={handleGroupInputChange} />
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>Active</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button"
                  onClick={() => { setShowGroupModal(false); resetGroupForm(); }}
                  style={{
                    background: '#f3f4f6', color: '#374151', border: 'none',
                    borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '0.875rem', cursor: 'pointer'
                  }}>
                  Cancel
                </button>
                <button type="submit" disabled={groupModalLoading}
                  style={{
                    background: groupModalLoading ? '#9ca3af' : '#0369a1', color: 'white',
                    border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem', fontWeight: 600, cursor: groupModalLoading ? 'not-allowed' : 'pointer'
                  }}>
                  {groupModalLoading ? (
                    <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Saving...</>
                  ) : (
                    <><i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>{selectedGroup ? 'Update Group' : 'Create Group'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
