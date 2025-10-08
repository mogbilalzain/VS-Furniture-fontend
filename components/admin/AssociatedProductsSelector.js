'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';

const AssociatedProductsSelector = ({ 
  products = [], 
  selectedProductIds = [], 
  onProductToggle,
  onProductReorder,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSelected, setShowSelected] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [draggedItem, setDraggedItem] = useState(null);

  // استخراج الفئات المتاحة
  const availableCategories = useMemo(() => {
    const categories = products
      .filter(product => product.category?.name)
      .map(product => product.category.name);
    return [...new Set(categories)].sort();
  }, [products]);

  // فلترة المنتجات حسب البحث والفئة
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // تطبيق البحث المحسن
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const name = product.name.toLowerCase();
        const category = product.category?.name?.toLowerCase() || '';
        const model = product.model?.toLowerCase() || '';
        
        return name.includes(query) || 
               category.includes(query) || 
               model.includes(query) ||
               // البحث في الكلمات المفصولة
               query.split(' ').every(word => 
                 name.includes(word) || category.includes(word) || model.includes(word)
               );
      });
    }

    // تطبيق فلتر الفئة
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category?.name === selectedCategory);
    }

    // عرض المنتجات المحددة فقط
    if (showSelected) {
      filtered = filtered.filter(product => selectedProductIds.includes(product.id));
    }

    // ترتيب النتائج: المنتجات المحددة أولاً
    return filtered.sort((a, b) => {
      const aSelected = selectedProductIds.includes(a.id);
      const bSelected = selectedProductIds.includes(b.id);
      
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      
      // ثم ترتيب حسب الاسم
      return a.name.localeCompare(b.name);
    });
  }, [products, searchQuery, selectedCategory, showSelected, selectedProductIds]);

  const selectedProducts = products.filter(product => selectedProductIds.includes(product.id));

  const handleSelectAll = () => {
    const filteredIds = filteredProducts.map(product => product.id);
    const allSelected = filteredIds.every(id => selectedProductIds.includes(id));
    
    if (allSelected) {
      // إلغاء تحديد جميع المنتجات المفلترة
      filteredIds.forEach(id => {
        if (selectedProductIds.includes(id)) {
          onProductToggle(id);
        }
      });
    } else {
      // تحديد جميع المنتجات المفلترة
      filteredIds.forEach(id => {
        if (!selectedProductIds.includes(id)) {
          onProductToggle(id);
        }
      });
    }
  };

  const clearSelection = () => {
    selectedProductIds.forEach(id => onProductToggle(id));
  };

  const handleDragStart = (e, productId) => {
    e.dataTransfer.setData('text/plain', productId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(productId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetProductId) => {
    e.preventDefault();
    const draggedProductId = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (draggedProductId !== targetProductId && onProductReorder) {
      const currentIndex = selectedProductIds.indexOf(draggedProductId);
      const targetIndex = selectedProductIds.indexOf(targetProductId);
      
      if (currentIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...selectedProductIds];
        newOrder.splice(currentIndex, 1);
        newOrder.splice(targetIndex, 0, draggedProductId);
        onProductReorder(newOrder);
      }
    }
    setDraggedItem(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* عنوان ومؤشرات */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Associated Products
          </h3>
          <p className="text-sm text-gray-600">
            {selectedProductIds.length} of {products.length} products selected
          </p>
        </div>
        
        {selectedProductIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSelected(!showSelected)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                showSelected 
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showSelected ? 'Show All' : 'Show Selected'}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {availableCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {filteredProducts.every(product => selectedProductIds.includes(product.id)) ? 'Deselect All' : 'Select All'}
          </button>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* المنتجات المحددة */}
      {selectedProducts.length > 0 && !showSelected && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-900">
              Selected Products ({selectedProducts.length})
            </h4>
            {onProductReorder && selectedProducts.length > 1 && (
              <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                Drag to reorder
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedProductIds.map((productId, index) => {
              const product = products.find(p => p.id === productId);
              if (!product) return null;
              
              return (
                <div
                  key={product.id}
                  draggable={onProductReorder && selectedProducts.length > 1}
                  onDragStart={(e) => handleDragStart(e, product.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, product.id)}
                  className={`inline-flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm shadow-sm transition-all ${
                    onProductReorder && selectedProducts.length > 1 
                      ? 'cursor-move hover:shadow-md hover:border-blue-300' 
                      : ''
                  } ${
                    draggedItem === product.id 
                      ? 'opacity-50 scale-95 shadow-lg' 
                      : ''
                  }`}
                >
                  {onProductReorder && selectedProducts.length > 1 && (
                    <div className="text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs text-gray-500 font-mono min-w-[1.5rem]">
                    {index + 1}
                  </span>
                  {(product.image_url || product.image) && (
                    <Image
                      src={product.image_url || product.image}
                      alt={product.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 object-cover rounded"
                    />
                  )}
                  <span className="text-gray-900 font-medium">{product.name}</span>
                  <button
                    type="button"
                    onClick={() => onProductToggle(product.id)}
                    className="text-blue-600 hover:text-blue-800 ml-1 p-1 hover:bg-blue-100 rounded transition-colors"
                    title="Remove from selection"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* قائمة المنتجات */}
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="max-h-80 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  
                  return (
                    <label
                      key={product.id}
                      className={`relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onProductToggle(product.id)}
                        className="absolute top-2 right-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      {/* صورة المنتج */}
                      <div className="flex justify-center mb-2">
                        {(product.image_url || product.image) ? (
                          <Image
                            src={product.image_url || product.image}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* معلومات المنتج */}
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 truncate" title={product.name}>
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate" title={product.category?.name}>
                          {product.category?.name || 'Uncategorized'}
                        </p>
                        {product.model && (
                          <p className="text-xs text-gray-400 truncate mt-1" title={`Model: ${product.model}`}>
                            {product.model}
                          </p>
                        )}
                      </div>
                      
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600 bg-opacity-10 rounded-lg pointer-events-none">
                          <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {selectedProductIds.indexOf(product.id) + 1}
                            </span>
                          </div>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  
                  return (
                    <label
                      key={product.id}
                      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 hover:bg-blue-100' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onProductToggle(product.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="ml-3 flex items-center space-x-3 flex-1 min-w-0">
                        {/* صورة المنتج */}
                        <div className="flex-shrink-0">
                          {(product.image_url || product.image) ? (
                            <Image
                              src={product.image_url || product.image}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* معلومات المنتج */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {product.category?.name || 'Uncategorized'}
                              </p>
                              {product.model && (
                                <p className="text-xs text-gray-400 truncate">
                                  Model: {product.model}
                                </p>
                              )}
                            </div>
                            
                            {isSelected && (
                              <div className="flex-shrink-0 ml-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  #{selectedProductIds.indexOf(product.id) + 1}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )
          ) : (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedCategory ? 'Try adjusting your search criteria.' : 'No products available.'}
              </p>
              {(searchQuery || selectedCategory) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                  }}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-500"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* إحصائيات محسنة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            Showing {filteredProducts.length} of {products.length} products
          </span>
          {searchQuery && (
            <span className="text-blue-600">
              Search: "{searchQuery}"
            </span>
          )}
          {selectedCategory && (
            <span className="text-green-600">
              Category: {selectedCategory}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {selectedProductIds.length > 0 && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              {selectedProductIds.length} selected
            </span>
          )}
          <span className="text-gray-400">
            {availableCategories.length} categories
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssociatedProductsSelector;
