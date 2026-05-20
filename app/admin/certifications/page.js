'use client';

import React, { useState, useEffect } from 'react';
import { certificationsAPI, productsAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminInput,
  PageHeader,
  EmptyState,
  StatCard,
} from '../../../components/admin/ui';

const AdminCertifications = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [certifications, setCertifications] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [selectedCertificationForProducts, setSelectedCertificationForProducts] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCertifications();
      fetchProducts();
    }
  }, [user]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await certificationsAPI.getAll();
      if (response.success) {
        setCertifications(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCertification) {
        await certificationsAPI.admin.update(editingCertification.id, formData);
      } else {
        await certificationsAPI.admin.create(formData);
      }
      setShowModal(false);
      setEditingCertification(null);
      resetForm();
      fetchCertifications();
    } catch (err) {
      alert('Error saving certification: ' + err.message);
    }
  };

  const handleEdit = (certification) => {
    setEditingCertification(certification);
    setFormData({
      title: certification.title,
      description: certification.description,
      image_url: certification.image_url || '',
      is_active: certification.is_active,
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      try {
        await certificationsAPI.admin.delete(id);
        fetchCertifications();
      } catch (err) {
        alert('Error deleting certification: ' + err.message);
      }
    }
  };

  const handleManageProducts = async (certification) => {
    setSelectedCertificationForProducts(certification);
    try {
      const response = await certificationsAPI.getById(certification.id);
      if (response.success && response.data.products) {
        setSelectedProducts(response.data.products.map((p) => p.id));
      }
    } catch (err) {
      console.error('Error fetching certification products:', err);
      setSelectedProducts([]);
    }
    setShowProductModal(true);
  };

  const handleSaveProductAssignments = async () => {
    try {
      const certificationId = selectedCertificationForProducts.id;
      const currentResponse = await certificationsAPI.getById(certificationId);
      const currentProductIds =
        currentResponse.success && currentResponse.data.products
          ? currentResponse.data.products.map((p) => p.id)
          : [];

      const productsToAdd = selectedProducts.filter((id) => !currentProductIds.includes(id));
      const productsToRemove = currentProductIds.filter((id) => !selectedProducts.includes(id));

      for (const productId of productsToAdd) {
        await certificationsAPI.admin.attachToProduct(productId, certificationId);
      }
      for (const productId of productsToRemove) {
        await certificationsAPI.admin.detachFromProduct(productId, certificationId);
      }

      setShowProductModal(false);
      setSelectedCertificationForProducts(null);
      setSelectedProducts([]);
      alert('Product assignments updated successfully!');
    } catch (err) {
      alert('Error updating product assignments: ' + err.message);
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    try {
      setUploadingImage(true);
      const response = await certificationsAPI.admin.uploadImage(imageFile);
      if (response.success) {
        setFormData((prev) => ({ ...prev, image_url: response.data.image_url }));
        setImageFile(null);
        setImagePreview(response.data.full_url || response.data.image_url);
        alert('Image uploaded successfully!');
      } else {
        alert('Error uploading image: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: '' }));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', image_url: '', is_active: true });
    setEditingCertification(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadingImage(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
      </div>
    );
  }

  const activeCount = certifications.filter((c) => c.is_active).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Certifications"
        description="Manage product certifications and standards."
        actions={
          <AdminButton
            variant="primary"
            icon="add"
            size="lg"
            onClick={() => {
              setEditingCertification(null);
              resetForm();
              setShowModal(true);
            }}
          >
            Add Certification
          </AdminButton>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <StatCard
          icon="workspace_premium"
          label="Total Certifications"
          value={certifications.length.toString()}
          change="Catalog"
          changeType="neutral"
        />
        <StatCard
          icon="check_circle"
          label="Active"
          value={activeCount.toString()}
          change="Published"
          changeType="positive"
        />
        <StatCard
          icon="visibility_off"
          label="Inactive"
          value={(certifications.length - activeCount).toString()}
          change="Hidden"
          changeType="neutral"
        />
      </section>

      {error && (
        <div className="flex items-start justify-between gap-4 px-5 py-3 rounded-2xl bg-error-container border border-error/30 text-on-error-container">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5">error</span>
            <div>{error}</div>
          </div>
          <button onClick={() => setError(null)} className="text-on-error-container/70 hover:text-on-error-container">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {certifications.length === 0 ? (
        <EmptyState
          icon="workspace_premium"
          title="No certifications yet"
          description="Add your first certification to start associating it with products."
          action={
            <AdminButton
              variant="primary"
              icon="add"
              onClick={() => {
                setEditingCertification(null);
                resetForm();
                setShowModal(true);
              }}
            >
              Add Certification
            </AdminButton>
          }
        />
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {certifications.map((certification) => (
            <AdminCard key={certification.id} className="text-center group" padding="p-6">
              <div className="absolute right-5 top-5">
                <AdminBadge tone={certification.is_active ? 'active' : 'pending'} dot>
                  {certification.is_active ? 'Active' : 'Inactive'}
                </AdminBadge>
              </div>
              {certification.image_url && (
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-surface-container-low flex items-center justify-center overflow-hidden">
                  <img
                    src={certification.image_url}
                    alt={certification.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <h3 className="text-[17px] font-bold text-on-surface mb-2 tracking-tight">
                {certification.title}
              </h3>
              <p className="text-on-surface-variant text-[13px] line-clamp-3 mb-5">
                {certification.description}
              </p>
              <div className="flex justify-center gap-1 pt-4 border-t border-surface-container">
                <button
                  onClick={() => handleEdit(certification)}
                  title="Edit"
                  className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  onClick={() => handleManageProducts(certification)}
                  title="Manage products"
                  className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">link</span>
                </button>
                <button
                  onClick={() => handleDelete(certification.id)}
                  title="Delete"
                  className="w-9 h-9 rounded-lg hover:bg-error-container text-error flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </AdminCard>
          ))}
        </section>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AdminCard className="w-full max-w-md max-h-[90vh] overflow-y-auto" padding="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-headline-md font-bold text-on-surface">
                {editingCertification ? 'Edit Certification' : 'Add New Certification'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AdminInput
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-on-surface focus:ring-2 focus:ring-primary-container/40 transition-all resize-y"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Certification Image
                </label>

                {(formData.image_url || imagePreview) && (
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden flex items-center justify-center">
                      <img
                        src={imagePreview || formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-error text-on-error rounded-full w-7 h-7 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="certification-image-upload"
                />
                <div className="flex flex-wrap gap-2">
                  <label
                    htmlFor="certification-image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-[13px] font-bold cursor-pointer hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">image</span>
                    Choose file
                  </label>
                  {imageFile && (
                    <AdminButton
                      type="button"
                      variant="dark"
                      size="sm"
                      icon="upload"
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading…' : 'Upload'}
                    </AdminButton>
                  )}
                </div>

                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-surface-container" />
                  <span className="text-[11px] text-on-surface-variant/60 font-bold uppercase tracking-wider">
                    or
                  </span>
                  <div className="flex-1 h-px bg-surface-container" />
                </div>

                <AdminInput
                  placeholder="Enter image URL manually"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary-container"
                />
                <span className="text-[14px] text-on-surface">Active (visible to users)</span>
              </label>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-surface-container">
                <AdminButton type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </AdminButton>
                <AdminButton type="submit" variant="primary" icon={editingCertification ? 'save' : 'add'}>
                  {editingCertification ? 'Update' : 'Create'}
                </AdminButton>
              </div>
            </form>
          </AdminCard>
        </div>
      )}

      {/* Product Assignment Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AdminCard className="w-full max-w-4xl max-h-[85vh] overflow-y-auto" padding="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-headline-md font-bold text-on-surface">
                  Manage Products
                </h2>
                <p className="text-on-surface-variant/70 text-[13px] mt-1">
                  For &ldquo;{selectedCertificationForProducts?.title}&rdquo;
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-on-surface-variant text-[13px] mb-5">
              Select the products that should have this certification.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {products.map((product) => {
                const checked = selectedProducts.includes(product.id);
                return (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => toggleProductSelection(product.id)}
                    className={`text-left rounded-xl p-3 border-2 transition-all ${
                      checked
                        ? 'border-primary-container bg-primary-container/10'
                        : 'border-surface-container hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                          checked
                            ? 'bg-primary-container border-primary-container'
                            : 'border-outline-variant'
                        }`}
                      >
                        {checked && (
                          <span className="material-symbols-outlined text-[14px] text-on-primary-fixed">
                            check
                          </span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-outline-variant/20 overflow-hidden flex-shrink-0">
                        {product.image_url || product.image ? (
                          <img
                            src={product.image_url || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                            <span className="material-symbols-outlined text-[18px]">image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-on-surface truncate">{product.name}</p>
                        <p className="text-[11px] text-on-surface-variant/60 truncate font-mono">
                          {product.model || product.sku || '—'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl mb-5">
              <p className="text-[13px] text-on-surface">
                <span className="font-bold">{selectedProducts.length}</span> product
                {selectedProducts.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-surface-container">
              <AdminButton type="button" variant="secondary" onClick={() => setShowProductModal(false)}>
                Cancel
              </AdminButton>
              <AdminButton
                type="button"
                variant="primary"
                icon="save"
                onClick={handleSaveProductAssignments}
              >
                Save Assignments
              </AdminButton>
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
};

export default AdminCertifications;
