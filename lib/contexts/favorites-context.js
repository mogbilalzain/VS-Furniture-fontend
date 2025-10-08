'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  getFavoritesFromStorage,
  addProductToFavorites,
  removeProductFromFavorites,
  isProductInFavorites,
  getFavoritesCount,
  clearFavorites
} from '../utils/favorites-utils';

// Initial state
const initialState = {
  favorites: [],
  count: 0,
  loading: false,
  error: null,
  initialized: false
};

// Action types
const ACTIONS = {
  INITIALIZE: 'INITIALIZE',
  SET_LOADING: 'SET_LOADING',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  SET_FAVORITES: 'SET_FAVORITES',
  CLEAR_FAVORITES: 'CLEAR_FAVORITES',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const favoritesReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.INITIALIZE:
      return {
        ...state,
        favorites: action.payload.favorites,
        count: action.payload.count,
        initialized: true,
        loading: false
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTIONS.ADD_FAVORITE:
      return {
        ...state,
        favorites: action.payload.favorites,
        count: action.payload.favorites.length,
        loading: false,
        error: null
      };

    case ACTIONS.REMOVE_FAVORITE:
      return {
        ...state,
        favorites: action.payload.favorites,
        count: action.payload.favorites.length,
        loading: false,
        error: null
      };

    case ACTIONS.SET_FAVORITES:
      return {
        ...state,
        favorites: action.payload,
        count: action.payload.length,
        loading: false
      };

    case ACTIONS.CLEAR_FAVORITES:
      return {
        ...state,
        favorites: [],
        count: 0,
        loading: false,
        error: null
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const FavoritesContext = createContext();

// Provider component
export const FavoritesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Initialize favorites from localStorage on mount
  useEffect(() => {
    const initializeFavorites = () => {
      try {
        const favorites = getFavoritesFromStorage();
        const count = getFavoritesCount();
        
        dispatch({
          type: ACTIONS.INITIALIZE,
          payload: { favorites, count }
        });
      } catch (error) {
        console.error('Error initializing favorites:', error);
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: 'Failed to load favorites'
        });
      }
    };

    initializeFavorites();
  }, []);

  // Add product to favorites
  const addToFavorites = async (product) => {
    if (!product || !product.id) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Invalid product data'
      });
      return { success: false, message: 'Invalid product data' };
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const result = addProductToFavorites(product);
      
      if (result.success) {
        dispatch({
          type: ACTIONS.ADD_FAVORITE,
          payload: { favorites: result.favorites }
        });
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('favoritesUpdated', {
          detail: { action: 'add', product, count: result.favorites.length }
        }));
      } else {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: result.message
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      const errorMessage = 'Failed to add to favorites';
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  // Remove product from favorites
  const removeFromFavorites = async (productId) => {
    if (!productId) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Invalid product ID'
      });
      return { success: false, message: 'Invalid product ID' };
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const result = removeProductFromFavorites(productId);
      
      if (result.success) {
        dispatch({
          type: ACTIONS.REMOVE_FAVORITE,
          payload: { favorites: result.favorites }
        });
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('favoritesUpdated', {
          detail: { action: 'remove', productId, count: result.favorites.length }
        }));
      } else {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: result.message
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      const errorMessage = 'Failed to remove from favorites';
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (product) => {
    const isFavorite = isProductInFavorites(product.id);
    
    if (isFavorite) {
      return await removeFromFavorites(product.id);
    } else {
      return await addToFavorites(product);
    }
  };

  // Check if product is favorite
  const isFavorite = (productId) => {
    return isProductInFavorites(productId);
  };

  // Clear all favorites
  const clearAllFavorites = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const success = clearFavorites();
      
      if (success) {
        dispatch({ type: ACTIONS.CLEAR_FAVORITES });
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('favoritesUpdated', {
          detail: { action: 'clear', count: 0 }
        }));
      } else {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: 'Failed to clear favorites'
        });
      }
      
      return { success };
    } catch (error) {
      console.error('Error clearing favorites:', error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Failed to clear favorites'
      });
      return { success: false };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    favorites: state.favorites,
    count: state.count,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    
    // Actions
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    clearError
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use favorites context
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  
  return context;
};

// Export context for advanced usage
export { FavoritesContext };
