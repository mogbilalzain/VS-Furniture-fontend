/**
 * API Client for VS Furniture Laravel Backend
 */

import { ENV_CONFIG, buildApiUrl } from '../environment/index.js';

const API_BASE_URL = ENV_CONFIG.API_BASE_URL;

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ROLE: 'user_role', 
  USER_DATA: 'user_data',
  LOGIN_TIME: 'login_time',
  ADMIN_TOKEN: 'adminToken'
};

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (storedToken) {
        this.token = storedToken;
        console.log('🔄 Initialized token from localStorage');
      }
    }
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    }
    console.log('🔄 ApiClient token updated:', token ? token.substring(0, 20) + '...' : 'null');
  }

  /**
   * Get authentication token
   */
  getToken() {
    if (typeof window !== 'undefined') {
      // Try to get token from localStorage if not in memory
      if (!this.token) {
        const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (storedToken) {
          this.token = storedToken;
          console.log('🔄 Restored token from localStorage');
        }
      }
    }
    return this.token;
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem('loginTime'); // Legacy key cleanup
      console.log('🗑️ Cleared authentication token and user data');
    }
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    // Debug token retrieval for critical requests
    if (endpoint.includes('auth/login') || endpoint.includes('admin/categories')) {
      console.log(`🔍 ${endpoint} - Token from localStorage:`, token ? token.substring(0, 20) + '...' : 'null');
      console.log(`🔍 ${endpoint} - localStorage keys:`, Object.keys(localStorage));
      console.log(`🔍 ${endpoint} - auth_token direct:`, localStorage.getItem('auth_token') ? 'exists' : 'missing');
    }

    // Default headers
    const defaultHeaders = {
      'Accept': 'application/json',
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const config = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    };

    // Add authorization header if token exists and endpoint requires auth
    // Public endpoints that don't need authentication
    // Note: These should be exact matches to avoid conflicts with admin endpoints
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/contact'
    ];
    
    // More precise public endpoint detection - exact path matching
    const apiPath = url.replace(this.baseURL, '');
    const isPublicEndpoint = publicEndpoints.some(endpoint => {
      if (endpoint.startsWith('/')) {
        // For exact matching, check if the API path matches exactly
        const isExactMatch = apiPath === endpoint;
        const isQueryMatch = apiPath.startsWith(endpoint + '?');
        
        // Debug for auth endpoints
        if (endpoint.includes('auth/')) {
          console.log(`🔍 Auth endpoint check for ${endpoint}:`);
          console.log(`  - API Path: ${apiPath}`);
          console.log(`  - Endpoint: ${endpoint}`);
          console.log(`  - Exact match: ${isExactMatch}`);
          console.log(`  - Query match: ${isQueryMatch}`);
          console.log(`  - Final result: ${isExactMatch || isQueryMatch}`);
        }
        
        return isExactMatch || isQueryMatch;
      } else {
        return url.includes(`/${endpoint}`);
      }
    });
    
    // Special handling for public product/category endpoints (non-admin)
    const isPublicProductCategory = (
      // Exact matches for root endpoints
      apiPath === '/products' || 
      apiPath === '/categories' ||
      apiPath === '/certifications' ||
      // Product details and related endpoints
      apiPath.match(/^\/products\/\d+$/) ||
      apiPath.match(/^\/products\/\d+\/properties$/) ||
      apiPath.match(/^\/products\/\d+\/files$/) ||
      apiPath.match(/^\/products\/\d+\/files\/\d+\/download$/) ||
      apiPath.match(/^\/products\/\d+\/certifications$/) ||
      apiPath.match(/^\/products\/\d+\/images$/) ||
      apiPath.match(/^\/products\/\d+\/materials$/) ||
      // Category details and products
      apiPath.match(/^\/categories\/\d+$/) ||
      apiPath.match(/^\/categories\/\d+\/products$/) ||
      apiPath.match(/^\/categories\/\d+\/properties$/) ||
      // Materials endpoints
      apiPath === '/materials/categories' ||
      apiPath.match(/^\/materials\/categories\/\d+$/) ||
      apiPath === '/materials/groups' ||
      apiPath.match(/^\/materials\/groups\/\d+$/) ||
      apiPath === '/materials' ||
      apiPath.match(/^\/materials\/\d+$/)
    ) && !apiPath.includes('/admin/') && !apiPath.includes('/auth/');
    
    // Determine if this endpoint needs authentication
    const needsAuth = !isPublicEndpoint && !isPublicProductCategory;
    
    // Debug public endpoint detection for product and auth requests
    if (endpoint.includes('auth/login') || endpoint.includes('admin/') || endpoint.includes('categories') || endpoint.includes('products')) {
      console.log(`🔍 Endpoint detection for ${endpoint}:`);
      console.log(`  - URL: ${url}`);
      console.log(`  - API Path: ${apiPath}`);
      console.log(`  - Public endpoints:`, publicEndpoints);
      console.log(`  - Is public endpoint: ${isPublicEndpoint}`);
      console.log(`  - Is public product/category: ${isPublicProductCategory}`);
      console.log(`  - Product ID regex test: ${apiPath.match(/^\/products\/\d+$/)}`);
      console.log(`  - Product properties regex test: ${apiPath.match(/^\/products\/\d+\/properties$/)}`);
      console.log(`  - Product files regex test: ${apiPath.match(/^\/products\/\d+\/files$/)}`);
      console.log(`  - Needs auth: ${needsAuth}`);
      console.log(`  - Token exists: ${!!token}`);
      console.log(`  - Method: ${options.method || 'GET'}`);
    }
    
    // Only add Authorization header for endpoints that need authentication
    // AND only if we have a valid token
    if (needsAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔐 Added Authorization header for ${endpoint}`);
      console.log(`🔐 Token preview: ${token.substring(0, 20)}...`);
    } else {
      // Explicitly remove Authorization header for public endpoints
      delete config.headers.Authorization;
      
      if (endpoint.includes('auth/login')) {
        console.log(`🔓 No Authorization header for login (public endpoint)`);
      } else if (isPublicEndpoint || isPublicProductCategory) {
        console.log(`🔓 No Authorization header for public ${endpoint} (public endpoint)`);
      } else if (needsAuth && !token) {
        console.log(`❌ No Authorization header for ${endpoint} - missing token`);
      } else {
        console.log(`ℹ️ No Authorization header for ${endpoint}`);
      }
    }

    try {
      console.log(`🔄 Making API request to: ${url}`);
      console.log(`📤 Request method: ${config.method || 'GET'}`);
      console.log(`📤 Request headers:`, config.headers);
      
      // Special debugging for admin requests
      if (endpoint.includes('admin/') || (endpoint.includes('categories') && !endpoint.includes('auth/')) || (endpoint.includes('products') && !endpoint.includes('auth/'))) {
        console.log(`🔍 DETAILED DEBUG for ${endpoint}:`);
        console.log(`  - Full URL: ${url}`);
        console.log(`  - Method: ${config.method || 'GET'}`);
        console.log(`  - Token exists: ${!!token}`);
        console.log(`  - Token value: ${token ? token.substring(0, 30) + '...' : 'null'}`);
        console.log(`  - Is public endpoint: ${isPublicEndpoint}`);
        console.log(`  - Is public product/category: ${isPublicProductCategory}`);
        console.log(`  - Needs auth: ${needsAuth}`);
        console.log(`  - Authorization header: ${config.headers.Authorization || 'MISSING'}`);
        console.log(`  - All headers:`, JSON.stringify(config.headers, null, 2));
      }
      if (config.body) {
        console.log(`📤 Request body:`, config.body);
      }
      
      const response = await fetch(url, config);
      console.log(`📥 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorData = {};
        
        try {
          // Try to read as JSON directly first
          const responseClone = response.clone();
          errorData = await response.json();
          console.log(`📥 Error response JSON:`, errorData);
        } catch (jsonError) {
          console.log('❌ Failed to parse as JSON, trying text...');
          try {
            // Fallback to text if JSON parsing fails
            const responseClone = response.clone();
            const errorText = await responseClone.text();
            console.log(`📥 Raw error response text: "${errorText}"`);
            
            if (errorText) {
              try {
                errorData = JSON.parse(errorText);
              } catch (parseError) {
                errorData = { 
                  message: errorText,
                  status: response.status,
                  statusText: response.statusText
                };
              }
            } else {
              errorData = {
                message: `Empty error response for ${response.status}`,
                status: response.status,
                statusText: response.statusText
              };
            }
          } catch (textError) {
            console.error('❌ Failed to read response as text:', textError);
            errorData = {
              message: `Failed to read error response: ${textError.message}`,
              status: response.status,
              statusText: response.statusText
            };
          }
        }
        
        console.error(`❌ API Error Response (${response.status}):`, errorData);
        console.error(`❌ Response headers:`, Object.fromEntries(response.headers.entries()));
        
        // Create more descriptive error message
        let errorMessage = errorData.message || 
          errorData.error || 
          `HTTP ${response.status}: ${response.statusText || 'Unknown Error'}`;
        
        // Special handling for different error types
        if (response.status === 401) {
          // Check if this is shortly after login (within 5 seconds) - don't delete token
          const loginTime = localStorage.getItem('login_time');
          const isRecentLogin = loginTime && (Date.now() - new Date(loginTime).getTime()) < 5000;
          
          // For public endpoints getting 401, clear any stored token as it's invalid
          if (isPublicEndpoint || isPublicProductCategory) {
            console.log('🧹 401 on public endpoint - clearing invalid token');
            this.clearToken();
          }
          // Never clear token for:
          // 1. Login requests
          // 2. Recent logins (within 5 seconds)
          else if (typeof window !== 'undefined' && 
              !url.includes('/auth/login') && 
              !isRecentLogin) {
            const tokenBeforeDelete = this.token;
            this.token = null;
            console.log('🗑️ Cleared invalid authentication token');
            console.log('🗑️ Token that was deleted:', tokenBeforeDelete ? tokenBeforeDelete.substring(0, 20) + '...' : 'null');
            console.log('🗑️ Request that caused deletion:', url);
            console.log('🗑️ Deletion timestamp:', new Date().toISOString());
            
            // Clear localStorage auth data
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME);
            localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
            localStorage.removeItem('loginTime');
          } else {
            console.log('🔐 Keeping token despite 401 error');
            console.log('🔐 Reason:', 
              url.includes('/auth/login') ? 'Login request' :
              isRecentLogin ? 'Recent login' :
              'Unknown'
            );
          }
          
          if (url.includes('/auth/profile')) {
            errorMessage = 'Authentication token expired or invalid. Please login again.';
          } else if (url.includes('/auth/login')) {
            errorMessage = 'Invalid login credentials. Please check your email and password.';
          } else if (url.includes('/admin/')) {
            errorMessage = 'Admin authentication required. Your session may have expired.';
            
            // Special handling for admin pages - redirect to admin login
            if (typeof window !== 'undefined' && 
                window.location.pathname.includes('/admin/') && 
                !window.location.pathname.includes('/admin/login')) {
              console.log('🔄 Admin 401 detected - preparing redirect');
              
              // Show non-blocking notification
              errorMessage = 'انتهت صلاحية جلسة تسجيل الدخول. سيتم إعادة توجيهك لصفحة تسجيل الدخول.';
              
              // Delayed redirect to allow user to see the error message
              setTimeout(() => {
                console.log('🔄 Redirecting to admin login');
                window.location.href = '/admin/login';
              }, 3000); // 3 seconds delay
            }
          } else {
            errorMessage = 'Authentication required. Please login to access this page.';
          }
        } else if (response.status === 403) {
          errorMessage = 'Access denied. You need admin privileges to access this page.';
        } else if (response.status === 404) {
          errorMessage = 'The requested data was not found or has been deleted.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Sorry for the inconvenience, please try again later.';
        } else if (response.status === 422) {
          console.log('🔍 422 Validation Error detected:', errorData);
          console.log('🔍 ErrorData type:', typeof errorData);
          console.log('🔍 ErrorData keys:', Object.keys(errorData || {}));
          
          let validationDetails = '';
          let mainMessage = 'Validation failed. Please check your input data.';
          
          if (errorData && typeof errorData === 'object') {
            if (errorData.errors && typeof errorData.errors === 'object') {
              console.log('🔍 Found validation errors:', errorData.errors);
              const errorMessages = [];
              for (const [field, messages] of Object.entries(errorData.errors)) {
                errorMessages.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
              }
              validationDetails = '\n\nValidation Errors:\n' + errorMessages.join('\n');
            } else if (errorData.message) {
              console.log('🔍 Found error message:', errorData.message);
              mainMessage = errorData.message;
            } else if (errorData.failed_fields && Array.isArray(errorData.failed_fields)) {
              console.log('🔍 Found failed fields:', errorData.failed_fields);
              validationDetails = '\n\nFailed fields: ' + errorData.failed_fields.join(', ');
            } else {
              console.log('🔍 Unknown errorData structure, showing raw data');
              validationDetails = '\n\nError details: ' + JSON.stringify(errorData, null, 2);
            }
          } else {
            console.log('❌ No error data available or data is not an object');
            validationDetails = '\n\nNo specific error details available. Please check all required fields.';
          }
          
          errorMessage = `${mainMessage}${validationDetails}`;
          
          const error = new Error(errorMessage);
          error.status = response.status;
          error.validationErrors = errorData?.errors;
          error.fullResponse = errorData;
          throw error;
        } else if (response.status === 400) {
          // Handle validation errors and bad requests
          console.log('🔍 400 Bad Request detected:', errorData);
          
          const error = new Error(errorData.message || errorMessage);
          error.status = response.status;
          error.fullResponse = errorData;
          
          // Check if it has validation errors
          if (errorData.errors && typeof errorData.errors === 'object') {
            error.validationErrors = errorData.errors;
            console.log('🔍 Validation errors found:', errorData.errors);
          }
          
          throw error;
        }
          
        // For other errors, create an error object with full response data
        const error = new Error(errorMessage);
        error.status = response.status;
        error.fullResponse = errorData;
        throw error;
      }

      const data = await response.json();
      console.log(`✅ API response:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Request Error for ${url}:`, error);
      console.error(`❌ Error type: ${error.name}`);
      console.error(`❌ Error message: ${error.message}`);
      
      // Handle network errors with friendly English messages
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError = new Error(`🌐 Cannot connect to server. Please make sure the Laravel backend is running on ${ENV_CONFIG.API_BASE_URL.replace('/api', '')}`);
        networkError.code = 'NETWORK_ERROR';
        networkError.suggestions = [
          'Check if Laravel server is running',
          'Verify your internet connection',
          'Try refreshing the page'
        ];
        throw networkError;
      }
      
      // Handle CORS errors
      if (error.name === 'TypeError' && error.message.includes('CORS')) {
        const corsError = new Error('🚫 CORS error: The server is not allowing requests from this domain');
        corsError.code = 'CORS_ERROR';
        throw corsError;
      }
      
      // Check for timeout errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        const timeoutError = new Error('⏱️ Request timeout. The server might be slow, please try again.');
        timeoutError.code = 'TIMEOUT_ERROR';
        throw timeoutError;
      }
      
      // Re-throw the original error with more context
      const contextError = new Error(`API Request Failed: ${error.message}`);
      contextError.originalError = error;
      contextError.url = url;
      throw contextError;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * POST request with form data (for file uploads)
   */
  async postFormData(endpoint, formData) {
    console.log('🔧 ApiClient.postFormData called');
    console.log('🔧 Endpoint:', endpoint);
    console.log('🔧 FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, value instanceof File ? `File(${value.name})` : value]));
    
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export apiClient for external access
export { apiClient };

// Authentication API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  profile: () => apiClient.get('/auth/profile'),
  logout: () => {
    apiClient.setToken(null);
    return Promise.resolve({ success: true });
  },
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => apiClient.get('/products', params),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (productData) => {
    // If productData contains a file, use FormData
    if (productData instanceof FormData) {
      return apiClient.postFormData('/admin/products', productData);
    }
    return apiClient.post('/admin/products', productData);
  },
  update: (id, productData) => apiClient.put(`/admin/products/${id}`, productData),
  delete: (id) => apiClient.delete(`/admin/products/${id}`),
  getAdminAll: (params = {}) => apiClient.get('/admin/products', params),
  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    // Use test endpoint temporarily
    return apiClient.postFormData('/upload-test', formData);
  },
  
  // Filter products by properties (new system)
  filterByProperties: (params = {}) => {
    // Convert property filters to query parameters
    const queryParams = new URLSearchParams();
    
    // Add basic parameters
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add property filters
    if (params.properties) {
      Object.entries(params.properties).forEach(([propertyName, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          values.forEach(value => {
            queryParams.append(`${propertyName}[]`, value);
          });
        }
      });
    }
    
    return apiClient.get(`/products?${queryParams.toString()}`);
  },
  
  // Update product properties
  updateProperties: (productId, propertyData) => apiClient.post(`/admin/products/${productId}/properties`, propertyData),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiClient.get('/categories'),
  getById: (id) => apiClient.get(`/categories/${id}`),
  getProducts: (id) => apiClient.get(`/categories/${id}/products`),
  getAdminAll: () => apiClient.get('/admin/categories'),
  create: (categoryData) => apiClient.post('/admin/categories', categoryData),
  update: (id, categoryData) => apiClient.put(`/admin/categories/${id}`, categoryData),
  delete: (id) => apiClient.delete(`/admin/categories/${id}`),
  
  // Update category properties
  updateProperties: (categoryId, propertyIds) => 
    apiClient.put(`/admin/categories/${categoryId}/properties`, { property_ids: propertyIds }),
    
  // Category image management
  uploadImage: (categoryId, formData) => 
    apiClient.postFormData(`/admin/categories/${categoryId}/upload-image`, formData),
  deleteImage: (categoryId) => 
    apiClient.delete(`/admin/categories/${categoryId}/delete-image`),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => apiClient.post('/orders', orderData),
  getAll: (params = {}) => apiClient.get('/orders', params),
  getById: (id) => apiClient.get(`/orders/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/orders/${id}/status`, { status }),
  getStats: () => apiClient.get('/orders/stats/overview'),
};

// Contact API
export const contactAPI = {
  send: (messageData) => apiClient.post('/contact', messageData),
  getAll: (params = {}) => apiClient.get('/contact', params),
  getById: (id) => apiClient.get(`/contact/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/contact/${id}/status`, { status }),
  delete: (id) => apiClient.delete(`/contact/${id}`),
  getStats: () => apiClient.get('/contact/stats/overview'),
};

// Properties API (New System)
export const propertiesAPI = {
  // Get all properties
  getAll: () => apiClient.get('/admin/properties'),
  
  // Get properties for a specific category
  getByCategoryId: (categoryId) => apiClient.get(`/admin/categories/${categoryId}/properties`),
  getCategoryProperties: (categoryId) => apiClient.get(`/categories/${categoryId}/properties`),
  
  // Get values for a specific property
  getPropertyValues: (propertyId) => {
    if (propertyId) {
      return apiClient.get(`/properties/${propertyId}/values`);
    } else {
      // Get all property values for admin management
      return apiClient.get('/admin/property-values');
    }
  },
  
  // Admin: Manage properties
  create: (propertyData) => {
    if (!propertyData.category_id) {
      throw new Error('category_id is required to create a property');
    }
    return apiClient.post(`/admin/categories/${propertyData.category_id}/properties`, propertyData);
  },
  update: (propertyId, propertyData) => apiClient.put(`/admin/properties/${propertyId}`, propertyData),
  delete: (propertyId) => apiClient.delete(`/admin/properties/${propertyId}`),
  
  // Legacy methods for backward compatibility
  createProperty: (categoryId, propertyData) => apiClient.post(`/admin/categories/${categoryId}/properties`, propertyData),
  updateProperty: (propertyId, propertyData) => apiClient.put(`/admin/properties/${propertyId}`, propertyData),
  deleteProperty: (propertyId) => apiClient.delete(`/admin/properties/${propertyId}`),
  
  // Admin: Manage property values
  createPropertyValue: (propertyId, valueData) => apiClient.post(`/admin/properties/${propertyId}/values`, valueData),
  updatePropertyValue: (valueId, valueData) => apiClient.put(`/admin/property-values/${valueId}`, valueData),
  deletePropertyValue: (valueId) => apiClient.delete(`/admin/property-values/${valueId}`),
  
  // Update product counts
  updateProductCounts: () => apiClient.post('/admin/properties/update-counts'),
};

// Solutions API
export const solutionsAPI = {
  getAll: (params = {}) => apiClient.get('/solutions', params),
  getById: (id) => apiClient.get(`/solutions/${id}`),
  create: (solutionData) => apiClient.post('/admin/solutions', solutionData),
  update: (id, solutionData) => apiClient.put(`/admin/solutions/${id}`, solutionData),
  delete: (id) => apiClient.delete(`/admin/solutions/${id}`),
  getAdminAll: (params = {}) => apiClient.get('/admin/solutions', params),
  
  // Get available products for solutions
  getAvailableProducts: () => apiClient.get('/admin/solutions/available-products'),
  
  // Attach products to solution
  attachProducts: (solutionId, productIds) => 
    apiClient.post(`/admin/solutions/${solutionId}/products`, { product_ids: productIds }),
  
  // Remove products from solution
  detachProducts: (solutionId, productIds) => 
    apiClient.delete(`/admin/solutions/${solutionId}/products`, { product_ids: productIds }),
  
  // Image upload functionality
  uploadImage: (imageFile, type = 'gallery') => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('type', type);
    console.log('🔧 solutionsAPI.uploadImage called');
    console.log('🔧 Image file:', imageFile.name);
    console.log('🔧 Type:', type);
    return apiClient.postFormData('/admin/solutions/upload-image', formData);
  },
};

