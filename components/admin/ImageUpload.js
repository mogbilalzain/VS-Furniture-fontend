'use client';

import { useState, useRef } from 'react';
import { productsAPI } from '../../lib/api';

const ImageUpload = ({ 
  value = '', 
  onChange, 
  onUpload, 
  onFileSelect, // New prop for file selection without upload
  autoUpload = true, // New prop to control auto upload
  className = '',
  placeholder = 'Upload image or enter URL',
  disabled = false 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState(value);
  const [previewUrl, setPreviewUrl] = useState(value);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB.');
      return;
    }

    try {
      setIsUploading(true);
      
      // Create preview
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);

      if (autoUpload) {
        console.log('🔄 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

        // Upload file
        const response = await productsAPI.uploadImage(file);
        
        console.log('📥 Upload response:', response);
        
        if (response.success) {
          const uploadedUrl = response.data.url;
          console.log('✅ Upload successful, URL:', uploadedUrl);
          setImageUrl(uploadedUrl);
          onChange(uploadedUrl);
          if (onUpload) {
            onUpload(uploadedUrl, file);
          }
        } else {
          console.error('❌ Upload failed:', response);
          alert('Failed to upload image: ' + (response.message || 'Unknown error'));
          setPreviewUrl(value);
        }
      } else {
        // Just set file for later upload
        console.log('📁 File selected for later upload:', file.name);
        if (onFileSelect) {
          onFileSelect(file);
        }
        // Use object URL for preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setImageUrl(''); // Clear URL since we have a file
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Failed to upload image: ' + error.message);
      setPreviewUrl(value);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewUrl(url);
    onChange(url);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setPreviewUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleModeChange = (mode) => {
    setUploadMode(mode);
    if (mode === 'upload' && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Selection */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => handleModeChange('upload')}
          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
            uploadMode === 'upload'
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={disabled}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('url')}
          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
            uploadMode === 'url'
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={disabled}
        >
          Image URL
        </button>
      </div>

      {/* Upload Mode */}
      {uploadMode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <div
            onClick={handleBrowseClick}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              disabled || isUploading 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL Mode */}
      {uploadMode === 'url' && (
        <div>
          <input
            type="url"
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Preview</label>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
              disabled={disabled}
            >
              Remove
            </button>
          </div>
          <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/products/product-tbale-1.jpg';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;