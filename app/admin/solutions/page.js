'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiClient, solutionsAPI } from '../../../lib/api';
import AssociatedProductsSelector from '../../../components/admin/AssociatedProductsSelector';
import SolutionImageDiagnostic from '../../../components/admin/SolutionImageDiagnostic';

const SolutionsManager = () => {
  const [solutions, setSolutions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSolution, setEditingSolution] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image: '',
    is_active: true,
    product_ids: [],
    images: []
  });
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  useEffect(() => {
    fetchSolutions();
    fetchProducts();
  }, []);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const response = await solutionsAPI.getAdminAll();
      if (response.success) {
        setSolutions(response.data);
        console.log('✅ Solutions loaded:', response.data.length, 'items');
      }
    } catch (err) {
      console.error('❌ Error fetching solutions:', err);
      setError(err.message);
      
      // Fallback data for testing
      setSolutions([
        {
          id: 1,
          title: 'Modern Office Workspace',
          description: 'Create a contemporary office environment that promotes productivity and collaboration.',
          cover_image: '/images/placeholder-product.jpg',
          is_active: true,
          products_count: 5,
          images: [],
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Interactive Learning Environment',
          description: 'Transform traditional classrooms into dynamic learning spaces that engage students.',
          cover_image: '/images/placeholder-product.jpg',
          is_active: true,
          products_count: 8,
          images: [],
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Try the specific route first, fallback to general products if needed
      let response;
      try {
        response = await solutionsAPI.getAvailableProducts();
      } catch (routeError) {
        console.log('⚠️ Solutions products route failed, trying general products route');
        try {
          response = await apiClient.get('/admin/products');
        } catch (generalError) {
          console.log('⚠️ General products route also failed, using fallback data');
          // Use fallback data
          setProducts([
            { id: 1, name: 'Sample Product 1', category: { name: 'Desks' }, image: '/images/placeholder-product.jpg' },
            { id: 2, name: 'Sample Product 2', category: { name: 'Chairs' }, image: '/images/placeholder-product.jpg' },
            { id: 3, name: 'Sample Product 3', category: { name: 'Tables' }, image: '/images/placeholder-product.jpg' }
          ]);
          return;
        }
      }
      
      if (response && response.success) {
        setProducts(response.data);
        console.log('✅ Products loaded:', response.data.length, 'items');
      } else {
        console.log('⚠️ API response not successful, using fallback data');
        setProducts([
          { id: 1, name: 'Sample Product 1', category: { name: 'Desks' }, image: '/images/placeholder-product.jpg' },
          { id: 2, name: 'Sample Product 2', category: { name: 'Chairs' }, image: '/images/placeholder-product.jpg' },
          { id: 3, name: 'Sample Product 3', category: { name: 'Tables' }, image: '/images/placeholder-product.jpg' }
        ]);
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      // Fallback: set sample data so the component doesn't break
      setProducts([
        { id: 1, name: 'Sample Product 1', category: { name: 'Desks' }, image: '/images/placeholder-product.jpg' },
        { id: 2, name: 'Sample Product 2', category: { name: 'Chairs' }, image: '/images/placeholder-product.jpg' },
        { id: 3, name: 'Sample Product 3', category: { name: 'Tables' }, image: '/images/placeholder-product.jpg' }
      ]);
    }
  };

  const handleAddNew = () => {
    setEditingSolution(null);
    setFormData({
      title: '',
      description: '',
      cover_image: '',
      is_active: true,
      product_ids: [],
      images: []
    });
    setSelectedCoverFile(null);
    setSelectedGalleryFiles([]);
    setShowModal(true);
  };

  const handleEdit = (solution) => {
    setEditingSolution(solution);
    setFormData({
      title: solution.title,
      description: solution.description,
      cover_image: solution.cover_image,
      is_active: solution.is_active,
      product_ids: solution.products ? solution.products.map(p => p.id) : [],
      images: solution.images || []
    });
    setSelectedCoverFile(null);
    setSelectedGalleryFiles([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this solution? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await solutionsAPI.delete(id);
      if (response.success) {
        setSolutions(solutions.filter(s => s.id !== id));
        alert('Solution deleted successfully!');
      }
    } catch (err) {
      console.error('❌ Error deleting solution:', err);
      alert('Failed to delete solution: ' + err.message);
    }
  };

  const uploadImage = async (file, type = 'gallery') => {
    try {
      console.log('🔄 Uploading image:', file.name, 'Type:', type);
      const response = await solutionsAPI.uploadImage(file, type);
      
      if (response.success) {
        console.log('✅ Image uploaded successfully:', response.data);
        return response.data.image_url;
      }
      throw new Error(response.message || 'Upload failed');
    } catch (err) {
      console.error('❌ Error uploading image:', err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let coverImageUrl = formData.cover_image;
      let galleryImages = [...formData.images];

      // رفع صورة الغلاف إذا تم اختيار صورة جديدة
      if (selectedCoverFile) {
        coverImageUrl = await uploadImage(selectedCoverFile, 'cover');
      }

      // رفع الصور الإضافية إذا تم اختيار صور جديدة
      if (selectedGalleryFiles.length > 0) {
        const uploadPromises = selectedGalleryFiles.map((file, index) => 
          uploadImage(file, 'gallery').then(url => ({
            image_path: url,
            alt_text: `${formData.title} - Image ${index + 1}`,
            sort_order: galleryImages.length + index + 1
          }))
        );
        const newImages = await Promise.all(uploadPromises);
        galleryImages = [...galleryImages, ...newImages];
      }

      const solutionData = {
        ...formData,
        cover_image: coverImageUrl,
        images: galleryImages
      };

      let response;
      if (editingSolution) {
        response = await solutionsAPI.update(editingSolution.id, solutionData);
      } else {
        response = await solutionsAPI.create(solutionData);
      }

      if (response.success) {
        await fetchSolutions();
        setShowModal(false);
        alert(editingSolution ? 'Solution updated successfully!' : 'Solution created successfully!');
      }
    } catch (err) {
      console.error('❌ Error saving solution:', err);
      alert('Failed to save solution: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleProductToggle = (productId) => {
    const currentIds = formData.product_ids;
    const newIds = currentIds.includes(productId)
      ? currentIds.filter(id => id !== productId)
      : [...currentIds, productId];
    
    setFormData({ ...formData, product_ids: newIds });
  };

  const handleProductReorder = (newOrder) => {
    setFormData({ ...formData, product_ids: newOrder });
  };

  const removeGalleryImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading solutions...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solutions Management</h1>
          <p className="text-gray-600">Manage your solutions and their associated products</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showDiagnostic ? 'Hide Diagnostic' : 'Image Diagnostic'}
          </button>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Solution
          </button>
        </div>
      </div>

      {/* Diagnostic Panel */}
      {showDiagnostic && (
        <div className="mb-6">
          <SolutionImageDiagnostic />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchSolutions}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Solutions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Solution
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {solutions.map((solution) => (
              <tr key={solution.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                      {(solution.cover_image || solution.cover_image_url) ? (
                        <Image
                          src={solution.cover_image_url || solution.cover_image}
                          alt={solution.title}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            console.error('Image load error for solution:', solution.id, solution.cover_image_url || solution.cover_image);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center" style={{display: (solution.cover_image || solution.cover_image_url) ? 'none' : 'flex'}}>
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{solution.title}</div>
                      <div className="text-sm text-gray-500">
                        {solution.description ? solution.description.substring(0, 60) + '...' : 'No description'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {solution.products_count || 0} products
                  </div>
                  <div className="text-sm text-gray-500">
                    {solution.images?.length || 0} images
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    solution.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {solution.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(solution.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(solution)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(solution.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {solutions.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No solutions</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new solution.</p>
            <div className="mt-6">
              <button
                onClick={handleAddNew}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Solution
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSolution ? 'Edit Solution' : 'Add New Solution'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this solution..."
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image
                </label>
                <div className="flex items-center space-x-4">
                  {(formData.cover_image || selectedCoverFile) && (
                    <div className="relative">
                      <Image
                        src={selectedCoverFile ? URL.createObjectURL(selectedCoverFile) : formData.cover_image}
                        alt="Cover preview"
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          console.error('Cover image preview error');
                          e.target.style.display = 'none';
                        }}
                      />
                      {selectedCoverFile && (
                        <div className="absolute -top-2 -right-2">
                          <span className="inline-block w-4 h-4 bg-green-500 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedCoverFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Recommended: JPG, PNG, WEBP (max 5MB)
                    </p>
                  </div>
                </div>
                {selectedCoverFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {selectedCoverFile.name}
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gallery Images
                </label>
                
                {/* Existing Images */}
                {formData.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current Images ({formData.images.length}):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image.full_url || image.image_path}
                            alt={image.alt_text || `Image ${index + 1}`}
                            width={120}
                            height={120}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:border-gray-300 transition-colors"
                            onError={(e) => {
                              console.error('Gallery image preview error:', image.image_path);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setSelectedGalleryFiles(Array.from(e.target.files))}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Choose multiple images or drag and drop here
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    JPG, PNG, WEBP up to 5MB each
                  </p>
                </div>
                
                {/* Preview of selected new images */}
                {selectedGalleryFiles.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">
                      New Images to Upload ({selectedGalleryFiles.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {selectedGalleryFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`New image ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-16 object-cover rounded-lg border border-green-300"
                          />
                          <div className="absolute -top-1 -right-1">
                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                          </div>
                          <div className="text-xs text-green-700 mt-1 truncate" title={file.name}>
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Products Selection - Enhanced */}
              <AssociatedProductsSelector
                products={products}
                selectedProductIds={formData.product_ids}
                onProductToggle={handleProductToggle}
                onProductReorder={handleProductReorder}
              />

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : (editingSolution ? 'Update Solution' : 'Create Solution')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionsManager;
