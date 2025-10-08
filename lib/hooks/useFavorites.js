'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFavorites as useFavoritesContext } from '../contexts/favorites-context';
import {
  getRecentFavorites,
  searchFavorites,
  getFavoritesByCategory,
  exportFavorites,
  importFavorites
} from '../utils/favorites-utils';

/**
 * Enhanced useFavorites hook with additional functionality
 */
export const useEnhancedFavorites = () => {
  const context = useFavoritesContext();
  const [recentFavorites, setRecentFavorites] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [categorizedFavorites, setCategorizedFavorites] = useState({});

  // Update derived data when favorites change
  useEffect(() => {
    if (context.initialized) {
      setRecentFavorites(getRecentFavorites(5));
      setCategorizedFavorites(getFavoritesByCategory());
    }
  }, [context.favorites, context.initialized]);

  // Search favorites
  const searchInFavorites = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }
    
    const results = searchFavorites(query);
    setSearchResults(results);
    return results;
  }, []);

  // Get favorites by category
  const getFavoritesByCategories = useCallback(() => {
    return getFavoritesByCategory();
  }, []);

  // Export favorites
  const exportFavoritesData = useCallback(() => {
    try {
      const data = exportFavorites();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vs-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true, message: 'Favorites exported successfully' };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, message: 'Failed to export favorites' };
    }
  }, []);

  // Import favorites
  const importFavoritesData = useCallback(async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = importFavorites(data);
      
      if (result.success) {
        // Refresh context
        window.location.reload(); // Simple refresh to update context
      }
      
      return result;
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, message: 'Failed to import favorites' };
    }
  }, []);

  // Share favorites (generate shareable link)
  const shareFavorites = useCallback(() => {
    try {
      const data = exportFavorites();
      const shareData = {
        title: 'My VS Favorites',
        text: `Check out my favorite products! I have ${data.count} items in my list.`,
        url: window.location.origin + '/favorites'
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareData.url);
        return { success: true, message: 'Link copied to clipboard' };
      }
      
      return { success: true, message: 'Shared successfully' };
    } catch (error) {
      console.error('Share error:', error);
      return { success: false, message: 'Failed to share' };
    }
  }, []);

  // Get favorite statistics
  const getFavoriteStats = useCallback(() => {
    const categories = getFavoritesByCategory();
    const categoryStats = Object.entries(categories).map(([category, items]) => ({
      category,
      count: items.length,
      percentage: Math.round((items.length / context.count) * 100)
    }));

    return {
      totalCount: context.count,
      categoriesCount: Object.keys(categories).length,
      categoryBreakdown: categoryStats,
      recentCount: recentFavorites.length
    };
  }, [context.count, recentFavorites.length]);

  return {
    // Core context functionality
    ...context,
    
    // Enhanced functionality
    recentFavorites,
    searchResults,
    categorizedFavorites,
    
    // Methods
    searchInFavorites,
    getFavoritesByCategories,
    exportFavoritesData,
    importFavoritesData,
    shareFavorites,
    getFavoriteStats
  };
};

/**
 * Hook for managing favorite button state
 */
export const useFavoriteButton = (product) => {
  const { isFavorite, addToFavorites, removeFromFavorites, loading } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const isProductFavorite = isFavorite(product?.id);

  const handleToggle = useCallback(async () => {
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

  return {
    isFavorite: isProductFavorite,
    isLoading: loading,
    isAnimating,
    toggle: handleToggle
  };
};

// Re-export the context hook as the main hook
export const useFavorites = useFavoritesContext;

export default useEnhancedFavorites;
