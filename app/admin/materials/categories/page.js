'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { materialsAPI } from '../../../../lib/api';
import { authStorage } from '../../../../lib/localStorage-utils';
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminInput,
  PageHeader,
  EmptyState,
  StatCard,
  AdminTable,
  AdminTHead,
  AdminTH,
  AdminTBody,
  AdminTR,
  AdminTD,
} from '../../../../components/admin/ui';

export default function MaterialCategoriesAdmin() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await materialsAPI.admin.getCategories();

      if (response.success) {
        setCategories(response.data);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'An error occurred while fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = authStorage.getToken();
    const isAdminAuth = authStorage.isAuthenticatedAdmin();

    if (!token || !isAdminAuth) {
      router.push('/admin/login');
      return;
    }

    fetchCategories();
  }, [router]);

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      sort_order: category.sort_order || 0,
      is_active: category.is_active !== undefined ? category.is_active : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = authStorage.getToken();
      const isAdminAuth = authStorage.isAuthenticatedAdmin();

      if (!token || !isAdminAuth) {
        alert('Authentication required. Please login again.');
        router.push('/admin/login');
        return;
      }

      setError('');
      setSubmitting(true);

      let response;
      if (editingCategory) {
        response = await materialsAPI.admin.updateCategory(editingCategory.id, formData);
      } else {
        response = await materialsAPI.admin.createCategory(formData);
      }

      if (response.success) {
        setShowModal(false);
        fetchCategories();
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.message || 'An error occurred while saving the category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (
      !confirm(
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const token = authStorage.getToken();
      const isAdminAuth = authStorage.isAuthenticatedAdmin();

      if (!token || !isAdminAuth) {
        alert('Authentication required. Please login again.');
        router.push('/admin/login');
        return;
      }

      const response = await materialsAPI.admin.deleteCategory(category.id);

      if (response.success) {
        fetchCategories();
      } else {
        alert(response.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      alert(err.message || 'An error occurred while deleting the category');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'name' && !editingCategory) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
      </div>
    );
  }

  const activeCount = categories.filter((c) => c.is_active).length;
  const totalMaterials = categories.reduce(
    (sum, c) => sum + (parseInt(c.materials_count) || 0),
    0
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Material Categories"
        description="Manage material category types (Metal Colors, Veneers, Laminates, etc.)"
        actions={
          <AdminButton variant="primary" size="lg" icon="add" onClick={handleAdd}>
            Add New Category
          </AdminButton>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <StatCard
          icon="category"
          label="Total Categories"
          value={categories.length.toString()}
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
          icon="palette"
          label="Total Materials"
          value={totalMaterials.toString()}
          change="Across categories"
          changeType="neutral"
        />
      </section>

      {error && (
        <div className="flex items-start justify-between gap-4 px-5 py-3 rounded-2xl bg-error-container border border-error/30 text-on-error-container">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5">error</span>
            <div>{error}</div>
          </div>
          <button
            onClick={() => setError('')}
            className="text-on-error-container/70 hover:text-on-error-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {categories.length === 0 ? (
        <EmptyState
          icon="category"
          title="No categories found"
          description="Create your first material category to start organizing materials."
          action={
            <AdminButton variant="primary" icon="add" onClick={handleAdd}>
              Create Your First Category
            </AdminButton>
          }
        />
      ) : (
        <AdminTable>
          <AdminTHead>
            <AdminTH>Category</AdminTH>
            <AdminTH>Description</AdminTH>
            <AdminTH align="center">Sort Order</AdminTH>
            <AdminTH>Status</AdminTH>
            <AdminTH align="center">Groups</AdminTH>
            <AdminTH align="center">Materials</AdminTH>
            <AdminTH align="right">Actions</AdminTH>
          </AdminTHead>
          <AdminTBody>
            {categories.map((category) => (
              <AdminTR key={category.id}>
                <AdminTD>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        category
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold text-on-surface tracking-tight">
                        {category.name}
                      </div>
                      <div className="text-[12px] text-on-surface-variant/70 font-mono">
                        {category.slug}
                      </div>
                    </div>
                  </div>
                </AdminTD>
                <AdminTD>
                  <div
                    className="text-[13px] text-on-surface-variant max-w-xs truncate"
                    title={category.description}
                  >
                    {category.description || '—'}
                  </div>
                </AdminTD>
                <AdminTD align="center">
                  <span className="text-[13px] font-bold text-on-surface">
                    {category.sort_order}
                  </span>
                </AdminTD>
                <AdminTD>
                  <AdminBadge tone={category.is_active ? 'active' : 'pending'} dot>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </AdminBadge>
                </AdminTD>
                <AdminTD align="center">
                  <div className="text-[14px] font-bold text-on-surface">
                    {category.material_groups_count || 0}
                  </div>
                  <div className="text-[11px] text-on-surface-variant/70 uppercase tracking-wider">
                    groups
                  </div>
                </AdminTD>
                <AdminTD align="center">
                  <div className="text-[14px] font-bold text-on-surface">
                    {category.materials_count || 0}
                  </div>
                  <div className="text-[11px] text-on-surface-variant/70 uppercase tracking-wider">
                    materials
                  </div>
                </AdminTD>
                <AdminTD align="right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      title="Edit"
                      className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      title="Delete"
                      className="w-9 h-9 rounded-lg hover:bg-error-container text-error flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </AdminTD>
              </AdminTR>
            ))}
          </AdminTBody>
        </AdminTable>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AdminCard className="w-full max-w-xl max-h-[90vh] overflow-y-auto" padding="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary p-2.5 bg-primary-container/20 rounded-xl text-[22px]">
                  category
                </span>
                <div>
                  <h2 className="text-headline-md font-bold text-on-surface">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <p className="text-[12px] text-on-surface-variant/70">
                    {editingCategory
                      ? 'Update the details of this category'
                      : 'Create a new material category'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-error-container border border-error/30 text-on-error-container mb-4">
                <span className="material-symbols-outlined">error</span>
                <span className="text-[13px]">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AdminInput
                label="Name *"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Metal Colors"
              />

              <AdminInput
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="e.g., metal-colors"
                hint="URL-friendly version of the name"
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
                  placeholder="Describe this material category…"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-on-surface focus:ring-2 focus:ring-primary-container/40 transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <AdminInput
                  label="Sort Order"
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  min="0"
                />
                <label className="flex items-center gap-3 cursor-pointer h-[46px]">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded accent-primary-container"
                  />
                  <span className="text-[14px] text-on-surface">Active</span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-surface-container">
                <AdminButton type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </AdminButton>
                <AdminButton
                  type="submit"
                  variant="primary"
                  icon={submitting ? 'progress_activity' : editingCategory ? 'save' : 'add'}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving…'
                    : editingCategory
                    ? 'Update Category'
                    : 'Create Category'}
                </AdminButton>
              </div>
            </form>
          </AdminCard>
        </div>
      )}
    </div>
  );
}
