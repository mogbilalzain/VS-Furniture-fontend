'use client';

import React, { useState, useCallback } from 'react';
import { useFavorites } from '../lib/contexts/favorites-context';

/**
 * FavoriteButton Component
 * 
 * @param {Object} product - Product object
 * @param {string} size - Button size: 'sm', 'md', 'lg'
 * @param {string} variant - Button variant: 'icon', 'button', 'text'
 * @param {string} className - Additional CSS classes
 * @param {function} onToggle - Callback function when toggled
 */
const FavoriteButton = ({ 
  product, 
  size = 'md', 
  variant = 'icon', 
  className = '', 
  onToggle,
  showTooltip = true 
}) => {
  const { isFavorite: checkIsFavorite, addToFavorites, removeFromFavorites, loading } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const isProductFavorite = checkIsFavorite(product?.id);

  const toggle = useCallback(async () => {
    if (!product || loading) return;

    setIsAnimating(true);
    
    try {
      let result;
      if (isProductFavorite) {
        result = await removeFromFavorites(product.id);
      } else {
        result = await addToFavorites(product);
      }
      
      // Animation duration
      setTimeout(() => setIsAnimating(false), 300);
      
      return result;
    } catch (error) {
      setIsAnimating(false);
      throw error;
    }
  }, [product, isProductFavorite, addToFavorites, removeFromFavorites, loading]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const result = await toggle();
      
      // Call external callback if provided
      if (onToggle) {
        onToggle(result, isProductFavorite);
      }
      
      // Show toast notification (you can implement this later)
      if (result?.success) {
        const message = isProductFavorite ? 'Removed from favorites' : 'Added to favorites';
        console.log('✅', message); // Replace with actual toast
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      button: 'px-2 py-1 text-xs',
      text: 'text-xs'
    },
    md: {
      icon: 'w-5 h-5',
      button: 'px-3 py-2 text-sm',
      text: 'text-sm'
    },
    lg: {
      icon: 'w-6 h-6',
      button: 'px-4 py-2 text-base',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Base classes
  const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2';
  
  // Animation classes
  const animationClasses = isAnimating ? 'scale-125' : 'scale-100';
  
  // Loading spinner
  const LoadingSpinner = () => (
    <svg 
      className={`animate-spin ${config.icon}`} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Star icon
  const StarIcon = () => (
    <svg 
      className={`${config.icon} ${animationClasses} transition-transform duration-300`}
      fill={isProductFavorite ? "currentColor" : "none"}
      stroke="currentColor" 
      viewBox="0 0 24 24"
      strokeWidth={isProductFavorite ? 0 : 2}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.519 4.674c.3.921-.755 1.688-1.539 1.176l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.512-1.839-.255-1.539-1.176l1.519-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
      />
    </svg>
  );

  // Render based on variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={loading || !product}
        className={`
          ${baseClasses}
          ${isProductFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}
          disabled:opacity-50 disabled:cursor-not-allowed
          rounded-full p-1 hover:bg-gray-100
          ${className}
        `}
        title={showTooltip ? (isProductFavorite ? 'Remove from favorites' : 'Add to favorites') : ''}
        aria-label={isProductFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {loading ? <LoadingSpinner /> : <StarIcon />}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        disabled={loading || !product}
        className={`
          ${baseClasses}
          ${config.button}
          ${isProductFavorite 
            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          rounded-lg font-medium flex items-center gap-2
          ${className}
        `}
      >
        {loading ? <LoadingSpinner /> : <StarIcon />}
        {isProductFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleClick}
        disabled={loading || !product}
        className={`
          ${baseClasses}
          ${config.text}
          ${isProductFavorite ? 'text-yellow-600' : 'text-gray-600 hover:text-yellow-600'}
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2 font-medium
          ${className}
        `}
      >
        {loading ? <LoadingSpinner /> : <StarIcon />}
        <span>{isProductFavorite ? 'Remove from My List' : 'Add to My List'}</span>
      </button>
    );
  }

  return null;
};

export default FavoriteButton;
