'use client';

import React, { useState, useEffect } from 'react';
import { certificationsAPI, productsAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  XMarkIcon,
  CheckIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const AdminCertifications = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [certifications, setCertifications] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [selectedCertificationForProducts, setSelectedCertificationForProducts] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCertifications();
      fetchProducts();
    }
  }, [user]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await certificationsAPI.getAll();
      if (response.success) {
        setCertifications(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCertification) {
        await certificationsAPI.admin.update(editingCertification.id, formData);
      } else {
        await certificationsAPI.admin.create(formData);
      }
      
      setShowModal(false);
      setEditingCertification(null);
      resetForm();
      fetchCertifications();
    } catch (err) {
      alert('Error saving certification: ' + err.message);
    }
  };

  const handleEdit = (certification) => {
    console.log('🔧 Editing certification:', certification);
    console.log('📷 Image URL:', certification.image_url);
    
    setEditingCertification(certification);
    setFormData({
      title: certification.title,
      description: certification.description,
      image_url: certification.image_url || '',
      is_active: certification.is_active
    });
    // Clear any previous upload state
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      try {
        await certificationsAPI.admin.delete(id);
        fetchCertifications();
      } catch (err) {
        alert('Error deleting certification: ' + err.message);
      }
    }
  };

  const handleManageProducts = async (certification) => {
    setSelectedCertificationForProducts(certification);
    try {
      // Get current products for this certification
      const response = await certificationsAPI.getById(certification.id);
      if (response.success && response.data.products) {
        setSelectedProducts(response.data.products.map(p => p.id));
      }
    } catch (err) {
      console.error('Error fetching certification products:', err);
      setSelectedProducts([]);
    }
    setShowProductModal(true);
  };

  const handleSaveProductAssignments = async () => {
    try {
      const certificationId = selectedCertificationForProducts.id;
      
      // Get current certification data to see existing product assignments
      const currentResponse = await certificationsAPI.getById(certificationId);
      const currentProductIds = currentResponse.success && currentResponse.data.products 
        ? currentResponse.data.products.map(p => p.id) 
        : [];

      // Find products to add and remove
      const productsToAdd = selectedProducts.filter(id => !currentProductIds.includes(id));
      const productsToRemove = currentProductIds.filter(id => !selectedProducts.includes(id));

      // Add new products
      for (const productId of productsToAdd) {
        await certificationsAPI.admin.attachToProduct(productId, certificationId);
      }

      // Remove unselected products
      for (const productId of productsToRemove) {
        await certificationsAPI.admin.detachFromProduct(productId, certificationId);
      }

      setShowProductModal(false);
      setSelectedCertificationForProducts(null);
      setSelectedProducts([]);
      alert('Product assignments updated successfully!');
    } catch (err) {
      alert('Error updating product assignments: ' + err.message);
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    
    try {
      setUploadingImage(true);
      console.log('🔄 Uploading image:', imageFile.name);
      
      const response = await certificationsAPI.admin.uploadImage(imageFile);
      console.log('📥 Upload response:', response);
      
      if (response.success) {
        console.log('✅ Image uploaded successfully:', response.data.image_url);
        setFormData(prev => ({ ...prev, image_url: response.data.image_url }));
        setImageFile(null);
        // Keep preview showing the uploaded image URL instead of clearing it
        setImagePreview(response.data.image_url);
        alert('Image uploaded successfully!');
      } else {
        console.error('❌ Upload failed:', response);
        alert('Error uploading image: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('Error uploading image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', image_url: '', is_active: true });
    setEditingCertification(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadingImage(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certifications Management</h1>
          <p className="text-gray-600 mt-2">Manage product certifications and their details</p>
        </div>
        <button
                  onClick={() => {
          setEditingCertification(null);
          resetForm();
          setShowModal(true);
        }}
          className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Certification</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Certifications Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certifications.map((certification) => (
          <div key={certification.id} className="bg-white rounded-lg border border-gray-200 p-6">
                                  {/* Certification Image */}
                      {certification.image_url && (
                        <div className="w-16 h-16 mx-auto mb-4">
                          <img
                            src={certification.image_url}
                            alt={certification.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

            {/* Certification Info */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {certification.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3">
                {certification.description}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                certification.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {certification.is_active ? (
                  <>
                    <EyeIcon className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <EyeSlashIcon className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handleEdit(certification)}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                title="Edit Certification"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleManageProducts(certification)}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                title="Manage Products"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(certification.id)}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                title="Delete Certification"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCertification ? 'Edit Certification' : 'Add New Certification'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification Image
                  </label>
                  
                  {/* Current Image Preview */}
                  {(formData.image_url || imagePreview) && (
                    <div className="mb-3">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview || formData.image_url}
                          alt="Certification preview"
                          className="w-20 h-20 object-contain border rounded-lg"
                          onLoad={() => console.log('✅ Admin image loaded:', imagePreview || formData.image_url)}
                          onError={(e) => {
                            console.error('❌ Admin image failed:', imagePreview || formData.image_url);
                            console.error('Error details:', e);
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Section */}
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="certification-image-upload"
                      />
                      <label
                        htmlFor="certification-image-upload"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <PhotoIcon className="h-5 w-5 mr-2 text-gray-400" />
                        Choose Image File
                      </label>
                    </div>
                    
                    {/* Upload Button */}
                    {imageFile && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{imageFile.name}</span>
                        <button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={uploadingImage}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    )}
                    
                    {/* OR Divider */}
                    <div className="flex items-center">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="px-3 text-sm text-gray-500">OR</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    
                    {/* Manual URL Input */}
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Or enter image URL manually"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg transition-colors"
                >
                  {editingCertification ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Assignment Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Manage Products for "{selectedCertificationForProducts?.title}"
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 text-sm">
                Select the products that should have this certification. You can select multiple products.
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedProducts.includes(product.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedProducts.includes(product.id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedProducts.includes(product.id) && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </div>

                    {/* Product Image */}
                    <div className="w-12 h-12 flex-shrink-0">
                      {product.image_url || product.image ? (
                        <img
                          src={product.image_url || product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Model: {product.model || product.sku || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Summary */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>{selectedProducts.length}</strong> product{selectedProducts.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProductAssignments}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                disabled={!selectedProducts.length}
              >
                Save Product Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertifications;