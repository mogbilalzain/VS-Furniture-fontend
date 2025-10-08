'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';
import { productsAPI, materialsAPI } from '../../lib/api';

export default function ProductDetails() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [product, setProduct] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleAddToList = (e) => {
    e.preventDefault();
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const handleDownloadCutSheet = () => {
    // يمكن Add منطق الDownload الفعلي هنا
    alert('Cut Sheet downloaded successfully!');
  };

  // Load product materials
  const loadProductMaterials = async (productId) => {
    try {
      setMaterialsLoading(true);
      const response = await materialsAPI.getProductMaterials(productId);
      if (response.success && response.data) {
        setMaterials(response.data.materials_by_category || []);
      }
    } catch (error) {
      console.error('Failed to load product materials:', error);
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const response = await productsAPI.getById(productId);
        
        if (response.success && response.data) {
          setProduct(response.data);
          // Load materials for this product
          await loadProductMaterials(productId);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  return (
    <>
      <Header />
      
      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300">
          Product added to your list!
        </div>
      )}

      <main className="bg-[--color-vs-gray]">
        {/* Loading State */}
        {loading && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading product details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <Link 
                  href="/services"
                  className="block bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Browse All Products
                </Link>
                <Link 
                  href="/"
                  className="block text-gray-600 hover:text-gray-800 underline"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Product Content */}
        {!loading && !error && product && (
          <>
            {/* Breadcrumb Navigation */}
            <section className="bg-white border-b border-gray-200">
              <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center space-x-2 text-sm">
                  <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                    Home
                  </Link>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href="/services" className="text-gray-500 hover:text-gray-700 transition-colors">
                    Services
                  </Link>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {product.category_name && (
                    <>
                      <span className="text-gray-500">{product.category_name}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                  <span className="text-gray-900 font-medium">{product.name}</span>
                </nav>
              </div>
            </section>

            {/* Main Product Section */}
            <section className="py-16 md:py-24">
              <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  {/* Left Side - Product Info */}
                  <div className="order-2 lg:order-1">
                    <div className="mb-4">
                      <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {product.category_name}
                      </span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
                      {product.name}
                    </h1>
                    
                    {product.model && (
                      <p className="text-xl text-gray-600 mb-2">
                        Model: {product.model}
                      </p>
                    )}
                    
                    <div className="text-3xl font-bold text-gray-900 mb-6">
                      ${product.price}
                    </div>
                    
                    {product.stock_quantity !== undefined && (
                      <div className={`mb-6 ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock_quantity > 0 
                          ? `✅ ${product.stock_quantity} in stock` 
                          : '❌ Out of stock'
                        }
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <button 
                        onClick={handleDownloadCutSheet}
                        className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Download Cut Sheet
                      </button>
                      
                      <div>
                        <a 
                          href="#" 
                          onClick={handleAddToList}
                          className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                          Add to My List
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Side - Product Image */}
                  <div className="order-1 lg:order-2 flex justify-center">
                    <div className="max-w-lg">
                      <Image 
                        src={product.image_url || product.image || "/products/product-tbale-1.jpg"} 
                        alt={product.name || "Product"} 
                        width={500}
                        height={400}
                        className="w-full h-auto object-contain rounded-lg"
                        priority
                        onError={(e) => {
                          e.target.src = "/products/product-tbale-1.jpg";
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Product Details Section */}
            <section className="py-16 md:py-24 bg-white">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-light text-gray-800 mb-8">Product Details</h2>
                  
                  {product.description && (
                    <div className="bg-gray-50 p-6 rounded-lg mb-8">
                      <h3 className="text-xl font-medium text-gray-900 mb-4">Description</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Product Specifications */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-medium text-gray-900 mb-4">Specifications</h3>
                      <dl className="space-y-3">
                        {product.model && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Model:</dt>
                            <dd className="text-gray-900 font-medium">{product.model}</dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Price:</dt>
                          <dd className="text-gray-900 font-medium">${product.price}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Category:</dt>
                          <dd className="text-gray-900 font-medium">{product.category_name}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Status:</dt>
                          <dd className={`font-medium ${product.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                            {product.status === 'active' ? 'Available' : 'Unavailable'}
                          </dd>
                        </div>
                        {product.stock_quantity !== undefined && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Stock:</dt>
                            <dd className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stock_quantity > 0 ? `${product.stock_quantity} units` : 'Out of stock'}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Additional Features */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-medium text-gray-900 mb-4">Features</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          Premium quality materials and construction
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          Designed for modern workplace environments
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          Ergonomic design for maximum comfort
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          Durable and long-lasting performance
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          Professional installation available
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Material Details Section */}
                  {materials && materials.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-medium text-gray-900 mb-6">Material Details</h3>
                      
                      {materialsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <span className="ml-2 text-gray-600">Loading materials...</span>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {materials.map((categoryGroup, index) => (
                            <div key={index} className="bg-gray-50 p-6 rounded-lg">
                              <h4 className="text-lg font-medium text-gray-900 mb-4">{categoryGroup.category}</h4>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {categoryGroup.materials.map((material) => (
                                  <div 
                                    key={material.id} 
                                    className="relative bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                  >
                                    {material.is_default && (
                                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                        Default
                                      </div>
                                    )}
                                    
                                    <div className="flex flex-col items-center text-center">
                                      {material.image_url ? (
                                        <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden border border-gray-200">
                                          <Image
                                            src={material.image_url}
                                            alt={material.name}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                                            <span className="text-gray-400 text-xs">No Image</span>
                                          </div>
                                        </div>
                                      ) : material.color_hex ? (
                                        <div 
                                          className="w-16 h-16 mb-2 rounded-lg border border-gray-300"
                                          style={{ backgroundColor: material.color_hex }}
                                          title={`Color: ${material.color_hex}`}
                                        ></div>
                                      ) : (
                                        <div className="w-16 h-16 mb-2 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                          <span className="text-gray-400 text-xs">Material</span>
                                        </div>
                                      )}
                                      
                                      <div className="text-sm font-medium text-gray-900 mb-1">
                                        {material.name}
                                      </div>
                                      
                                      {material.code && (
                                        <div className="text-xs text-gray-500 mb-1">
                                          Code: {material.code}
                                        </div>
                                      )}
                                      
                                      {material.description && (
                                        <div className="text-xs text-gray-600 line-clamp-2">
                                          {material.description}
                                        </div>
                                      )}
                                      
                                      {material.group && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {material.group.name}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

        {/* Resources Quick Links Section */}
        <section className="resources-section py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-light text-center text-gray-800 mb-16">Resources Quick Links</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Symbols & 3D Resources */}
              <div className="resource-card bg-gray-100 rounded-lg p-8 text-center">
                <div className="resource-image mb-6 h-48 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  </div>
                </div>
                <h3 className="resource-title text-xl font-medium text-gray-800 mb-4">Symbols & 3D Resources</h3>
                <p className="resource-description text-gray-600 text-sm leading-relaxed">
                  Explore our library of symbols and 3D resources to enhance your design and planning process, making it easier to visualize and customize learning spaces.
                </p>
              </div>

              {/* Size Guides */}
              <div className="resource-card bg-gray-100 rounded-lg p-8 text-center">
                <div className="resource-image mb-6 h-48 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                      <path d="M4 4l16 16"/>
                      <path d="M16 8l4-4"/>
                      <path d="M20 8h-4"/>
                      <path d="M16 4v4"/>
                    </svg>
                  </div>
                </div>
                <h3 className="resource-title text-xl font-medium text-gray-800 mb-4">Size Guides</h3>
                <p className="resource-description text-gray-600 text-sm leading-relaxed">
                  Ensuring the right fit matters – find the ideal seating and table sizes for every student with our size guides, ensuring comfort and focus in every space.
                </p>
              </div>

              {/* Cut Sheet Library */}
              <div className="resource-card bg-gray-100 rounded-lg p-8 text-center">
                <div className="resource-image mb-6 h-48 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  </div>
                </div>
                <h3 className="resource-title text-xl font-medium text-gray-800 mb-4">Cut Sheet Library</h3>
                <p className="resource-description text-gray-600 text-sm leading-relaxed">
                  Explore our product cut sheets featuring dimensions, model numbers, and technical specifications for detailed product information.
                </p>
              </div>
            </div>
          </div>
        </section>

            {/* Back to Products Section */}
            <section className="bg-gray-100 py-12 border-t border-gray-200">
              <div className="container mx-auto px-4 text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link 
                    href="/services" 
                    className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back to Products
                  </Link>
                  {product.category_name && (
                    <Link 
                      href={`/services?category=${encodeURIComponent(product.category_name)}`}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Browse {product.category_name}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}