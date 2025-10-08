'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductFiles from '../../../components/ProductFiles';
import ProductCertifications from '../../../components/ProductCertifications';
import ProductConfigurator from '../../../components/ProductConfigurator';
import ProductImageGallery from '../../../components/ProductImageGallery';
import ProductMaterialDetails from '../../../components/ProductMaterialDetails';
import { ENV_CONFIG } from '../../../environment';
import FavoriteButton from '../../../components/FavoriteButton';
import { productsAPI, productPropertiesAPI } from '../../../lib/api';
import { 
  StarIcon, 
  EyeIcon, 
  ShareIcon,
  HeartIcon,
  ChevronRightIcon,
  TagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState(null);
  const [productProperties, setProductProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [productFiles, setProductFiles] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (params.id) {
      // Check if user is trying to access wrong routes
      if (params.id === 'services') {
        router.replace('/services');
        return;
      }
      if (params.id === 'solutions') {
        router.replace('/solutions');
        return;
      }
      if (params.id === 'contact') {
        router.replace('/contact');
        return;
      }
      if (params.id === 'certifications') {
        router.replace('/certifications');
        return;
      }
      loadProductDetails();
    }
  }, [params.id, router]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Download Product Details
      const productResponse = await productsAPI.getById(params.id);
      
      if (productResponse.success) {
        setProduct(productResponse.data);
        
        // Download Product Properties
        try {
          const propertiesResponse = await productPropertiesAPI.getProductProperties(params.id);
          if (propertiesResponse.success) {
            setProductProperties(propertiesResponse.data.properties || {});
          }
        } catch (propError) {
          console.warn('Could not load product properties:', propError);
        }
        
        // Load product files
        await loadProductFiles();
        
        // Update عدد المشاهدات (يمكن Add API endpoint لهذا)
        // await productsAPI.incrementViews(params.id);
        
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error loading product details:', err);
      
      // Check if it's a 404 error (product not found)
      if (err.message && err.message.includes('404')) {
        setError('Product not found. This product may have been removed or the ID is incorrect.');
      } else {
        setError('Failed to load product details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProductFiles = async () => {
    try {
      // Try primary API endpoint
      const apiUrl = `${ENV_CONFIG.API_BASE_URL}/products/${params.id}/files`;
      console.log('🔧 Loading product files from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 API Response data:', data);
        
        if (data.success && data.data && data.data.length > 0) {
          setProductFiles(data.data);
          console.log('✅ Product files loaded successfully:', data.data.length, 'files');
          console.log('📋 First file details:', data.data[0]);
          return; // Success, exit early
        } else {
          console.log('⚠️ API returned no files or success=false:', data.message);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
      }
      
      // If primary API failed, try fallback approach
      console.log('🔄 Trying fallback API approach...');
      await loadProductFilesFallback();
      
    } catch (err) {
      console.error('❌ Network error loading product files:', err);
      console.error('❌ Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Try fallback approach
      console.log('🔄 Trying fallback API approach after network error...');
      await loadProductFilesFallback();
    }
  };


    function generateStaticParams() {
    // قائمة IDs ثابتة للمنتجات
    const productIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    
    return productIds.map(id => ({
      id: id
    }));
  }

  const loadProductFilesFallback = async () => {
    try {
      // Try using productFilesAPI from lib/api.js
      console.log('🔄 Attempting fallback with productFilesAPI...');
      
      // Import dynamically to avoid issues
      const { productFilesAPI } = await import('../../../lib/api');
      const response = await productFilesAPI.getByProductId(params.id);
      
      if (response.success && response.data && response.data.length > 0) {
        // Filter active files
        const activeFiles = response.data.filter(file => file.is_active !== false);
        setProductFiles(activeFiles);
        console.log('✅ Fallback API successful:', activeFiles.length, 'files');
        return;
      }
      
      console.log('⚠️ Fallback API returned no files');
      
      // Last resort: Create sample data for testing (if this is product ID 3)
      if (params.id === '3') {
        console.log('🔄 Using sample data for Product ID 3...');
        setProductFiles([
          {
            id: 'sample-1',
            display_name: 'Product Cut Sheet',
            description: 'Technical specifications and dimensions',
            file_category: 'specs',
            file_size: '2.1 MB',
            download_count: 15,
            is_featured: true,
            download_url: '#'
          },
          {
            id: 'sample-2',
            display_name: 'Assembly Instructions',
            description: 'Step-by-step assembly guide',
            file_category: 'manual',
            file_size: '1.8 MB',
            download_count: 8,
            is_featured: false,
            download_url: '#'
          }
        ]);
        console.log('✅ Sample data loaded for testing');
      } else {
        setProductFiles([]);
      }
      
    } catch (fallbackErr) {
      console.error('❌ Fallback API also failed:', fallbackErr);
      setProductFiles([]);
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      setDownloading(true);
      
      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/products/${params.id}/files/${fileId}/download`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
        },
      });

      if (response.ok) {
        // Get the file blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'product-file.pdf';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        console.log('✅ File downloaded successfully');
      } else {
        throw new Error('Download failed');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/images/placeholder-product.jpg';
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied');
    }
  };



  const formatSpecifications = (specs) => {
    if (!specs || typeof specs !== 'object') return [];
    
    return Object.entries(specs).map(([key, value]) => ({
      key: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: value
    }));
  };

  const formatProperties = (properties) => {
    if (!properties || typeof properties !== 'object') return [];
    
    return Object.entries(properties).map(([propertyName, values]) => ({
      name: propertyName,
      values: Array.isArray(values) ? values : [values]
    }));
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <h2 className="text-lg text-gray-600 mb-6">{error || 'The product you are looking for does not exist or has been removed.'}</h2>
            
            {/* Helpful suggestions */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <h3 className="font-semibold mb-3">What you can do:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Check the URL for typos</li>
                <li>• Browse our product categories</li>
                <li>• Use the search function</li>
                <li>• Contact us for assistance</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/products')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Products
              </button>
              <button 
                onClick={() => router.push('/services')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Our Services
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Contact Us
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
      <Header />
      
      {/* Main Product Section */}
      <main className="bg-gray-000">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Product Info */}
              <div className="order-2 lg:order-1">
                <h1 className="text-5xl font-light text-gray-900 mb-4">{product.name}</h1>
                {product.short_description && (
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      {product.short_description}
                </p>
                 )}
                
                {/* Short Description */}
                {/* {product.short_description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Product Overview</h3>
                    <p className="text-gray-600 text-lg leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      {product.short_description}
                    </p>
                  </div>
                )} */}
                
                {/* Fallback if no short description */}
                {/* {!product.short_description && (
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Available in various configurations to meet your needs
                  </p>
                )} */}
                
                <div className="space-y-4">
                  {/* Download Cut Sheet Button */}
                  {productFiles.length > 0 ? (
                    <button 
                      onClick={() => {
                        const featuredFile = productFiles.find(file => file.is_featured) || productFiles[0];
                        handleDownloadFile(featuredFile.id, featuredFile.display_name);
                      }}
                      disabled={downloading}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-6 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {downloading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Cut Sheet
                        </>
                      )}
                    </button>
                  ) : (
                    <button 
                      disabled 
                      className="bg-gray-300 text-gray-500 font-medium py-3 px-6 cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      No Files Available
                    </button>
                  )}
                  
                  {/* Add to My List */}
                  <div>
                    <FavoriteButton 
                      product={product}
                      variant="text"
                      size="md"
                      onToggle={(result, wasFavorite) => {
                        if (result.success) {
                          console.log(wasFavorite ? 'Removed from favorites' : 'Added to favorites');
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
                 {/* Right Side - Product Image Gallery */}
                <div className="order-1 lg:order-2 flex justify-center">
                  <div className="max-w-lg w-full">
                    {/* <ProductImageGallery 
                      productId={params.id} 
                      product={product}
                    /> */}
                    <Image
                      src={product.image_url || product.image || "/products/product-tbale-1.jpg"}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="w-full rounded-lg mb-4 object-cover h-48 md:h-60"
                    />
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* Product Details Section */}
        <section className="text-white py-16 md:py-24" style={{backgroundColor: '#3b3b3b'}}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="text-yellow-000 text-sm font-medium mb-2">
                Model: {product.model || 'N/A'}
              </div>
              <h2 className="text-4xl font-light mb-6">{product.name}</h2>
              
              <div className="text-lg leading-relaxed mb-6">
                {product.description || 'Product description not available.'}
              </div>
              
              {/* Features List */}
              {formatProperties(productProperties).length > 0 && (
                <ul className="space-y-2">
                  {/* {formatProperties(productProperties).slice(0, 5).map((property, index) => (
                    <li key={index} className="text-sm leading-relaxed pl-4 relative">
                      <span className="absolute left-0 text-yellow-400 font-bold">•</span>
                      <span className="font-medium">{property.name}:</span> {property.values.map(v => v.display_name || v.value || v).join(', ')}
                    </li>
                  ))} */}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Product Configurator Section */}
        <ProductConfigurator product={product} />

        {/* Product Certifications Section */}
        <ProductCertifications productId={params.id} />

        {/* Product Material Details Section */}
        <ProductMaterialDetails productId={params.id} />

        {/* Product Files Section */}
        <div className="bg-gray-000 py-16">
          <div className="container mx-auto px-4">
            <ProductFiles 
              productId={params.id} 
              files={productFiles}
              onRefresh={loadProductFiles}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}