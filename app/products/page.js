'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';
import { categoriesAPI } from '../../lib/api';

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await categoriesAPI.getAll();
      console.log('Categories response:', response);
      
      if (response.success) {
        setCategories(response.data || []);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Error loading categories: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <span className="ml-3 text-gray-600">Loading categories...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-2">⚠️ {error}</div>
            <button
              onClick={loadCategories}
              className="text-red-700 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && categories.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 products-grid">
            {categories.map((category) => (
              <Link 
                key={category.id}
                href={`/products/category/${category.slug}`} 
                className="product-item block text-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg p-3 sm:p-4 lg:p-6 transition-transform duration-300 hover:scale-105 bg-white shadow-sm hover:shadow-md border border-gray-100"
              >
                <div className="product-image-container mb-3 sm:mb-4 lg:mb-6">
                  <Image
                    src={category.image_url || category.image || '/images/placeholder-product.jpg'}
                    alt={category.alt_text || category.name}
                    width={300}
                    height={200}
                    className="product-item-image mx-auto rounded-lg object-cover transition-shadow duration-300 w-full h-32 sm:h-40 lg:h-48"
                    onError={(e) => {
                      e.target.src = '/products/default-category.jpg';
                    }}
                  />
                </div>
                <div className="product-item-label text-gray-700 font-normal text-sm sm:text-base lg:text-lg leading-6 sm:leading-7">
                  {category.name}
                  {category.products_count > 0 && (
                    <span className="block text-xs text-gray-500 mt-1">
                      {category.products_count} products
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* No Categories Found */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">📂 No categories found</div>
            <p className="text-gray-400 mb-4">
              Categories will appear here once they are added to the system.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
} 