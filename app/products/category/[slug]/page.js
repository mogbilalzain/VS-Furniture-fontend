'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import PropertiesFilter from '../../../../components/PropertiesFilter';
import ProductsGrid from '../../../../components/ProductsGrid';
import ProductFilters from '../../../../components/ProductFilters';
import { categoriesAPI, productsAPI, propertiesAPI } from '../../../../lib/api';

export default function CategoryProducts() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll for sticky control bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      // Fixed threshold - adjust this value based on your hero sections height
      const threshold = 1000; // Approximately where control bar should become sticky
      const shouldBeSticky = currentScrollY >= threshold;
      
      // console.log('Scroll Position:', currentScrollY, 'Threshold:', threshold, 'Should be sticky:', shouldBeSticky);
      
      // Always set the state based on current scroll position
      setIsScrolled(shouldBeSticky);
    };

    if (category) {
      // Reset state when category changes
      setIsScrolled(false);
      
      // Add scroll listener
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // Check initial position
      handleScroll();

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [category]);

  // استخراج المعاملات من URL
  useEffect(() => {
    const filters = {};
    const urlParams = new URLSearchParams(searchParams.toString());
    
    // استخراج الفلاتر من URL
    for (const [key, value] of urlParams.entries()) {
      if (key.endsWith('[]')) {
        const propertyName = key.slice(0, -2);
        if (!filters[propertyName]) {
          filters[propertyName] = [];
        }
        filters[propertyName].push(parseInt(value));
      }
    }
    
    setSelectedFilters(filters);
    setSearchQuery(urlParams.get('search') || '');
    setSortBy(urlParams.get('sort') || 'name');
    setCurrentPage(parseInt(urlParams.get('page')) || 1);
  }, [searchParams]);

  // Download بيانات Category
  useEffect(() => {
    if (params.slug) {
      loadCategory();
      // generateStaticParams();
    }
  }, [params.slug]);

  // Download Products عند تغيير الفلاتر
  useEffect(() => {
    if (category) {
      loadProducts();
    }
  }, [category, selectedFilters, searchQuery, sortBy, currentPage]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading category with slug:', params.slug);
      // البحث عن Category بالـ slug
      const categoriesResponse = await categoriesAPI.getAll();
      console.log('📥 Categories API response:', categoriesResponse);
      
      if (categoriesResponse.success) {
        const foundCategory = categoriesResponse.data.find(cat => cat.slug === params.slug);
        console.log('🔍 Found category:', foundCategory);
        
        if (foundCategory) {
          setCategory(foundCategory);
        } else {
          console.error('❌ Category not found:', params.slug);
          setError('Category not found');
        }
      } else {
        console.error('❌ Failed to load categories:', categoriesResponse);
        setError('فشل في Download بيانات Category');
      }
    } catch (err) {
      console.error('Error loading category:', err);
      setError('Error loading category');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        category: category.slug,
        search: searchQuery,
        sort: sortBy,
        page: currentPage,
        limit: 12,
        properties: selectedFilters
      };
      
      console.log('🔍 Loading products with params:', params);
      const response = await productsAPI.filterByProperties(params);
      console.log('📥 Products API response:', response);
      
      if (response.success) {
        console.log('✅ Products loaded successfully:', response.data?.length || 0, 'products');
        setProducts(response.data || []);
        setPagination(response.pagination || null);
      } else {
        console.error('❌ Failed to load products:', response);
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setSelectedFilters(newFilters);
    setCurrentPage(1); // إعادة تعيين الصفحة عند تغيير الفلاتر
    updateURL(newFilters, searchQuery, sortBy, 1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL(selectedFilters, query, sortBy, 1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateURL(selectedFilters, searchQuery, sort, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL(selectedFilters, searchQuery, sortBy, page);
    
    // التمرير إلى أعلى الصفحة
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const updateURL = (filters, search, sort, page) => {
    const params = new URLSearchParams();
    
    // Add الفلاتر
    Object.entries(filters).forEach(([propertyName, values]) => {
      values.forEach(value => {
        params.append(`${propertyName}[]`, value);
      });
    });
    
    // Add المعاملات الأخرى
    if (search) params.set('search', search);
    if (sort !== 'name') params.set('sort', sort);
    if (page > 1) params.set('page', page);
    
    const queryString = params.toString();
    const newUrl = queryString 
      ? `/products/category/${category?.slug || 'unknown'}?${queryString}`
      : `/products/category/${category?.slug || 'unknown'}`;
    
    router.push(newUrl, { scroll: false });
  };

  const generateStaticParams = async () => {
    const categories = await categoriesAPI.getAll();
    return categories.map(category => ({
      slug: category.slug
    }));
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">{error}</h2>
              <button 
                onClick={() => router.push('/products')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Categories
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${isScrolled ? '-translate-y-full' : 'translate-y-0'}`}>
        <Header />
      </div>
      
      {/* Spacer for fixed header */}
      <div className="h-16"></div>
      
      {/* Hero Section */}
      <section className="relative bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6">
                {category?.name || 'loading...'}
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {category?.description || 'VS tables and desks support dynamic learning environments with durability and versatility. Available in various sizes and configurations, they ensure ergonomic comfort while fostering collaboration. Built to last, our tables provide the foundation for flexible learning spaces.'}
              </p>
              <button 
                onClick={() => {
                  const element = document.getElementById('products-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-8 transition-colors"
              >
                Jump to Product Catalog
              </button>
            </div>
            
            {/* Right Image */}
            <div className="relative">
              <img 
                src="/hero-tables.jpg" 
                alt="Table & Desk Products"
                className="w-full h-auto object-cover"
                onError={(e) => { e.target.src = '/concepts/media-library-hero.jpg'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Illustration */}
            {/* <div className="relative bg-gray-50 p-8 rounded-lg">
              <div className="text-center"> */}
                {/* Simple illustration placeholder */}
                {/* <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-32 h-32 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H4V8h16v8z"/>
                  </svg>
                </div>
                <p className="mt-4 text-sm text-gray-500">Illustration showing adaptable desk sizes</p>
              </div>
            </div> */}
            
            {/* Right Content */}
            {/* <div>
              <h2 className="text-3xl font-light text-gray-900 mb-6">
                Sized to Support Every Student
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our tables and desks are designed with adaptability in mind, 
                offering a range of sizes for students of various ages and heights, 
                ensuring everyone can find their ideal place to learn.
              </p>
              <button className="inline-flex items-center text-gray-900 font-medium hover:text-gray-700 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
                GO TO SIZE GUIDE
              </button>
            </div> */}
          </div>
        </div>
      </section>
      
      <main className="bg-gray-000">

        {/* شريط البحث */}
        {/* Products Navigation Header */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              {/* Play button icon */}
              <button className="flex items-center justify-center w-12 h-12 bg-black text-white hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              
              {/* Title */}
              <h1 className="text-4xl font-light text-gray-900 italic text-center flex-1">
                {category?.name || 'Products'}
              </h1>
              
              {/* Search Icon */}
              <button className="flex items-center justify-center w-12 h-12 text-gray-700 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Control Bar Placeholder - when control bar becomes fixed */}
        {isScrolled && <div className="h-16"></div>}
        
        {/* Control Bar */}
        <div data-control-bar className={`bg-white shadow-sm border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : 'relative'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                {/* Toggle filters button */}
                <button 
                  onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-full flex items-center space-x-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  <span>
                    {filtersCollapsed ? 'Show Filters' : 'Hide Filters'}
                    {Object.keys(selectedFilters).length > 0 && (
                      <span className="ml-1 bg-black text-yellow-400 rounded-full px-2 py-1 text-xs">
                        {Object.values(selectedFilters).reduce((total, filters) => total + (filters?.length || 0), 0)}
                      </span>
                    )}
                  </span>
                </button>
                
                {/* Products count */}
                <span className="text-lg text-gray-700 font-medium">
                  {products.length} products for {category?.name || 'this category'}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Back to top button */}
                <button 
                  onClick={scrollToTop}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                  </svg>
                  <span>Back to top</span>
                </button>
                
                {/* Sort button */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-full transition-colors"
                >
                  <option value="name">Sort by Name</option>
                  {/* <option value="price">Sort by Price</option> */}
                  <option value="newest">Sort by Newest</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Filters and Products */}
        <div id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row">
            {/* Filters Sidebar */}
            <div className={`w-full md:w-80 md:mr-8 md:sticky md:self-start transition-all duration-300 ${isScrolled ? 'md:top-20' : 'md:top-24'}`}>
              {category && (
                <PropertiesFilter
                  categoryId={category.id}
                  selectedFilters={selectedFilters}
                  onFiltersChange={handleFiltersChange}
                  isCollapsed={filtersCollapsed}
                  className="mb-6"
                />
              )}
            </div>

            {/* Product Grid */}
            <div className="flex-1 mt-6 md:mt-0">
              {/* Filter Tags */}
              {Object.keys(selectedFilters).length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedFilters).map(([filterName, values]) => 
                      values.map((value, index) => (
                        <span 
                          key={`${filterName}-${value}-${index}`}
                          className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {filterName}
                          <button
                            onClick={() => {
                              const newFilters = { ...selectedFilters };
                              newFilters[filterName] = newFilters[filterName].filter(v => v !== value);
                              if (newFilters[filterName].length === 0) {
                                delete newFilters[filterName];
                              }
                              handleFiltersChange(newFilters);
                            }}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}

              <ProductsGrid
                products={products}
                loading={loading}
                error={error}
                pagination={pagination}
                onPageChange={handlePageChange}
                onSortChange={handleSortChange}
                currentSort={sortBy}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}