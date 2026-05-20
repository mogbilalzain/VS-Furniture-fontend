'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiClient, solutionsAPI } from '../../../lib/api';
import AssociatedProductsSelector from '../../../components/admin/AssociatedProductsSelector';
import SolutionImageDiagnostic from '../../../components/admin/SolutionImageDiagnostic';
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  PageHeader,
  EmptyState,
  StatCard,
} from '../../../components/admin/ui';

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
      </div>
    );
  }

  const totalProducts = solutions.reduce((acc, s) => acc + (s.products_count || 0), 0);
  const activeCount = solutions.filter((s) => s.is_active).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Solutions"
        description="Curate solutions and their associated products."
        actions={
          <>
            <AdminButton
              variant="secondary"
              size="lg"
              icon={showDiagnostic ? 'visibility_off' : 'troubleshoot'}
              onClick={() => setShowDiagnostic(!showDiagnostic)}
            >
              {showDiagnostic ? 'Hide Diagnostic' : 'Diagnostic'}
            </AdminButton>
            <AdminButton variant="primary" icon="add" size="lg" onClick={handleAddNew}>
              New Solution
            </AdminButton>
          </>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <StatCard
          icon="lightbulb"
          label="Total Solutions"
          value={solutions.length.toString()}
          change="Catalog"
          changeType="neutral"
        />
        <StatCard
          icon="check_circle"
          label="Active"
          value={activeCount.toString()}
          change="Published"
          changeType="positive"
        />
        <StatCard
          icon="inventory_2"
          label="Linked Products"
          value={totalProducts.toString()}
          change="Across all"
          changeType="neutral"
        />
      </section>

      {showDiagnostic && (
        <AdminCard>
          <SolutionImageDiagnostic />
        </AdminCard>
      )}

      {error && (
        <div className="flex items-start justify-between gap-4 px-5 py-3 rounded-2xl bg-error-container border border-error/30 text-on-error-container">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5">error</span>
            <div>
              <p className="font-medium">Error: {error}</p>
              <button onClick={fetchSolutions} className="underline text-[13px] mt-1">
                Try Again
              </button>
            </div>
          </div>
          <button onClick={() => setError(null)} className="text-on-error-container/70 hover:text-on-error-container">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {solutions.length === 0 && !loading ? (
        <EmptyState
          icon="lightbulb"
          title="No solutions yet"
          description="Get started by creating your first solution."
          action={
            <AdminButton variant="primary" icon="add" onClick={handleAddNew}>
              New Solution
            </AdminButton>
          }
        />
      ) : (
        <AdminCard padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Solution</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Products</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 hidden lg:table-cell">Created</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {solutions.map((solution) => (
                  <tr key={solution.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/20 flex-shrink-0 flex items-center justify-center">
                          {(solution.cover_image || solution.cover_image_url) ? (
                            <Image
                              src={solution.cover_image_url || solution.cover_image}
                              alt={solution.title}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant/40 text-[22px]">image</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-on-surface font-bold text-[14px] truncate">{solution.title}</p>
                          <p className="text-on-surface-variant/60 text-[12px] truncate max-w-md">
                            {solution.description
                              ? solution.description.substring(0, 80) + (solution.description.length > 80 ? '…' : '')
                              : 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] text-on-surface font-bold">
                          {solution.products_count || 0} products
                        </span>
                        <span className="text-[11px] text-on-surface-variant/60">
                          {solution.images?.length || 0} images
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge tone={solution.is_active ? 'active' : 'pending'} dot>
                        {solution.is_active ? 'Active' : 'Inactive'}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-[13px] text-on-surface-variant/70">
                        {new Date(solution.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(solution)}
                          title="Edit"
                          className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(solution.id)}
                          title="Delete"
                          className="w-9 h-9 rounded-lg hover:bg-error-container text-error flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-10 mx-auto p-6 sm:p-8 w-full max-w-4xl bg-surface admin-shadow-soft rounded-2xl border border-outline-variant/30">
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
