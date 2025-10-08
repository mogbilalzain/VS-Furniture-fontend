'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFavorites } from '../lib/contexts/favorites-context';
import { getRecentFavorites } from '../lib/utils/favorites-utils';

/**
 * FavoritesCounter Component for Header
 * Shows favorites count with badge and dropdown
 */
const FavoritesCounter = ({ showDropdown = true, className = '' }) => {
  const { count, loading, initialized } = useFavorites();
  const [recentFavorites, setRecentFavorites] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animateCount, setAnimateCount] = useState(false);

  // Update recent favorites when initialized
  useEffect(() => {
    if (initialized) {
      setRecentFavorites(getRecentFavorites(5));
    }
  }, [initialized, count]);

  // Animate count when it changes
  useEffect(() => {
    if (initialized && count > 0) {
      setAnimateCount(true);
      const timer = setTimeout(() => setAnimateCount(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count, initialized]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('[data-dropdown="favorites"]')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Listen for favorites updates
  useEffect(() => {
    const handleFavoritesUpdate = (event) => {
      // Trigger animation on updates
      setAnimateCount(true);
      setTimeout(() => setAnimateCount(false), 300);
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, []);

  const handleToggleDropdown = () => {
    if (showDropdown && count > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  if (!initialized) {
    return (
      <div className={`relative ${className}`}>
        <button className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} data-dropdown="favorites" >
      <button
        onClick={handleToggleDropdown}
        className="text-gray-700 hover:text-blue-600 rounded-lg p-2 relative transition-colors cursor-pointer"
        aria-label={`Favorites (${count} items)`}
       
      >
        {/* Star Icon */}
        <svg
          className={`w-6 h-6 transition-colors duration-200 ${count > 0 ? 'text-yellow-500' : 'text-gray-600'
            }`}
          fill={count > 0 ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={count > 0 ? 0 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.519 4.674c.3.921-.755 1.688-1.539 1.176l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.512-1.839-.255-1.539-1.176l1.519-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
           
         />
        </svg>

        {/* Count Badge */}
        {count > 0 && (
          <span
            className={`
              absolute -top-1 -right-1 bg-yellow-500 text-gray-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium
              transition-transform duration-300
              ${animateCount ? 'scale-125' : 'scale-100'}
            `}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && isDropdownOpen && count > 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">My Favorites</h3>
              <span className="text-xs text-gray-500">{count} items</span>
            </div>
          </div>

          {/* Recent Favorites */}
          <div className="max-h-64 overflow-y-auto">
            {recentFavorites.length > 0 ? (
              recentFavorites.map((favorite) => (
                <Link
                  key={favorite.id}
                  href={`/products/${favorite.id}`}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={handleDropdownClose}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={favorite.image || '/images/placeholder-product.jpg'}
                      alt={favorite.name}
                      className="w-10 h-10 object-cover rounded-md bg-gray-100"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {favorite.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {favorite.category}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No recent favorites
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100">
            <Link
              href="/favorites"
              className="block w-full text-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium py-2 px-4 transition-colors"
              onClick={handleDropdownClose}
            >
              View All Favorites
            </Link>
          </div>
        </div>
      )}

      {/* Simple Link for Mobile or No Dropdown */}
      {(!showDropdown || count === 0) && count > 0 && (
        <Link
          href="/favorites"
          className="absolute top-full right-0 mt-2 text-xs text-gray-600 hover:text-blue-600"
        >
          View Favorites
        </Link>
      )}
    </div>
  );
};

export default FavoritesCounter;
