'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from './api';
import apiClient from './api';
import { authStorage } from './localStorage-utils';
import { ENV_CONFIG } from '../environment';

const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(undefined); // Start with undefined to indicate loading
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [initialized, setInitialized] = React.useState(false);

  // Initialize auth state
  React.useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      const token = authStorage.getToken();
      const userData = authStorage.getUserData();
      
      if (token) {
        console.log('🔍 Found existing token, verifying...');
        console.log('🔍 Cached user data:', userData);
        
        // Update apiClient token temporarily for profile check
        apiClient.setToken(token);
        console.log('🔄 Updated apiClient token for profile check');
        
        try {
          const response = await authAPI.profile();
          if (response.success) {
            console.log('✅ Token valid, user authenticated');
            console.log('🔍 User data from profile API:', response.data);
            console.log('🔍 User role from profile:', response.data?.role);
            
            // Update localStorage with fresh data
            authStorage.updateUserData(response.data);
            setUser(response.data);
          } else {
            console.warn('⚠️ Token invalid, clearing auth data...');
            authStorage.clearAuth();
            apiClient.setToken(null);
            setUser(null);
          }
        } catch (profileError) {
          console.warn('⚠️ Error verifying token, clearing auth data...', profileError.message);
          authStorage.clearAuth();
          apiClient.setToken(null);
          setUser(null);
        }
      } else {
        console.log('ℹ️ No existing token found');
        // Check for cached user data without token (shouldn't happen, but cleanup)
        if (userData) {
          console.log('🧹 Cleaning up orphaned user data');
          authStorage.clearAuth();
          apiClient.setToken(null);
        }
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      
      // Check if it's a network error (server not running)
      if (error.message.includes('Cannot connect to server') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network Error')) {
        console.warn('🌐 Server appears to be offline, keeping cached data');
        setError('Server is not available. Please check if the backend is running.');
        
        // Use cached data if available
        const cachedUserData = authStorage.getUserData();
        if (cachedUserData) {
          console.log('📦 Using cached user data:', cachedUserData);
          setUser(cachedUserData);
        }
      } else {
        console.warn('🔒 Invalid or expired token, clearing auth data...');
        authStorage.clearAuth();
        apiClient.setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Attempting login with credentials:', { username: credentials.username, password: '***' });
      console.log('🌐 API Base URL:', ENV_CONFIG.API_BASE_URL);
      
      const response = await authAPI.login(credentials);
      
      console.log('📥 Raw login response:', response);
      console.log('📥 Response type:', typeof response);
      console.log('📥 Response success:', response?.success);
      
      if (response && response.success) {
        const { user: userData, token } = response.data;
        
        console.log('✅ Login successful for user:', userData);
        
        // Update apiClient token first
        apiClient.setToken(token);
        console.log('🔄 Updated apiClient token');
        
        // Then store auth data in localStorage
        console.log('🔄 Saving auth data to localStorage...');
        console.log('🔍 Token to save:', token.substring(0, 30) + '...');
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', userData.role);
        localStorage.setItem('user_data', JSON.stringify(userData));
        localStorage.setItem('login_time', new Date().toISOString());
        
        // Verify token was saved
        const savedToken = localStorage.getItem('auth_token');
        console.log('🔍 Token after save:', savedToken ? savedToken.substring(0, 30) + '...' : 'null');
        console.log('🔍 Token match:', token === savedToken);
        
        // Set user state
        setUser(userData);
        
        // Debug: Log user state after setting
        console.log('🔍 User state set in AuthContext:', userData);
        console.log('🔍 User role:', userData?.role);
        console.log('🔍 User object keys:', Object.keys(userData || {}));
        console.log('🔍 localStorage role check:', authStorage.getRole());
        console.log('🔍 localStorage admin check:', authStorage.isAdmin());
        
        return { success: true, user: userData };
      } else {
        console.error('❌ Login failed - response:', response);
        const errorMsg = (response && response.message) || 'Login failed - Invalid response';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user: newUser, token } = response.data;
        
        // Store auth data in localStorage using our utility
        authStorage.setAuth(token, newUser);
        
        // Update apiClient token
        apiClient.setToken(token);
        console.log('🔄 Updated apiClient token');
        
        // Set user state
        setUser(newUser);
        
        return { success: true, user: newUser };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      authStorage.clearAuth();
      
      // Update apiClient token
      apiClient.setToken(null);
      console.log('🔄 Cleared apiClient token');
      
      setUser(null);
      setError(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local state even if API call fails
      authStorage.clearAuth();
      
      // Update apiClient token
      apiClient.setToken(null);
      console.log('🔄 Cleared apiClient token');
      
      setUser(null);
      console.log('✅ Local auth data cleared despite API error');
    }
  };

  const isAdmin = () => {
    // First check React state, then fallback to localStorage
    if (user) {
      return user.role === 'admin';
    }
    return authStorage.isAdmin();
  };

  const isAuthenticated = () => {
    // First check React state, then fallback to localStorage
    if (user !== undefined) {
      return !!user;
    }
    return authStorage.isAuthenticated();
  };

  const value = {
    user,
    loading,
    error,
    initialized,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated,
    setError,
    // Expose localStorage utilities
    authStorage,
  };

  // Show loading state until initialized
  if (!initialized && loading) {
    return (
      <AuthContext.Provider value={value}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;