// Product Properties API
export const productPropertiesAPI = {
  // Get properties for a product
  getProductProperties: (productId) => apiClient.get(`/products/${productId}/properties`),
  
  // Attach properties to a product
  attachProperties: (productId, propertyValues) => 
    apiClient.post(`/products/${productId}/properties`, { property_values: propertyValues }),
  
  // Get category properties for product creation/editing
  getCategoryPropertiesForProduct: (categoryId) => 
    apiClient.get(`/categories/${categoryId}/properties-for-product`),
};

// Product Files API (Unified System)
export const productFilesAPI = {
  // Admin Methods - Get all files
  getAll: () => apiClient.get('/admin/product-files'),
  
  // Admin Methods - Get files for a specific product
  getByProductId: (productId) => apiClient.get(`/admin/products/${productId}/files`),
  
  // Admin Methods - Upload a new file
  upload: (fileData, onProgress) => {
    console.log('🔧 productFilesAPI.upload called');
    console.log('🔧 FormData entries:', Array.from(fileData.entries()).map(([key, value]) => [key, value instanceof File ? `File(${value.name})` : value]));
    
    // Use postFormData without extra options since it doesn't support onUploadProgress
    return apiClient.postFormData('/admin/product-files', fileData);
  },
  
  // Admin Methods - Update file information
  update: (fileId, fileData) => apiClient.put(`/admin/product-files/${fileId}`, fileData),
  
  // Admin Methods - Delete a file
  delete: (fileId) => apiClient.delete(`/admin/product-files/${fileId}`),
  
  // Admin Methods - Download a file
  download: (fileId) => apiClient.get(`/admin/product-files/${fileId}/download`, {}, {
    responseType: 'blob'
  }),
  
  // Admin Methods - Get file stats
  getStats: () => apiClient.get('/admin/product-files/stats'),
  
  // Public Methods - Get files for a product (for frontend display)
  getProductFiles: (productId) => apiClient.get(`/products/${productId}/files`),
  
  // Legacy Methods - Upload a file for a product (backward compatibility)
  uploadFile: (productId, fileData) => {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('display_name', fileData.display_name);
    if (fileData.description) formData.append('description', fileData.description);
    if (fileData.file_category) formData.append('file_category', fileData.file_category);
    if (fileData.is_featured) formData.append('is_featured', fileData.is_featured);
    
    return apiClient.postFormData(`/products/${productId}/files`, formData);
  },
  
  // Legacy Methods - Update file information (backward compatibility)
  updateFile: (productId, fileId, fileData) => 
    apiClient.put(`/products/${productId}/files/${fileId}`, fileData),
  
  // Legacy Methods - Delete a file (backward compatibility)
  deleteFile: (productId, fileId) => apiClient.delete(`/products/${productId}/files/${fileId}`),
  
  // Legacy Methods - Get download URL for a file (backward compatibility)
  getDownloadUrl: (productId, fileId) => 
    `${API_BASE_URL}/products/${productId}/files/${fileId}/download`,
};

