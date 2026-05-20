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

const PropertiesPage = () => {
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Property modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    property_group_id: '',
    name: '',
    display_name: '',
    description: '',
    input_type: 'select',
    is_required: false,
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  // Group modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupModalLoading, setGroupModalLoading] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    category_id: '',
    name: '',
    display_name: '',
    sort_order: 0,
    is_active: true,
  });
  const [groupFormErrors, setGroupFormErrors] = useState({});

  const [activeTab, setActiveTab] = useState('properties');

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

      const [categoriesResponse, propertiesResponse, groupsResponse] = await Promise.all([
        categoriesAPI.getAll(),
        propertiesAPI.getAll(),
        propertiesAPI.getAllPropertyGroups(),
      ]);

      if (categoriesResponse.success) setCategories(categoriesResponse.data || []);
      if (propertiesResponse.success) setProperties(propertiesResponse.data || []);
      if (groupsResponse.success) setPropertyGroups(groupsResponse.data || []);
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
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.category_id) errors.category_id = 'Category is required';
    if (!formData.name.trim()) errors.name = 'Property name is required';
    if (!formData.display_name.trim()) errors.display_name = 'Display name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      property_group_id: '',
      name: '',
      display_name: '',
      description: '',
      input_type: 'select',
      is_required: false,
      is_active: true,
    });
    setFormErrors({});
    setSelectedProperty(null);
  };

  const handleAddProperty = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setFormData({
      category_id: property.category?.id || property.category_id || '',
      property_group_id: property.property_group_id || '',
      name: property.name || '',
      display_name: property.display_name || '',
      description: property.description || '',
      input_type: property.input_type || 'select',
      is_required: property.is_required || false,
      is_active: property.is_active !== undefined ? property.is_active : true,
    });
    setShowModal(true);
  };

  const handleSaveProperty = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setModalLoading(true);
      setError(null);

      const payload = {
        ...formData,
        property_group_id: formData.property_group_id || null,
      };

      let response;
      if (selectedProperty) {
        response = await propertiesAPI.update(selectedProperty.id, payload);
      } else {
        response = await propertiesAPI.create(payload);
      }

      if (response.success) {
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        if (response.errors) setFormErrors(response.errors);
        setError(response.message || 'Failed to save property');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      setError('An error occurred while saving the property');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property? This will also delete all its values.'))
      return;
    try {
      setLoading(true);
      const response = await propertiesAPI.delete(propertyId);
      if (response.success) {
        await loadData();
      } else {
        setError(response.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      setError('An error occurred while deleting the property');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGroupFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : name === 'sort_order' ? parseInt(value) || 0 : value,
    }));
    if (groupFormErrors[name]) {
      setGroupFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateGroupForm = () => {
    const errors = {};
    if (!groupFormData.category_id) errors.category_id = 'Category is required';
    if (!groupFormData.name.trim()) errors.name = 'Group name is required';
    if (!groupFormData.display_name.trim()) errors.display_name = 'Display name is required';
    setGroupFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetGroupForm = () => {
    setGroupFormData({
      category_id: '',
      name: '',
      display_name: '',
      sort_order: 0,
      is_active: true,
    });
    setGroupFormErrors({});
    setSelectedGroup(null);
  };

  const handleAddGroup = () => {
    resetGroupForm();
    setShowGroupModal(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setGroupFormData({
      category_id: group.category_id || '',
      name: group.name || '',
      display_name: group.display_name || '',
      sort_order: group.sort_order || 0,
      is_active: group.is_active !== undefined ? group.is_active : true,
    });
    setShowGroupModal(true);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!validateGroupForm()) return;

    try {
      setGroupModalLoading(true);
      setError(null);

      let response;
      if (selectedGroup) {
        response = await propertiesAPI.updatePropertyGroup(selectedGroup.id, groupFormData);
      } else {
        response = await propertiesAPI.createPropertyGroup(
          groupFormData.category_id,
          groupFormData
        );
      }

      if (response.success) {
        await loadData();
        setShowGroupModal(false);
        resetGroupForm();
      } else {
        if (response.errors) setGroupFormErrors(response.errors);
        setError(response.message || 'Failed to save property group');
      }
    } catch (error) {
      console.error('Error saving group:', error);
      setError('An error occurred while saving the property group');
    } finally {
      setGroupModalLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (
      !confirm(
        'Are you sure you want to delete this group? Properties in this group will become ungrouped.'
      )
    )
      return;
    try {
      setLoading(true);
      const response = await propertiesAPI.deletePropertyGroup(groupId);
      if (response.success) {
        await loadData();
      } else {
        setError(response.message || 'Failed to delete property group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('An error occurred while deleting the property group');
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const catId = property.category?.id || property.category_id;
    const matchesCategory = selectedCategory === 'all' || catId == selectedCategory;
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedProperties = filteredProperties.reduce((acc, property) => {
    const categoryId = property.category?.id || property.category_id || 'uncategorized';
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(property);
    return acc;
  }, {});

  const filteredGroups = propertyGroups.filter((group) => {
    const matchesCategory = selectedCategory === 'all' || group.category_id == selectedCategory;
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedGroupsByCategory = filteredGroups.reduce((acc, group) => {
    const categoryId = group.category_id || 'uncategorized';
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(group);
    return acc;
  }, {});

  const getCategoryName = (categoryId) => {
    if (categoryId === 'uncategorized') return 'Uncategorized';
    const category = categories.find((c) => c.id == categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  const groupsForCategory = (categoryId) =>
    propertyGroups.filter((g) => g.category_id == categoryId);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  if (loading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin" />
      </div>
    );
  }

  const activePropertiesCount = properties.filter((p) => p.is_active).length;
  const requiredPropertiesCount = properties.filter((p) => p.is_required).length;

  const TABS = [
    { id: 'properties', label: `Properties (${properties.length})`, icon: 'tune' },
    { id: 'groups', label: `Property Groups (${propertyGroups.length})`, icon: 'layers' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Properties Management"
        description="Manage category properties, groups, and their settings."
        actions={
          <>
            <AdminButton variant="secondary" size="lg" icon="layers" onClick={handleAddGroup}>
              Add Group
            </AdminButton>
            <AdminButton variant="primary" size="lg" icon="add" onClick={handleAddProperty}>
              Add Property
            </AdminButton>
          </>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard
          icon="tune"
          label="Total Properties"
          value={properties.length.toString()}
          change="Catalog"
          changeType="neutral"
        />
        <StatCard
          icon="check_circle"
          label="Active"
          value={activePropertiesCount.toString()}
          change="Published"
          changeType="positive"
        />
        <StatCard
          icon="error"
          label="Required"
          value={requiredPropertiesCount.toString()}
          change="Mandatory"
          changeType="warning"
        />
        <StatCard
          icon="layers"
          label="Property Groups"
          value={propertyGroups.length.toString()}
          change="Organized"
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

      {/* Segmented Tabs */}
      <div className="inline-flex bg-surface-container-low p-1 rounded-2xl gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold tracking-tight transition-all ${
              activeTab === tab.id
                ? 'bg-surface-container-lowest text-on-surface admin-shadow-soft'
                : 'text-on-surface-variant/70 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <AdminCard padding="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-4 items-end">
          <AdminSelect
            label="Filter by Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categoryOptions}
          />
          <AdminInput
            label="Search"
            icon="search"
            placeholder="Search by name or display name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </AdminCard>

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <>
          {Object.keys(groupedProperties).length === 0 ? (
            <EmptyState
              icon="tune"
              title="No properties found"
              description={
                searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start by adding your first property'
              }
              action={
                <AdminButton variant="primary" icon="add" onClick={handleAddProperty}>
                  Add Property
                </AdminButton>
              }
            />
          ) : (
            <AdminCard padding="p-0" className="overflow-hidden">
              {Object.keys(groupedProperties).map((categoryId, catIdx) => (
                <div
                  key={categoryId}
                  className={catIdx > 0 ? 'border-t border-surface-container' : ''}
                >
                  <div className="bg-surface-container-low px-6 py-4 flex items-center gap-3 border-b border-surface-container">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                      category
                    </span>
                    <h3 className="text-[14px] font-bold text-on-surface tracking-tight">
                      {getCategoryName(categoryId)}
                    </h3>
                    <AdminBadge tone="neutral">
                      {groupedProperties[categoryId].length}
                    </AdminBadge>
                  </div>
                  <div className="divide-y divide-surface-container">
                    {groupedProperties[categoryId].map((property) => (
                      <div
                        key={property.id}
                        className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-surface-container-low/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="text-[15px] font-bold text-on-surface tracking-tight">
                              {property.display_name}
                            </h4>
                            <AdminBadge tone={property.is_active ? 'active' : 'pending'} dot>
                              {property.is_active ? 'Active' : 'Inactive'}
                            </AdminBadge>
                            {property.is_required && (
                              <AdminBadge tone="warning">Required</AdminBadge>
                            )}
                            <AdminBadge tone="info">{property.input_type}</AdminBadge>
                            {property.property_group && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-secondary-container text-on-secondary-container">
                                <span className="material-symbols-outlined text-[12px]">
                                  layers
                                </span>
                                {property.property_group.display_name}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] text-on-surface-variant flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-1.5">
                              Name:
                              <code className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-mono text-[12px]">
                                {property.name}
                              </code>
                            </span>
                            {property.values_count !== undefined && (
                              <span>
                                Values:{' '}
                                <strong className="text-on-surface">
                                  {property.active_values_count || 0}
                                </strong>
                                /{property.values_count || 0}
                              </span>
                            )}
                          </p>
                          {property.description && (
                            <p className="text-[13px] text-on-surface-variant/80 mt-1">
                              {property.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEditProperty(property)}
                            title="Edit"
                            className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
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
        </>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <>
          {Object.keys(groupedGroupsByCategory).length === 0 ? (
            <EmptyState
              icon="layers"
              title="No property groups found"
              description="Property groups allow you to organize related properties together (e.g. “Frame” group with “Size” and “Color” properties)."
              action={
                <AdminButton variant="primary" icon="add" onClick={handleAddGroup}>
                  Add Group
                </AdminButton>
              }
            />
          ) : (
            <AdminCard padding="p-0" className="overflow-hidden">
              {Object.keys(groupedGroupsByCategory).map((categoryId, catIdx) => (
                <div
                  key={categoryId}
                  className={catIdx > 0 ? 'border-t border-surface-container' : ''}
                >
                  <div className="bg-surface-container-low px-6 py-4 flex items-center gap-3 border-b border-surface-container">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                      category
                    </span>
                    <h3 className="text-[14px] font-bold text-on-surface tracking-tight">
                      {getCategoryName(categoryId)}
                    </h3>
                    <AdminBadge tone="neutral">
                      {groupedGroupsByCategory[categoryId].length}
                    </AdminBadge>
                  </div>
                  <div className="divide-y divide-surface-container">
                    {groupedGroupsByCategory[categoryId].map((group) => (
                      <div
                        key={group.id}
                        className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-surface-container-low/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="material-symbols-outlined text-primary text-[18px]">
                              layers
                            </span>
                            <h4 className="text-[15px] font-bold text-on-surface tracking-tight">
                              {group.display_name}
                            </h4>
                            <AdminBadge tone={group.is_active ? 'active' : 'pending'} dot>
                              {group.is_active ? 'Active' : 'Inactive'}
                            </AdminBadge>
                            <AdminBadge tone="info">
                              {group.properties_count || 0} properties
                            </AdminBadge>
                          </div>
                          <p className="text-[13px] text-on-surface-variant flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-1.5">
                              Name:
                              <code className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-mono text-[12px]">
                                {group.name}
                              </code>
                            </span>
                            <span>
                              Sort: <strong className="text-on-surface">{group.sort_order}</strong>
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEditGroup(group)}
                            title="Edit"
                            className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
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
        </>
      )}

      {/* Property Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AdminCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" padding="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-headline-md font-bold text-on-surface">
                {selectedProperty ? 'Edit Property' : 'Add New Property'}
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

            <form onSubmit={handleSaveProperty} className="space-y-5">
              <AdminSelect
                label="Category *"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                error={formErrors.category_id}
                options={[
                  { value: '', label: 'Select a category' },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />

              <AdminSelect
                label="Property Group (Optional)"
                name="property_group_id"
                value={formData.property_group_id}
                onChange={handleInputChange}
                hint="Assign this property to a group to organize related properties together."
                options={[
                  { value: '', label: 'No group (ungrouped)' },
                  ...(formData.category_id
                    ? groupsForCategory(formData.category_id).map((g) => ({
                        value: g.id,
                        label: g.display_name,
                      }))
                    : []),
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="Property Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., type"
                  error={formErrors.name}
                />
                <AdminInput
                  label="Display Name *"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Type"
                  error={formErrors.display_name}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Property description…"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-on-surface focus:ring-2 focus:ring-primary-container/40 transition-all resize-y"
                />
              </div>

              <AdminSelect
                label="Input Type"
                name="input_type"
                value={formData.input_type}
                onChange={handleInputChange}
                options={[
                  { value: 'select', label: 'Select (Dropdown)' },
                  { value: 'checkbox', label: 'Checkbox (Multiple)' },
                  { value: 'text', label: 'Text Input' },
                  { value: 'number', label: 'Number Input' },
                ]}
              />

              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_required"
                    checked={formData.is_required}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded accent-primary-container"
                  />
                  <span className="text-[14px] text-on-surface">Required</span>
                </label>
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
              </div>

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
                  icon={modalLoading ? 'progress_activity' : selectedProperty ? 'save' : 'add'}
                  disabled={modalLoading}
                >
                  {modalLoading
                    ? 'Saving…'
                    : selectedProperty
                    ? 'Update Property'
                    : 'Create Property'}
                </AdminButton>
              </div>
            </form>
          </AdminCard>
        </div>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AdminCard className="w-full max-w-xl max-h-[90vh] overflow-y-auto" padding="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">layers</span>
                {selectedGroup ? 'Edit Property Group' : 'Add New Property Group'}
              </h2>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  resetGroupForm();
                }}
                className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-5">
              <AdminSelect
                label="Category *"
                name="category_id"
                value={groupFormData.category_id}
                onChange={handleGroupInputChange}
                disabled={!!selectedGroup}
                error={groupFormErrors.category_id}
                options={[
                  { value: '', label: 'Select a category' },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="Group Name *"
                  name="name"
                  value={groupFormData.name}
                  onChange={handleGroupInputChange}
                  placeholder="e.g., frame"
                  error={groupFormErrors.name}
                />
                <AdminInput
                  label="Display Name *"
                  name="display_name"
                  value={groupFormData.display_name}
                  onChange={handleGroupInputChange}
                  placeholder="e.g., Frame"
                  error={groupFormErrors.display_name}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <AdminInput
                  label="Sort Order"
                  type="number"
                  name="sort_order"
                  value={groupFormData.sort_order}
                  onChange={handleGroupInputChange}
                  min="0"
                />
                <label className="flex items-center gap-3 cursor-pointer h-[46px]">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={groupFormData.is_active}
                    onChange={handleGroupInputChange}
                    className="w-5 h-5 rounded accent-primary-container"
                  />
                  <span className="text-[14px] text-on-surface">Active</span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-surface-container">
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowGroupModal(false);
                    resetGroupForm();
                  }}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  type="submit"
                  variant="primary"
                  icon={groupModalLoading ? 'progress_activity' : selectedGroup ? 'save' : 'add'}
                  disabled={groupModalLoading}
                >
                  {groupModalLoading
                    ? 'Saving…'
                    : selectedGroup
                    ? 'Update Group'
                    : 'Create Group'}
                </AdminButton>
              </div>
            </form>
          </AdminCard>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
