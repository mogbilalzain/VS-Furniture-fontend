'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '../../../lib/localStorage-utils';
import { propertiesAPI, categoriesAPI } from '../../../lib/api';

const PropertiesPage = () => {
  const router = useRouter();
  
  // State management
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    display_name: '',
    description: '',
    input_type: 'select',
    is_required: false,
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Authentication check
  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Properties page - Not authenticated admin, redirecting...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Properties page - User is authenticated admin');
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
      
      // Load categories and properties in parallel
      const [categoriesResponse, propertiesResponse] = await Promise.all([
        categoriesAPI.getAll(),
        propertiesAPI.getAll()
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }

      if (propertiesResponse.success) {
        setProperties(propertiesResponse.data || []);
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
    
    if (!formData.category_id) {
      errors.category_id = 'Category is required';
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Property name is required';
    }
    
    if (!formData.display_name.trim()) {
      errors.display_name = 'Display name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
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
      category_id: property.category_id || '',
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
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setModalLoading(true);
      setError(null);

      let response;
      if (selectedProperty) {
        // Update existing property
        response = await propertiesAPI.update(selectedProperty.id, formData);
      } else {
        // Create new property
        response = await propertiesAPI.create(formData);
      }

      if (response.success) {
        await loadData(); // Reload data
        setShowModal(false);
        resetForm();
        
        const successMessage = selectedProperty 
          ? '✅ Property updated successfully!' 
          : '🎉 Property created successfully!';
        alert(successMessage);
      } else {
        if (response.errors) {
          setFormErrors(response.errors);
        }
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
    if (!confirm('Are you sure you want to delete this property? This will also delete all its values.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await propertiesAPI.delete(propertyId);
      
      if (response.success) {
        await loadData();
        alert('✅ Property deleted successfully!');
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

  // Filter properties based on category and search
  const filteredProperties = properties.filter(property => {
    const matchesCategory = selectedCategory === 'all' || property.category_id == selectedCategory;
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group properties by category
  const groupedProperties = filteredProperties.reduce((acc, property) => {
    const categoryId = property.category_id || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(property);
    return acc;
  }, {});

  const getCategoryName = (categoryId) => {
    if (categoryId === 'uncategorized') return 'Uncategorized';
    const category = categories.find(c => c.id == categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  if (loading && properties.length === 0) {
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
          Loading properties...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-properties" style={{ fontFamily: "'Quasimoda', 'Inter', sans-serif" }}>
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
          }}>Properties Management</h1>
          <p style={{
            color: '#6b7280',
            margin: '0.25rem 0 0 0'
          }}>Manage category properties and their settings</p>
        </div>
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
          Add Property
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
          gridTemplateColumns: '1fr 1fr',
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
              onChange={(e) => setSelectedCategory(e.target.value)}
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

          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Search Properties
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or display name..."
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

      {/* Properties List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {Object.keys(groupedProperties).length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <i className="fas fa-cogs" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              No properties found
            </h3>
            <p style={{ fontSize: '0.875rem' }}>
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Start by adding your first property'
              }
            </p>
          </div>
        ) : (
          Object.keys(groupedProperties).map(categoryId => (
            <div key={categoryId} style={{ borderBottom: '1px solid #e5e7eb' }}>
              {/* Category Header */}
              <div style={{
                background: '#f9fafb',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#111827',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-folder"></i>
                  {getCategoryName(categoryId)}
                  <span style={{
                    background: '#e5e7eb',
                    color: '#6b7280',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem'
                  }}>
                    {groupedProperties[categoryId].length}
                  </span>
                </h3>
              </div>

              {/* Properties in this category */}
              <div>
                {groupedProperties[categoryId].map(property => (
                  <div
                    key={property.id}
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
                          {property.display_name}
                        </h4>
                        <span style={{
                          background: property.is_active ? '#dcfce7' : '#fef2f2',
                          color: property.is_active ? '#166534' : '#dc2626',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem'
                        }}>
                          {property.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {property.is_required && (
                          <span style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem'
                          }}>
                            Required
                          </span>
                        )}
                        <span style={{
                          background: '#e0e7ff',
                          color: '#3730a3',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem'
                        }}>
                          {property.input_type}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: '0 0 0.5rem 0'
                      }}>
                        Name: <code style={{ background: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '4px' }}>
                          {property.name}
                        </code>
                      </p>
                      {property.description && (
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {property.description}
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEditProperty(property)}
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
                        title="Edit Property"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
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

      {/* Add/Edit Property Modal */}
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
                {selectedProperty ? 'Edit Property' : 'Add New Property'}
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

            <form onSubmit={handleSaveProperty}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Category */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${formErrors.category_id ? '#dc2626' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category_id && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {formErrors.category_id}
                    </div>
                  )}
                </div>

                {/* Name and Display Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Property Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., type"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${formErrors.name ? '#dc2626' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    />
                    {formErrors.name && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {formErrors.name}
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
                      placeholder="e.g., Type"
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

                {/* Description */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Property description..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Input Type */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Input Type
                  </label>
                  <select
                    name="input_type"
                    value={formData.input_type}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="select">Select (Dropdown)</option>
                    <option value="checkbox">Checkbox (Multiple)</option>
                    <option value="text">Text Input</option>
                    <option value="number">Number Input</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="is_required"
                      checked={formData.is_required}
                      onChange={handleInputChange}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Required</span>
                  </label>
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
                      {selectedProperty ? 'Update Property' : 'Create Property'}
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

export default PropertiesPage;