// Legacy Filters API (for backward compatibility)
export const filtersAPI = {
  getAll: () => apiClient.get('/filters'),
  filterProducts: (filters) => apiClient.post('/filters/products', filters),
  getFilterStats: (filters) => apiClient.post('/filters/stats', filters),
  associateProductFilters: (productId, filterOptions) => 
    apiClient.post(`/products/${productId}/filters`, { filter_options: filterOptions }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getContentAnalytics: () => apiClient.get('/dashboard/content-analytics'),
  getChartsData: () => apiClient.get('/dashboard/charts-data'),
};

// Certifications API
export const certificationsAPI = {
  // جلب جميع الشهادات (public - النشطة فقط)
  getAll: () => apiClient.get('/certifications'),
  
  // جلب جميع الشهادات للادمن (تشمل غير النشطة)
  getAllForAdmin: () => apiClient.get('/admin/certifications'),
  
  // جلب شهادة محددة
  getById: (id) => apiClient.get(`/certifications/${id}`),
  
  // جلب شهادات منتج معين
  getProductCertifications: (productId) => apiClient.get(`/products/${productId}/certifications`),
  
  // إدارة الشهادات (محمية - تحتاج authentication)
  admin: {
    // إنشاء شهادة جديدة
    create: (certificationData) => apiClient.post('/admin/certifications', certificationData),
    
    // تحديث شهادة
    update: (id, certificationData) => apiClient.put(`/admin/certifications/${id}`, certificationData),
    
    // حذف شهادة
    delete: (id) => apiClient.delete(`/admin/certifications/${id}`),
    
    // رفع صورة للشهادة
    uploadImage: (imageFile) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      return apiClient.postFormData('/admin/certifications/upload-image', formData);
    },
    
    // ربط شهادة بمنتج
    attachToProduct: (productId, certificationId) => 
      apiClient.post(`/admin/products/${productId}/certifications`, { certification_id: certificationId }),
    
    // إلغاء ربط شهادة من منتج
    detachFromProduct: (productId, certificationId) => 
      apiClient.delete(`/admin/products/${productId}/certifications/${certificationId}`),
  }
};

