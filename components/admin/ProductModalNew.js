'use client';

import { useState, useEffect } from 'react';
import { propertiesAPI } from '../../lib/api';

const ProductModalNew = ({ 
  isOpen, 
  onClose, 
  onSave, 
  product = null, 
  categories = [], 
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    model: '',
    category_id: '',
    image: '',
    status: 'active',
    is_featured: false,
    sort_order: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [categoryProperties, setCategoryProperties] = useState([]);
  const [selectedPropertyValues, setSelectedPropertyValues] = useState({});
  const [productFiles, setProductFiles] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  
  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imageType, setImageType] = useState('url'); // 'url' or 'file'
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        short_description: product.short_description || '',
        model: product.model || '',
        category_id: product.category_id || '',
        image: product.image_url || product.image || '',
        status: product.status || 'active',
        is_featured: product.is_featured || false,
        sort_order: product.sort_order || 0
      });
      
      // Load existing property values
      if (product.property_values) {
        const propertyValues = {};
        product.property_values.forEach(value => {
          const propertyId = value.category_property_id;
          if (!propertyValues[propertyId]) {
            propertyValues[propertyId] = [];
          }
          propertyValues[propertyId].push(value.id);
        });
        setSelectedPropertyValues(propertyValues);
      }
      
      // Load existing files
      console.log('🔧 ProductModalNew: Loading product files', {
        product_id: product.id,
        product_name: product.name,
        files_array: product.files,
        files_count: product.files?.length || 0
      });
      
      if (product.files && Array.isArray(product.files)) {
        setProductFiles(product.files);
        console.log('✅ ProductModalNew: Files loaded successfully:', product.files.length);
      } else {
        console.log('⚠️ ProductModalNew: No files found or files not array');
        setProductFiles([]);
      }
      
      // Load category properties
      if (product.category_id) {
        loadCategoryProperties(product.category_id);
      }
    } else {
      resetForm();
    }
  }, [product]);

  // Load properties when category changes
  useEffect(() => {
    if (formData.category_id) {
      loadCategoryProperties(formData.category_id);
    } else {
      setCategoryProperties([]);
      setSelectedPropertyValues({});
    }
  }, [formData.category_id]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      model: '',
      category_id: '',
      image: '',
      status: 'active',
      is_featured: false,
      sort_order: 0
    });
    setFormErrors({});
    setCategoryProperties([]);
    setSelectedPropertyValues({});
    setProductFiles([]);
    setActiveTab('basic');
    
    // Reset image states
    setImageFile(null);
    setImageType('url');
    setImagePreview(null);
  };

  const loadCategoryProperties = async (categoryId) => {
    if (!categoryId) return;
    
    try {
      setPropertiesLoading(true);
      const response = await propertiesAPI.getByCategoryId(categoryId);
      if (response.success) {
        setCategoryProperties(response.data || []);
      }
    } catch (error) {
      console.error('Error loading category properties:', error);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
    
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Image handling functions
  const handleImageTypeChange = (type) => {
    console.log('🔄 Image type changed to:', type);
    setImageType(type);
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📸 Image file selected:', file.name, file.type, file.size);
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file (JPEG, PNG, GIF, WebP)'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setFormErrors(prev => ({
          ...prev,
          image: 'Image file size must be less than 5MB'
        }));
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any existing image URL and errors
      setFormData(prev => ({
        ...prev,
        image: ''
      }));
      setFormErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const handlePropertyValueChange = (propertyId, valueId, checked) => {
    setSelectedPropertyValues(prev => {
      const currentValues = prev[propertyId] || [];
      
      if (checked) {
        // Add value if not already selected
        if (!currentValues.includes(valueId)) {
          return {
            ...prev,
            [propertyId]: [...currentValues, valueId]
          };
        }
      } else {
        // Remove value
        return {
          ...prev,
          [propertyId]: currentValues.filter(id => id !== valueId)
        };
      }
      
      return prev;
    });
  };


  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (!formData.category_id) {
      errors.category_id = 'Category is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    console.log('📄 Preparing submission data...');
    console.log('🖼️ Image type:', imageType);
    console.log('📁 Image file:', imageFile);
    console.log('🔗 Image URL:', formData.image);
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      property_values: selectedPropertyValues,
      files: productFiles
    };
    
    // Add image based on type
    if (imageType === 'file' && imageFile) {
      console.log('📸 Adding image file to submission');
      submitData.imageFile = imageFile;
      // Remove image URL if file is selected
      delete submitData.image;
    } else if (imageType === 'url' && formData.image) {
      console.log('🔗 Using image URL:', formData.image);
      // Keep the URL in submitData.image
    }
    
    console.log('📤 Final submit data:', submitData);
    await onSave(submitData);
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
        maxWidth: '900px',
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
            {product ? 'Edit Product' : 'Add New Product'}
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
          {formData.category_id && (
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
              Properties ({categoryProperties.length})
            </button>
          )}
          {product && (
            <button
              onClick={() => setActiveTab('files')}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === 'files' ? 'white' : 'transparent',
                color: activeTab === 'files' ? '#3b82f6' : '#6b7280',
                fontWeight: activeTab === 'files' ? 600 : 400,
                cursor: 'pointer',
                borderBottom: activeTab === 'files' ? '2px solid #3b82f6' : 'none'
              }}
            >
              <i className="fas fa-file-pdf" style={{ marginRight: '0.5rem' }}></i>
              Files ({productFiles.length})
            </button>
          )}
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
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
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

                {/* Model */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Product model"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Short Description
                  </label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    placeholder="Brief product description"
                    rows={2}
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
                    placeholder="Detailed product description"
                    rows={4}
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

                {/* Product Image */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Product Image
                  </label>
                  
                  {/* Image Type Selector */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="imageType"
                          value="url"
                          checked={imageType === 'url'}
                          onChange={() => handleImageTypeChange('url')}
                        />
                        <span style={{ fontSize: '0.875rem' }}>🔗 Image URL</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="imageType"
                          value="file"
                          checked={imageType === 'file'}
                          onChange={() => handleImageTypeChange('file')}
                        />
                        <span style={{ fontSize: '0.875rem' }}>📁 Upload Image File</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Image URL Input */}
                  {imageType === 'url' && (
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
                  )}
                  
                  {/* Image File Input */}
                  {imageType === 'file' && (
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageFileChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          backgroundColor: '#f9fafb'
                        }}
                      />
                      
                      {/* File Info and Preview */}
                      {imageFile && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          backgroundColor: '#f0f9ff',
                          border: '1px solid #0ea5e9',
                          borderRadius: '8px'
                        }}>
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#0c4a6e',
                            marginBottom: '0.5rem'
                          }}>
                            📁 Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                          </div>
                          
                          {/* Image Preview */}
                          {imagePreview && (
                            <div style={{ textAlign: 'center' }}>
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                style={{
                                  maxWidth: '200px',
                                  maxHeight: '150px',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e7eb'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {formErrors.image && (
                    <div style={{
                      color: '#dc2626',
                      fontSize: '0.875rem',
                      marginTop: '0.5rem'
                    }}>
                      {formErrors.image}
                    </div>
                  )}
                </div>

                {/* Status, Featured, Sort Order */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                      <option value="draft">Draft</option>
                    </select>
                  </div>
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
                  {/* <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                      />
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>Featured Product</span>
                    </label>
                  </div> */}
                </div>
              </div>
            </form>
          )}

          {activeTab === 'properties' && formData.category_id && (
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '1rem'
              }}>
                Category Properties
              </h3>
              
              {propertiesLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  Loading properties...
                </div>
              ) : categoryProperties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No properties available for this category.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {categoryProperties.map((property) => (
                    <div
                      key={property.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        background: '#f9fafb'
                      }}
                    >
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#111827',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {property.display_name}
                          {property.is_required && (
                            <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>
                          )}
                        </h4>
                        {property.description && (
                          <p style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            margin: 0
                          }}>
                            {property.description}
                          </p>
                        )}
                      </div>
                      
                      {property.property_values && property.property_values.length > 0 ? (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '0.5rem'
                        }}>
                          {property.property_values.map((value) => (
                            <label
                              key={value.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem',
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={(selectedPropertyValues[property.id] || []).includes(value.id)}
                                onChange={(e) => handlePropertyValueChange(property.id, value.id, e.target.checked)}
                              />
                              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                                {value.display_name}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          No values available for this property.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {activeTab === 'files' && product && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#111827',
                  margin: 0
                }}>
                  Product Files ({productFiles.length})
                </h3>
                <a
                  href="/admin/product-files"
                  target="_blank"
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <i className="fas fa-external-link-alt"></i>
                  Manage Files
                </a>
              </div>
              
              {productFiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <i className="fas fa-file-pdf" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                  <p>No files uploaded yet.</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    Use the "Manage Files" button above to upload PDF files for this product.
                  </p>
                  {product && product.id && (
                    <p style={{ fontSize: '0.75rem', marginTop: '1rem', color: '#9ca3af' }}>
                      Product ID: {product.id} | Files Array: {JSON.stringify(product.files)}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {productFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: '#f9fafb'
                      }}
                    >
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: '#dc2626',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <i className="fas fa-file-pdf"></i>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '0.25rem'
                        }}>
                          {file.display_name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          {file.file_name} • {file.file_category} • {file.download_count || 0} downloads
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          background: file.is_active ? '#dcfce7' : '#fef2f2',
                          color: file.is_active ? '#166534' : '#dc2626',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem'
                        }}>
                          {file.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {file.is_featured && (
                          <span style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem'
                          }}>
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
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
          {(activeTab === 'basic' || activeTab === 'properties') && (
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
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModalNew;