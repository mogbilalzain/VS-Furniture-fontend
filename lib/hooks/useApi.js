'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for API calls with loading, error, and data states
 */
export const useApi = (apiFunction, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * Hook for paginated API calls
 */
export const usePaginatedApi = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10, ...initialParams });

  const fetchData = useCallback(async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalParams = { ...params, ...newParams };
      const result = await apiFunction(finalParams);
      
      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
      }
      
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params]);

  const loadMore = useCallback(() => {
    if (pagination && pagination.page < pagination.pages) {
      const newParams = { ...params, page: params.page + 1 };
      setParams(newParams);
      return fetchData(newParams);
    }
  }, [pagination, params, fetchData]);

  const refresh = useCallback(() => {
    return fetchData({ ...params, page: 1 });
  }, [fetchData, params]);

  const updateParams = useCallback((newParams) => {
    const updatedParams = { ...params, ...newParams, page: 1 };
    setParams(updatedParams);
    return fetchData(updatedParams);
  }, [params, fetchData]);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    params,
    fetchData,
    loadMore,
    refresh,
    updateParams,
  };
};

/**
 * Hook for making direct API calls with authentication
 */
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (endpoint, method = 'GET', data = null, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token from apiClient (which handles localStorage)
      let token = null;
      if (typeof window !== 'undefined') {
        try {
          const { apiClient } = await import('../api');
          token = apiClient.getToken();
        } catch (error) {
          console.warn('Could not import apiClient, falling back to localStorage');
          token = localStorage.getItem('auth_token');
        }
      }
      
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      // Add authorization header if token exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Handle FormData (for file uploads)
      if (data instanceof FormData) {
        delete config.headers['Content-Type']; // Let browser set it for FormData
        config.body = data;
      } else if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      // Use centralized environment configuration
      const { ENV_CONFIG } = await import('../../environment');
      const baseURL = ENV_CONFIG.API_BASE_URL;
      const url = endpoint.startsWith('http') ? endpoint : `${baseURL}${endpoint}`;
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    apiCall,
    loading,
    error,
  };
};

export default useApi;