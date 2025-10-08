'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { materialsAPI } from '../../../../lib/api';
import { authStorage } from '../../../../lib/localStorage-utils';

export default function MaterialGroupsAdmin() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  // Fetch groups and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [groupsResponse, categoriesResponse] = await Promise.all([
        materialsAPI.admin.getGroups(),
        materialsAPI.admin.getCategories()
      ]);
      
      console.log('📦 Groups Response:', groupsResponse);
      console.log('📦 Categories Response:', categoriesResponse);
      
      if (groupsResponse.success) {
        setGroups(groupsResponse.data);
      } else {
        setError(groupsResponse.message || 'Failed to fetch groups');
      }
      
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.filter(cat => cat.is_active));
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
    setEditingGroup(null);
    setFormData({
      category_id: categories.length > 0 ? categories[0].id : '',
      name: '',
      description: '',
      sort_order: groups.length + 1,
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      category_id: group.category_id || '',
      name: group.name || '',
      description: group.description || '',
      sort_order: group.sort_order || 0,
      is_active: group.is_active !== undefined ? group.is_active : true
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
      
      let response;
      if (editingGroup) {
        response = await materialsAPI.admin.updateGroup(editingGroup.id, formData);
      } else {
        response = await materialsAPI.admin.createGroup(formData);
      }
      
      if (response.success) {
        setShowModal(false);
        fetchData();
        alert(editingGroup ? 'Group updated successfully!' : 'Group created successfully!');
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (err) {
      console.error('❌ Error saving group:', err);
      setError(err.message || 'An error occurred while saving the group');
    }
  };

  const handleDelete = async (group) => {
    if (!confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
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

      const response = await materialsAPI.admin.deleteGroup(group.id);
      
      if (response.success) {
        fetchData();
        alert('Group deleted successfully!');
      } else {
        alert(response.message || 'Failed to delete group');
      }
    } catch (err) {
      console.error('❌ Error deleting group:', err);
      alert(err.message || 'An error occurred while deleting the group');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGroup(null);
    setError('');
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading groups...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Material Groups</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage material groups within categories (Group M1, Group F1, etc.)
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={categories.length === 0}
            >
              Add New Group
            </button>
          </div>
          
          {categories.length === 0 && (
            <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p>Please create at least one material category before adding groups.</p>
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

          {/* Groups Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              {groups.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No groups found.</p>
                  {categories.length > 0 && (
                    <button
                      onClick={handleAdd}
                      className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Create Your First Group
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Group Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sort Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Materials
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groups.map((group) => (
                        <tr key={group.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{group.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{getCategoryName(group.category_id)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate" title={group.description}>
                              {group.description || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{group.sort_order}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              group.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {group.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{group.materials_count || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(group)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(group)}
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingGroup ? 'Edit Group' : 'Add New Group'}
              </h3>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    name="category_id"
                    required
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Group M1 Metals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe this material group..."
                  />
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
                    {editingGroup ? 'Update' : 'Create'}
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