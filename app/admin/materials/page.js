'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { materialsAPI } from '../../../lib/api';
import { authStorage } from '../../../lib/localStorage-utils';

export default function MaterialsAdmin() {
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    group_id: '',
    code: '',
    name: '',
    description: '',
    color_hex: '',
    image_url: '',
    sort_order: 0,
    is_active: true
  });

  // Fetch materials, groups, and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [materialsResponse, groupsResponse, categoriesResponse] = await Promise.all([
        materialsAPI.admin.getMaterials(),
        materialsAPI.admin.getGroups(),
        materialsAPI.admin.getCategories()
      ]);
      
      console.log('📦 Materials Response:', materialsResponse);
      console.log('📦 Groups Response:', groupsResponse);
      console.log('📦 Categories Response:', categoriesResponse);
      
      if (materialsResponse.success) {
        setMaterials(materialsResponse.data);
      } else {
        setError(materialsResponse.message || 'Failed to fetch materials');
      }
      
      if (groupsResponse.success) {
        setGroups(groupsResponse.data.filter(group => group.is_active));
      }
      
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    const token = authStorage.getToken();
    const isAdminAuth = authStorage.isAuthenticatedAdmin();
    
    if (!token || !isAdminAuth) {
      router.push('/admin/login');
      return;
    }

    fetchData();
  }, [router]);

  const handleAdd = () => {
    setEditingMaterial(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      group_id: groups.length > 0 ? groups[0].id : '',
      code: '',
      name: '',
      description: '',
      color_hex: '',
      image_url: '',
      sort_order: materials.length + 1,
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      group_id: material.group_id || '',
      code: material.code || '',
      name: material.name || '',
      description: material.description || '',
      color_hex: material.color_hex || '',
      image_url: material.image_url || '',
      sort_order: material.sort_order || 0,
      is_active: material.is_active !== undefined ? material.is_active : true
    });
    setShowModal(true);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    try {
      setUploadingImage(true);
      
      const formDataUpload = new FormData();
      formDataUpload.append('image', imageFile);
      
      const response = await materialsAPI.admin.uploadMaterialImage(formDataUpload);
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          image_url: response.data.image_url
        }));
        setImagePreview(response.data.image_url);
        alert('Image uploaded successfully!');
      } else {
        alert(response.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('❌ Error uploading image:', err);
      alert(err.message || 'An error occurred while uploading the image');
    } finally {
      setUploadingImage(false);
    }
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

      // Validate that at least color or image is provided
      if (!formData.color_hex && !formData.image_url) {
        setError('Either color hex or image must be provided');
        return;
      }

      setError('');
      
      let response;
      if (editingMaterial) {
        response = await materialsAPI.admin.updateMaterial(editingMaterial.id, formData);
      } else {
        response = await materialsAPI.admin.createMaterial(formData);
      }
      
      if (response.success) {
        setShowModal(false);
        fetchData();
        alert(editingMaterial ? 'Material updated successfully!' : 'Material created successfully!');
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (err) {
      console.error('❌ Error saving material:', err);
      setError(err.message || 'An error occurred while saving the material');
    }
  };

  const handleDelete = async (material) => {
    if (!confirm(`Are you sure you want to delete "${material.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = authStorage.getToken();
      const isAdminAuth = authStorage.isAuthenticatedAdmin();
      
      if (!token || !isAdminAuth) {
        alert('Authentication required. Please login again.');
        router.push('/admin/login');
        return;
      }

      const response = await materialsAPI.admin.deleteMaterial(material.id);
      
      if (response.success) {
        fetchData();
        alert('Material deleted successfully!');
      } else {
        alert(response.message || 'Failed to delete material');
      }
    } catch (err) {
      console.error('❌ Error deleting material:', err);
      alert(err.message || 'An error occurred while deleting the material');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setImageFile(null);
    setImagePreview(null);
    setError('');
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown';
  };

  const getCategoryName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return 'Unknown';
    
    const category = categories.find(cat => cat.id === group.category_id);
    return category ? category.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage individual materials with colors and images (M030, F010, L027, etc.)
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={groups.length === 0}
            >
              Add New Material
            </button>
          </div>
          
          {groups.length === 0 && (
            <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p>Please create at least one material group before adding materials.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Materials Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              {materials.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No materials found.</p>
                  {groups.length > 0 && (
                    <button
                      onClick={handleAdd}
                      className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Create Your First Material
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preview
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code & Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Group & Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sort
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Products
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {materials.map((material) => (
                        <tr key={material.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden">
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{material.code}</div>
                            <div className="text-sm text-gray-500">{material.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{getGroupName(material.group_id)}</div>
                            <div className="text-sm text-gray-500">{getCategoryName(material.group_id)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate" title={material.description}>
                              {material.description || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              material.image_url 
                                ? 'bg-purple-100 text-purple-800' 
                                : material.color_hex 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {material.image_url && material.color_hex ? 'Both' : material.image_url ? 'Image' : material.color_hex ? 'Color' : 'None'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{material.sort_order}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              material.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {material.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{material.products_count || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(material)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(material)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </h3>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group *</label>
                  <select
                    name="group_id"
                    required
                    value={formData.group_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({getCategoryName(group.id)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Code *</label>
                  <input
                    type="text"
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., M030"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., terra grey"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe this material..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Color Hex</label>
                  <div className="mt-1 flex">
                    <input
                      type="color"
                      name="color_hex"
                      value={formData.color_hex}
                      onChange={handleInputChange}
                      className="h-10 w-16 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      name="color_hex"
                      value={formData.color_hex}
                      onChange={handleInputChange}
                      className="flex-1 border border-gray-300 rounded-r-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="#8B8680"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">6-digit hex color code</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Material Image</label>
                  <div className="mt-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    
                    {imageFile && (
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={uploadingImage}
                        className="bg-green-500 hover:bg-green-700 text-white text-sm py-1 px-3 rounded disabled:opacity-50"
                      >
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </button>
                    )}
                    
                    {(imagePreview || formData.image_url) && (
                      <div className="mt-2">
                        <img
                          src={imagePreview || formData.image_url}
                          alt="Preview"
                          className="w-16 h-16 object-cover border border-gray-300 rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                  <input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {editingMaterial ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}