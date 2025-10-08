import React, { useState, useEffect } from 'react';
import { propertiesAPI } from '../../lib/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TagIcon,
  ListBulletIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const PropertiesManager = ({ categoryId, categoryName, onClose }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProperty, setExpandedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  useEffect(() => {
    if (categoryId) {
      loadProperties();
    }
  }, [categoryId]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await propertiesAPI.getCategoryProperties(categoryId);
      
      if (response.success) {
        setProperties(response.data.properties || []);
      } else {
        setError('فشل في Download Properties');
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Error loading properties');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = () => {
    setEditingProperty(null);
    setShowPropertyModal(true);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowPropertyModal(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخاصية؟ سيتم حذف جميع قيمها أيضاً.')) {
      return;
    }

    try {
      const response = await propertiesAPI.deleteProperty(propertyId);
      
      if (response.success) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        alert('تم Delete Property بنجاح');
      } else {
        alert('فشل في Delete Property');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      alert('حدث خطأ في Delete Property');
    }
  };

  const handleCreateValue = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setEditingValue(null);
    setShowValueModal(true);
  };

  const handleEditValue = (value, propertyId) => {
    setSelectedPropertyId(propertyId);
    setEditingValue(value);
    setShowValueModal(true);
  };

  const handleDeleteValue = async (valueId) => {
    if (!confirm('هل أنت متأكد من حذف هذه Valuesة؟')) {
      return;
    }

    try {
      const response = await propertiesAPI.deletePropertyValue(valueId);
      
      if (response.success) {
        // Update القائمة محلياً
        setProperties(prev => prev.map(property => ({
          ...property,
          values: property.values.filter(v => v.id !== valueId)
        })));
        alert('تم حذف Valuesة بنجاح');
      } else {
        alert('فشل في حذف Valuesة');
      }
    } catch (err) {
      console.error('Error deleting value:', err);
      alert('حدث خطأ في حذف Valuesة');
    }
  };

  const togglePropertyExpansion = (propertyId) => {
    setExpandedProperty(expandedProperty === propertyId ? null : propertyId);
  };

  const getInputTypeIcon = (inputType) => {
    switch (inputType) {
      case 'checkbox':
        return '☑️';
      case 'radio':
        return '🔘';
      case 'select':
        return '📋';
      default:
        return '📝';
    }
  };

  const getInputTypeLabel = (inputType) => {
    const labels = {
      'checkbox': 'Multiple Choice',
      'radio': 'Single Choice',
      'select': 'Dropdown List',
      'text': 'نص',
      'number': 'رقم'
    };
    return labels[inputType] || inputType;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              إدارة خصائص Category: {categoryName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              إدارة Properties وValues الخاصة بهذه Category
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={loadProperties}
                className="text-red-700 underline hover:text-red-900 mt-2"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Add Property Button */}
          <div className="mb-6">
            <button
              onClick={handleCreateProperty}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New Property
            </button>
          </div>

          {/* Properties List */}
          {properties.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TagIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No Properties</p>
              <p className="text-sm">ابدأ بAdd New Property لهذه Category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Property Header */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <button
                        onClick={() => togglePropertyExpansion(property.id)}
                        className="mr-2 text-gray-500 hover:text-gray-700"
                      >
                        {expandedProperty === property.id ? (
                          <ChevronDownIcon className="w-4 h-4" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4" />
                        )}
                      </button>
                      
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getInputTypeIcon(property.input_type)}</span>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {property.display_name || property.name}
                            {property.is_required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getInputTypeLabel(property.input_type)} • {property.values?.length || 0} value
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCreateValue(property.id)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Add value"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditProperty(property)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit Property"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Property"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Property Values */}
                  {expandedProperty === property.id && (
                    <div className="p-4">
                      {property.description && (
                        <p className="text-sm text-gray-600 mb-4">{property.description}</p>
                      )}
                      
                      {property.values && property.values.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {property.values.map((value) => (
                            <div key={value.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">
                                  {value.display_name || value.value}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {value.product_count || 0} product
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={() => handleEditValue(value, property.id)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="تعديل"
                                >
                                  <PencilIcon className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteValue(value.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="حذف"
                                >
                                  <TrashIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <ListBulletIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No values for this property</p>
                          <button
                            onClick={() => handleCreateValue(property.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm mt-1"
                          >
                            Add New Value
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Property Modal */}
      {showPropertyModal && (
        <PropertyModal
          categoryId={categoryId}
          property={editingProperty}
          onClose={() => setShowPropertyModal(false)}
          onSave={() => {
            setShowPropertyModal(false);
            loadProperties();
          }}
        />
      )}

      {/* Value Modal */}
      {showValueModal && (
        <ValueModal
          propertyId={selectedPropertyId}
          value={editingValue}
          onClose={() => setShowValueModal(false)}
          onSave={() => {
            setShowValueModal(false);
            loadProperties();
          }}
        />
      )}
    </div>
  );
};

// Property Modal Component
const PropertyModal = ({ categoryId, property, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: property?.name || '',
    display_name: property?.display_name || '',
    display_name_ar: property?.display_name_ar || '',
    description: property?.description || '',
    input_type: property?.input_type || 'checkbox',
    is_required: property?.is_required || false,
    sort_order: property?.sort_order || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (property) {
        response = await propertiesAPI.updateProperty(property.id, formData);
      } else {
        response = await propertiesAPI.createProperty(categoryId, formData);
      }

      if (response.success) {
        alert(property ? 'تم Update الخاصية بنجاح' : 'Property created successfully');
        onSave();
      } else {
        alert('فشل في Save الخاصية');
      }
    } catch (err) {
      console.error('Error saving property:', err);
      alert('حدث خطأ في Save الخاصية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {property ? 'Edit Property' : 'Add New Property'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Name (English)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({...formData, display_name: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Type
            </label>
            <select
              value={formData.input_type}
              onChange={(e) => setFormData({...formData, input_type: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="checkbox">Multiple Choice</option>
              <option value="radio">Single Choice</option>
              <option value="select">Dropdown List</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (اختياري)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_required"
              checked={formData.is_required}
              onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="is_required" className="text-sm text-gray-700">
              Required Property
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Value Modal Component
const ValueModal = ({ propertyId, value, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    value: value?.value || '',
    display_name: value?.display_name || '',
    display_name_ar: value?.display_name_ar || '',
    sort_order: value?.sort_order || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (value) {
        response = await propertiesAPI.updatePropertyValue(value.id, formData);
      } else {
        response = await propertiesAPI.createPropertyValue(propertyId, formData);
      }

      if (response.success) {
        alert(value ? 'تم Update Valuesة بنجاح' : 'تم إنشاء Valuesة بنجاح');
        onSave();
      } else {
        alert('فشل في Save Valuesة');
      }
    } catch (err) {
      console.error('Error saving value:', err);
      alert('حدث خطأ في Save Valuesة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {value ? 'تعديل Valuesة' : 'Add New Value'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valuesة (بالإنجليزية)
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({...formData, display_name: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertiesManager;