'use client';

import React, { useState, useEffect } from 'react';
import { materialsAPI } from '../../lib/api';
import { authStorage } from '../../lib/localStorage-utils';

const ProductMaterialsManager = ({ productId, onClose }) => {
  const [productMaterials, setProductMaterials] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [productMaterialsResponse, categoriesResponse] = await Promise.all([
        materialsAPI.getProductMaterials(productId),
        materialsAPI.getCategories()
      ]);

      console.log('📦 Product Materials Response:', productMaterialsResponse);
      console.log('📦 Categories Response:', categoriesResponse);

      if (productMaterialsResponse.success) {
        const materialsData = productMaterialsResponse.data.materials_by_category || [];
        const allMaterials = [];
        materialsData.forEach(category => {
          allMaterials.push(...category.materials);
        });
        setProductMaterials(allMaterials);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [productId]);

  // Fetch available materials when category/group changes
  useEffect(() => {
    const fetchAvailableMaterials = async () => {
      if (!selectedCategory) return;

      try {
        const filters = { category_id: selectedCategory };
        if (selectedGroup) {
          filters.group_id = selectedGroup;
        }

        const response = await materialsAPI.getMaterials(filters);
        if (response.success) {
          // Filter out materials already assigned to this product
          const assignedMaterialIds = productMaterials.map(m => m.id);
          const available = response.data.filter(m => !assignedMaterialIds.includes(m.id));
          setAvailableMaterials(available);
        }
      } catch (err) {
        console.error('❌ Error fetching available materials:', err);
      }
    };

    fetchAvailableMaterials();
  }, [selectedCategory, selectedGroup, productMaterials]);

  const handleAddMaterials = async () => {
    if (selectedMaterials.length === 0) {
      alert('Please select at least one material');
      return;
    }

    try {
      const token = authStorage.getToken();
      if (!token) {
        alert('Authentication required');
        return;
      }

      setError('');

      // Add each selected material
      for (const materialId of selectedMaterials) {
        await materialsAPI.admin.assignMaterialToProduct(productId, {
          material_id: materialId,
          is_default: productMaterials.length === 0 && selectedMaterials[0] === materialId
        });
      }

      setShowAddModal(false);
      setSelectedMaterials([]);
      fetchData();
      alert(`${selectedMaterials.length} material(s) added successfully!`);
    } catch (err) {
      console.error('❌ Error adding materials:', err);
      setError(err.message || 'Failed to add materials');
    }
  };

  const handleRemoveMaterial = async (materialId) => {
    if (!confirm('Are you sure you want to remove this material from the product?')) {
      return;
    }

    try {
      const token = authStorage.getToken();
      if (!token) {
        alert('Authentication required');
        return;
      }

      await materialsAPI.admin.removeMaterialFromProduct(productId, materialId);
      fetchData();
      alert('Material removed successfully!');
    } catch (err) {
      console.error('❌ Error removing material:', err);
      alert(err.message || 'Failed to remove material');
    }
  };

  const handleSetDefault = async (materialId) => {
    try {
      const token = authStorage.getToken();
      if (!token) {
        alert('Authentication required');
        return;
      }

      await materialsAPI.admin.setDefaultMaterial(productId, materialId);
      fetchData();
      alert('Default material updated successfully!');
    } catch (err) {
      console.error('❌ Error setting default material:', err);
      alert(err.message || 'Failed to set default material');
    }
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id.toString() === selectedCategory);
  };

  const getAvailableGroups = () => {
    const category = getSelectedCategory();
    return category ? category.groups || [] : [];
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading materials...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-gray-900">
              Manage Product Materials
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Materials
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Current Materials */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Current Materials ({productMaterials.length})
            </h4>
            
            {productMaterials.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No materials assigned to this product yet.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add First Material
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productMaterials.map((material) => (
                  <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Material Preview */}
                        <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                          {material.image_url ? (
                            <img 
                              src={material.image_url} 
                              alt={material.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (material.color_hex) {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full ${material.image_url ? 'hidden' : 'block'}`}
                            style={{ backgroundColor: material.color_hex || '#f3f4f6' }}
                          />
                        </div>
                        
                        {/* Material Info */}
                        <div>
                          <div className="font-medium text-gray-900">{material.code}</div>
                          <div className="text-sm text-gray-500">{material.name}</div>
                          <div className="text-xs text-gray-400">{material.group?.name}</div>
                          {material.is_default && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-1">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col space-y-1">
                        {!material.is_default && (
                          <button
                            onClick={() => handleSetDefault(material.id)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMaterial(material.id)}
                          className="text-red-600 hover:text-red-900 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Materials Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Materials to Product</h3>
            
            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedGroup('');
                  setSelectedMaterials([]);
                }}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Group Selection */}
            {selectedCategory && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Group (Optional)</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setSelectedMaterials([]);
                  }}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All groups</option>
                  {getAvailableGroups().map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Available Materials */}
            {selectedCategory && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Materials ({availableMaterials.length})
                </label>
                
                {availableMaterials.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No available materials in this category/group.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {availableMaterials.map((material) => (
                      <div
                        key={material.id}
                        className={`border rounded-lg p-2 cursor-pointer transition-all ${
                          selectedMaterials.includes(material.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedMaterials(prev => 
                            prev.includes(material.id)
                              ? prev.filter(id => id !== material.id)
                              : [...prev, material.id]
                          );
                        }}
                      >
                        <div className="flex flex-col items-center">
                          {/* Material Preview */}
                          <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden mb-2">
                            {material.image_url ? (
                              <img 
                                src={material.image_url} 
                                alt={material.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  if (material.color_hex) {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full ${material.image_url ? 'hidden' : 'block'}`}
                              style={{ backgroundColor: material.color_hex || '#f3f4f6' }}
                            />
                          </div>
                          
                          {/* Material Info */}
                          <div className="text-center">
                            <div className="text-xs font-medium text-gray-900">{material.code}</div>
                            <div className="text-xs text-gray-500 truncate w-full">{material.name}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected Materials Summary */}
            {selectedMaterials.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Selected {selectedMaterials.length} material(s)
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCategory('');
                  setSelectedGroup('');
                  setSelectedMaterials([]);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMaterials}
                disabled={selectedMaterials.length === 0}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Selected Materials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMaterialsManager;