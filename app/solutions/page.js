'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { config } from '../../lib/config';
import { solutionsAPI } from '../../lib/api';
import { ENV_CONFIG } from '../../environment/index.js';

const SolutionsPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-product.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Convert relative path to full URL using backend URL
    const backendBaseUrl = ENV_CONFIG.API_BASE_URL.replace('/api', '');
    return `${backendBaseUrl}${imagePath}`;
  };

  useEffect(() => {
    fetchSolutions(1, true);
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '') {
        fetchSolutions(1, true, searchTerm);
      } else {
        fetchSolutions(1, true);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchSolutions = async (page = 1, reset = false, search = '') => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page: page.toString(),
        per_page: '9'
      };
      
      if (search) {
        params.search = search;
      }

      const response = await solutionsAPI.getAll(params);
      
      if (response.success) {
        if (reset) {
          setSolutions(response.data);
        } else {
          setSolutions(prev => [...prev, ...response.data]);
        }
        setPagination(response.pagination);
        setCurrentPage(page);
        console.log('✅ Solutions loaded:', response.data.length, 'items for page', page);
        
        // Debug: Log image URLs for first solution
        if (response.data.length > 0) {
          const firstSolution = response.data[0];
          console.log('🖼️ First solution image info:', {
            id: firstSolution.id,
            title: firstSolution.title,
            cover_image: firstSolution.cover_image,
            cover_image_url: firstSolution.cover_image_url,
            generated_url: getImageUrl(firstSolution.cover_image_url || firstSolution.cover_image)
          });
        }
      } else {
        throw new Error('API response indicated failure');
      }
    } catch (err) {
      console.error('❌ Error fetching solutions:', err);
      setError(err.message);
      
      // Fallback data in case of API failure
      if (reset) {
        setSolutions([
          {
            id: 1,
            title: "Modern Office Workspace",
            description: "Create a contemporary office environment that promotes productivity and collaboration. Our modern office workspace solutions combine ergonomic furniture with innovative design.",
            cover_image: "/images/placeholder-product.jpg",
            products_count: 8,
            images: []
          },
          {
            id: 2,
            title: "Interactive Learning Environment",
            description: "Transform traditional classrooms into dynamic learning spaces that engage students and support modern teaching methods.",
            cover_image: "/images/placeholder-product.jpg",
            products_count: 12,
            images: []
          }
        ]);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: 9,
          total: 2,
          has_more: false
        });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination && pagination.has_more) {
      fetchSolutions(currentPage + 1, false, searchTerm);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading solutions...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 items-center min-h-screen" style={{maxWidth: '87rem'}}>
        <div className="md:pr-10 md:order-1 order-2 md:text-left text-center">
          <span className="inline-block bg-gray-100 text-gray-500 px-3 py-1 rounded text-xs font-medium uppercase tracking-wider mb-6 animate-fade-up">
            Explore
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-none mb-6 text-gray-900 animate-fade-up-delay-1">
            <strong className="font-bold">Solutions</strong><br />
            <em className="italic text-gray-600">Designed</em> by VS
          </h1>
          <p className="text-xl text-gray-600 font-normal leading-relaxed animate-fade-up-delay-2">
            Innovative furniture solutions for every space
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto md:mx-0 mt-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search solutions..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:order-2 order-1 relative">
          <div className="relative overflow-hidden" style={{paddingBottom: '100%'}}>
            <Image
              src="/images/solutions/covers/VSIMC_homepage_overview.webp"
              alt="VS Solutions - Furniture Overview"
              fill
              className="object-cover animate-fade-up-delay-3"
              priority
              onError={(e) => {
                e.target.src = '/images/placeholder-product.jpg';
              }}
            />
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-red-800 font-medium">Failed to load solutions</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => fetchSolutions(1, true, searchTerm)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Results Info */}
          {pagination && (
            <div className="mb-8">
              <p className="text-gray-600">
                {searchTerm ? `Search results for "${searchTerm}" - ` : ''}
                Showing {solutions.length} of {pagination.total} solutions
              </p>
            </div>
          )}

          {/* Solutions Grid - New Design */}
          {solutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {solutions.map((solution, index) => {
                // Alternate between large (2/3 width) and small (1/3 width) cards
                const isLarge = index % 3 === 0;
                const colSpan = isLarge ? 'md:col-span-2' : 'md:col-span-1';
                
                return (
                  <div key={solution.id} className={`${colSpan} bg-white rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300`}>
                    {/* Image */}
                    <div className="relative">
                      <span className="absolute top-3 left-3 bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full z-10">
                        Solution Concept
                      </span>
                      <Image
                        src={getImageUrl(solution.cover_image_url || solution.cover_image)}
                        alt={solution.title}
                        width={isLarge ? 800 : 400}
                        height={isLarge ? 400 : 300}
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          console.error('Image load error for solution:', solution.id, getImageUrl(solution.cover_image_url || solution.cover_image));
                          e.target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h2 className="text-xl font-bold mb-3">{solution.title}</h2>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {solution.description ? 
                          (solution.description.length > (isLarge ? 200 : 150) ? 
                            solution.description.substring(0, isLarge ? 200 : 150) + '...' : 
                            solution.description
                          ) : 
                          'No description available'
                        }
                      </p>
                      
                      {/* Stats - Only show for smaller cards to save space */}
                      {!isLarge && (
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 mb-3">
                          <span>{solution.products_count || 0} products</span>
                          <span>{solution.images?.length || 0} images</span>
                        </div>
                      )}
                      
                      {/* CTA Link */}
                      <Link 
                        href={`/solutions/${solution.id}`}
                        className="inline-flex items-center gap-1 mt-4 font-semibold text-black hover:underline"
                      >
                        Explore Concepts <span>↗</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <svg className="mx-auto h-24 w-24 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm ? 'No solutions found' : 'No solutions available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `We couldn't find any solutions matching "${searchTerm}". Try adjusting your search terms.`
                  : 'There are no solutions available at the moment. Please check back later.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Load More Button */}
          {pagination && pagination.has_more && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  'Load More Solutions'
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default SolutionsPage;