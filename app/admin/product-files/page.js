'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '../../../lib/localStorage-utils';
import { productFilesAPI, productsAPI } from '../../../lib/api';

const ProductFilesPage = () => {
  const router = useRouter();
  
  // State management
  const [files, setFiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    product_id: '',
    display_name: '',
    description: '',
    file_category: 'manual',
    is_active: true,
    is_featured: false,
    sort_order: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedFileForUpload, setSelectedFileForUpload] = useState(null);

  // Authentication check
  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Product Files page - Not authenticated admin, redirecting...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Product Files page - User is authenticated admin');
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
      
      // Load products and files in parallel
      const [productsResponse, filesResponse] = await Promise.all([
        productsAPI.getAdminAll(),
        productFilesAPI.getAll()
      ]);

      if (productsResponse.success) {
        setProducts(productsResponse.data || []);
      }

      if (filesResponse.success) {
        setFiles(filesResponse.data || []);
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      
      setSelectedFileForUpload(file);
      
      // Auto-fill display name from file name
      if (!formData.display_name) {
        const fileName = file.name.replace('.pdf', '');
        setFormData(prev => ({
          ...prev,
          display_name: fileName
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.product_id) {
      errors.product_id = 'Product is required';
    }
    
    if (!formData.display_name.trim()) {
      errors.display_name = 'Display name is required';
    }
    
    if (!selectedFile && !selectedFileForUpload) {
      errors.file = 'File is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      display_name: '',
      description: '',
      file_category: 'manual',
      is_active: true,
      is_featured: false,
      sort_order: 0
    });
    setFormErrors({});
    setSelectedFile(null);
    setSelectedFileForUpload(null);
    setUploadProgress(0);
  };

  const handleAddFile = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditFile = (file) => {
    setSelectedFile(file);
    setFormData({
      product_id: file.product_id || '',
      display_name: file.display_name || '',
      description: file.description || '',
      file_category: file.file_category || 'manual',
      is_active: file.is_active !== undefined ? file.is_active : true,
      is_featured: file.is_featured || false,
      sort_order: file.sort_order || 0
    });
    setShowModal(true);
  };

  const handleSaveFile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setModalLoading(true);
      setError(null);

      let response;
      if (selectedFile) {
        // Update existing file
        response = await productFilesAPI.update(selectedFile.id, formData);
      } else {
        // Create new file with upload
        console.log('🔧 Preparing file upload...');
        console.log('🔧 Selected file:', selectedFileForUpload);
        console.log('🔧 Form data:', formData);
        
        const uploadData = new FormData();
        uploadData.append('file', selectedFileForUpload);
        uploadData.append('product_id', formData.product_id);
        uploadData.append('display_name', formData.display_name);
        uploadData.append('description', formData.description || '');
        uploadData.append('file_category', formData.file_category);
        uploadData.append('is_active', formData.is_active ? '1' : '0');
        uploadData.append('is_featured', formData.is_featured ? '1' : '0');
        uploadData.append('sort_order', formData.sort_order.toString());
        
        console.log('🔧 Upload FormData entries:');
        for (let [key, value] of uploadData.entries()) {
          console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
        }
        
        response = await productFilesAPI.upload(uploadData, (progress) => {
          setUploadProgress(progress);
        });
      }

      if (response.success) {
        await loadData(); // Reload data
        setShowModal(false);
        resetForm();
        
        const successMessage = selectedFile 
          ? '✅ File updated successfully!' 
          : '🎉 File uploaded successfully!';
        alert(successMessage);
      } else {
        if (response.errors) {
          setFormErrors(response.errors);
        }
        setError(response.message || 'Failed to save file');
      }
    } catch (error) {
      console.error('❌ Error saving file:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        fullResponse: error.fullResponse
      });
      
      if (error.fullResponse && error.fullResponse.message) {
        setError(error.fullResponse.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An error occurred while saving the file');
      }
    } finally {
      setModalLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await productFilesAPI.delete(fileId);
      
      if (response.success) {
        await loadData();
        alert('✅ File deleted successfully!');
      } else {
        setError(response.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('An error occurred while deleting the file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await productFilesAPI.download(fileId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Reload data to update download count
      await loadData();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  // Filter files based on product and search
  const filteredFiles = files.filter(file => {
    const matchesProduct = selectedProduct === 'all' || file.product_id == selectedProduct;
    const matchesSearch = file.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesProduct && matchesSearch;
  });

  // Group files by product
  const groupedFiles = filteredFiles.reduce((acc, file) => {
    const productId = file.product_id || 'uncategorized';
    if (!acc[productId]) {
      acc[productId] = [];
    }
    acc[productId].push(file);
    return acc;
  }, {});

  const getProductName = (productId) => {
    if (productId === 'uncategorized') return 'Uncategorized';
    const product = products.find(p => p.id == productId);
    return product ? product.name : `Product ${productId}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && files.length === 0) {
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
          Loading product files...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-product-files" style={{ fontFamily: "'Quasimoda', 'Inter', sans-serif" }}>
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
          }}>Product Files Management</h1>
          <p style={{
            color: '#6b7280',
            margin: '0.25rem 0 0 0'
          }}>Manage PDF files for products</p>
        </div>
        <button
          onClick={handleAddFile}
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
          <i className="fas fa-upload"></i>
          Upload File
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
          {/* Product Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Filter by Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Products</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
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
              Search Files
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
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

      {/* Files List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {Object.keys(groupedFiles).length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <i className="fas fa-file-pdf" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              No files found
            </h3>
            <p style={{ fontSize: '0.875rem' }}>
              {searchTerm || selectedProduct !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Start by uploading your first file'
              }
            </p>
          </div>
        ) : (
          Object.keys(groupedFiles).map(productId => (
            <div key={productId} style={{ borderBottom: '1px solid #e5e7eb' }}>
              {/* Product Header */}
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
                  <i className="fas fa-cube"></i>
                  {getProductName(productId)}
                  <span style={{
                    background: '#e5e7eb',
                    color: '#6b7280',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem'
                  }}>
                    {groupedFiles[productId].length} files
                  </span>
                </h3>
              </div>

              {/* Files in this product */}
              <div>
                {groupedFiles[productId]
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map(file => (
                  <div
                    key={file.id}
                    style={{
                      padding: '1.5rem',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start'
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'start', gap: '1rem' }}>
                      {/* File Icon */}
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        background: '#dc2626',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.25rem'
                      }}>
                        <i className="fas fa-file-pdf"></i>
                      </div>
                      
                      {/* File Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#111827',
                            margin: 0
                          }}>
                            {file.display_name}
                          </h4>
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
                          <span style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem'
                          }}>
                            {file.file_category}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            <i className="fas fa-file" style={{ marginRight: '0.25rem' }}></i>
                            {file.file_name}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            <i className="fas fa-weight" style={{ marginRight: '0.25rem' }}></i>
                            {formatFileSize(file.file_size)}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            <i className="fas fa-download" style={{ marginRight: '0.25rem' }}></i>
                            {file.download_count || 0} downloads
                          </span>
                        </div>
                        
                        {file.description && (
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            margin: 0
                          }}>
                            {file.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDownloadFile(file.id, file.file_name)}
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #d1fae5',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        title="Download File"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      <button
                        onClick={() => handleEditFile(file)}
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
                        title="Edit File"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
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
                        title="Delete File"
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

      {/* Upload/Edit File Modal */}
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
                {selectedFile ? 'Edit File' : 'Upload New File'}
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

            <form onSubmit={handleSaveFile}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Product */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Product *
                  </label>
                  <select
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${formErrors.product_id ? '#dc2626' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.product_id && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {formErrors.product_id}
                    </div>
                  )}
                </div>

                {/* File Upload (only for new files) */}
                {!selectedFile && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      PDF File *
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `2px solid ${formErrors.file ? '#dc2626' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    />
                    {formErrors.file && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {formErrors.file}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Only PDF files up to 10MB are allowed
                    </div>
                  </div>
                )}

                {/* Display Name */}
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
                    placeholder="File display name"
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
                    placeholder="File description..."
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

                {/* Category and Sort Order */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Category
                    </label>
                    <select
                      name="file_category"
                      value={formData.file_category}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="manual">Manual</option>
                      <option value="catalog">Catalog</option>
                      <option value="specification">Specification</option>
                      <option value="warranty">Warranty</option>
                      <option value="installation">Installation Guide</option>
                      <option value="other">Other</option>
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
                </div>

                {/* Checkboxes */}
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Active</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Featured</span>
                  </label>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>Uploading...</span>
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>{uploadProgress}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '0.5rem',
                      background: '#e5e7eb',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        background: '#3b82f6',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                )}
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
                  disabled={modalLoading || (uploadProgress > 0 && uploadProgress < 100)}
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
                      {selectedFile ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas fa-${selectedFile ? 'save' : 'upload'}`} style={{ marginRight: '0.5rem' }}></i>
                      {selectedFile ? 'Update File' : 'Upload File'}
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

export default ProductFilesPage;