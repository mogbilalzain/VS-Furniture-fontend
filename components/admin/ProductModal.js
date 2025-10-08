'use client';

import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';

export default function ProductModal({ 
  isOpen, 
  onClose, 
  onSave, 
  product = null, 
  categories = [], 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    model: product?.model || '',
    price: product?.price || '',
    stock_quantity: product?.stock_quantity || '',
    category_id: product?.category_id || '',
    image: product?.image || '',
    status: product?.status || 'active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [uploadedImageFile, setUploadedImageFile] = useState(null);

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: product?.name || '',
        description: product?.description || '',
        model: product?.model || '',
        price: product?.price || '',
        stock_quantity: product?.stock_quantity || '',
        category_id: product?.category_id || '',
        image: product?.image || '',
        status: product?.status || 'active'
      });
      setFormErrors({});
      setUploadedImageFile(null);
    }
  }, [isOpen, product]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'category_id'];
    const errors = {};
    
    requiredFields.forEach(field => {
      if (!formData[field]?.toString().trim()) {
        errors[field] = `${field} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare data for API
    console.log('🔄 Preparing product data...');
    console.log('📄 Form data:', formData);
    console.log('📁 Uploaded file:', uploadedImageFile);
    
    if (uploadedImageFile) {
      // Create FormData for file upload
      console.log('📤 Creating FormData for file upload');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('model', formData.model || '');
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('stock_quantity', parseInt(formData.stock_quantity) || 0);
      formDataToSend.append('category_id', parseInt(formData.category_id));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('image', uploadedImageFile);
      
      console.log('📤 FormData entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }
      
      onSave(formDataToSend);
    } else {
      // Send as regular JSON if no file upload
      console.log('📤 Creating JSON data (no file upload)');
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category_id: parseInt(formData.category_id)
      };
      
      // If image is a URL, send it as image_url
      if (formData.image && formData.image.startsWith('http')) {
        productData.image_url = formData.image;
        delete productData.image;
      }
      
      console.log('📤 JSON data:', productData);
      onSave(productData);
    }
  };

  const handleClose = () => {
    setFormErrors({});
    setUploadedImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>

          {/* Model and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter model number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                step="0.01"
                min="0"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {formErrors.price && (
                <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
              )}
            </div>
          </div>

          {/* Category and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleFormChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {formErrors.category_id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.category_id}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleFormChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <ImageUpload
              value={formData.image}
              onChange={(imageUrl) => {
                setFormData(prev => ({
                  ...prev,
                  image: imageUrl
                }));
              }}
              onUpload={(imageUrl, file) => {
                setUploadedImageFile(file);
                setFormData(prev => ({
                  ...prev,
                  image: imageUrl
                }));
              }}
              disabled={loading}
              placeholder="Upload product image"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (product ? 'Updating...' : 'Creating...') : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}