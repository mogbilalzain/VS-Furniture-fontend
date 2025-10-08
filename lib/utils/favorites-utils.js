/**
 * Utility functions for managing favorites in localStorage
 */

const FAVORITES_KEY = 'vs_favorites';
const FAVORITES_VERSION = '1.0';

/**
 * Get favorites from localStorage
 */
export const getFavoritesFromStorage = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    
    // Check version compatibility
    if (data.version !== FAVORITES_VERSION) {
      console.warn('Favorites version mismatch, clearing data');
      clearFavorites();
      return [];
    }
    
    return data.products || [];
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
};

/**
 * Save favorites to localStorage
 */
export const saveFavoritesToStorage = (favorites) => {
  if (typeof window === 'undefined') return false;
  
  try {
    const data = {
      products: favorites,
      lastUpdated: new Date().toISOString(),
      version: FAVORITES_VERSION,
      count: favorites.length
    };
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
    return false;
  }
};

/**
 * Add product to favorites
 */
export const addProductToFavorites = (product) => {
  const favorites = getFavoritesFromStorage();
  
  // Check if product already exists
  const existingIndex = favorites.findIndex(fav => fav.id === product.id);
  if (existingIndex !== -1) {
    return { success: false, message: 'Product already in favorites' };
  }
  
  // Create favorite item
  const favoriteItem = {
    id: product.id,
    name: product.name,
    image: product.image_url || product.image || '/images/placeholder-product.jpg',
    category: product.category?.name || 'Unknown',
    model: product.model || '',
    addedAt: new Date().toISOString(),
    // Store minimal product data to avoid localStorage size issues
    productData: {
      id: product.id,
      name: product.name,
      image: product.image_url || product.image,
      category: product.category,
      model: product.model
    }
  };
  
  const updatedFavorites = [favoriteItem, ...favorites];
  const saved = saveFavoritesToStorage(updatedFavorites);
  
  return {
    success: saved,
    message: saved ? 'Added to favorites' : 'Failed to save',
    favorites: updatedFavorites
  };
};

/**
 * Remove product from favorites
 */
export const removeProductFromFavorites = (productId) => {
  const favorites = getFavoritesFromStorage();
  const updatedFavorites = favorites.filter(fav => fav.id !== productId);
  
  const saved = saveFavoritesToStorage(updatedFavorites);
  
  return {
    success: saved,
    message: saved ? 'Removed from favorites' : 'Failed to remove',
    favorites: updatedFavorites
  };
};

/**
 * Check if product is in favorites
 */
export const isProductInFavorites = (productId) => {
  const favorites = getFavoritesFromStorage();
  return favorites.some(fav => fav.id === productId);
};

/**
 * Get favorites count
 */
export const getFavoritesCount = () => {
  const favorites = getFavoritesFromStorage();
  return favorites.length;
};

/**
 * Clear all favorites
 */
export const clearFavorites = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
};

/**
 * Get recent favorites (last 5)
 */
export const getRecentFavorites = (limit = 5) => {
  const favorites = getFavoritesFromStorage();
  return favorites
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, limit);
};

/**
 * Search favorites
 */
export const searchFavorites = (query) => {
  const favorites = getFavoritesFromStorage();
  const lowercaseQuery = query.toLowerCase();
  
  return favorites.filter(fav => 
    fav.name.toLowerCase().includes(lowercaseQuery) ||
    fav.category.toLowerCase().includes(lowercaseQuery) ||
    (fav.model && fav.model.toLowerCase().includes(lowercaseQuery))
  );
};

/**
 * Get favorites by category
 */
export const getFavoritesByCategory = () => {
  const favorites = getFavoritesFromStorage();
  const grouped = {};
  
  favorites.forEach(fav => {
    const category = fav.category || 'Unknown';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(fav);
  });
  
  return grouped;
};

/**
 * Export favorites data
 */
export const exportFavorites = () => {
  const favorites = getFavoritesFromStorage();
  const exportData = {
    favorites,
    exportedAt: new Date().toISOString(),
    count: favorites.length,
    version: FAVORITES_VERSION
  };
  
  return exportData;
};

/**
 * Import favorites data
 */
export const importFavorites = (importData) => {
  try {
    if (!importData.favorites || !Array.isArray(importData.favorites)) {
      return { success: false, message: 'Invalid import data' };
    }
    
    const saved = saveFavoritesToStorage(importData.favorites);
    return {
      success: saved,
      message: saved ? 'Favorites imported successfully' : 'Failed to import',
      count: importData.favorites.length
    };
  } catch (error) {
    console.error('Error importing favorites:', error);
    return { success: false, message: 'Import failed' };
  }
};
