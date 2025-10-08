'use client';

import { useState, useEffect } from 'react';
import { productFilesAPI } from '../lib/api';

const ProductFiles = ({ productId, files: externalFiles, onRefresh }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If external files are provided, use them
    if (externalFiles) {
      console.log('🔧 ProductFiles: Using external files:', externalFiles.length);
      setFiles(externalFiles);
      setLoading(false);
      setError(null);
      return;
    }
    
    // Otherwise, load files internally
    if (productId) {
      loadProductFiles();
    }
  }, [productId, externalFiles]);

  const loadProductFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔧 ProductFiles: Loading files internally for product:', productId);
      
      const response = await productFilesAPI.getByProductId(productId);
      if (response.success) {
        // Filter only active files
        const activeFiles = (response.data || []).filter(file => file.is_active !== false);
        setFiles(activeFiles);
        console.log('✅ ProductFiles: Loaded', activeFiles.length, 'files');
      } else {
        console.log('⚠️ ProductFiles: API returned success=false');
        setFiles([]);
      }
    } catch (error) {
      console.error('❌ ProductFiles: Error loading files:', error);
      setError('Failed to load files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await productFilesAPI.download(fileId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Reload files to update download count
      await loadProductFiles();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      manual: 'fas fa-book',
      catalog: 'fas fa-book-open',
      specification: 'fas fa-clipboard-list',
      warranty: 'fas fa-shield-alt',
      installation: 'fas fa-tools',
      other: 'fas fa-file'
    };
    return icons[category] || icons.other;
  };

  const getCategoryColor = (category) => {
    const colors = {
      manual: '#3b82f6',
      catalog: '#10b981',
      specification: '#f59e0b',
      warranty: '#ef4444',
      installation: '#8b5cf6',
      other: '#6b7280'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
        <p>Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#dc2626'
      }}>
        <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
        <p>{error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <i className="fas fa-file-pdf" style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }}></i>
        <p>No downloadable files available for this product.</p>
      </div>
    );
  }

  // Group files by category
  const groupedFiles = files.reduce((acc, file) => {
    const category = file.file_category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(file);
    return acc;
  }, {});

  // Sort files within each category
  Object.keys(groupedFiles).forEach(category => {
    groupedFiles[category].sort((a, b) => {
      // Featured files first, then by sort order
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
  });

  return (
    <div className="product-files">
      
      

      <style jsx>{`
        .file-card {
          transition: all 0.3s ease;
        }
        .file-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default ProductFiles;