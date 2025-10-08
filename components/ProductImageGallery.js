'use client';

import { useState, useEffect } from 'react';
import { productImagesAPI } from '../lib/api';
import { 
  XMarkIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

export default function ProductImageGallery({ productId, product }) {
  const [primaryImage, setPrimaryImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (productId) {
      console.log('🔍 ProductImageGallery: Fetching images for product ID:',  product?.image);
      fetchImages();
    }
  }, [productId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      console.log('🔍 ProductImageGallery: Fetching images for product ID:', product);
      
      const response = await productImagesAPI.getProductImages(productId);
      console.log('📥 ProductImageGallery: API response:', response);
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('🖼️ Product gallery images loaded:', response.data.length, 'images');
        console.log('📋 Images data:', response.data);
        
        // Find primary image or use the first one
        const primary = response.data.find(img => img.is_primary) || response.data[0];
        setPrimaryImage(primary);
        console.log('📸 Primary image selected:', primary);
      } else {
        console.log('⚠️ No gallery images found for product ID:', productId);
        console.log('📊 Response details:', {
          success: response.success,
          dataExists: !!response.data,
          dataLength: response.data?.length,
          fullResponse: response
        });
        
        // Fallback to legacy image field (prefer image_url over image)
        const fallbackImageUrl = product?.image_url || product?.image;
        if (fallbackImageUrl) {
          console.log('🔄 Using legacy image:', fallbackImageUrl);
          setPrimaryImage({
            id: 'legacy',
            image_url: fallbackImageUrl,
            alt_text: product.name || 'Product image',
            is_primary: true
          });
        } else {
          console.log('🔄 Using placeholder image');
          setPrimaryImage({
            id: 'placeholder',
            image_url: '/images/placeholder-product.jpg',
            alt_text: 'Product placeholder',
            is_primary: true
          });
        }
      }
    } catch (error) {
      console.error('❌ ProductImageGallery: Error fetching images:', error);
      console.error('📊 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Fallback to legacy image or placeholder
      const fallbackImage = product?.image_url || product?.image || '/images/placeholder-product.jpg';
      console.log('🔄 Using fallback image:', fallbackImage);
      setPrimaryImage({
        id: 'fallback',
        image_url: fallbackImage,
        alt_text: product?.name || 'Product image',
        is_primary: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/images/placeholder-product.jpg';
  };

  const openLightbox = () => {
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  if (loading) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading image...</div>
      </div>
    );
  }

  if (!primaryImage) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">No image available</div>
      </div>
    );
  }

  return (
    <>
      {/* Single Main Image */}
      <div className="relative group">
        <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
          <img
            src={primaryImage.image_url || '/images/placeholder-product.jpg'}
            alt={primaryImage.alt_text || 'Product image'}
            onError={handleImageError}
            className="w-full h-full object-contain cursor-pointer"
            onClick={openLightbox}
          />
        </div>

        {/* Zoom Icon */}
        <button
          onClick={openLightbox}
          className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-10"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>

          {/* Main Lightbox Image */}
          <div className="relative max-w-5xl max-h-[90vh] mx-auto p-4">
            <img
              src={primaryImage.image_url}
              alt={primaryImage.alt_text}
              onError={handleImageError}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Close instruction */}
          <div className="absolute bottom-6 right-6 text-white text-sm opacity-60">
            Press ESC to close
          </div>
        </div>
      )}

      {/* Keyboard Navigation */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-40"
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeLightbox();
          }}
          tabIndex={0}
        />
      )}
    </>
  );
}