import React, { useState, useEffect } from 'react';
import { productFilesAPI } from '../../lib/api';
import { 
  DocumentIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CloudArrowUpIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ProductFilesManager = ({ productId, productName, onClose }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (productId) {
      loadFiles();
    }
  }, [productId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productFilesAPI.getProductFiles(productId);
      
      if (response.success) {
        setFiles(response.data || []);
      } else {
        setError('Failed to load product files');
      }
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Error loading files');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      return;
    }

    try {
      const response = await productFilesAPI.deleteFile(productId, fileId);
      
      if (response.success) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        alert('تم Delete File بنجاح');
      } else {
        alert('فشل في Delete File');
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('حدث خطأ في Delete File');
    }
  };

  const handleEditFile = (file) => {
    setEditingFile(file);
    setShowEditModal(true);
  };

  const handleDownloadFile = (file) => {
    const downloadUrl = productFilesAPI.getDownloadUrl(productId, file.id);
    window.open(downloadUrl, '_blank');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Not specified';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (category) => {
    const icons = {
      'catalog': '📋',
      'manual': '📖',
      'specs': '📊',
      'warranty': '🛡️',
      'certificate': '🏆',
      'drawing': '📐',
    };
    return icons[category] || '📄';
  };

  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      'catalog': 'Product Catalog',
      'manual': 'User Manual',
      'specs': 'Technical Specifications',
      'warranty': 'Product Warranty',
      'certificate': 'Quality Certificates',
      'drawing': 'Technical Drawings',
      'other': 'Other Files',
    };
    return categoryNames[category] || 'PDF File';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
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
              Manage Product Files: {productName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              رفع وإدارة ملفات PDF الخاصة بالproduct
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
                onClick={loadFiles}
                className="text-red-700 underline hover:text-red-900 mt-2"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Upload Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Upload New File
            </button>
          </div>

          {/* Files List */}
          {files.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No Files</p>
              <p className="text-sm">ابدأ برفع PDF File للproduct</p>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">{getFileIcon(file.file_category)}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-gray-800 truncate">
                            {file.display_name}
                          </h3>
                          {file.is_featured && (
                            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-4" dir="ltr">
                          <span>{getCategoryDisplayName(file.file_category)}</span>
                          <span>•</span>
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            {file.download_count || 0} Download
                          </span>
                        </div>
                        
                        {file.description && (
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {file.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditFile(file)}
                        className="text-green-600 hover:text-green-800 p-2"
                        title="تعديل"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="حذف"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Total Files: {files.length} • إجمالي الDownloadات: {files.reduce((sum, file) => sum + (file.download_count || 0), 0)}
          </div>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUploadModal
          productId={productId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            loadFiles();
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingFile && (
        <FileEditModal
          productId={productId}
          file={editingFile}
          onClose={() => {
            setShowEditModal(false);
            setEditingFile(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingFile(null);
            loadFiles();
          }}
        />
      )}
    </div>
  );
};

// File Upload Modal
const FileUploadModal = ({ productId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    file: null,
    display_name: '',
    description: '',
    file_category: 'other',
    is_featured: false,
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        file: file,
        display_name: formData.display_name || file.name.replace('.pdf', ''),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      alert('يرجى اختيار PDF File');
      return;
    }

    setLoading(true);

    try {
      const response = await productFilesAPI.uploadFile(productId, formData);
      
      if (response.success) {
        alert('تم Upload File بنجاح');
        onSuccess();
      } else {
        alert('فشل في Upload File');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('حدث خطأ في Upload File');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Upload New File</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDF File
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Maximum: 10MB</p>
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
              File Category
            </label>
            <select
              value={formData.file_category}
              onChange={(e) => setFormData({...formData, file_category: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="catalog">Product Catalog</option>
              <option value="manual">User Manual</option>
              <option value="specs">Technical Specifications</option>
              <option value="warranty">Product Warranty</option>
              <option value="certificate">Quality Certificates</option>
              <option value="drawing">Technical Drawings</option>
              <option value="other">أخرى</option>
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
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="is_featured" className="text-sm text-gray-700">
              ملف Featured
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
              {loading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// File Edit Modal
const FileEditModal = ({ productId, file, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    display_name: file.display_name || '',
    description: file.description || '',
    file_category: file.file_category || 'other',
    is_featured: file.is_featured || false,
    is_active: file.is_active !== undefined ? file.is_active : true,
    sort_order: file.sort_order || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await productFilesAPI.updateFile(productId, file.id, formData);
      
      if (response.success) {
        alert('تم Update الملف بنجاح');
        onSuccess();
      } else {
        alert('فشل في Update الملف');
      }
    } catch (err) {
      console.error('Error updating file:', err);
      alert('حدث خطأ في Update الملف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">تعديل معلومات الملف</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              File Category
            </label>
            <select
              value={formData.file_category}
              onChange={(e) => setFormData({...formData, file_category: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="catalog">Product Catalog</option>
              <option value="manual">User Manual</option>
              <option value="specs">Technical Specifications</option>
              <option value="warranty">Product Warranty</option>
              <option value="certificate">Quality Certificates</option>
              <option value="drawing">Technical Drawings</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
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

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="is_featured" className="text-sm text-gray-700">
                ملف Featured
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                متاح للDownload
              </label>
            </div>
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
              {loading ? 'Saving...' : 'Save التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFilesManager;