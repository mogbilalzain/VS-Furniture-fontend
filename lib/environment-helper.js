/**
 * Environment Helper
 * مساعد مركزي لاستخدام إعدادات البيئة في جميع أنحاء التطبيق
 */

import { ENV_CONFIG } from '../environment';

/**
 * Get API base URL
 * @returns {string} API base URL
 */
export const getApiBaseUrl = () => {
  return ENV_CONFIG.API_BASE_URL;
};

/**
 * Get frontend base URL
 * @returns {string} Frontend base URL
 */
export const getFrontendBaseUrl = () => {
  return ENV_CONFIG.FRONTEND_BASE_URL;
};

/**
 * Build full API URL
 * @param {string} endpoint - API endpoint (e.g., '/products')
 * @returns {string} Full API URL
 */
export const buildApiUrl = (endpoint) => {
  return ENV_CONFIG.buildApiUrl(endpoint);
};

/**
 * Build full image URL
 * @param {string} imagePath - Image path
 * @returns {string} Full image URL
 */
export const buildImageUrl = (imagePath) => {
  return ENV_CONFIG.buildImageUrl(imagePath);
};

/**
 * Check if we're in development mode
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return ENV_CONFIG.isDevelopment();
};

/**
 * Check if we're in production mode
 * @returns {boolean}
 */
export const isProduction = () => {
  return ENV_CONFIG.isProduction();
};

/**
 * Get current environment name
 * @returns {string}
 */
export const getCurrentEnvironment = () => {
  return ENV_CONFIG.ENVIRONMENT;
};

/**
 * Log environment info (only in debug mode)
 */
export const logEnvironmentInfo = () => {
  if (ENV_CONFIG.DEBUG_MODE) {
    ENV_CONFIG.logEnvironmentInfo();
  }
};

/**
 * Get environment config for debugging
 * @returns {object}
 */
export const getEnvironmentConfig = () => {
  return {
    environment: ENV_CONFIG.ENVIRONMENT,
    apiBaseUrl: ENV_CONFIG.API_BASE_URL,
    frontendBaseUrl: ENV_CONFIG.FRONTEND_BASE_URL,
    imageBaseUrl: ENV_CONFIG.IMAGE_BASE_URL,
    debugMode: ENV_CONFIG.DEBUG_MODE,
    logLevel: ENV_CONFIG.LOG_LEVEL,
    cacheEnabled: ENV_CONFIG.CACHE_ENABLED,
  };
};

/**
 * Create fetch config with environment-aware settings
 * @param {object} options - Additional fetch options
 * @returns {object} Fetch configuration
 */
export const createFetchConfig = (options = {}) => {
  const defaultConfig = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'omit',
  };

  return {
    ...defaultConfig,
    ...options,
  };
};

/**
 * Enhanced fetch function with environment integration
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} Fetch promise
 */
export const envFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : buildApiUrl(endpoint);
  const config = createFetchConfig(options);
  
  if (ENV_CONFIG.DEBUG_MODE) {
    console.log('🌐 ENV Fetch:', url);
    console.log('🔧 Config:', config);
  }
  
  return fetch(url, config);
};

export default {
  getApiBaseUrl,
  getFrontendBaseUrl,
  buildApiUrl,
  buildImageUrl,
  isDevelopment,
  isProduction,
  getCurrentEnvironment,
  logEnvironmentInfo,
  getEnvironmentConfig,
  createFetchConfig,
  envFetch,
};
