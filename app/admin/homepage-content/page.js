'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api';

const HomepageContentManager = () => {
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState([]);
  const [selectedSection, setSelectedSection] = useState('real_spaces');
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    section: 'real_spaces',
    type: 'video',
    title: '',
    description: '',
    video_url: '',
    link_url: '',
    is_active: true
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);

  const sections = [
    { value: 'real_spaces', label: 'REAL SPACES, REAL STORIES' },
    { value: 'hero', label: 'Hero Section' },
    { value: 'what_we_do', label: 'What We Do' },
    { value: 'projects', label: 'Projects' },
    { value: 'trusted_logos', label: 'Trusted Logos' }
  ];

  const contentTypes = [
    { value: 'video', label: 'Video' },
    { value: 'image', label: 'Image' },
    { value: 'text', label: 'Text' }
  ];

  useEffect(() => {
    fetchContents();
  }, [selectedSection]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/homepage-content?section=${selectedSection}`);
      if (response.success) {
        setContents(response.data);
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      let submitData = { ...formData };
      
      // Upload video file if selected
      if (selectedVideoFile) {
        const uploadedVideoUrl = await handleVideoUpload(selectedVideoFile);
        if (uploadedVideoUrl) {
          submitData.video_url = uploadedVideoUrl;
        } else {
          setLoading(false);
          return; // Stop if video upload failed
        }
      }

      let response;
      if (editingContent) {
        response = await apiClient.put(`/admin/homepage-content/${editingContent.id}`, submitData);
      } else {
        response = await apiClient.post('/admin/homepage-content', submitData);
      }

      if (response.success) {
        setShowModal(false);
        setEditingContent(null);
        resetForm();
        fetchContents();
        alert(editingContent ? 'Content updated successfully!' : 'Content created successfully!');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      section: content.section,
      type: content.type,
      title: content.title,
      description: content.description || '',
      video_url: content.video_url || '',
      link_url: content.link_url || '',
      is_active: content.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await apiClient.delete(`/admin/homepage-content/${id}`);
      if (response.success) {
        fetchContents();
        alert('Content deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content. Please try again.');
    }
  };

  const handleToggleActive = async (content) => {
    try {
      const response = await apiClient.put(`/admin/homepage-content/${content.id}`, {
        is_active: !content.is_active
      });
      if (response.success) {
        fetchContents();
      }
    } catch (error) {
      console.error('Error updating content status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      section: selectedSection,
      type: 'video',
      title: '',
      description: '',
      video_url: '',
      link_url: '',
      is_active: true
    });
    setSelectedVideoFile(null);
  };

  const handleVideoUpload = async (file) => {
    if (!file) return null;

    try {
      setUploadingVideo(true);
      const formData = new FormData();
      formData.append('video', file);

      const response = await apiClient.postFormData('/admin/homepage-content/upload-video', formData);
      
      if (response.success) {
        return response.data.url;
      } else {
        throw new Error('Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
      return null;
    } finally {
      setUploadingVideo(false);
    }
  };

  const openAddModal = () => {
    setEditingContent(null);
    resetForm();
    setShowModal(true);
  };

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Homepage Content Management</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Content
        </button>
      </div>

      {/* Section Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Section:
        </label>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-64"
        >
          {sections.map((section) => (
            <option key={section.value} value={section.value}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contents.map((content) => (
              <tr key={content.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {content.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {content.description?.substring(0, 50)}...
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {content.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {content.type === 'video' && content.video_id && (
                    <img
                      src={`https://img.youtube.com/vi/${content.video_id}/mqdefault.jpg`}
                      alt={content.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                  {content.type === 'image' && content.thumbnail && (
                    <img
                      src={content.thumbnail_url}
                      alt={content.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(content)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      content.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {content.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(content)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(content.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {contents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No content found in this section
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingContent ? 'Edit Content' : 'Add New Content'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  {sections.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                />
              </div>

              {formData.type === 'video' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video URL (YouTube)
                    </label>
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {formData.video_url && extractYouTubeId(formData.video_url) && (
                      <div className="mt-2">
                        <img
                          src={`https://img.youtube.com/vi/${extractYouTubeId(formData.video_url)}/mqdefault.jpg`}
                          alt="Video preview"
                          className="w-32 h-24 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center text-gray-500 text-sm">OR</div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Video File
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setSelectedVideoFile(e.target.files[0])}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {selectedVideoFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        Selected file: {selectedVideoFile.name}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-gray-500">
                      Max size: 50MB. Supported formats: MP4, MOV, AVI, WMV
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingVideo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadingVideo ? 'Uploading Video...' : loading ? 'Saving...' : (editingContent ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageContentManager;
