'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ENV_CONFIG } from '../environment';

/**
 * مكون محسن لعرض الصور من Laravel Backend
 * Enhanced component for displaying images from Laravel Backend
 */
export default function LaravelImage({ 
  src, 
  alt = "Image", 
  width = 300, 
  height = 200, 
  className = "",
  priority = false,
  fill = false,
  sizes,
  placeholder = "blur",
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  ...props 
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // بناء رابط الصورة الكامل
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // إذا كان الرابط كاملاً بالفعل
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // إذا كان مسار Laravel storage
    if (imagePath.startsWith('/storage/')) {
      return `${ENV_CONFIG.API_BASE_URL.replace('/api', '')}${imagePath}`;
    }
    
    // إذا كان مسار Next.js
    if (imagePath.startsWith('/images/')) {
      return `${ENV_CONFIG.FRONTEND_BASE_URL}${imagePath}`;
    }
    
    // افتراضي - مسار Laravel storage
    return `${ENV_CONFIG.API_BASE_URL.replace('/api', '')}/storage/${imagePath}`;
  };

  const imageUrl = buildImageUrl(src);
  const fallbackUrl = '/images/placeholder-product.jpg';

  // معالجة خطأ تحميل الصورة
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    
    if (ENV_CONFIG.DEBUG_MODE) {
      console.warn('⚠️ LaravelImage: Failed to load image:', imageUrl);
    }
  };

  // معالجة نجاح تحميل الصورة
  const handleImageLoad = () => {
    setImageLoading(false);
    
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log('✅ LaravelImage: Successfully loaded:', imageUrl);
    }
  };

  // إذا لم يكن هناك مصدر للصورة
  if (!imageUrl) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">لا توجد صورة</span>
      </div>
    );
  }

  // استخدام fill prop
  if (fill) {
    return (
      <div className={`relative ${className}`} {...props}>
        <Image
          src={imageError ? fallbackUrl : imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className="object-cover"
        />
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-sm">جاري التحميل...</div>
          </div>
        )}
      </div>
    );
  }

  // الاستخدام العادي مع width و height
  return (
    <div className={`relative ${className}`} {...props}>
      <Image
        src={imageError ? fallbackUrl : imageUrl}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className="object-cover"
      />
      {imageLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-sm">جاري التحميل...</div>
        </div>
      )}
    </div>
  );
}

// مكونات مخصصة للاستخدامات المختلفة
export const ProductImage = ({ product, ...props }) => (
  <LaravelImage
    src={product?.image_url || product?.image}
    alt={product?.name || 'Product Image'}
    {...props}
  />
);

export const ProductThumbnail = ({ product, ...props }) => (
  <LaravelImage
    src={product?.image_url || product?.image}
    alt={product?.name || 'Product Thumbnail'}
    width={150}
    height={150}
    className="rounded-lg"
    {...props}
  />
);

export const ProductGalleryImage = ({ image, ...props }) => (
  <LaravelImage
    src={image?.image_url}
    alt={image?.alt_text || image?.title || 'Gallery Image'}
    width={400}
    height={300}
    className="rounded-lg shadow-md"
    {...props}
  />
);
