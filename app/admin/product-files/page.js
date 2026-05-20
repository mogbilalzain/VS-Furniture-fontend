'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '../../../lib/localStorage-utils';
import { productFilesAPI, productsAPI } from '../../../lib/api';
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

const ProductFilesPage = () => {
  const router = useRouter();

  const [files, setFiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    product_id: '',
    display_name: '',
    description: '',
    file_category: 'manual',
    is_active: true,
    is_featured: false,
    sort_order: 0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedFileForUpload, setSelectedFileForUpload] = useState(null);

  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      router.replace('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsResponse, filesResponse] = await Promise.all([
        productsAPI.getAdminAll(),
        productFilesAPI.getAll(),
      ]);

      if (productsResponse.success) setProducts(productsResponse.data || []);
      if (filesResponse.success) setFiles(filesResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseInt(value) || 0
          : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        e.target.value = '';
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        e.target.value = '';
        return;
      }

      setSelectedFileForUpload(file);

      if (!formData.display_name) {
        const fileName = file.name.replace('.pdf', '');
        setFormData((prev) => ({ ...prev, display_name: fileName }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.product_id) errors.product_id = 'Product is required';
    if (!formData.display_name.trim()) errors.display_name = 'Display name is required';
    if (!selectedFile && !selectedFileForUpload) errors.file = 'File is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      display_name: '',
      description: '',
      file_category: 'manual',
      is_active: true,
      is_featured: false,
      sort_order: 0,
    });
    setFormErrors({});
    setSelectedFile(null);
    setSelectedFileForUpload(null);
    setUploadProgress(0);
  };

  const handleAddFile = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditFile = (file) => {
    setSelectedFile(file);
    setFormData({
      product_id: file.product_id || '',
      display_name: file.display_name || '',
      description: file.description || '',
      file_category: file.file_category || 'manual',
      is_active: file.is_active !== undefined ? file.is_active : true,
      is_featured: file.is_featured || false,
      sort_order: file.sort_order || 0,
    });
    setShowModal(true);
  };

  const handleSaveFile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setModalLoading(true);
      setError(null);

      let response;
      if (selectedFile) {
        response = await productFilesAPI.update(selectedFile.id, formData);
      } else {
        const uploadData = new FormData();
        uploadData.append('file', selectedFileForUpload);
        uploadData.append('product_id', formData.product_id);
        uploadData.append('display_name', formData.display_name);
        uploadData.append('description', formData.description || '');
        uploadData.append('file_category', formData.file_category);
        uploadData.append('is_active', formData.is_active ? '1' : '0');
        uploadData.append('is_featured', formData.is_featured ? '1' : '0');
        uploadData.append('sort_order', formData.sort_order.toString());

        response = await productFilesAPI.upload(uploadData, (progress) => {
          setUploadProgress(progress);
        });
      }

      if (response.success) {
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        if (response.errors) setFormErrors(response.errors);
        setError(response.message || 'Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      if (error.fullResponse && error.fullResponse.message) {
        setError(error.fullResponse.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An error occurred while saving the file');
      }
    } finally {
      setModalLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.'))
      return;

    try {
      setLoading(true);
      const response = await productFilesAPI.delete(fileId);

      if (response.success) {
        await loadData();
      } else {
        setError(response.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('An error occurred while deleting the file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await productFilesAPI.download(fileId);

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      await loadData();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesProduct = selectedProduct === 'all' || file.product_id == selectedProduct;
    const matchesSearch =
      file.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesProduct && matchesSearch;
  });

  const groupedFiles = filteredFiles.reduce((acc, file) => {
    const productId = file.product_id || 'uncategorized';
    if (!acc[productId]) acc[productId] = [];
    acc[productId].push(file);
    return acc;
  }, {});

  const getProductName = (productId) => {
    if (productId === 'uncategorized') return 'Uncategorized';
    const product = products.find((p) => p.id == productId);
    return product ? product.name : `Product ${productId}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && files.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
      </div>
    );
  }

  const totalDownloads = files.reduce((sum, f) => sum + (f.download_count || 0), 0);
  const featuredCount = files.filter((f) => f.is_featured).length;

  const productOptions = [
    { value: 'all', label: 'All Products' },
    ...products.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Product Files"
        description="Manage PDF files and downloadable resources for products."
        actions={
          <AdminButton variant="primary" size="lg" icon="upload" onClick={handleAddFile}>
            Upload File
          </AdminButton>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <StatCard
          icon="description"
          label="Total Files"
          value={files.length.toString()}
          change="Catalog"
          changeType="neutral"
        />
        <StatCard
          icon="download"
          label="Total Downloads"
          value={totalDownloads.toString()}
          change="All time"
          changeType="positive"
        />
        <StatCard
          icon="star"
          label="Featured"
          value={featuredCount.toString()}
          change="Highlighted"
          changeType="warning"
        />
      </section>

      {error && (
        <div className="flex items-start justify-between gap-4 px-5 py-3 rounded-2xl bg-error-container border border-error/30 text-on-error-container">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5">error</span>
            <div>{error}</div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-on-error-container/70 hover:text-on-error-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Filters */}
      <AdminCard padding="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <AdminSelect
            label="Filter by Product"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            options={productOptions}
          />
          <AdminInput
            label="Search Files"
            icon="search"
            placeholder="Search by name or description…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </AdminCard>

      {/* Files List */}
      {Object.keys(groupedFiles).length === 0 ? (
        <EmptyState
          icon="description"
          title="No files found"
          description={
            searchTerm || selectedProduct !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Start by uploading your first file'
          }
          action={
            <AdminButton variant="primary" icon="upload" onClick={handleAddFile}>
              Upload File
            </AdminButton>
          }
        />
      ) : (
        <AdminCard padding="p-0" className="overflow-hidden">
          {Object.keys(groupedFiles).map((productId, idx) => (
            <div
              key={productId}
              className={idx > 0 ? 'border-t border-surface-container' : ''}
            >
              <div className="bg-surface-container-low px-6 py-4 flex items-center gap-3 border-b border-surface-container">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                  inventory_2
                </span>
                <h3 className="text-[14px] font-bold text-on-surface tracking-tight">
                  {getProductName(productId)}
                </h3>
                <AdminBadge tone="neutral">
                  {groupedFiles[productId].length} files
                </AdminBadge>
              </div>
              <div className="divide-y divide-surface-container">
                {groupedFiles[productId]
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map((file) => (
                    <div
                      key={file.id}
                      className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-surface-container-low/50 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[24px]">
                            picture_as_pdf
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="text-[15px] font-bold text-on-surface tracking-tight">
                              {file.display_name}
                            </h4>
                            <AdminBadge tone={file.is_active ? 'active' : 'pending'} dot>
                              {file.is_active ? 'Active' : 'Inactive'}
                            </AdminBadge>
                            {file.is_featured && (
                              <AdminBadge tone="warning">
                                <span className="material-symbols-outlined text-[12px] mr-1">
                                  star
                                </span>
                                Featured
                              </AdminBadge>
                            )}
                            <AdminBadge tone="info">{file.file_category}</AdminBadge>
                          </div>

                          <div className="flex gap-4 text-[13px] text-on-surface-variant/80 flex-wrap mb-2">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">
                                description
                              </span>
                              {file.file_name}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">
                                scale
                              </span>
                              {formatFileSize(file.file_size)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">
                                download
                              </span>
                              {file.download_count || 0} downloads
                            </span>
                          </div>

                          {file.description && (
                            <p className="text-[13px] text-on-surface-variant">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleDownloadFile(file.id, file.file_name)}
                          title="Download"
                          className="w-9 h-9 rounded-lg hover:bg-primary-container/20 text-primary flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            download
                          </span>
                        </button>
                        <button
                          onClick={() => handleEditFile(file)}
                          title="Edit"
                          className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          title="Delete"
                          className="w-9 h-9 rounded-lg hover:bg-error-container text-error flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </AdminCard>
      )}

      {/* Upload/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AdminCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" padding="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-headline-md font-bold text-on-surface">
                {selectedFile ? 'Edit File' : 'Upload New File'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveFile} className="space-y-5">
              <AdminSelect
                label="Product *"
                name="product_id"
                value={formData.product_id}
                onChange={handleInputChange}
                error={formErrors.product_id}
                options={[
                  { value: '', label: 'Select a product' },
                  ...products.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />

              {!selectedFile && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">
                    PDF File *
                  </label>
                  <label
                    className={`flex items-center justify-center gap-3 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                      formErrors.file
                        ? 'border-error bg-error-container/30'
                        : selectedFileForUpload
                        ? 'border-primary-container bg-primary-container/10'
                        : 'border-outline-variant/60 hover:border-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <span className="material-symbols-outlined text-[28px] text-on-surface-variant">
                      {selectedFileForUpload ? 'check_circle' : 'upload_file'}
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-on-surface">
                        {selectedFileForUpload ? selectedFileForUpload.name : 'Click to choose PDF file'}
                      </p>
                      <p className="text-[12px] text-on-surface-variant/70">
                        Only PDF files up to 10MB are allowed
                      </p>
                    </div>
                  </label>
                  {formErrors.file && (
                    <p className="text-[12px] text-error font-medium">{formErrors.file}</p>
                  )}
                </div>
              )}

              <AdminInput
                label="Display Name *"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                placeholder="File display name"
                error={formErrors.display_name}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="File description…"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-on-surface focus:ring-2 focus:ring-primary-container/40 transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminSelect
                  label="Category"
                  name="file_category"
                  value={formData.file_category}
                  onChange={handleInputChange}
                  options={[
                    { value: 'manual', label: 'Manual' },
                    { value: 'catalog', label: 'Catalog' },
                    { value: 'specification', label: 'Specification' },
                    { value: 'warranty', label: 'Warranty' },
                    { value: 'installation', label: 'Installation Guide' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <AdminInput
                  label="Sort Order"
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded accent-primary-container"
                  />
                  <span className="text-[14px] text-on-surface">Active</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded accent-primary-container"
                  />
                  <span className="text-[14px] text-on-surface">Featured</span>
                </label>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[13px] text-on-surface-variant font-medium">
                      Uploading…
                    </span>
                    <span className="text-[13px] text-on-surface font-bold">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-surface-container">
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  type="submit"
                  variant="primary"
                  icon={modalLoading ? 'progress_activity' : selectedFile ? 'save' : 'upload'}
                  disabled={modalLoading || (uploadProgress > 0 && uploadProgress < 100)}
                >
                  {modalLoading
                    ? selectedFile
                      ? 'Updating…'
                      : 'Uploading…'
                    : selectedFile
                    ? 'Update File'
                    : 'Upload File'}
                </AdminButton>
              </div>
            </form>
          </AdminCard>
        </div>
      )}
    </div>
  );
};

export default ProductFilesPage;