// Product Images API
export const productImagesAPI = {
  // جلب صور المنتج (public)
  getProductImages: (productId) => apiClient.get(`/products/${productId}/images`),
  
  // إدارة صور المنتج (محمية - تحتاج authentication)
  admin: {
    // جلب صور المنتج للادمن
    getProductImages: (productId) => apiClient.get(`/admin/products/${productId}/images`),
    
    // رفع صور متعددة
    uploadImages: (productId, formData) => 
      apiClient.postFormData(`/admin/products/${productId}/images`, formData),
    
    // تحديث صورة
    updateImage: (productId, imageId, imageData) => 
      apiClient.put(`/admin/products/${productId}/images/${imageId}`, imageData),
    
    // حذف صورة
    deleteImage: (productId, imageId) => 
      apiClient.delete(`/admin/products/${productId}/images/${imageId}`),
    
    // تعيين صورة أساسية
    setPrimaryImage: (productId, imageId) => 
      apiClient.post(`/admin/products/${productId}/images/${imageId}/set-primary`),
  }
};

// Materials API
export const materialsAPI = {
  // Public routes
  getCategories: () => apiClient.get('/materials/categories'),
  getCategory: (categoryId) => apiClient.get(`/materials/categories/${categoryId}`),
  getGroups: (categoryId = null) => {
    const params = categoryId ? `?category_id=${categoryId}` : '';
    return apiClient.get(`/materials/groups${params}`);
  },
  getGroup: (groupId) => apiClient.get(`/materials/groups/${groupId}`),
  getMaterials: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.group_id) params.append('group_id', filters.group_id);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.display_type) params.append('display_type', filters.display_type);
    
    const queryString = params.toString();
    return apiClient.get(`/materials${queryString ? '?' + queryString : ''}`);
  },
  getMaterial: (materialId) => apiClient.get(`/materials/${materialId}`),
  getProductMaterials: (productId) => apiClient.get(`/products/${productId}/materials`),

  // Admin routes
  admin: {
    // Categories
    getCategories: () => apiClient.get('/admin/materials/categories'),
    createCategory: (categoryData) => apiClient.post('/admin/materials/categories', categoryData),
    updateCategory: (categoryId, categoryData) => apiClient.put(`/admin/materials/categories/${categoryId}`, categoryData),
    deleteCategory: (categoryId) => apiClient.delete(`/admin/materials/categories/${categoryId}`),

    // Groups
    getGroups: () => apiClient.get('/admin/materials/groups'),
    createGroup: (groupData) => apiClient.post('/admin/materials/groups', groupData),
    updateGroup: (groupId, groupData) => apiClient.put(`/admin/materials/groups/${groupId}`, groupData),
    deleteGroup: (groupId) => apiClient.delete(`/admin/materials/groups/${groupId}`),

    // Materials
    getMaterials: () => apiClient.get('/admin/materials'),
    createMaterial: (materialData) => apiClient.post('/admin/materials', materialData),
    updateMaterial: (materialId, materialData) => apiClient.put(`/admin/materials/${materialId}`, materialData),
    deleteMaterial: (materialId) => apiClient.delete(`/admin/materials/${materialId}`),
    uploadMaterialImage: (formData) => apiClient.postFormData('/admin/materials/upload-image', formData),

    // Product Materials
    getProductMaterials: (productId) => apiClient.get(`/admin/products/${productId}/materials`),
    assignMaterialToProduct: (productId, materialData) => apiClient.post(`/admin/products/${productId}/materials`, materialData),
    updateProductMaterial: (productId, materialId, data) => apiClient.put(`/admin/products/${productId}/materials/${materialId}`, data),
    removeMaterialFromProduct: (productId, materialId) => apiClient.delete(`/admin/products/${productId}/materials/${materialId}`),
    reorderProductMaterials: (productId, materialIds) => apiClient.post(`/admin/products/${productId}/materials/reorder`, { material_ids: materialIds }),
    setDefaultMaterial: (productId, materialId) => apiClient.post(`/admin/products/${productId}/materials/${materialId}/set-default`),
  }
};

export default apiClient;