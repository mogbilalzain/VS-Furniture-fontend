'use client';

import { useState, useEffect } from 'react';
import { 
  CubeIcon, 
  ArrowDownTrayIcon, 
  CameraIcon,
  EyeIcon,
  ChevronDownIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import { productImagesAPI } from '../lib/api';

export default function ProductConfigurator({ product }) {
  const [selectedFrame, setSelectedFrame] = useState('default');
  const [selectedSurface, setSelectedSurface] = useState('default');
  const [showFrameOptions, setShowFrameOptions] = useState(false);
  const [showSurfaceOptions, setShowSurfaceOptions] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  
  // Product images state
  const [productImages, setProductImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [imagesError, setImagesError] = useState(null);

  // Mock configuration options (in real implementation, these would come from props or API)
  const frameOptions = [
    { id: 'white', name: 'White Frame', image: '/images/frames/white-frame.svg' },
    { id: 'yellow', name: 'Yellow Frame', image: '/images/frames/yellow-frame.svg' },
    { id: 'black', name: 'Black Frame', image: '/images/frames/black-frame.svg' }
  ];

  const surfaceOptions = [
    { id: 'wood', name: 'Wood Surface', image: '/images/surfaces/wood.svg' },
    { id: 'glass', name: 'Glass Surface', image: '/images/surfaces/glass.svg' },
    { id: 'metal', name: 'Metal Surface', image: '/images/surfaces/metal.svg' }
  ];

  // Load product images when component mounts or product changes
  useEffect(() => {
    if (product?.id) {
      loadProductImages();
    }
  }, [product?.id]);

  const loadProductImages = async () => {
    try {
      setImagesLoading(true);
      setImagesError(null);
      
      const response = await productImagesAPI.getProductImages(product.id);
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('📸 ProductConfigurator - Product images API response:', response.data);
        console.log('📊 ProductConfigurator - Raw image data:', response.data.map(img => ({
          id: img.id,
          image_url: img.image_url,
          is_primary: img.is_primary,
          sort_order: img.sort_order
        })));
        
        // Transform API response to match our component structure
        const transformedImages = response.data.map((img, index) => ({
          id: img.id,
          name: img.title || img.alt_text || `Product Image ${index + 1}`,
          image: img.image_url,
          alt_text: img.alt_text || img.title || `Product Image ${index + 1}`,
          display_order: img.sort_order || index
        }));
        
        // Sort by display_order if available
        transformedImages.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        
        setProductImages(transformedImages);
        console.log('✅ ProductConfigurator - Product images loaded:', transformedImages.length, 'images');
        console.log('📋 ProductConfigurator - Transformed image details:', transformedImages.map(img => ({ 
          id: img.id, 
          name: img.name, 
          url: img.image 
        })));
        
        // Check if all images have the same URL (this would indicate a problem)
        const uniqueUrls = [...new Set(transformedImages.map(img => img.image))];
        console.log('🔍 ProductConfigurator - Unique image URLs:', uniqueUrls.length, 'out of', transformedImages.length);
        if (uniqueUrls.length === 1 && transformedImages.length > 1) {
          console.warn('⚠️ ProductConfigurator - All images have the same URL! This might be a problem.');
          console.warn('⚠️ ProductConfigurator - URL:', uniqueUrls[0]);
        }
      } else {
        // If no images, show fallback
        console.log('⚠️ No product images found for product ID:', product?.id);
        console.log('📄 API response:', response);
        
        // Use the product's image_url if available, otherwise fallback
        const fallbackImageUrl = product?.image_url || product?.image || '/images/placeholder-product.jpg';
        setProductImages([
          { 
            id: 'fallback', 
            name: 'Product View', 
            image: fallbackImageUrl,
            alt_text: product?.name || 'Product'
          }
        ]);
      }
    } catch (err) {
      console.error('❌ Error loading product images for product ID:', product?.id);
      console.error('❌ Full error:', err);
      setImagesError('Failed to load product images');
      
      // Show fallback on error
      const fallbackImageUrl = product?.image_url || product?.image || '/images/placeholder-product.jpg';
      setProductImages([
        { 
          id: 'fallback', 
          name: 'Product View', 
          image: fallbackImageUrl,
          alt_text: product?.name || 'Product'
        }
      ]);
    } finally {
      setImagesLoading(false);
    }
  };

  // Use productImages instead of mock data
  const preConfiguredOptions = productImages.length > 0 ? productImages : [
    { 
      id: 'fallback', 
      name: 'Product View', 
      image: product?.image_url || product?.image || '/images/placeholder-product.jpg',
      alt_text: product?.name || 'Product'
    }
  ];

  const handleDownloadScreenshot = () => {
    // Implementation for downloading screenshot
    alert('Screenshot download functionality will be implemented');
  };

  const handleDownload3DData = () => {
    // Implementation for downloading 3D data
    alert('3D data download functionality will be implemented');
  };

  const handleTo3DView = () => {
    // Implementation for 3D view
    alert('3D view functionality will be implemented');
  };

  if (!product) return null;

  return (
    <section className="bg-gray-000 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
            Product <em className="italic text-gray-600">Configurator</em>
          </h2>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Side - Product Visualization */}
            <div className="space-y-6">
              {/* Main Product Image/3D View */}
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="aspect-square mb-6 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {imagesLoading ? (
                    // Loading state
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                      <span className="text-sm text-gray-500">Loading images...</span>
                    </div>
                  ) : imagesError ? (
                    // Error state
                    <div className="flex flex-col items-center justify-center space-y-3 text-center p-4">
                      <div className="text-red-500 text-3xl">⚠️</div>
                      <span className="text-sm text-red-600">{imagesError}</span>
                      <button
                        onClick={loadProductImages}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : (
                    // Image display
                    <img
                      src={preConfiguredOptions[currentImage]?.image || product.image_url || product.image || '/images/placeholder-product.jpg'}
                      alt={preConfiguredOptions[currentImage]?.alt_text || `${product.name} - Configuration ${currentImage + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-product.jpg';
                      }}
                    />
                  )}
                  
                  {/* 3D View Button */}
                  {/* <button
                    onClick={handleTo3DView}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-full font-medium transition-colors"
                  >
                    To 3D view
                  </button> */}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  {/* <button
                    onClick={handleDownloadScreenshot}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span className="text-sm">Download screenshot</span>
                  </button> */}
                  
                  <div className="text-sm text-gray-500">
                    Model {product.model || product.sku || '01440'}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              {/* <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-2xl font-light text-gray-900 mb-2">
                  {product.name || 'Shift+ Thumbprint'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {product.short_description || 'Convex table'}
                </p>
                
                {/* Dimensions */}
                {/* <div className="space-y-1 text-sm text-gray-600 mb-6">
                  <div>W: 38.2" x D: 21.3"</div>
                  <div>Available in 7 fixed heights or step height adjustable 23.25" - 32.3"</div>
                </div> */}

                {/* Download 3D Data */}{/*
                <button
                  onClick={handleDownload3DData}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Download 3D data</span>
                </button>
              </div> */}
            </div>

            {/* Right Side - Configuration Options */}
            <div className="space-y-6">
              
              {/* Product Images Configurator */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Product Images 
                  {!imagesLoading && preConfiguredOptions.length > 1 && (
                    <span className="text-sm text-gray-500 font-normal ml-2">
                      ({preConfiguredOptions.length} images)
                    </span>
                  )}
                  {!imagesLoading && preConfiguredOptions.length === 1 && (
                    <span className="text-sm text-gray-500 font-normal ml-2">
                      (1 image)
                    </span>
                  )}
                </h4>
                
                {imagesLoading ? (
                  // Loading state for grid
                  <div className="grid grid-cols-4 gap-3">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg border-2 border-gray-200 p-2 animate-pulse"
                      >
                        <div className="w-full h-full bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : imagesError ? (
                  // Error state for grid
                  <div className="text-center py-8">
                    <div className="text-red-500 text-2xl mb-2">⚠️</div>
                    <p className="text-sm text-red-600 mb-3">{imagesError}</p>
                    <p className="text-xs text-gray-500 mb-3">Product ID: {product?.id}</p>
                    <button
                      onClick={loadProductImages}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Retry loading images
                    </button>
                  </div>
                ) : (
                  // Image grid
                  <div className={`grid gap-3 ${
                    preConfiguredOptions.length === 1 ? 'grid-cols-1 max-w-xs' :
                    preConfiguredOptions.length === 2 ? 'grid-cols-2' :
                    preConfiguredOptions.length === 3 ? 'grid-cols-3' :
                    'grid-cols-4'
                  }`}>
                    {preConfiguredOptions.map((option, index) => (
                      <button
                        key={option.id}
                        onClick={() => setCurrentImage(index)}
                        className={`aspect-square rounded-lg border-2 transition-all duration-200 p-2 hover:shadow-md ${
                          currentImage === index 
                            ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={option.name}
                      >
                        <img
                          src={option.image}
                          alt={option.alt_text || option.name}
                          className="w-full h-full object-contain rounded"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-product.jpg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Image counter when multiple images */}
                {!imagesLoading && !imagesError && preConfiguredOptions.length > 1 && (
                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-500">
                      Image {currentImage + 1} of {preConfiguredOptions.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Adjust configuration */}
              {/* <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-medium text-gray-900 mb-6">Adjust configuration</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Not all options shown are available for all products – please contact us if you have any questions.
                </p>

                <div className="space-y-4">
                  {/* Frame Options */}
                  {/* <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setShowFrameOptions(!showFrameOptions)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">Frame</span>
                      <PlusIcon className={`h-5 w-5 text-gray-400 transition-transform ${showFrameOptions ? 'rotate-45' : ''}`} />
                    </button>
                    
                    {showFrameOptions && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {frameOptions.map((frame) => (
                            <button
                              key={frame.id}
                              onClick={() => setSelectedFrame(frame.id)}
                              className={`aspect-square rounded-lg border-2 transition-colors p-2 ${
                                selectedFrame === frame.id 
                                  ? 'border-yellow-400 bg-yellow-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={frame.image}
                                alt={frame.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.src = '/images/placeholder-product.jpg';
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div> */}

                  {/* Top/Surface Options */}
                  {/* <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setShowSurfaceOptions(!showSurfaceOptions)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">Top/surface</span>
                      <PlusIcon className={`h-5 w-5 text-gray-400 transition-transform ${showSurfaceOptions ? 'rotate-45' : ''}`} />
                    </button>
                    
                    {showSurfaceOptions && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {surfaceOptions.map((surface) => (
                            <button
                              key={surface.id}
                              onClick={() => setSelectedSurface(surface.id)}
                              className={`aspect-square rounded-lg border-2 transition-colors p-2 ${
                                selectedSurface === surface.id 
                                  ? 'border-yellow-400 bg-yellow-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={surface.image}
                                alt={surface.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.src = '/images/placeholder-product.jpg';
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div> *
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}