'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { authStorage } from '../../../lib/localStorage-utils';
import { productsAPI, categoriesAPI } from '../../../lib/api';
import ProductModalNew from '../../../components/admin/ProductModalNew';
import ProductCertificationsManager from '../../../components/admin/ProductCertificationsManager';
import ProductImagesManager from '../../../components/admin/ProductImagesManager';
import ProductMaterialsManager from '../../../components/admin/ProductMaterialsManager';
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  PageHeader,
  EmptyState,
  StatCard,
} from '../../../components/admin/ui';

export default function AdminProducts() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showCertificationsModal, setShowCertificationsModal] = useState(false);
  const [selectedProductForCertifications, setSelectedProductForCertifications] = useState(null);

  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedProductForImages, setSelectedProductForImages] = useState(null);

  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedProductForMaterials, setSelectedProductForMaterials] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      router.replace('/admin/login');
    }
  }, [router]);

  const handleManageCertifications = (product) => {
    setSelectedProductForCertifications(product);
    setShowCertificationsModal(true);
  };
  const handleCloseCertificationsModal = () => {
    setShowCertificationsModal(false);
    setSelectedProductForCertifications(null);
  };

  const handleManageImages = (product) => {
    setSelectedProductForImages(product);
    setShowImagesModal(true);
  };
  const handleCloseImagesModal = () => {
    setShowImagesModal(false);
    setSelectedProductForImages(null);
  };

  const handleManageMaterials = (product) => {
    setSelectedProductForMaterials(product);
    setShowMaterialsModal(true);
  };
  const handleCloseMaterialsModal = () => {
    setShowMaterialsModal(false);
    setSelectedProductForMaterials(null);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {
        page: currentPage,
        limit: 10,
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

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      setLoading(true);
      setError('');

      const token = authStorage.getToken();
      const isAdminAuth = authStorage.isAuthenticatedAdmin();

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      if (!isAdminAuth) {
        throw new Error('Admin authentication required. Please login as admin.');
      }

      let apiData;
      if (productData.imageFile) {
        apiData = new FormData();
        apiData.append('name', productData.name || '');
        apiData.append('description', productData.description || '');
        apiData.append('short_description', productData.short_description || '');
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
        apiData.append('image', productData.imageFile);
      } else {
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
          sort_order: productData.sort_order,
        };
      }

      let response;
      if (selectedProduct) {
        response = await productsAPI.update(selectedProduct.id, apiData);
      } else {
        response = await productsAPI.create(apiData);
      }

      if (response.success) {
        const productId = response.data?.id || selectedProduct?.id;

        if (productData.property_values && Object.keys(productData.property_values).length > 0) {
          try {
            const propertyValueIds = [];
            Object.values(productData.property_values).forEach((valueIds) => {
              propertyValueIds.push(...valueIds);
            });

            if (propertyValueIds.length > 0) {
              await productsAPI.updateProperties(productId, { property_values: propertyValueIds });
            }
          } catch (propertyError) {
            console.error('Error saving property values:', propertyError);
          }
        }

        await loadProducts();
        setShowModal(false);
        setSelectedProduct(null);
        setError('');

        const msg = selectedProduct ? 'تم تحديث المنتج بنجاح' : 'تم إنشاء المنتج بنجاح';
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 4000);
        return true;
      } else {
        if (response.errors) {
          const lines = Object.values(response.errors).flat().join('\n');
          setError(`أخطاء في التحقق:\n${lines}`);
        } else {
          setError(response.message || 'فشل حفظ المنتج');
        }
        return false;
      }
    } catch (err) {
      console.error('Product save error:', err);
      setError(err.message || 'Failed to save product. An unexpected error occurred.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!confirm(`⚠️ Are you sure you want to delete the product "${product.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const token = authStorage.getToken();
      const isAdminAuth = authStorage.isAuthenticatedAdmin();

      if (!token || !isAdminAuth) {
        alert('Authentication required. Please login again.');
        router.push('/admin/login');
        return;
      }

      const response = await productsAPI.delete(product.id);

      if (response.success) {
        await loadProducts();
        setSuccessMessage('🗑️ Product deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setError(response.message || 'Failed to delete product');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <EmptyState
        icon="lock"
        title="Access Denied"
        description="You need admin privileges to access this page."
      />
    );
  }

  const activeCount = products.filter((p) => p.status === 'active').length;
  const inactiveCount = products.filter((p) => p.status !== 'active').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Products"
        description="Manage your enterprise inventory and global product listings."
        actions={
          <>
            <AdminButton variant="secondary" icon="file_download" size="lg">
              Export CSV
            </AdminButton>
            <AdminButton
              variant="primary"
              icon="add"
              size="lg"
              onClick={handleAddProduct}
            >
              New Product
            </AdminButton>
          </>
        }
      />

      {/* Stats row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard
          icon="inventory_2"
          label="Total Products"
          value={totalProducts.toString()}
          change="+12%"
          changeType="positive"
        />
        <StatCard
          icon="check_circle"
          label="Active Listings"
          value={activeCount.toString()}
          change="Operational"
          changeType="positive"
        />
        <StatCard
          icon="pause_circle"
          label="Inactive"
          value={inactiveCount.toString()}
          change="Stable"
          changeType="neutral"
        />
        <StatCard
          icon="category"
          label="Categories"
          value={categories.length.toString()}
          change="Live"
          changeType="positive"
        />
      </section>

      {/* Filters */}
      <AdminCard padding="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-2">
            <AdminInput
              label="Search products"
              icon="search"
              placeholder="Name, model, or description…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AdminSelect
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </AdminSelect>
          <AdminSelect
            label="Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </AdminSelect>
        </div>
        {(searchQuery || selectedCategory || selectedStatus) && (
          <div className="mt-4 flex justify-end">
            <AdminButton variant="ghost" size="sm" icon="close" onClick={clearFilters}>
              Clear filters
            </AdminButton>
          </div>
        )}
      </AdminCard>

      {/* Success */}
      {successMessage && (
        <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-primary-container/30 border border-primary-container/40 text-on-primary-fixed">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-on-primary-fixed/70 hover:text-on-primary-fixed"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start justify-between gap-4 px-5 py-3 rounded-2xl bg-error-container border border-error/30 text-on-error-container">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5">error</span>
            <div className="whitespace-pre-line font-medium">{error}</div>
          </div>
          <button
            onClick={() => setError('')}
            className="text-on-error-container/70 hover:text-on-error-container flex-shrink-0"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Products table */}
      {loading ? (
        <AdminCard className="text-center" padding="p-10">
          <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading products…</p>
        </AdminCard>
      ) : products.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="No products found"
          description={
            searchQuery || selectedCategory || selectedStatus
              ? 'No products match your search criteria. Try adjusting your filters.'
              : 'No products have been created yet. Start by adding your first product.'
          }
          action={
            <AdminButton variant="primary" icon="add" onClick={handleAddProduct}>
              Add First Product
            </AdminButton>
          }
        />
      ) : (
        <AdminCard padding="p-0" className="overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Product</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Properties</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Created</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/20 flex-shrink-0">
                          <img
                            className="w-full h-full object-cover"
                            src={product.image_url || product.image || '/products/product-tbale-1.jpg'}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = '/products/product-tbale-1.jpg';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-on-surface font-bold text-[14px] truncate">{product.name}</p>
                          {product.model && (
                            <p className="text-[12px] text-on-surface-variant/60 font-medium truncate">
                              Model: <span className="font-mono">{product.model}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge tone="info">{product.category_name}</AdminBadge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {product.property_values && product.property_values.length > 0 ? (
                          <>
                            {product.property_values.slice(0, 2).map((value, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-surface-container text-on-surface-variant"
                              >
                                {value.display_name}
                              </span>
                            ))}
                            {product.property_values.length > 2 && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-surface-container-high text-on-surface-variant">
                                +{product.property_values.length - 2}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[12px] text-on-surface-variant/40 italic">No properties</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge
                        tone={product.status === 'active' ? 'active' : 'error'}
                        dot
                      >
                        {product.status}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[13px]">
                        <p className="text-on-surface font-medium">
                          {new Date(product.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-[11px] text-on-surface-variant/60">
                          {new Date(product.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                          className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleManageCertifications(product)}
                          title="Certifications"
                          className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                        </button>
                        <button
                          onClick={() => handleManageImages(product)}
                          title="Images"
                          className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">image</span>
                        </button>
                        <button
                          onClick={() => handleManageMaterials(product)}
                          title="Materials"
                          className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">palette</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          title="Delete"
                          className="w-9 h-9 rounded-lg hover:bg-error-container text-error flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="block lg:hidden divide-y divide-surface-container">
            {products.map((product) => (
              <div key={product.id} className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/20 flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={product.image_url || product.image || '/products/product-tbale-1.jpg'}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/products/product-tbale-1.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-[15px] truncate">{product.name}</p>
                    {product.model && (
                      <p className="text-[12px] text-on-surface-variant/60 mt-0.5 font-mono">{product.model}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <AdminBadge tone="info">{product.category_name}</AdminBadge>
                      <AdminBadge tone={product.status === 'active' ? 'active' : 'error'} dot>
                        {product.status}
                      </AdminBadge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-surface-container">
                  <AdminButton variant="secondary" size="sm" icon="edit" onClick={() => handleEditProduct(product)}>
                    Edit
                  </AdminButton>
                  <AdminButton variant="secondary" size="sm" icon="workspace_premium" onClick={() => handleManageCertifications(product)}>
                    Certs
                  </AdminButton>
                  <AdminButton variant="secondary" size="sm" icon="image" onClick={() => handleManageImages(product)}>
                    Images
                  </AdminButton>
                  <AdminButton variant="secondary" size="sm" icon="palette" onClick={() => handleManageMaterials(product)}>
                    Materials
                  </AdminButton>
                  <AdminButton variant="danger" size="sm" icon="delete" onClick={() => handleDeleteProduct(product)}>
                    Delete
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-surface-container">
              <p className="text-[13px] text-on-surface-variant/70 font-medium">
                Showing{' '}
                <span className="text-on-surface font-bold">
                  {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalProducts)}
                </span>{' '}
                of <span className="text-on-surface font-bold">{totalProducts}</span> products
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-outline-variant/60 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages || page < 1) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[13px] transition-colors ${
                        currentPage === page
                          ? 'bg-primary-container text-on-primary-fixed admin-shadow-md'
                          : 'border border-outline-variant/60 text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-outline-variant/60 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </AdminCard>
      )}

      {/* Modals */}
      <ProductModalNew
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        categories={categories}
        loading={loading}
      />

      {showCertificationsModal && selectedProductForCertifications && (
        <ProductCertificationsManager
          productId={selectedProductForCertifications.id}
          productName={selectedProductForCertifications.name}
          onClose={handleCloseCertificationsModal}
        />
      )}

      {showImagesModal && selectedProductForImages && (
        <ProductImagesManager
          productId={selectedProductForImages.id}
          onClose={handleCloseImagesModal}
        />
      )}

      {showMaterialsModal && selectedProductForMaterials && (
        <ProductMaterialsManager
          productId={selectedProductForMaterials.id}
          onClose={handleCloseMaterialsModal}
        />
      )}
    </div>
  );
}
