import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ProductsGrid = ({ 
  products = [], 
  loading = false, 
  error = null,
  pagination = null,
  onPageChange,
  onSortChange,
  currentSort = 'name',
  className = ""
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'featured', label: 'Featured First' },
    { value: 'most_viewed', label: 'Most Viewed' },
  ];

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="mt-4 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Error loading products</h3>
          <p className="text-gray-600">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold mb-2 text-gray-600">No Products</h3>
          <p className="text-gray-500 mb-4">No products found matching current search criteria</p>
          <div className="text-sm text-gray-400">
            <p>Try:</p>
            <ul className="mt-2 space-y-1">
              <li>• Change search criteria</li>
              <li>• Remove some filters</li>
              <li>• Search in another category</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* شريط التحكم العلوي */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* Results info */}
        <div className="flex items-center gap-4">
          <p className="text-gray-600">
            {pagination && pagination.total ? (
              <>
                Showing of {Number(pagination.total)} products
                {/* Showing {((Number(pagination.current_page) - 1) * Number(pagination.per_page)) + 1} - {Math.min(Number(pagination.current_page) * Number(pagination.per_page), Number(pagination.total))} of {Number(pagination.total)} products */}
              </>
            ) : (
              `${products.length} products`
            )}
          </p>
        </div>

        {/* أدوات التحكم */}
        <div className="flex items-center gap-4">
          {/* نمط العرض */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* ترتيب Products */}
          <select
            value={currentSort}
            onChange={(e) => onSortChange && onSortChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* شبكة Products */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
      }>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            className={viewMode === 'list' ? 'flex' : ''}
          />
        ))}
      </div>

      {/* التنقل بين الصفحات */}
      {pagination && pagination.last_page > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2" dir="ltr">
            {/* الصفحة Previousة */}
            <button
              onClick={() => onPageChange && onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-4 h-4 mr-1" />
              Previous
            </button>

            {/* أرقام الصفحات */}
            <div className="flex space-x-1">
              {[...Array(Math.min(5, pagination.last_page))].map((_, index) => {
                let pageNumber;
                if (pagination.last_page <= 5) {
                  pageNumber = index + 1;
                } else if (pagination.current_page <= 3) {
                  pageNumber = index + 1;
                } else if (pagination.current_page >= pagination.last_page - 2) {
                  pageNumber = pagination.last_page - 4 + index;
                } else {
                  pageNumber = pagination.current_page - 2 + index;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange && onPageChange(pageNumber)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNumber === pagination.current_page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            {/* Next page */}
            <button
              onClick={() => onPageChange && onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronLeftIcon className="w-4 h-4 ml-1" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;