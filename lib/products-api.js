import ApiClient from './api';

class ProductsAPI {
  constructor() {
    this.api = new ApiClient();
  }

  /**
   * Get all products (public endpoint)
   * @param {Object} filters - Filter options
   * @param {string} filters.search - Search query
   * @param {string} filters.category - Category name filter
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise<Object>} API response with products and pagination
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    return await this.api.request(url, {
      method: 'GET'
    });
  }

  /**
   * Get single product by ID
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} API response with product data
   */
  async getById(productId) {
    return await this.api.request(`/products/${productId}`, {
      method: 'GET'
    });
  }

  /**
   * Get products by category
   * @param {string} categoryName - Category name
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response with products
   */
  async getByCategory(categoryName, options = {}) {
    return await this.getAll({
      category: categoryName,
      ...options
    });
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} options - Additional search options
   * @returns {Promise<Object>} API response with matching products
   */
  async search(query, options = {}) {
    return await this.getAll({
      search: query,
      ...options
    });
  }

  /**
   * Get products with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} API response with paginated products
   */
  async getPaginated(page = 1, limit = 12, filters = {}) {
    return await this.getAll({
      page,
      limit,
      ...filters
    });
  }

  // Admin endpoints (require authentication)
  
  /**
   * Get all products for admin (includes inactive products)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} API response with all products
   */
  async getAdminAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    const url = queryString ? `/admin/products?${queryString}` : '/admin/products';
    
    return await this.api.request(url, {
      method: 'GET'
    });
  }

  /**
   * Create new product (admin only)
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} API response with created product
   */
  async create(productData) {
    return await this.api.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  /**
   * Update product (admin only)
   * @param {number} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} API response with updated product
   */
  async update(productId, productData) {
    return await this.api.request(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  /**
   * Delete product (admin only)
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} API response
   */
  async delete(productId) {
    return await this.api.request(`/admin/products/${productId}`, {
      method: 'DELETE'
    });
  }
}

export default ProductsAPI;