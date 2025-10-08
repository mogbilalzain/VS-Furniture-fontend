'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { authStorage } from '../../../lib/localStorage-utils';
import { executeWithAuthRetry } from '../../../lib/auth-utils';
import { productsAPI, categoriesAPI } from '../../../lib/api';
import ProductModalNew from '../../../components/admin/ProductModalNew';
import ProductCertificationsManager from '../../../components/admin/ProductCertificationsManager';
import ProductImagesManager from '../../../components/admin/ProductImagesManager';
import ProductMaterialsManager from '../../../components/admin/ProductMaterialsManager';

export default function AdminProducts() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // State for products data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // State for certifications modal
  const [showCertificationsModal, setShowCertificationsModal] = useState(false);
  const [selectedProductForCertifications, setSelectedProductForCertifications] = useState(null);

  // State for images modal
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedProductForImages, setSelectedProductForImages] = useState(null);
  
  // State for materials modal
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedProductForMaterials, setSelectedProductForMaterials] = useState(null);


  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Authentication check
  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Products page - Not authenticated admin, redirecting...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Products page - User is authenticated admin');
    }
  }, [router]);
  const [totalProducts, setTotalProducts] = useState(0);

  // Handle manage certifications
  const handleManageCertifications = (product) => {
    setSelectedProductForCertifications(product);
    setShowCertificationsModal(true);
  };

  const handleCloseCertificationsModal = () => {
    setShowCertificationsModal(false);
    setSelectedProductForCertifications(null);
  };

  // Handle manage images
  const handleManageImages = (product) => {
    setSelectedProductForImages(product);
    setShowImagesModal(true);
  };

  const handleCloseImagesModal = () => {
    setShowImagesModal(false);
    setSelectedProductForImages(null);
  };

  // Handle manage materials
  const handleManageMaterials = (product) => {
    setSelectedProductForMaterials(product);
    setShowMaterialsModal(true);
  };

  const handleCloseMaterialsModal = () => {
    setShowMaterialsModal(false);
    setSelectedProductForMaterials(null);
  };

  // Load products and categories
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {
        page: currentPage,
        limit: 10
      };

      if (searchQuery.trim()) filters.search = searchQuery;
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedStatus) filters.status = selectedStatus;

      const response = await productsAPI.getAdminAll(filters);

      if (response.success) {
        setProducts(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
          setTotalProducts(response.pagination.total);
        }
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadProducts();
    }
  }, [isAuthenticated, user, currentPage, searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadCategories();
    }
  }, [isAuthenticated, user]);

  // Handle add product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Handle save product (add or edit)
  const handleSaveProduct = async (productData) => {
    try {
      setLoading(true);
      setError('');

      console.log('🔄 Starting product save...');
      console.log('📄 Product data:', productData);
      console.log('✏️ Selected product:', selectedProduct);

      // التحقق من authentication قبل العملية مع debugging مفصل
      const token = authStorage.getToken();
      const role = authStorage.getRole();
      const isAuth = authStorage.isAuthenticated();
      const isAdmin = authStorage.isAdmin();
      const isAdminAuth = authStorage.isAuthenticatedAdmin();
      
      console.log('🔐 Detailed Auth Check:');
      console.log('  - Token exists:', !!token);
      console.log('  - Token preview:', token ? token.substring(0, 30) + '...' : 'null');
      console.log('  - Role from storage:', role);
      console.log('  - isAuthenticated():', isAuth);
      console.log('  - isAdmin():', isAdmin);
      console.log('  - isAuthenticatedAdmin():', isAdminAuth);
      console.log('  - User from context:', user);

      if (!token) {
        console.error('❌ No auth token found');
        throw new Error('No authentication token found. Please login again.');
      }
      
      if (!isAdminAuth) {
        console.error('❌ Not authenticated as admin');
        console.error('  - Role should be "admin", got:', role);
        throw new Error('Admin authentication required. Please login as admin.');
      }

      // Prepare data for API
      console.log('🔍 Checking for image file in productData:', !!productData.imageFile);
      
      let apiData;
      let useFormData = false;
      
      if (productData.imageFile) {
        // Use FormData for file upload
        console.log('📸 Creating FormData for file upload');
        useFormData = true;
        apiData = new FormData();
        
        // Add all fields to FormData
        apiData.append('name', productData.name || '');
        apiData.append('description', productData.description || '');
        apiData.append('short_description', productData.short_description || '');
        
        // Handle specifications - stringify if it's an object
        if (productData.specifications) {
          if (typeof productData.specifications === 'object') {
            apiData.append('specifications', JSON.stringify(productData.specifications));
          } else {
            apiData.append('specifications', productData.specifications);
          }
        }
        
        apiData.append('model', productData.model || '');
        apiData.append('category_id', productData.category_id || '');
        apiData.append('status', productData.status || 'active');
        apiData.append('is_featured', productData.is_featured ? '1' : '0');
        apiData.append('sort_order', productData.sort_order || '0');
        
        // Add the image file
        apiData.append('image', productData.imageFile);
        
        console.log('📄 FormData entries:');
        for (let [key, value] of apiData.entries()) {
          console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
        }
      } else {
        // Use regular JSON for URL or no image
        console.log('🔗 Using JSON data (no file upload)');
        apiData = {
          name: productData.name,
          description: productData.description,
          short_description: productData.short_description,
          specifications: productData.specifications,
          model: productData.model,
          category_id: productData.category_id,
          image: productData.image,
          status: productData.status,
          is_featured: productData.is_featured,
          sort_order: productData.sort_order
        };
      }

      // Make API call directly with proper logging
      let response;
      if (selectedProduct) {
        // Update existing product
        console.log('📝 Updating existing product...');
        console.log('🔑 Auth check before update - Token:', !!authStorage.getToken());
        response = await productsAPI.update(selectedProduct.id, apiData);
      } else {
        // Create new product
        console.log('➕ Creating new product...');
        console.log('🔑 Auth check before create - Token:', !!authStorage.getToken());
        console.log('🔑 API Data type:', apiData instanceof FormData ? 'FormData' : 'JSON');
        response = await productsAPI.create(apiData);
      }

      console.log('📥 API Response:', response);

      if (response.success) {
        const productId = response.data?.id || selectedProduct?.id;
        
        // Save property values if any
        if (productData.property_values && Object.keys(productData.property_values).length > 0) {
          console.log('🔗 Saving property values...');
          try {
            // Flatten property values for API
            const propertyValueIds = [];
            Object.values(productData.property_values).forEach(valueIds => {
              propertyValueIds.push(...valueIds);
            });
            
            if (propertyValueIds.length > 0) {
              await productsAPI.updateProperties(productId, { property_value_ids: propertyValueIds });
              console.log('✅ Property values saved successfully');
            }
          } catch (propertyError) {
            console.error('❌ Error saving property values:', propertyError);
            // Don't fail the entire operation for property errors
          }
        }

        await loadProducts();
        setShowModal(false);
        setSelectedProduct(null);
        
        const successMessage = selectedProduct 
          ? '✅ Product updated successfully!' 
          : '🎉 Product created successfully!';
        alert(successMessage);
      } else {
        // Handle validation errors
        if (response.errors) {
          console.error('Validation errors:', response.errors);
          const errorMessages = Object.values(response.errors).flat().join(', ');
          setError(`Validation errors: ${errorMessages}`);
        } else {
          setError(response.message || 'Failed to save product');
        }
      }
    } catch (err) {
      console.error('Product save error:', err);
      setError(err.message || 'Failed to save product. An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (product) => {
    if (!confirm(`⚠️ Are you sure you want to delete the product "${product.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);

      // التحقق من authentication قبل العملية
      const token = authStorage.getToken();
      const isAdminAuth = authStorage.isAuthenticatedAdmin();
      console.log('🔐 Delete Auth check - Token exists:', !!token);
      console.log('🔐 Delete Auth check - Is admin:', isAdminAuth);

      if (!token || !isAdminAuth) {
        alert('Authentication required. Please login again.');
        router.push('/admin/login');
        return;
      }

      const response = await productsAPI.delete(product.id);
      
      if (response.success) {
        await loadProducts();
        alert('🗑️ Product deleted successfully!');
      } else {
        setError(response.message || 'Failed to delete product');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  // Authentication check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products" style={{ fontFamily: 'Quasimoda, Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
    <div>
          <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, model, or description..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="min-w-32">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadProducts}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Search
            </button>
            {(searchQuery || selectedCategory || selectedStatus) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedStatus('');
                  setCurrentPage(1);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="text-red-600">⚠️ {error}</div>
          </div>
        </div>
      )}

      {/* Products Table */}
      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">📦 No products found</div>
            <p className="text-gray-400 mb-4">
              {searchQuery || selectedCategory || selectedStatus 
                ? 'No products match your search criteria.' 
                : 'No products have been created yet.'
              }
            </p>
          <button 
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add First Product
          </button>
          </div>
        ) : (
          <>
            {/* Products Count & View Toggle */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-sm text-gray-700 font-medium">
                  {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'} Found
                  {(searchQuery || selectedCategory || selectedStatus) && (
                    <button 
                      onClick={() => {/* Clear filters logic */}}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-xs text-gray-500">View:</span>
                  <button
                    onClick={() => {/* Toggle view logic */}}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Grid View"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    className="p-1 text-blue-600"
                    title="Table View"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
            {/* Table Header */}
              <div className="bg-gray-50 sticky top-0 z-10">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  <div className="col-span-3 flex items-center">
                    Product
                    <svg className="ml-1 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Properties</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Created</div>
                  <div className="col-span-2 text-center">Actions</div>
              </div>
        </div>
        
            {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {products.map((product, index) => (
                  <div key={product.id} className={`px-6 py-4 hover:bg-blue-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Product Info */}
                    <div className="col-span-3">
                        <div className="flex items-center group">
                          <div className="relative flex-shrink-0">
                          <img
                              className="h-14 w-14 object-cover rounded-xl border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-200 shadow-sm"
                            src={product.image_url || product.image || "/products/product-tbale-1.jpg"}
                      alt={product.name}
                            onError={(e) => {
                              e.target.src = "/products/product-tbale-1.jpg";
                            }}
                          />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                              {product.name}
                        </div>
                          {product.model && (
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="inline-flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  {product.model}
                                </span>
                              </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {product.category_name}
                      </span>
                    </div>

                    {/* Properties */}
                    <div className="col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {product.property_values && product.property_values.length > 0 ? (
                            <>
                              {product.property_values.slice(0, 2).map((value, index) => (
                            <span
                              key={index}
                                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                            >
                              {value.display_name}
                            </span>
                              ))}
                              {product.property_values.length > 2 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-300 text-gray-600">
                                  +{product.property_values.length - 2}
                          </span>
                        )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No properties</span>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${product.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'active' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {product.status}
                    </span>
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="col-span-2">
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">
                            {new Date(product.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(product.created_at).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <div className="flex flex-wrap gap-1">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleManageCertifications(product)}
                            className="text-green-600 hover:text-green-900 text-xs font-medium"
                          >
                            Cert
                          </button>
                          <button 
                            onClick={() => handleManageImages(product)}
                            className="text-purple-600 hover:text-purple-900 text-xs font-medium"
                          >
                            Images
                          </button>
                          <button 
                            onClick={() => handleManageMaterials(product)}
                            className="text-orange-600 hover:text-orange-900 text-xs font-medium"
                          >
                            Materials
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 hover:text-red-900 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="block lg:hidden">
              <div className="divide-y divide-gray-100">
                {products.map((product, index) => (
                  <div key={product.id} className="p-4 hover:bg-blue-50 transition-all duration-200">
                    {/* Product Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="relative flex-shrink-0">
                        <img
                          className="h-20 w-20 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                          src={product.image_url || product.image || "/products/product-tbale-1.jpg"}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = "/products/product-tbale-1.jpg";
                          }}
                        />
                        <div className={`absolute -top-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                          product.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-semibold text-gray-900 mb-1 leading-tight">
                          {product.name}
                        </div>
                        {product.model && (
                          <div className="text-sm text-gray-500 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Model: {product.model}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            {product.category_name}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Properties */}
                    {product.property_values && product.property_values.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Properties
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {product.property_values.slice(0, 6).map((value, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {value.display_name}
                            </span>
                          ))}
                          {product.property_values.length > 6 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-300 text-gray-600">
                              +{product.property_values.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        <div className="font-medium text-gray-600">
                          {new Date(product.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs">
                          {new Date(product.created_at).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                      <button 
                          onClick={() => handleEditProduct(product)}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                      </button>
                      <button 
                          onClick={() => handleManageCertifications(product)}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          Certificates
                      </button>
                      <button 
                          onClick={() => handleManageImages(product)}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Images
                      </button>
                      <button 
                          onClick={() => handleManageMaterials(product)}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          Materials
                      </button>
                      <button 
                          onClick={() => handleDeleteProduct(product)}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                      </button>
                    </div>
                    </div>
                  </div>
                ))}
                </div>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-700 font-medium text-center sm:text-left">
                    <span className="text-gray-900 font-semibold">
                      {((currentPage - 1) * 10) + 1}
                    </span>
                    {' '}-{' '}
                    <span className="text-gray-900 font-semibold">
                      {Math.min(currentPage * 10, totalProducts)}
                    </span>
                    {' '}of{' '}
                    <span className="text-gray-900 font-semibold">
                      {totalProducts}
                    </span>
                    {' '}products
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="First Page"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                        if (page > totalPages) return null;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              currentPage === page
                                ? 'bg-blue-600 text-white font-semibold shadow-lg'
                                : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Last Page"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
        </div>
      </div>
    </div>
            )}
          </>
        )}
      </div>
     

      {/* Product Modal */}
      <ProductModalNew
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        categories={categories}
        loading={loading}
      />

      {/* Product Certifications Modal */}
      {showCertificationsModal && selectedProductForCertifications && (
        <ProductCertificationsManager
          productId={selectedProductForCertifications.id}
          productName={selectedProductForCertifications.name}
          onClose={handleCloseCertificationsModal}
        />
      )}

      {/* Product Images Modal */}
      {showImagesModal && selectedProductForImages && (
        <ProductImagesManager
          productId={selectedProductForImages.id}
          onClose={handleCloseImagesModal}
        />
      )}

      {/* Product Materials Modal */}
      {showMaterialsModal && selectedProductForMaterials && (
        <ProductMaterialsManager
          productId={selectedProductForMaterials.id}
          onClose={handleCloseMaterialsModal}
        />
      )}
    </div>
  );
}