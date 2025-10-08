'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth-context'
import { authStorage, adminRedirect } from '../../../lib/localStorage-utils'
import { categoriesAPI } from '../../../lib/api'
import CategoryModal from '../../../components/admin/CategoryModal'

const CategoriesPage = () => {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin } = useAuth()
  
  // State management
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'fas fa-cube',
    color: '#3d5c4d',
    status: 'active'
  })
  const [formErrors, setFormErrors] = useState({})

  // Authentication check and load data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      console.log('🔍 Categories page - Auth check');
      console.log('🔍 Page load timestamp:', new Date().toISOString());
      
      // Check localStorage immediately
      const immediateToken = localStorage.getItem('auth_token');
      console.log('🔍 Token on page load:', immediateToken ? immediateToken.substring(0, 30) + '...' : 'null');
      
      console.log('🔍 localStorage debug:', authStorage.getDebugInfo());
      
      // Use localStorage for immediate auth check
      if (!authStorage.isAuthenticatedAdmin()) {
        console.log('❌ Not authenticated admin, redirecting to login...');
        router.replace('/admin/login');
        return;
      }
      
      // If authenticated and admin, load categories
      console.log('✅ User is authenticated admin, loading categories...');
      
      // Add small delay to ensure token is properly saved
      await new Promise(resolve => setTimeout(resolve, 100));
      await loadCategories();
    };
    
    checkAuthAndLoadData();
  }, [router])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Loading admin categories...')
      
      // Debug: Check token before making request
      const token = localStorage.getItem('auth_token');
      console.log('🔍 Token before categories request:', token ? token.substring(0, 30) + '...' : 'null');
      console.log('🔍 Request timestamp:', new Date().toISOString());
      
      const response = await categoriesAPI.getAdminAll()
      console.log('📥 Admin categories response:', response)
      
      if (response.success) {
        setCategories(response.data || [])
        console.log('✅ Categories loaded successfully:', response.data?.length || 0)
      } else {
        setError('Failed to load categories')
        console.error('❌ Failed to load categories:', response)
      }
    } catch (err) {
      console.error('❌ Error loading categories:', err)
      
      // Handle specific error types
      if (err.message?.includes('401')) {
        setError('Authentication required. Please login again.')
        router.push('/admin/login')
      } else if (err.message?.includes('403')) {
        setError('Access denied. Admin privileges required.')
        router.push('/admin/login')
      } else if (err.message?.includes('Network Error') || err.message?.includes('Failed to fetch')) {
        setError('Server connection failed. Please check if the backend is running.')
      } else {
        setError(err.message || 'Failed to load categories')
      }
    } finally {
      setLoading(false)
    }
  }

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({
        ...prev,
        slug: slug
      }))
    }

    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required'
    }
    if (!formData.slug.trim()) {
      errors.slug = 'Category slug is required'
    }
    if (!formData.description.trim()) {
      errors.description = 'Category description is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'fas fa-cube',
      color: '#3d5c4d',
      status: 'active'
    })
    setFormErrors({})
    setSelectedCategory(null)
  }

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setShowModal(true)
  }

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    setShowModal(true)
  }

  const handleModalSave = async (categoryData) => {
    try {
      setModalLoading(true)
      setError(null)

      // Debug: Check token before making request
      const token = localStorage.getItem('auth_token');
      console.log('🔍 Token before category save:', token ? token.substring(0, 30) + '...' : 'null');
      console.log('🔍 Save timestamp:', new Date().toISOString());
      
      // Debug: Check auth state
      console.log('🔍 Auth state:', {
        isAuthenticated: authStorage.isAuthenticated(),
        isAdmin: authStorage.isAdmin(),
        role: authStorage.getRole(),
        userData: authStorage.getUserData()
      });

      let response
      if (selectedCategory) {
        // Update existing category
        console.log('🔄 Updating category:', selectedCategory.id);
        response = await categoriesAPI.update(selectedCategory.id, categoryData)
        
        // If properties were selected, update category properties
        if (categoryData.selectedProperties) {
          try {
            console.log('🔄 Updating category properties:', categoryData.selectedProperties);
            await categoriesAPI.updateProperties(selectedCategory.id, categoryData.selectedProperties);
          } catch (propError) {
            console.warn('Failed to update category properties:', propError);
          }
        }
      } else {
        // Create new category
        console.log('🔄 Creating new category:', categoryData);
        response = await categoriesAPI.create(categoryData)
        
        // If properties were selected and category was created successfully, assign properties
        if (response.success && categoryData.selectedProperties && categoryData.selectedProperties.length > 0) {
          try {
            console.log('🔄 Assigning properties to new category:', categoryData.selectedProperties);
            await categoriesAPI.updateProperties(response.data.id, categoryData.selectedProperties);
          } catch (propError) {
            console.warn('Failed to assign properties to new category:', propError);
          }
        }
      }

      if (response.success) {
        await loadCategories()
        setShowModal(false)
        setSelectedCategory(null)
        // Show success message in English
        const successMessage = selectedCategory 
          ? '✅ Category updated successfully!' 
          : '🎉 Category created successfully!';
        alert(successMessage);
      } else {
        // Handle validation errors
        if (response.errors) {
          console.error('Validation errors:', response.errors);
          const errorMessages = Object.values(response.errors).flat().join(', ');
          setError(`Validation errors: ${errorMessages}`);
        } else {
          setError(response.message || 'Failed to save category')
        }
        throw new Error(response.message || 'Failed to save category');
      }
    } catch (err) {
      console.error('Category save error:', err);
      setError('An error occurred while saving the category');
      throw err;
    } finally {
      setModalLoading(false)
    }
  }

  const handleSaveCategory = async (categoryData) => {
    // Use categoryData from modal if provided, otherwise use formData
    const dataToSave = categoryData || formData;
    
    if (!validateForm()) return

    try {
      setLoading(true)
      let response

      if (selectedCategory) {
        // Update existing category
        response = await categoriesAPI.update(selectedCategory.id, dataToSave)
        
        // If properties were selected, update category properties
        if (dataToSave.selectedProperties) {
          try {
            await categoriesAPI.updateProperties(selectedCategory.id, dataToSave.selectedProperties);
          } catch (propError) {
            console.warn('Failed to update category properties:', propError);
          }
        }
      } else {
        // Create new category
        response = await categoriesAPI.create(dataToSave)
        
        // If properties were selected and category was created successfully, assign properties
        if (response.success && dataToSave.selectedProperties && dataToSave.selectedProperties.length > 0) {
          try {
            await categoriesAPI.updateProperties(response.data.id, dataToSave.selectedProperties);
          } catch (propError) {
            console.warn('Failed to assign properties to new category:', propError);
          }
        }
      }

      if (response.success) {
        await loadCategories()
        setShowModal(false)
        resetForm()
        // Show success message in English
        const successMessage = selectedCategory 
          ? '✅ Category updated successfully!' 
          : '🎉 Category created successfully!';
        alert(successMessage);
      } else {
        // Handle validation errors
        if (response.errors) {
          console.error('Validation errors:', response.errors);
          const errorMessages = Object.values(response.errors).flat().join(', ');
          setError(`Validation errors: ${errorMessages}`);
          
          // Set form field errors
          const newFormErrors = {};
          Object.keys(response.errors).forEach(field => {
            newFormErrors[field] = response.errors[field][0]; // First error for each field
          });
          setFormErrors(newFormErrors);
        } else {
          setError(response.message || 'Failed to save category')
        }
      }
    } catch (err) {
      console.error('Category save error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        validationErrors: err.validationErrors,
        fullResponse: err.fullResponse
      });
      
      // Handle different error types
      if (err.validationErrors && Object.keys(err.validationErrors).length > 0) {
        // Handle validation errors from API
        console.error('Validation errors:', err.validationErrors);
        
        // Create user-friendly error messages
        const errorMessages = [];
        const newFormErrors = {};
        
        Object.keys(err.validationErrors).forEach(field => {
          const fieldErrors = err.validationErrors[field];
          
          // Extract error message
          let errorMessage;
          if (Array.isArray(fieldErrors)) {
            errorMessage = fieldErrors[0];
          } else if (typeof fieldErrors === 'object' && fieldErrors.en) {
            errorMessage = fieldErrors.en;
          } else {
            errorMessage = fieldErrors;
          }
          
          newFormErrors[field] = errorMessage;
          errorMessages.push(errorMessage);
        });
        
        setError(`⚠️ Input validation errors: ${errorMessages.join(' • ')}`);
        setFormErrors(newFormErrors);
      } else if (err.status === 400) {
        // Use the error message from backend if available
        const errorMessage = err.message || 'Please check your input data and try again. Make sure the category name is unique.';
        setError(errorMessage);
        console.log('🔍 Setting error message:', errorMessage);
      } else if (err.status === 401 || err.message.includes('Authentication')) {
        setError('Authentication expired. Please login again.');
      } else if (err.status === 403 || err.message.includes('Unauthorized') || err.message.includes('Admin')) {
        setError('Access denied. You need admin privileges to access this page.');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network connection error. Please check your internet connection and server status.');
      } else if (err.code === 'TIMEOUT_ERROR') {
        setError('Request timeout. Please try again or check your internet speed.');
      } else {
        setError(err.message || 'Failed to save category. An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (category) => {
    if (!confirm(`⚠️ Are you sure you want to delete the category "${category.name}"?\n\nThis action cannot be undone and all related data will be deleted.`)) {
      return
    }

    try {
      setLoading(true)
      const response = await categoriesAPI.delete(category.id)
      
      if (response.success) {
        await loadCategories()
        alert('🗑️ Category deleted successfully!')
      } else {
        setError(response.message || 'Failed to delete category')
      }
    } catch (err) {
      setError(err.message || 'Failed to delete category')
      console.error('Error deleting category:', err)
    } finally {
      setLoading(false)
    }
  }

  // Category image upload handler
  const handleCategoryImageUpload = async (categoryId, file) => {
    if (!file) return;

    try {
      console.log('📤 Uploading category image...', file.name);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('alt_text', `${categories.find(c => c.id === categoryId)?.name} category image`);

      const response = await categoriesAPI.uploadImage(categoryId, formData);
      
      if (response.success) {
        console.log('✅ Category image uploaded successfully');
        await loadCategories(); // Refresh categories
        alert('🖼️ Category image uploaded successfully!');
      } else {
        console.error('❌ Upload failed:', response);
        alert('Upload failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Upload error: ' + error.message);
    }
  };

  // Category image delete handler
  const handleCategoryImageDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category image?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting category image...');
      
      const response = await categoriesAPI.deleteImage(categoryId);
      
      if (response.success) {
        console.log('✅ Category image deleted successfully');
        await loadCategories(); // Refresh categories
        alert('🗑️ Category image deleted successfully!');
      } else {
        console.error('❌ Delete failed:', response);
        alert('Delete failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Delete error: ' + error.message);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const iconOptions = [
    'fas fa-cube', 'fas fa-chair', 'fas fa-table', 'fas fa-couch',
    'fas fa-bed', 'fas fa-archive', 'fas fa-laptop', 'fas fa-lightbulb',
    'fas fa-home', 'fas fa-building', 'fas fa-store', 'fas fa-warehouse'
  ]

  // Show loading while auth is initializing
  if (user === undefined || loading) {
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
          Loading categories...
        </div>
      </div>
    )
  }

  // If not authenticated or not admin, don't render anything (redirect will happen)
  if (!authStorage.isAuthenticatedAdmin()) {
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
          Redirecting to login...
        </div>
      </div>
    )
  }

  return (
    <div className="admin-categories" style={{ fontFamily: "'Quasimoda', 'Inter', sans-serif" }}>
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
          }}>Categories Management</h1>
          <p style={{
            color: '#6b7280',
            margin: '0.25rem 0 0 0'
          }}>Manage product categories and their settings</p>
        </div>
        <button
          onClick={handleAddCategory}
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
            e.target.style.background = '#e6c200'
            e.target.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#FFD700'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          <i className="fas fa-plus"></i>
          Add Category
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
          <div>
            <strong>Error:</strong> {error}
            {error.includes('Server') && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Please make sure the Laravel backend is running on http://localhost:8000
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FFD700'
                e.target.style.outline = 'none'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
              }}
            />
          </div>
          <div style={{
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            {filteredCategories.length} of {categories.length} categories
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredCategories.map((category) => (
          <div key={category.id} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          >
            {/* Category Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: category.color + '20' || '#3d5c4d20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {category.image_url ? (
                  <img 
                    src={category.image_url}
                    alt={category.alt_text || category.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <i className={category.icon || 'fas fa-cube'} style={{
                  fontSize: '1.25rem',
                  color: category.color || '#3d5c4d',
                  display: category.image_url ? 'none' : 'block'
                }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#111827',
                  margin: '0 0 0.25rem 0'
                }}>{category.name}</h3>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  background: '#f3f4f6',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px'
                }}>/{category.slug}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: category.status === 'active' ? '#10b981' : '#f59e0b',
                  background: category.status === 'active' ? '#dcfce7' : '#fef3c7',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>
                  {category.status || 'active'}
                </span>
              </div>
            </div>

            {/* Category Description */}
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              margin: '0 0 1.5rem 0'
            }}>
              {category.description}
            </p>

            {/* Category Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0',
              borderTop: '1px solid #f3f4f6',
              borderBottom: '1px solid #f3f4f6',
              marginBottom: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#111827'
                }}>{category.products_count || 0}</div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>Products</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#111827'
                }}>{category.properties_count || 0}</div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>Properties</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexDirection: 'column'
            }}>
              {/* Image Management */}
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <label
                  htmlFor={`category-image-${category.id}`}
                  style={{
                    flex: 1,
                    background: '#f0f9ff',
                    color: '#0369a1',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e0f2fe'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f0f9ff'
                  }}
                >
                  <i className="fas fa-image" style={{ marginRight: '0.25rem' }}></i>
                  {category.image_url ? 'Change Image' : 'Add Image'}
                </label>
                <input
                  type="file"
                  id={`category-image-${category.id}`}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleCategoryImageUpload(category.id, e.target.files[0])}
                />
                {category.image_url && (
                  <button
                    onClick={() => handleCategoryImageDelete(category.id)}
                    style={{
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#fee2e2'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#fef2f2'
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              {/* Category Management */}
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  onClick={() => handleEditCategory(category)}
                  style={{
                    flex: 1,
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e5e7eb'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f3f4f6'
                  }}
                >
                  <i className="fas fa-edit" style={{ marginRight: '0.25rem' }}></i>
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  style={{
                    flex: 1,
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#fee2e2'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fef2f2'
                  }}
                >
                  <i className="fas fa-trash" style={{ marginRight: '0.25rem' }}></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && !loading && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <i className="fas fa-cube" style={{
            fontSize: '3rem',
            color: '#d1d5db',
            marginBottom: '1rem'
          }}></i>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: '0 0 0.5rem 0'
          }}>No Categories Found</h3>
          <p style={{
            color: '#6b7280',
            margin: '0 0 1.5rem 0'
          }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddCategory}
              style={{
                background: '#FFD700',
                color: '#2c2c2c',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
              Add Your First Category
            </button>
          )}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
        onSave={handleModalSave}
        loading={modalLoading}
      />
      
      {/* Old Modal - Remove this section */}
      {false && (showAddModal || showEditModal) && (
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
            maxWidth: '500px',
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
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  resetForm()
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

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  Description *
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
                    border: `2px solid ${formErrors.description ? '#dc2626' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
                {formErrors.description && (
                  <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {formErrors.description}
                  </div>
                )}
              </div>

              {/* Icon & Color */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Icon
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>
                        {icon.replace('fas fa-', '').replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
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
                      height: '42px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer'
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

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  resetForm()
                }}
                style={{
                  flex: 1,
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={loading}
                style={{
                  flex: 1,
                  background: loading ? '#d1d5db' : '#FFD700',
                  color: '#2c2c2c',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : (selectedCategory ? 'Update Category' : 'Create Category')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesPage