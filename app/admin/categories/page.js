'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth-context'
import { authStorage } from '../../../lib/localStorage-utils'
import { categoriesAPI } from '../../../lib/api'
import CategoryModal from '../../../components/admin/CategoryModal'
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminInput,
  PageHeader,
  EmptyState,
  StatCard,
} from '../../../components/admin/ui'

const CategoriesPage = () => {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin } = useAuth()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      if (!authStorage.isAuthenticatedAdmin()) {
        router.replace('/admin/login')
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
      await loadCategories()
    }
    checkAuthAndLoadData()
  }, [router])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await categoriesAPI.getAdminAll()
      if (response.success) {
        setCategories(response.data || [])
      } else {
        setError('Failed to load categories')
      }
    } catch (err) {
      console.error('Error loading categories:', err)
      if (err.message?.includes('401')) {
        setError('Authentication required. Please login again.')
        router.push('/admin/login')
      } else if (err.message?.includes('403')) {
        setError('Access denied. Admin privileges required.')
        router.push('/admin/login')
      } else if (err.message?.includes('Network Error') || err.message?.includes('Failed to fetch')) {
        setError('Server connection failed. Please check if the backend is running.')
      } else {
        setError(err.message || 'Failed to load categories')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setShowModal(true)
  }

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    setShowModal(true)
  }

  const handleModalSave = async (categoryData) => {
    try {
      setModalLoading(true)
      setError(null)

      let response
      if (selectedCategory) {
        response = await categoriesAPI.update(selectedCategory.id, categoryData)
        if (categoryData.selectedProperties) {
          try {
            await categoriesAPI.updateProperties(selectedCategory.id, categoryData.selectedProperties)
          } catch (propError) {
            console.warn('Failed to update category properties:', propError)
          }
        }
      } else {
        response = await categoriesAPI.create(categoryData)
        if (
          response.success &&
          categoryData.selectedProperties &&
          categoryData.selectedProperties.length > 0
        ) {
          try {
            await categoriesAPI.updateProperties(response.data.id, categoryData.selectedProperties)
          } catch (propError) {
            console.warn('Failed to assign properties to new category:', propError)
          }
        }
      }

      if (response.success) {
        await loadCategories()
        setShowModal(false)
        setSelectedCategory(null)
        const msg = selectedCategory ? 'Category updated successfully' : 'Category created successfully'
        setSuccessMessage(msg)
        setTimeout(() => setSuccessMessage(''), 4000)
      } else {
        if (response.errors) {
          const errorMessages = Object.values(response.errors).flat().join(', ')
          setError(`Validation errors: ${errorMessages}`)
        } else {
          setError(response.message || 'Failed to save category')
        }
        throw new Error(response.message || 'Failed to save category')
      }
    } catch (err) {
      console.error('Category save error:', err)
      if (!error) setError('An error occurred while saving the category')
      throw err
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteCategory = async (category) => {
    if (
      !confirm(
        `⚠️ Are you sure you want to delete the category "${category.name}"?\n\nThis action cannot be undone and all related data will be deleted.`
      )
    ) {
      return
    }

    try {
      setLoading(true)
      const response = await categoriesAPI.delete(category.id)
      if (response.success) {
        await loadCategories()
        setSuccessMessage('Category deleted successfully')
        setTimeout(() => setSuccessMessage(''), 4000)
      } else {
        setError(response.message || 'Failed to delete category')
      }
    } catch (err) {
      setError(err.message || 'Failed to delete category')
      console.error('Error deleting category:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryImageUpload = async (categoryId, file) => {
    if (!file) return
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append(
        'alt_text',
        `${categories.find((c) => c.id === categoryId)?.name} category image`
      )
      const response = await categoriesAPI.uploadImage(categoryId, fd)
      if (response.success) {
        await loadCategories()
        setSuccessMessage('Category image uploaded successfully')
        setTimeout(() => setSuccessMessage(''), 4000)
      } else {
        setError('Upload failed: ' + (response.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload error: ' + err.message)
    }
  }

  const handleCategoryImageDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category image?')) return
    try {
      const response = await categoriesAPI.deleteImage(categoryId)
      if (response.success) {
        await loadCategories()
        setSuccessMessage('Category image deleted successfully')
        setTimeout(() => setSuccessMessage(''), 4000)
      } else {
        setError('Delete failed: ' + (response.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Delete error: ' + err.message)
    }
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalProducts = categories.reduce((acc, c) => acc + (c.products_count || 0), 0)
  const activeCount = categories.filter((c) => c.status === 'active' || !c.status).length

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
      </div>
    )
  }

  if (!authStorage.isAuthenticatedAdmin()) {
    return (
      <EmptyState
        icon="lock"
        title="Redirecting…"
        description="Redirecting to login page."
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Categories"
        description="Manage your product classification and attribute inheritance."
        actions={
          <AdminButton variant="primary" icon="add" size="lg" onClick={handleAddCategory}>
            Add Category
          </AdminButton>
        }
      />

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <StatCard
          icon="category"
          label="Total Categories"
          value={categories.length.toString()}
          change="Live"
          changeType="positive"
        />
        <StatCard
          icon="check_circle"
          label="Active"
          value={activeCount.toString()}
          change="Operational"
          changeType="positive"
        />
        <StatCard
          icon="inventory_2"
          label="Linked Products"
          value={totalProducts.toString()}
          change="Across catalog"
          changeType="neutral"
        />
      </section>

      {/* Search */}
      <AdminCard padding="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <AdminInput
              icon="search"
              placeholder="Search categories by name or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-[13px] text-on-surface-variant/70 font-medium">
            <span className="text-on-surface font-bold">{filteredCategories.length}</span> of{' '}
            <span className="text-on-surface font-bold">{categories.length}</span> categories
          </p>
        </div>
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
            <div>
              <span className="font-bold">Error:</span> {error}
              {error.includes('Server') && (
                <div className="text-[13px] mt-1 opacity-80">
                  Please make sure the Laravel backend is running.
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-on-error-container/70 hover:text-on-error-container flex-shrink-0"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Bento grid */}
      {filteredCategories.length === 0 && !loading ? (
        <EmptyState
          icon="category"
          title="No categories found"
          description={
            searchTerm
              ? 'Try adjusting your search terms.'
              : 'Get started by creating your first category.'
          }
          action={
            !searchTerm && (
              <AdminButton variant="primary" icon="add" onClick={handleAddCategory}>
                Add Your First Category
              </AdminButton>
            )
          }
        />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="group bg-surface-container-lowest rounded-[20px] p-6 admin-shadow-soft border border-outline-variant/10 hover:border-primary-container hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image / banner */}
              <div className="aspect-video w-full rounded-xl overflow-hidden mb-5 bg-surface-container-low relative">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.alt_text || category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i
                      className={category.icon || 'fas fa-cube'}
                      style={{
                        fontSize: '2.5rem',
                        color: category.color || '#705d00',
                      }}
                    />
                  </div>
                )}
                <span className="absolute top-3 right-3">
                  <AdminBadge
                    tone={category.status === 'active' || !category.status ? 'active' : 'pending'}
                    dot
                  >
                    {category.status || 'active'}
                  </AdminBadge>
                </span>
              </div>

              {/* Title + slug */}
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-[18px] text-on-surface tracking-tight truncate mb-1">
                    {category.name}
                  </h3>
                  <span className="inline-block text-[11px] font-mono text-on-surface-variant/70 bg-surface-container px-2 py-0.5 rounded">
                    /{category.slug}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEditCategory(category)}
                    title="Edit"
                    className="w-9 h-9 rounded-lg text-on-surface-variant hover:bg-surface-container-high flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    title="Delete"
                    className="w-9 h-9 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              {category.description && (
                <p className="text-on-surface-variant text-[13px] leading-relaxed line-clamp-2 mb-5">
                  {category.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-2 mb-5">
                <span className="bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-full text-[11px] font-bold">
                  {category.products_count || 0} Products
                </span>
                <span className="bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-full text-[11px] font-bold">
                  {category.properties_count || 0} Properties
                </span>
              </div>

              {/* Image controls */}
              <div className="flex items-center gap-2 pt-4 border-t border-surface-container">
                <label
                  htmlFor={`category-image-${category.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant text-[12px] font-bold cursor-pointer hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">image</span>
                  {category.image_url ? 'Change Image' : 'Add Image'}
                </label>
                <input
                  type="file"
                  id={`category-image-${category.id}`}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCategoryImageUpload(category.id, e.target.files[0])}
                />
                {category.image_url && (
                  <button
                    onClick={() => handleCategoryImageDelete(category.id)}
                    title="Delete image"
                    className="w-9 h-9 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
        onSave={handleModalSave}
        loading={modalLoading}
      />
    </div>
  )
}

export default CategoriesPage
