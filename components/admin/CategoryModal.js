'use client';

import { useState, useEffect } from 'react';
import { propertiesAPI } from '../../lib/api';

const CategoryModal = ({ 
  isOpen, 
  onClose, 
  category, 
  onSave,
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    alt_text: '',
    icon: '',
    color: '#3d5c4d',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [allProperties, setAllProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({
    name: '',
    display_name: '',
    description: '',
    input_type: 'select',
    is_required: false,
    is_active: true
  });

  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        alt_text: category.alt_text || '',
        icon: category.icon || '',
        color: category.color || '#3d5c4d',
        status: category.status || 'active'
      });
      loadCategoryProperties(category.id);
    } else {
      resetForm();
    }
    // Always load all properties for selection
    loadAllProperties();
  }, [category]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      alt_text: '',
      icon: '',
      color: '#3d5c4d',
      status: 'active'
    });
    setFormErrors({});
    setProperties([]);
    setSelectedProperties([]);
    setActiveTab('basic');
  };

  const loadCategoryProperties = async (categoryId) => {
    if (!categoryId) return;
    
    // Check if we have authentication token and admin role
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'admin') {
      console.warn('No authentication token or not admin, skipping category properties load');
      setProperties([]);
      setSelectedProperties([]);
      return;
    }
    
    try {
      setPropertiesLoading(true);
      console.log('🔍 Loading properties for category:', categoryId);
      const response = await propertiesAPI.getByCategoryId(categoryId);
      console.log('📥 Category properties response:', response);
      if (response.success) {
        const categoryProps = response.data || [];
        setProperties(categoryProps);
        setSelectedProperties(categoryProps.map(prop => prop.id));
      } else {
        console.warn('Failed to load category properties:', response.message);
        setProperties([]);
        setSelectedProperties([]);
      }
    } catch (error) {
      console.error('Error loading category properties:', error);
      // Don't show error to user, just set empty arrays
      setProperties([]);
      setSelectedProperties([]);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const loadAllProperties = async () => {
    // Check if we have authentication token and admin role
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'admin') {
      console.warn('No authentication token or not admin, skipping all properties load');
      setAllProperties([]);
      return;
    }
    
    try {
      const response = await propertiesAPI.getAll();
      if (response.success) {
        setAllProperties(response.data || []);
      } else {
        console.warn('Failed to load all properties:', response.message);
        setAllProperties([]);
      }
    } catch (error) {
      console.error('Error loading all properties:', error);
      // Don't show error to user, just set empty array
      setAllProperties([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePropertyInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProperty(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    if (!formData.slug.trim()) {
      errors.slug = 'Category slug is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePropertySelection = (propertyId) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Include selected properties in form data
    const dataToSave = {
      ...formData,
      selectedProperties: selectedProperties
    };
    
    await onSave(dataToSave);
  };

  const handleAddProperty = async () => {
    if (!newProperty.name.trim() || !newProperty.display_name.trim()) {
      alert('Property name and display name are required');
      return;
    }

    try {
      const propertyData = {
        ...newProperty,
        category_id: category?.id
      };
      
      const response = await propertiesAPI.create(propertyData);
      if (response.success) {
        setProperties(prev => [...prev, response.data]);
        setNewProperty({
          name: '',
          display_name: '',
          description: '',
          input_type: 'select',
          is_required: false,
          is_active: true
        });
      }
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Failed to add property');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const response = await propertiesAPI.delete(propertyId);
      if (response.success) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  if (!isOpen) return null;

  return (
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
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <button
            onClick={() => setActiveTab('basic')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: activeTab === 'basic' ? 'white' : 'transparent',
              color: activeTab === 'basic' ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === 'basic' ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === 'basic' ? '2px solid #3b82f6' : 'none'
            }}
          >
            <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: activeTab === 'properties' ? 'white' : 'transparent',
              color: activeTab === 'properties' ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === 'properties' ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === 'properties' ? '2px solid #3b82f6' : 'none'
            }}
          >
            <i className="fas fa-cogs" style={{ marginRight: '0.5rem' }}></i>
            Properties ({selectedProperties.length})
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '2rem'
        }}>
          {activeTab === 'basic' && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter category name"
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

                {/* Slug */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Category Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="category-slug"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${formErrors.slug ? '#dc2626' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  />
                  {formErrors.slug && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {formErrors.slug}
                    </div>
                  )}
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
                    placeholder="Enter category description"
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

                {/* Image URL */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Alt Text */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Alt Text
                  </label>
                  <input
                    type="text"
                    name="alt_text"
                    value={formData.alt_text}
                    onChange={handleInputChange}
                    placeholder="Image description for accessibility"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Icon and Color */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Icon Class
                    </label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      placeholder="fas fa-chair"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Color
                    </label>
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        height: '2.75rem'
                      }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'properties' && (
            <div>
              {/* Properties Selection */}
              <div style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Select Properties for this Category
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '1.5rem'
                }}>
                  Choose which properties should be available for products in this category.
                </p>
                {/* Available Properties List */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '1rem',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '0.5rem'
                }}>
                  {allProperties.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2rem', 
                      color: '#6b7280',
                      gridColumn: '1 / -1'
                    }}>
                      No properties available. Create properties first in the Properties management page.
                    </div>
                  ) : (
                    allProperties.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => handlePropertySelection(property.id)}
                        style={{
                          border: selectedProperties.includes(property.id) 
                            ? '2px solid #3b82f6' 
                            : '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '1rem',
                          background: selectedProperties.includes(property.id) 
                            ? '#eff6ff' 
                            : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={selectedProperties.includes(property.id)}
                            onChange={() => {}} // Handled by parent div onClick
                            style={{ marginRight: '0.5rem' }}
                          />
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#111827',
                            margin: 0
                          }}>
                            {property.display_name || property.name}
                          </h4>
                        </div>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: '0 0 0.5rem 0'
                        }}>
                          {property.description || 'No description'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{
                            background: property.is_active ? '#dcfce7' : '#fef2f2',
                            color: property.is_active ? '#166534' : '#dc2626',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem'
                          }}>
                            {property.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span style={{
                            background: '#f3f4f6',
                            color: '#6b7280',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem'
                          }}>
                            {property.input_type}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selected Properties Summary */}
              {selectedProperties.length > 0 && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#065f46',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Selected Properties ({selectedProperties.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedProperties.map(propId => {
                      const property = allProperties.find(p => p.id === propId);
                      return property ? (
                        <span
                          key={propId}
                          style={{
                            background: '#065f46',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          {property.display_name || property.name}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePropertySelection(propId);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '0.75rem'
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem'
        }}>
          <button
            onClick={() => {
              onClose();
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
          {activeTab === 'basic' && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#FFD700',
                color: '#2c2c2c',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>
                  {category ? 'Update Category' : 'Create Category'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;