/**
 * Authentication Utilities
 * Helper functions for handling authentication issues
 */

import { authStorage } from './localStorage-utils';
import { ENV_CONFIG } from '../environment';

/**
 * Check if current token is valid and refresh if needed
 */
export const ensureValidAuth = async () => {
  const token = authStorage.getToken();
  const isAdmin = authStorage.isAuthenticatedAdmin();
  
  console.log('🔍 ensureValidAuth - Token exists:', !!token);
  console.log('🔍 ensureValidAuth - Is admin:', isAdmin);
  
  if (!token || !isAdmin) {
    console.log('❌ No valid authentication found');
    return false;
  }
  
  try {
    // Test the token with a simple API call
    const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/auth/me`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Token is valid');
      return true;
    } else {
      console.log('❌ Token is invalid or expired');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking token validity:', error);
    return false;
  }
};

/**
 * Attempt to refresh authentication
 */
export const refreshAuth = async () => {
  try {
    console.log('🔄 Attempting to refresh authentication...');
    
    // Try to get fresh token with stored credentials
    // Note: This would require storing username/password or having refresh token
    // For now, we'll redirect to login
    
    if (typeof window !== 'undefined') {
      console.log('🔄 Redirecting to admin login for re-authentication');
      
      // Clear old auth data
      authStorage.clearAuth();
      
      // Show message and redirect
      alert('انتهت صلاحية جلسة تسجيل الدخول. سيتم إعادة توجيهك لصفحة تسجيل الدخول.');
      window.location.href = '/admin/login';
      
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error refreshing auth:', error);
    return false;
  }
};

/**
 * Execute API call with auth retry
 */
export const executeWithAuthRetry = async (apiCall, maxRetries = 1) => {
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 API attempt ${attempt + 1}/${maxRetries + 1}`);
      
      // Check auth before attempt
      if (attempt === 0) {
        const isValid = await ensureValidAuth();
        if (!isValid) {
          console.log('❌ Invalid auth detected before API call');
          await refreshAuth();
          throw new Error('Authentication required');
        }
      }
      
      // Execute the API call
      const result = await apiCall();
      console.log('✅ API call successful');
      return result;
      
    } catch (error) {
      lastError = error;
      console.log(`❌ API attempt ${attempt + 1} failed:`, error.message);
      
      // If it's a 401 error and we have retries left, try to refresh auth
      if (error.message.includes('401') && attempt < maxRetries) {
        console.log('🔄 401 error - attempting auth refresh...');
        const refreshed = await refreshAuth();
        if (!refreshed) {
          console.log('❌ Auth refresh failed');
          break;
        }
        continue;
      }
      
      // If not 401 or no retries left, throw the error
      break;
    }
  }
  
  console.log('❌ All API attempts failed');
  throw lastError;
};

/**
 * Check if user should be redirected to login
 */
export const shouldRedirectToLogin = () => {
  if (typeof window === 'undefined') return false;
  
  const isAdminPage = window.location.pathname.includes('/admin/');
  const isLoginPage = window.location.pathname.includes('/admin/login');
  const hasValidAuth = authStorage.isAuthenticatedAdmin();
  
  return isAdminPage && !isLoginPage && !hasValidAuth;
};

export default {
  ensureValidAuth,
  refreshAuth,
  executeWithAuthRetry,
  shouldRedirectToLogin
};
