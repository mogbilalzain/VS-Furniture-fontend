'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { materialsAPI } from '../lib/api';

// Material Image Modal Component
const MaterialImageModal = ({ material, isOpen, onClose }) => {
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !material) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-[90vh] p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold z-10"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Material Info */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="text-xl font-bold text-gray-900">{material.code} - {material.name}</h3>
          {material.description && (
            <p className="text-gray-600 mt-2">{material.description}</p>
          )}
        </div>

        {/* Image Container */}
        <div className="bg-white rounded-lg p-4 max-h-[70vh] overflow-auto">
          {material.image_url ? (
            <img
              src={material.image_url}
              alt={`${material.code} - ${material.name}`}
              className="w-full h-auto max-w-full max-h-full object-contain rounded-lg"
              style={{ maxHeight: '60vh' }}
            />
          ) : material.color_hex ? (
            <div
              className="w-full h-96 rounded-lg border border-gray-200 flex items-center justify-center"
              style={{ backgroundColor: material.color_hex }}
            >
              <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg">
                <span className="text-gray-800 font-medium">{material.color_hex}</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No visual representation available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Material Swatch Component
const MaterialSwatch = ({ material, onImageClick }) => {
  const handleImageClick = useCallback((e) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(material);
    }
  }, [material, onImageClick]);

  return (
    <div className="relative transition-all duration-200">
      {/* Visual Representation */}
      <div className="relative w-42 h-16 overflow-hidden group">
        {/* Image display (priority) */}
        {material.image_url ? (
          <img
            src={material.image_url}
            alt={material.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to color if image fails to load
              if (material.color_hex) {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }
            }}
          />
        ) : null}
        
        {/* Color display (fallback or primary) */}
        <div
          className={`w-full h-full ${material.image_url ? 'hidden' : 'block'}`}
          style={{
            backgroundColor: material.color_hex || '#f3f4f6'
          }}
        />
        
        
        {/* Expand Icon - Show on hover if there's visual content */}
        {(material.image_url || material.color_hex) && (
          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={handleImageClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-1 hover:bg-opacity-100"
              title={`View ${material.code} details`}
              aria-label={`View ${material.code} details in full size`}
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Material Info */}
      <div className="p-2 text-center">
        <div className="text-xs font-medium text-gray-800 truncate">
          {material.code}
        </div>
        <div className="text-xs text-gray-600 truncate">
          {material.name}
        </div>
      </div>

    </div>
  );
};

// Material Group Component (Accordion)
const MaterialGroup = ({ group, onImageClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  }, [toggleOpen]);

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      {/* Group Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-label={`Toggle ${group.name} materials`}
      >
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-800">
            {group.name}
          </h4>
          {group.description && (
            <p className="text-sm text-gray-600 mt-1">
              {group.description}
            </p>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {group.materials.length} material{group.materials.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Expand/Collapse Icon */}
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Materials Grid */}
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {group.materials.map((material) => (
              <MaterialSwatch
                key={material.id}
                material={material}
                onImageClick={onImageClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Category Tab Component
const CategoryTab = ({ category, isActive, onClick }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  return (
    <button
      className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-gray-800 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="tab"
      aria-selected={isActive}
      aria-label={`Select ${category.name} category`}
    >
      <span className="block font-medium">
        {category.name}
      </span>
    </button>
  );
};

// Main Component
const ProductMaterialDetails = ({ productId }) => {
  const [productMaterialsByCategory, setProductMaterialsByCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedMaterialForModal, setSelectedMaterialForModal] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 ProductMaterialDetails: Fetching materials for product ID:', productId);

        if (!productId) {
          setError('Product ID is required');
          setLoading(false);
          return;
        }

        // Fetch only product materials - no need for all categories
        const productMaterialsResponse = await materialsAPI.getProductMaterials(productId);

        console.log('🎨 Product Materials Response:', productMaterialsResponse);

        if (productMaterialsResponse.success) {
          const materialsData = productMaterialsResponse.data.materials_by_category || [];
          setProductMaterialsByCategory(materialsData);
          
          // Set first category as selected by default if materials exist
          if (materialsData.length > 0) {
            setSelectedCategory({
              name: materialsData[0].category,
              materials: materialsData[0].materials
            });
          }
        } else {
          setError('No materials found for this product');
        }

      } catch (err) {
        console.error('❌ ProductMaterialDetails: Error fetching materials:', err);
        setError(err.message || 'Failed to fetch materials data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleImageClick = useCallback((material) => {
    setSelectedMaterialForModal(material);
    setShowImageModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowImageModal(false);
    setSelectedMaterialForModal(null);
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading materials...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
                Material Details
              </h2>
              <p className="text-red-500">
                Error loading materials: {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!productMaterialsByCategory || productMaterialsByCategory.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
              Material Details
            </h2>
            <p className="text-gray-500">
              No materials are currently assigned to this product.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gray-000">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
              Material Details
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive range of materials available for this product. 
              Choose from metal finishes, wood veneers, and laminate options to customize your furniture.
            </p>
          </div>

          {/* Category Tabs */}
          {productMaterialsByCategory.length > 1 && (
            <div className="flex flex-wrap justify-center gap-4 mb-8" role="tablist">
              {productMaterialsByCategory.map((categoryGroup, index) => (
                <CategoryTab
                  key={index}
                  category={{ name: categoryGroup.category }}
                  isActive={selectedCategory?.name === categoryGroup.category}
                  onClick={() => handleCategorySelect({
                    name: categoryGroup.category,
                    materials: categoryGroup.materials
                  })}
                />
              ))}
            </div>
          )}

          {/* Materials Display */}
          {selectedCategory && selectedCategory.materials && (
            <div role="tabpanel" aria-labelledby={`tab-${selectedCategory.name}`}>
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-xl font-medium text-gray-800 mb-6">
                  {selectedCategory.name} Materials
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {selectedCategory.materials.map((material) => (
                    <div 
                      key={material.id}
                      className="relative transition-all duration-200"
                    >
                      {/* Default Material Badge */}
                      {/* {material.is_default && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                          Default
                        </div>
                      )} */}
                      
                      <MaterialSwatch
                        material={material}
                        onImageClick={handleImageClick}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Material Image Modal */}
      <MaterialImageModal 
        material={selectedMaterialForModal}
        isOpen={showImageModal}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default ProductMaterialDetails;