'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '../../../lib/localStorage-utils';
import { propertiesAPI, categoriesAPI } from '../../../lib/api';

const PropertyValuesPage = () => {
  const router = useRouter();
  
  // State management
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [propertyValues, setPropertyValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_property_id: '',
    value: '',
    display_name: '',
    sort_order: 0,
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Authentication check
  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Property Values page - Not authenticated admin, redirecting...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Property Values page - User is authenticated admin');
    }
  }, [router]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Check token before making requests
      const token = localStorage.getItem('auth_token');
      console.log('🔍 Token before loading data:', token ? token.substring(0, 30) + '...' : 'null');
      console.log('🔍 Load timestamp:', new Date().toISOString());
      
      // Debug: Check auth state
      console.log('🔍 Auth state:', {
        isAuthenticated: authStorage.isAuthenticated(),
        isAdmin: authStorage.isAdmin(),
        role: authStorage.getRole(),
        userData: authStorage.getUserData()
      });
      
      // Add small delay to ensure token is properly saved
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Load categories, properties, and property values in parallel
      const [categoriesResponse, propertiesResponse, propertyValuesResponse] = await Promise.all([
        categoriesAPI.getAdminAll(), // Use admin endpoint
        propertiesAPI.getAll(),
        propertiesAPI.getPropertyValues()
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }

      if (propertiesResponse.success) {
        setProperties(propertiesResponse.data || []);
      }

      if (propertyValuesResponse.success) {
        const valuesData = propertyValuesResponse.data || [];
        console.log('🔍 Property Values Data:', valuesData);
        console.log('🔍 Sample Value:', valuesData[0]);
        setPropertyValues(valuesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.category_property_id) {
      errors.category_property_id = 'Property is required';
    }
    
    if (!formData.value.trim()) {
      errors.value = 'Value is required';
    }
    
    if (!formData.display_name.trim()) {
      errors.display_name = 'Display name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      category_property_id: '',
      value: '',
      display_name: '',
      sort_order: 0,
      is_active: true
    });
    setFormErrors({});
    setSelectedValue(null);
  };

  const handleAddValue = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditValue = (value) => {
    setSelectedValue(value);
    setFormData({
      category_property_id: value.category_property_id || '',
      value: value.value || '',
      display_name: value.display_name || '',
      sort_order: value.sort_order || 0,
      is_active: value.is_active !== undefined ? value.is_active : true
    });
    setShowModal(true);
  };

  const handleSaveValue = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setModalLoading(true);
      setError(null);

      let response;
      if (selectedValue) {
        // Update existing value
        response = await propertiesAPI.updatePropertyValue(selectedValue.id, formData);
      } else {
        // Create new value
        const propertyId = formData.category_property_id;
        response = await propertiesAPI.createPropertyValue(propertyId, formData);
      }

      if (response.success) {
        await loadData(); // Reload data
        setShowModal(false);
        resetForm();
        
        const successMessage = selectedValue 
          ? '✅ Property value updated successfully!' 
          : '🎉 Property value created successfully!';
        alert(successMessage);
      } else {
        if (response.errors) {
          setFormErrors(response.errors);
        }
        setError(response.message || 'Failed to save property value');
      }
    } catch (error) {
      console.error('Error saving property value:', error);
      setError('An error occurred while saving the property value');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteValue = async (valueId) => {
    if (!confirm('Are you sure you want to delete this property value?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await propertiesAPI.deletePropertyValue(valueId);
      
      if (response.success) {
        await loadData();
        alert('✅ Property value deleted successfully!');
      } else {
        setError(response.message || 'Failed to delete property value');
      }
    } catch (error) {
      console.error('Error deleting property value:', error);
      setError('An error occurred while deleting the property value');
    } finally {
      setLoading(false);
    }
  };

  // Filter values based on category, property, and search
  const filteredValues = propertyValues.filter(value => {
    // Get category ID from the value's property or category object
    const categoryId = value.category?.id || value.property?.category?.id || value.category_id;
    const propertyId = value.property?.id || value.category_property_id;
    
    const matchesCategory = selectedCategory === 'all' || categoryId == selectedCategory;
    const matchesProperty = selectedProperty === 'all' || propertyId == selectedProperty;
    const matchesSearch = !searchTerm || 
                         (value.value && value.value.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (value.display_name && value.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesProperty && matchesSearch;
  });

  // Group values by property
  const groupedValues = filteredValues.reduce((acc, value) => {
    const propertyId = value.property?.id || value.category_property_id || 'uncategorized';
    if (!acc[propertyId]) {
      acc[propertyId] = [];
    }
    acc[propertyId].push(value);
    return acc;
  }, {});

  const getPropertyName = (propertyId) => {
    if (propertyId === 'uncategorized') return 'Uncategorized';
    const property = properties.find(p => p.id == propertyId);
    return property ? `${property.display_name || property.name}` : `Property ${propertyId}`;
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id == categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  const getPropertyCategory = (propertyId) => {
    const property = properties.find(p => p.id == propertyId);
    return property ? getCategoryName(property.category?.id || property.category_id) : 'Unknown Category';
  };

  // Get properties for selected category
  const availableProperties = selectedCategory === 'all' 
    ? properties 
    : properties.filter(p => p.category_id == selectedCategory);

  if (loading && propertyValues.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <div style={{
          fontSize: '1.125rem',
          color: '#6b7280'
        }}>
          Loading property values...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-property-values" style={{ fontFamily: "'Quasimoda', 'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#111827',
            margin: 0
          }}>Property Values Management</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <p style={{
              color: '#6b7280',
              margin: 0
            }}>Manage property values and their settings</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{
                background: '#f3f4f6',
                color: '#374151',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                📊 {propertyValues.length} total values
              </span>
              <span style={{
                background: '#ecfdf5',
                color: '#065f46',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                ✅ {propertyValues.filter(v => v.is_active).length} active
              </span>
              <span style={{
                background: '#fef3c7',
                color: '#92400e',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                🔍 {filteredValues.length} filtered
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleAddValue}
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
          onMouseEnter={(e) => {
            e.target.style.background = '#e6c200';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#FFD700';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <i className="fas fa-plus"></i>
          Add Property Value
        </button>
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

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1rem',
          alignItems: 'end'
        }}>
          {/* Category Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedProperty('all'); // Reset property filter
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Property Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Filter by Property
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Properties</option>
              {availableProperties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.display_name} ({getCategoryName(property.category_id)})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Search Values
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by value or display name..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Property Values List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {Object.keys(groupedValues).length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <i className="fas fa-list" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              No property values found
            </h3>
            <p style={{ fontSize: '0.875rem' }}>
              {searchTerm || selectedCategory !== 'all' || selectedProperty !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Start by adding your first property value'
              }
            </p>
          </div>
        ) : (
          Object.keys(groupedValues).map(propertyId => (
            <div key={propertyId} style={{ borderBottom: '1px solid #e5e7eb' }}>
              {/* Property Header */}
              <div style={{
                background: '#f9fafb',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-cog"></i>
                    {getPropertyName(propertyId)}
                    <span style={{
                      background: '#e5e7eb',
                      color: '#6b7280',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem'
                    }}>
                      {groupedValues[propertyId].length} values
                    </span>
                  </h3>
                  <span style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    📂 {getPropertyCategory(propertyId)}
                  </span>
                </div>
              </div>

              {/* Values in this property */}
              <div>
                {groupedValues[propertyId]
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map(value => (
                  <div
                    key={value.id}
                    style={{
                      padding: '1.5rem',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#111827',
                          margin: 0
                        }}>
                          {value.display_name}
                        </h4>
                        <span style={{
                          background: value.is_active ? '#dcfce7' : '#fef2f2',
                          color: value.is_active ? '#166534' : '#dc2626',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem'
                        }}>
                          {value.is_active ? 'Active' : 'Inactive'}
                        </span>

                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: '0 0 0.5rem 0'
                      }}>
                        Value: <code style={{ background: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '4px' }}>
                          {value.value}
                        </code>
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        <span>
                          📂 Category: <strong>{value.category?.name || getCategoryName(value.category?.id)}</strong>
                        </span>
                        <span>
                          🏷️ Property: <strong>{value.property?.display_name || value.property?.name}</strong>
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEditValue(value)}
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #dbeafe',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        title="Edit Value"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteValue(value.id)}
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        title="Delete Value"
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

      {/* Add/Edit Property Value Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#111827',
                margin: 0
              }}>
                {selectedValue ? 'Edit Property Value' : 'Add New Property Value'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveValue}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Property */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Property *
                  </label>
                  <select
                    name="category_property_id"
                    value={formData.category_property_id}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${formErrors.category_property_id ? '#dc2626' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Select a property</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.display_name} ({getCategoryName(property.category_id)})
                      </option>
                    ))}
                  </select>
                  {formErrors.category_property_id && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {formErrors.category_property_id}
                    </div>
                  )}
                </div>

                {/* Value and Display Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Value *
                    </label>
                    <input
                      type="text"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="e.g., student-tables"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${formErrors.value ? '#dc2626' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    />
                    {formErrors.value && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {formErrors.value}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Display Name *
                    </label>
                    <input
                      type="text"
                      name="display_name"
                      value={formData.display_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Student Tables/Desks"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${formErrors.display_name ? '#dc2626' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    />
                    {formErrors.display_name && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {formErrors.display_name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Active Checkbox */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Active</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  style={{
                    background: modalLoading ? '#9ca3af' : '#FFD700',
                    color: '#2c2c2c',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: modalLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {modalLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>
                      {selectedValue ? 'Update Value' : 'Create Value'}
                    </>
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

export default PropertyValuesPage;