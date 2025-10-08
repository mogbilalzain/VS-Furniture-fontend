/**
 * localStorage Utilities for Authentication Management
 * Handles secure storage and retrieval of user authentication data
 */

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ROLE: 'user_role', 
  USER_DATA: 'user_data',
  LOGIN_TIME: 'login_time',
  // Legacy key for cleanup
  ADMIN_TOKEN: 'adminToken'
};

/**
 * Check if we're in browser environment
 */
const isBrowser = () => typeof window !== 'undefined';

/**
 * Authentication Storage Manager
 */
export const authStorage = {
  /**
   * Set authentication data in localStorage
   * @param {string} token - JWT token
   * @param {object} userData - User data object with role
   */
  setAuth: (token, userData) => {
    if (!isBrowser()) return;
    
    try {
      // Save token to localStorage first
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      
      // Update apiClient token
      const { apiClient } = require('./api');
      apiClient.setToken(token);
      
      // Then update other data
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, userData.role);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, new Date().toISOString());
      
      // Clean up legacy token
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      console.log('✅ Auth data saved:', {
        token: token ? token.substring(0, 20) + '...' : 'null',
        role: userData.role,
        user: userData.username || userData.email
      });
    } catch (error) {
      console.error('❌ Error saving auth data:', error);
    }
  },

  /**
   * Get user role from localStorage
   * @returns {string|null} User role or null
   */
  getRole: () => {
    if (!isBrowser()) return null;
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  },

  /**
   * Get auth token from localStorage
   * @returns {string|null} Auth token or null
   */
  getToken: () => {
    if (!isBrowser()) return null;
    
    try {
      const { apiClient } = require('./api');
      
      // Try to get from apiClient first
      if (apiClient.token) {
        return apiClient.token;
      }
      
      // Fallback to localStorage
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (storedToken) {
        // Restore to apiClient
        apiClient.setToken(storedToken);
        return storedToken;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  },

  /**
   * Get user data from localStorage
   * @returns {object|null} User data object or null
   */
  getUserData: () => {
    if (!isBrowser()) return null;
    
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error parsing user data from localStorage:', error);
      return null;
    }
  },

  /**
   * Get login time from localStorage
   * @returns {string|null} Login time ISO string or null
   */
  getLoginTime: () => {
    if (!isBrowser()) return null;
    return localStorage.getItem(STORAGE_KEYS.LOGIN_TIME);
  },

  /**
   * Check if user is admin
   * @returns {boolean} True if user is admin
   */
  isAdmin: () => {
    const role = authStorage.getRole();
    return role === 'admin';
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated: () => {
    const token = authStorage.getToken();
    return !!token;
  },

  /**
   * Check if user is authenticated admin
   * @returns {boolean} True if user is authenticated admin
   */
  isAuthenticatedAdmin: () => {
    return authStorage.isAuthenticated() && authStorage.isAdmin();
  },

  /**
   * Clear all authentication data
   */
  clearAuth: () => {
    if (!isBrowser()) return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME);
      
      // Clean up legacy tokens
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem('loginTime');
      
      console.log('✅ Auth data cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing auth data from localStorage:', error);
    }
  },

  /**
   * Update user data in localStorage
   * @param {object} userData - Updated user data
   */
  updateUserData: (userData) => {
    if (!isBrowser()) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      if (userData.role) {
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, userData.role);
      }
      console.log('✅ User data updated in localStorage');
    } catch (error) {
      console.error('❌ Error updating user data in localStorage:', error);
    }
  },

  /**
   * Check if session is expired (optional - for future use)
   * @param {number} maxAgeHours - Maximum session age in hours (default: 24)
   * @returns {boolean} True if session is expired
   */
  isSessionExpired: (maxAgeHours = 24) => {
    const loginTime = authStorage.getLoginTime();
    if (!loginTime) return true;
    
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diffHours = (now - loginDate) / (1000 * 60 * 60);
    
    return diffHours > maxAgeHours;
  },

  /**
   * Get debug info for troubleshooting
   * @returns {object} Debug information
   */
  getDebugInfo: () => {
    if (!isBrowser()) return { error: 'Not in browser environment' };
    
    return {
      hasToken: !!authStorage.getToken(),
      role: authStorage.getRole(),
      isAuthenticated: authStorage.isAuthenticated(),
      isAdmin: authStorage.isAdmin(),
      loginTime: authStorage.getLoginTime(),
      userData: authStorage.getUserData(),
      sessionExpired: authStorage.isSessionExpired()
    };
  }
};

/**
 * Legacy support - redirect functions for admin pages
 */
export const adminRedirect = {
  /**
   * Redirect to login if not authenticated admin
   * @param {object} router - Next.js router object
   * @returns {boolean} True if redirect happened
   */
  requireAdmin: (router) => {
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Admin access required, redirecting to login...');
      router.replace('/admin/login');
      return true;
    }
    return false;
  },

  /**
   * Redirect to admin dashboard if already authenticated
   * @param {object} router - Next.js router object
   * @returns {boolean} True if redirect happened
   */
  redirectIfAuthenticated: (router) => {
    if (authStorage.isAuthenticatedAdmin()) {
      console.log('✅ Already authenticated admin, redirecting to dashboard...');
      router.replace('/admin/categories');
      return true;
    }
    return false;
  }
};

export default authStorage;