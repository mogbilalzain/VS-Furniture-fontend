'use client';

import { useState, useEffect, useRef } from 'react';
import { productImagesAPI } from '../../lib/api';
import { 
  PhotoIcon, 
  TrashIcon, 
  StarIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function ProductImagesManager({ productId, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await productImagesAPI.admin.getProductImages(productId);
      if (response.success) {
        setImages(response.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Error fetching images: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      
      // Debug logging
      console.log('🔧 ProductImagesManager - Starting upload');
      console.log('🔧 Product ID:', productId);
      console.log('🔧 Selected files:', selectedFiles.length);
      
      // Check authentication
      const token = localStorage.getItem('auth_token');
      console.log('🔧 Auth token exists:', !!token);
      console.log('🔧 Auth token preview:', token ? token.substring(0, 20) + '...' : 'none');
      
      const formData = new FormData();
      
      selectedFiles.forEach((file, index) => {
        formData.append('images[]', file);
        formData.append(`alt_texts[${index}]`, `Product image ${index + 1}`);
        formData.append(`titles[${index}]`, `Product image ${index + 1}`);
        console.log(`🔧 Added file ${index + 1}: ${file.name} (${file.size} bytes)`);
      });

      // Set first image as primary if no images exist
      if (images.length === 0) {
        formData.append('is_primary', '1'); // Send as string '1' for better compatibility
        console.log('🔧 Set first image as primary');
      }

      console.log('🔧 About to call API...');
      console.log('🔧 API endpoint will be: /admin/products/' + productId + '/images');
      console.log('🔧 FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
      }
      
      const response = await productImagesAPI.admin.uploadImages(productId, formData);
      
      console.log('🔧 API Response received:', response);
      
      if (response.success) {
        console.log('🔧 Upload successful:', response.data);
        setSelectedFiles([]);
        fetchImages();
        alert(`${response.data.length} images uploaded successfully!`);
      } else {
        console.error('🔧 Upload failed:', response);
        alert('Upload failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('🔧 Upload error caught:', error);
      console.error('🔧 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert('Error uploading images: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const setPrimaryImage = async (imageId) => {
    try {
      const response = await productImagesAPI.admin.setPrimaryImage(productId, imageId);
      if (response.success) {
        fetchImages();
      }
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Error setting primary image: ' + error.message);
    }
  };

  const deleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await productImagesAPI.admin.deleteImage(productId, imageId);
      if (response.success) {
        fetchImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image: ' + error.message);
    }
  };

  const updateImage = async (imageId, data) => {
    try {
      const response = await productImagesAPI.admin.updateImage(productId, imageId, data);
      if (response.success) {
        setEditingImage(null);
        fetchImages();
      }
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Error updating image: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-pulse">Loading images...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Manage Product Images</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Upload Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Upload New Images</h3>
            
            {/* Drag & Drop Area */}
            <div
              ref={dropRef}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop images here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Supports: JPG, PNG, GIF, WebP, SVG (Max 5MB each, 10 images max)
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={uploadImages}
                  disabled={uploading}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
                >
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Images`}
                </button>
              </div>
            )}
          </div>

          {/* Current Images */}
          <div>
            <h3 className="text-lg font-medium mb-4">
              Current Images ({images.length})
            </h3>

            {images.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <PhotoIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No images uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group border rounded-lg overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-32 object-cover"
                    />
                    
                    {/* Primary Badge */}
                    {image.is_primary && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center">
                        <StarIconSolid className="h-3 w-3 mr-1" />
                        Primary
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPreviewImage(image)}
                          className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => setEditingImage(image)}
                          className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        {!image.is_primary && (
                          <button
                            onClick={() => setPrimaryImage(image.id)}
                            className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100"
                          >
                            <StarIcon className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteImage(image.id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="p-2">
                      <p className="text-xs text-gray-600 truncate">{image.alt_text || 'No alt text'}</p>
                      <p className="text-xs text-gray-500">Sort: {image.sort_order}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal 
          image={previewImage} 
          onClose={() => setPreviewImage(null)} 
        />
      )}

      {/* Edit Image Modal */}
      {editingImage && (
        <EditImageModal 
          image={editingImage} 
          onSave={updateImage}
          onClose={() => setEditingImage(null)} 
        />
      )}
    </div>
  );
}

// Image Preview Modal Component
function ImagePreviewModal({ image, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
      <div className="max-w-4xl max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white text-gray-700 rounded-full p-2 hover:bg-gray-100 z-10"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <img
          src={image.image_url}
          alt={image.alt_text}
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>
    </div>
  );
}

// Edit Image Modal Component
function EditImageModal({ image, onSave, onClose }) {
  const [formData, setFormData] = useState({
    alt_text: image.alt_text || '',
    title: image.title || '',
    sort_order: image.sort_order || 0,
    is_featured: image.is_featured || false,
    image_type: image.image_type || 'product'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(image.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Edit Image</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={formData.alt_text}
              onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Image description for accessibility"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Image title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Type
            </label>
            <select
              value={formData.image_type}
              onChange={(e) => setFormData(prev => ({ ...prev, image_type: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="product">Product</option>
              <option value="variant">Variant</option>
              <option value="detail">Detail</option>
              <option value="gallery">Gallery</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
              Featured Image
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}