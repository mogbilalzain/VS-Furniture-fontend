'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import EmblaCarousel from '../../../components/EmblaCarousel';
import { config } from '../../../lib/config';
import { solutionsAPI } from '../../../lib/api';
import { ENV_CONFIG } from '../../../environment/index.js';

const SolutionDetailsPage = () => {
  const params = useParams();
  const solutionId = params.id;
  
  const [solution, setSolution] = useState(null);
  const [relatedSolutions, setRelatedSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productsSortBy, setProductsSortBy] = useState('name');
  const [productsFilterBy, setProductsFilterBy] = useState('all');

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-product.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Convert relative path to full URL using backend URL
    const backendBaseUrl = ENV_CONFIG.API_BASE_URL.replace('/api', '');
    return `${backendBaseUrl}${imagePath}`;
  };

  useEffect(() => {
    if (solutionId) {
      fetchSolutionDetails();
    }
  }, [solutionId]);

  const fetchSolutionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await solutionsAPI.getById(solutionId);
      
      if (response.success) {
        setSolution(response.data.solution);
        setRelatedSolutions(response.data.related_solutions || []);
        console.log('✅ Solution details loaded:', response.data.solution.title);
      } else {
        throw new Error('Solution not found');
      }
    } catch (err) {
      console.error('❌ Error fetching solution details:', err);
      setError(err.message);
      
      // Fallback data
      setSolution({
        id: parseInt(solutionId),
        title: "Modern Office Workspace",
        description: "Create a contemporary office environment that promotes productivity and collaboration. Our modern office workspace solutions combine ergonomic furniture with innovative design to enhance employee well-being and efficiency. Features include height-adjustable desks, ergonomic seating, collaborative meeting spaces, and integrated technology solutions.",
        cover_image: "/images/placeholder-product.jpg",
        images: [
          { id: 1, image_path: "/images/placeholder-product.jpg", alt_text: "Office setup 1" },
          { id: 2, image_path: "/images/placeholder-product.jpg", alt_text: "Office setup 2" },
          { id: 3, image_path: "/images/placeholder-product.jpg", alt_text: "Office setup 3" }
        ],
        products: [
          { id: 1, name: "Executive Desk", category: { name: "Desks" }, image: "/images/placeholder-product.jpg" },
          { id: 2, name: "Ergonomic Chair", category: { name: "Chairs" }, image: "/images/placeholder-product.jpg" }
        ]
      });
      setRelatedSolutions([
        { id: 2, title: "Interactive Learning Environment", cover_image: "/images/placeholder-product.jpg" },
        { id: 3, title: "Executive Conference Room", cover_image: "/images/placeholder-product.jpg" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  const handleCarouselImageClick = (image, index) => {
    openLightbox(image, index);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setSelectedImage(null);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!showLightbox) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        prevImage();
      } else if (event.key === 'ArrowRight') {
        nextImage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, solution?.images, currentImageIndex]);

  const nextImage = () => {
    if (solution?.images && solution.images.length > 0) {
      const nextIndex = (currentImageIndex + 1) % solution.images.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(solution.images[nextIndex]);
    }
  };

  const prevImage = () => {
    if (solution?.images && solution.images.length > 0) {
      const prevIndex = currentImageIndex === 0 ? solution.images.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(solution.images[prevIndex]);
    }
  };

  async function generateStaticParams() {
    const solutions = await solutionsAPI.getAll();
    return solutions.map(solution => ({
      id: solution.id
    }));
  }

  const getSortedProducts = () => {
    if (!solution?.products || !Array.isArray(solution.products)) return [];
    
    let filtered = solution.products;
    
    // Filter by category
    if (productsFilterBy !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.name?.toLowerCase() === productsFilterBy.toLowerCase()
      );
    }
    
    // Sort products
    return filtered.sort((a, b) => {
      switch (productsSortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return (a.category?.name || '').localeCompare(b.category?.name || '');
        default:
          return 0;
      }
    });
  };

  const getUniqueCategories = () => {
    if (!solution?.products || !Array.isArray(solution.products)) return [];
    const categories = solution.products
      .map(product => product?.category?.name)
      .filter(Boolean)
      .filter((category, index, self) => self.indexOf(category) === index);
    return categories;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading solution details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex justify-center items-center">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Solution Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/solutions"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Solutions
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!solution) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading solution details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const sortedProducts = getSortedProducts();
  const categories = getUniqueCategories();

  return (
    <>
      <Header />
      
      {/* Breadcrumb */}
      <nav className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/solutions" className="hover:text-blue-600">Solutions</Link>
            <span>/</span>
            <span className="text-gray-900">{solution.title}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section - New Design: Text (Left) + Image (Right) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 px-10 py-16 items-center">
          {/* Left Text */}
          <div>
            {/* <span className="text-sm text-gray-500 border rounded-full px-3 py-1">Room Concept</span> */}
            <h1 className="text-4xl font-light mt-6">{solution.title}</h1>
            <h2 className="text-4xl italic font-serif mt-2 text-gray-700">Solution Details</h2>
            
            {/* Description */}
            <div className="mt-8">
              <p className="text-gray-600 leading-relaxed text-lg">
                {solution.description || 'Discover innovative solutions designed to transform your space and enhance productivity.'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 mt-8">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {solution.products?.length || 0} Products
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                </svg>
                {solution?.images?.length || 0} Images
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <Link 
                href="/contact"
                className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-8 py-4 text-lg font-medium transition-colors"
              >
                Get Quote for This Solution
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div>
            <Image
              src={getImageUrl(solution.cover_image_url || solution.cover_image)}
              alt={solution.title}
              width={600}
              height={400}
              className="rounded-xl  w-full h-auto object-cover"
              priority
              onError={(e) => {
                e.target.src = 'http://localhost:8000/images/placeholder-product.jpg';
              }}
            />
          </div>
        </section>

        {/* Image Gallery - Embla Carousel */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Gallery {solution?.images && solution.images.length > 0 && (
              <span className="text-lg font-normal text-gray-600">
                ({solution.images.length} {solution.images.length === 1 ? 'Image' : 'Images'})
              </span>
            )}
          </h2>
          <EmblaCarousel 
            images={solution?.images || []} 
            onImageClick={handleCarouselImageClick}
          />
        </section>

        {/* Related Products */}
        {solution.products && solution.products.length > 0 && (
          <section className="mb-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                Related Products ({sortedProducts.length})
              </h2>
              
              {/* Filters and Sorting */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Category Filter */}
                {categories.length > 1 && (
                  <select
                    value={productsFilterBy}
                    onChange={(e) => setProductsFilterBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                )}
                
                {/* Sort */}
                <select
                  value={productsSortBy}
                  onChange={(e) => setProductsSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="category">Sort by Category</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative h-48">
                    <Image
                      src={getImageUrl(product.image_url || product.image)}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'http://localhost:8000/images/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    {product.category && (
                      <p className="text-sm text-gray-600 mb-3">{product.category.name}</p>
                    )}
                    <Link 
                      href={`/products/${product.id}`}
                      className="block w-full bg-gray-800 hover:bg-gray-900 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Solutions */}
        {relatedSolutions.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Other Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedSolutions.map((relatedSolution) => (
                <Link 
                  key={relatedSolution.id}
                  href={`/solutions/${relatedSolution.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative h-32">
                    <Image
                      src={getImageUrl(relatedSolution.cover_image_url || relatedSolution.cover_image)}
                        alt={relatedSolution.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'http://localhost:8000/images/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {relatedSolution.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-6xl max-h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2 transition-all duration-200 hover:bg-opacity-70"
              aria-label="Close lightbox"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Navigation Buttons */}
            {solution?.images && solution.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 transition-all duration-200 hover:bg-opacity-70"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 transition-all duration-200 hover:bg-opacity-70"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image */}
            <div className="relative w-full h-full max-h-[80vh] min-h-[60vh]">
              <Image
                src={getImageUrl(selectedImage.full_url || selectedImage.image_path)}
                alt={selectedImage.alt_text || `Gallery image ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
                priority
                onError={(e) => {
                  console.error('Image failed to load:', selectedImage);
                  e.target.src = 'http://localhost:8000/images/placeholder-product.jpg';
                }}
              />
            </div>
            
            {/* Image Counter */}
            {solution?.images && solution.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-70 px-4 py-2 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {solution?.images?.length || 0}
              </div>
            )}

            {/* Image Title */}
            {selectedImage && (selectedImage.alt_text || selectedImage.title) && (
              <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-70 px-4 py-2 rounded-lg max-w-md">
                <p className="text-sm font-medium">{selectedImage.alt_text || selectedImage.title}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default SolutionDetailsPage;
