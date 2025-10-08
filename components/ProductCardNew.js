'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DocumentIcon, StarIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { productImagesAPI } from '../lib/api';

const ProductCardNew = ({ product, showProperties = true, className = "" }) => {
  const [productImages, setProductImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (product?.id) {
      fetchProductImages();
    }
  }, [product?.id]);

  const fetchProductImages = async () => {
    try {
      setImageLoading(true);
      const response = await productImagesAPI.getProductImages(product.id);
      
      if (response.success && response.data.length > 0) {
        setProductImages(response.data);
      } else {
        // Fallback to legacy image field
        if (product.image) {
          setProductImages([{
            id: 'legacy',
            image_url: product.image,
            alt_text: product.name,
            is_primary: true
          }]);
        } else {
          setProductImages([{
            id: 'placeholder',
            image_url: '/images/placeholder-product.jpg',
            alt_text: 'Product placeholder',
            is_primary: true
          }]);
        }
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
      // Fallback to legacy image or placeholder
      const fallbackImage = product.image || '/images/placeholder-product.jpg';
      setProductImages([{
        id: 'fallback',
        image_url: fallbackImage,
        alt_text: product.name || 'Product image',
        is_primary: true
      }]);
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/images/placeholder-product.jpg';
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const goToImage = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const currentImage = productImages[currentImageIndex];
  const hasMultipleImages = productImages.length > 1;

  return (
    <div 
      className={`bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Product Image Gallery */}
      <div className="relative">
        {/* Favorite Icon */}
        <button className="absolute top-3 right-3 z-10 text-gray-400 hover:text-yellow-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.329 1.176l1.519 4.674c.3.921-.755 1.688-1.539 1.176l-3.976-2.888a1 1 0 00-1.176 0l-3.976-2.888c-.783.512-1.839-.255-1.539-1.176l1.519-4.674a1 1 0 00-.329-1.176l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69l1.519-4.674z"/>
          </svg>
        </button>

        {/* Image Loading State */}
        {imageLoading ? (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        ) : (
          <>
            {/* Main Image */}
            <Link href={`/products/${product.id}`}>
              <img 
                src={currentImage?.image_url || '/images/placeholder-product.jpg'} 
                alt={currentImage?.alt_text || product.name}
                onError={handleImageError}
                className="w-full h-64 object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            </Link>

            {/* Navigation Arrows (show on hover if multiple images) */}
            {hasMultipleImages && hovering && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 rounded-full p-1 shadow-md transition-all"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 rounded-full p-1 shadow-md transition-all"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Image Indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => goToImage(index, e)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white bg-opacity-60 hover:bg-opacity-80'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Images Count Badge */}
            {hasMultipleImages && (
              <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1}/{productImages.length}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Model Number */}
        <div className="text-xs text-gray-500 mb-1">
          Model: {product.model || 'N/A'}
        </div>
        
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        
        {/* Product Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.short_description || product.description || 'No description available'}
        </p>
        
        {/* Product Specifications */}
        <div className="text-xs text-gray-500 mb-3">
          <div>W: 38.2" x D: 21.3"</div>
          <div>Height adjustable: 23.25" - 32.3"</div>
        </div>

        {/* Properties/Features */}
        {showProperties && product.property_values && product.property_values.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.property_values.slice(0, 3).map((property, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {property.display_name || property.value}
                </span>
              ))}
              {product.property_values.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{product.property_values.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Link
            href={`/products/${product.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </Link>
          
          <div className="flex items-center space-x-2 text-gray-400">
            <button className="hover:text-gray-600 transition-colors">
              <EyeIcon className="h-4 w-4" />
            </button>
            <button className="hover:text-gray-600 transition-colors">
              <DocumentIcon className="h-4 w-4" />
            </button>
            <button className="hover:text-yellow-500 transition-colors">
              <StarIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardNew;