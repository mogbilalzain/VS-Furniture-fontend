'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '../../../lib/localStorage-utils';
import { propertiesAPI, categoriesAPI } from '../../../lib/api';
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

const PropertyValuesPage = () => {
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [propertyValues, setPropertyValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_property_id: '',
    value: '',
    display_name: '',
    sort_order: 0,
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});

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

      await new Promise((resolve) => setTimeout(resolve, 100));

      const [categoriesResponse, propertiesResponse, propertyValuesResponse] = await Promise.all([
        categoriesAPI.getAdminAll(),
        propertiesAPI.getAll(),
        propertiesAPI.getPropertyValues(),
      ]);

      if (categoriesResponse.success) setCategories(categoriesResponse.data || []);
      if (propertiesResponse.success) setProperties(propertiesResponse.data || []);
      if (propertyValuesResponse.success) setPropertyValues(propertyValuesResponse.data || []);
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
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.category_property_id) {
      errors.category_property_id = 'Property is required';
    }
    if (!formData.value.trim()) {
      errors.value = 'Value is required';
    }
    if (!formData.display_name.trim()) {
      errors.display_name = 'Display name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      category_property_id: '',
      value: '',
      display_name: '',
      sort_order: 0,
      is_active: true,
    });
    setFormErrors({});
    setSelectedValue(null);
  };

  const handleAddValue = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditValue = (value) => {
    setSelectedValue(value);
    setFormData({
      category_property_id: value.category_property_id || '',
      value: value.value || '',
      display_name: value.display_name || '',
      sort_order: value.sort_order || 0,
      is_active: value.is_active !== undefined ? value.is_active : true,
    });
    setShowModal(true);
  };

  const handleSaveValue = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setModalLoading(true);
      setError(null);

      let response;
      if (selectedValue) {
        response = await propertiesAPI.updatePropertyValue(selectedValue.id, formData);
      } else {
        const propertyId = formData.category_property_id;
        response = await propertiesAPI.createPropertyValue(propertyId, formData);
      }

      if (response.success) {
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        if (response.errors) setFormErrors(response.errors);
        setError(response.message || 'Failed to save property value');
      }
    } catch (error) {
      console.error('Error saving property value:', error);
      setError('An error occurred while saving the property value');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteValue = async (valueId) => {
    if (!confirm('Are you sure you want to delete this property value?')) return;

    try {
      setLoading(true);
      const response = await propertiesAPI.deletePropertyValue(valueId);

      if (response.success) {
        await loadData();
      } else {
        setError(response.message || 'Failed to delete property value');
      }
    } catch (error) {
      console.error('Error deleting property value:', error);
      setError('An error occurred while deleting the property value');
    } finally {
      setLoading(false);
    }
  };

  const filteredValues = propertyValues.filter((value) => {
    const categoryId = value.category?.id || value.property?.category?.id || value.category_id;
    const propertyId = value.property?.id || value.category_property_id;

    const matchesCategory = selectedCategory === 'all' || categoryId == selectedCategory;
    const matchesProperty = selectedProperty === 'all' || propertyId == selectedProperty;
    const matchesSearch =
      !searchTerm ||
      (value.value && value.value.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (value.display_name &&
        value.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesProperty && matchesSearch;
  });

  const groupedValues = filteredValues.reduce((acc, value) => {
    const propertyId = value.property?.id || value.category_property_id || 'uncategorized';
    if (!acc[propertyId]) acc[propertyId] = [];
    acc[propertyId].push(value);
    return acc;
  }, {});

  const getPropertyName = (propertyId) => {
    if (propertyId === 'uncategorized') return 'Uncategorized';
    const property = properties.find((p) => p.id == propertyId);
    return property ? property.display_name || property.name : `Property ${propertyId}`;
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id == categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  const getPropertyCategory = (propertyId) => {
    const property = properties.find((p) => p.id == propertyId);
    return property
      ? getCategoryName(property.category?.id || property.category_id)
      : 'Unknown Category';
  };

  const availableProperties =
    selectedCategory === 'all'
      ? properties
      : properties.filter((p) => p.category_id == selectedCategory);

  if (loading && propertyValues.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
      </div>
    );
  }

  const activeCount = propertyValues.filter((v) => v.is_active).length;

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const propertyOptions = [
    { value: 'all', label: 'All Properties' },
    ...availableProperties.map((p) => ({
      value: p.id,
      label: `${p.display_name} (${getCategoryName(p.category_id)})`,
    })),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Property Values"
        description="Manage property values and their settings."
        actions={
          <AdminButton variant="primary" size="lg" icon="add" onClick={handleAddValue}>
            Add Property Value
          </AdminButton>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <StatCard
          icon="list_alt"
          label="Total Values"
          value={propertyValues.length.toString()}
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
          icon="filter_alt"
          label="Filtered"
          value={filteredValues.length.toString()}
          change="In view"
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
            onClick={() => setError(null)}
            className="text-on-error-container/70 hover:text-on-error-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Filters */}
      <AdminCard padding="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <AdminSelect
            label="Filter by Category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedProperty('all');
            }}
            options={categoryOptions}
          />
          <AdminSelect
            label="Filter by Property"
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            options={propertyOptions}
          />
          <AdminInput
            label="Search Values"
            icon="search"
            placeholder="Search by value or display name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </AdminCard>

      {/* Values List */}
      {Object.keys(groupedValues).length === 0 ? (
        <EmptyState
          icon="list_alt"
          title="No property values found"
          description={
            searchTerm || selectedCategory !== 'all' || selectedProperty !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Start by adding your first property value'
          }
          action={
            <AdminButton variant="primary" icon="add" onClick={handleAddValue}>
              Add Property Value
            </AdminButton>
          }
        />
      ) : (
        <AdminCard padding="p-0" className="overflow-hidden">
          {Object.keys(groupedValues).map((propertyId, propIdx) => (
            <div
              key={propertyId}
              className={propIdx > 0 ? 'border-t border-surface-container' : ''}
            >
              <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-surface-container">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                    tune
                  </span>
                  <h3 className="text-[14px] font-bold text-on-surface tracking-tight truncate">
                    {getPropertyName(propertyId)}
                  </h3>
                  <AdminBadge tone="neutral">
                    {groupedValues[propertyId].length} values
                  </AdminBadge>
                </div>
                <AdminBadge tone="info">
                  <span className="material-symbols-outlined text-[12px] mr-1">category</span>
                  {getPropertyCategory(propertyId)}
                </AdminBadge>
              </div>
              <div className="divide-y divide-surface-container">
                {groupedValues[propertyId]
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map((value) => (
                    <div
                      key={value.id}
                      className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-surface-container-low/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="text-[15px] font-bold text-on-surface tracking-tight">
                            {value.display_name}
                          </h4>
                          <AdminBadge tone={value.is_active ? 'active' : 'pending'} dot>
                            {value.is_active ? 'Active' : 'Inactive'}
                          </AdminBadge>
                          {value.sort_order > 0 && (
                            <AdminBadge tone="neutral">Sort: {value.sort_order}</AdminBadge>
                          )}
                        </div>
                        <p className="text-[13px] text-on-surface-variant mb-2 flex items-center gap-1.5">
                          Value:
                          <code className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-mono text-[12px]">
                            {value.value}
                          </code>
                        </p>
                        <div className="flex gap-4 text-[13px] text-on-surface-variant/80 flex-wrap">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">
                              category
                            </span>
                            Category:{' '}
                            <strong className="text-on-surface">
                              {value.category?.name || getCategoryName(value.category?.id)}
                            </strong>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">
                              tune
                            </span>
                            Property:{' '}
                            <strong className="text-on-surface">
                              {value.property?.display_name || value.property?.name}
                            </strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditValue(value)}
                          title="Edit"
                          className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteValue(value.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AdminCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" padding="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-headline-md font-bold text-on-surface">
                {selectedValue ? 'Edit Property Value' : 'Add New Property Value'}
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

            <form onSubmit={handleSaveValue} className="space-y-5">
              <AdminSelect
                label="Property *"
                name="category_property_id"
                value={formData.category_property_id}
                onChange={handleInputChange}
                error={formErrors.category_property_id}
                options={[
                  { value: '', label: 'Select a property' },
                  ...properties.map((p) => ({
                    value: p.id,
                    label: `${p.display_name} (${getCategoryName(p.category_id)})`,
                  })),
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="Value *"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="e.g., student-tables"
                  error={formErrors.value}
                />
                <AdminInput
                  label="Display Name *"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Student Tables/Desks"
                  error={formErrors.display_name}
                />
              </div>

              <AdminInput
                label="Sort Order"
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />

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
                  icon={modalLoading ? 'progress_activity' : selectedValue ? 'save' : 'add'}
                  disabled={modalLoading}
                >
                  {modalLoading
                    ? 'Saving…'
                    : selectedValue
                    ? 'Update Value'
                    : 'Create Value'}
                </AdminButton>
              </div>
            </form>
          </AdminCard>
        </div>
      )}
    </div>
  );
};

export default PropertyValuesPage;
