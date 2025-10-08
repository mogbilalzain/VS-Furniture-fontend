'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ENV_CONFIG } from '../../environment';

// Company Certifications Accordion Component
const CompanyCertificationsSection = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleToggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // Fetch certifications from API
  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/certifications`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCertifications(data.data);
        console.log('✅ Certifications loaded:', data.data.length, 'items');
      } else {
        throw new Error('API response indicated failure');
      }
    } catch (err) {
      console.error('❌ Error fetching certifications:', err);
      setError(err.message);
      
      // Fallback data in case of API failure
      setCertifications([
        {
          id: 1,
          title: "GS Tested Safety",
          description: "The GS mark is our guarantee of the safety of our furniture. In a GS test, an independent accredited organization tests products for stability, strength, and durability, while also focusing on ergonomic requirements.",
          image_url: "/images/certifications/gs-tested-safety.svg",
          is_active: true
        },
        {
          id: 2,
          title: "BIFMA e3 LEVEL",
          description: "BIFMA e3 LEVEL is the sustainability certification program of the Business and Institutional Furniture Manufacturers Association (BIFMA). It evaluates and certifies school, office, and contract furniture based on environmental and social responsibility criteria.",
          image_url: "/images/certifications/bifma-e3-level.svg",
          is_active: true
        },
        {
          id: 3,
          title: "GREENGUARD Gold",
          description: "GREENGUARD Gold certification ensures that our products meet strict chemical emissions limits, helping to reduce indoor air pollution and the risk of chemical exposure.",
          image_url: "/images/certifications/greenguard-gold.svg",
          is_active: true
        },
        {
          id: 4,
          title: "Forest Stewardship Council (FSC)",
          description: "FSC certification ensures that our wood products come from responsibly managed forests that provide environmental, social and economic benefits.",
          image_url: "/images/certifications/fsc-certified.svg",
          is_active: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load certifications on component mount
  React.useEffect(() => {
    fetchCertifications();
  }, []);

  return (
    <section className="bg-gray-50 text-gray-800 leading-relaxed">
      <div className="max-w-6xl mx-auto py-16 px-5">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-8 tracking-tight">
            All Company Certifications
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-8">
            As a manufacturer, property owner, employer, and contributor to society, we operate with clear principles, well-defined processes, and a dedication to the highest standards. By aligning with the rigorous management standards below and undergoing external certification, we ensure accountability, transparency, and a lasting commitment to excellence and responsibility.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading certifications...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 mb-2">Failed to load certifications</p>
              <p className="text-sm text-gray-600">{error}</p>
              <button 
                onClick={fetchCertifications}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Accordion Container */}
        {!loading && !error && certifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {certifications.map((cert, index) => (
              <div key={cert.id || index} className="border-b border-gray-200 last:border-b-0">
                <button
                  className={`w-full p-6 md:p-8 text-left flex justify-between items-center text-lg md:text-xl font-medium text-gray-800 hover:bg-gray-50 transition-all duration-300 ${
                    activeAccordion === index ? 'active bg-gray-100' : 'bg-white'
                  }`}
                  onClick={() => handleToggleAccordion(index)}
                >
                  <span>{cert.title}</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 fill-gray-600 ${
                      activeAccordion === index ? 'rotate-180' : 'rotate-0'
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 bg-white ${
                    activeAccordion === index ? 'max-h-[1000px]' : 'max-h-0'
                  }`}
                >
                  <div className="p-6 md:p-8 pt-0">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                      <div className="flex-shrink-0 self-center md:self-start">
                        <Image
                          src={cert.image_url || '/images/placeholder-product.jpg'}
                          alt={`${cert.title} Certificate`}
                          width={96}
                          height={96}
                          className="w-24 h-24 object-contain rounded-lg bg-gray-50 p-2"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-600 leading-7">
                          {cert.description || 'No description available for this certification.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && certifications.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <p className="text-gray-600 text-lg">No certifications available at the moment.</p>
              <p className="text-sm text-gray-500 mt-2">Please check back later or contact support.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default function Certifications() {
  return (
    <>
      <Header />
      
      {/* Main Section */}
      <section className="mx-auto px-6  grid grid-cols-1 md:grid-cols-2 gap-20 items-center min-h-screen" style={{maxWidth: '87rem'}}>
        <div className="md:pr-10 md:order-1 order-2 md:text-left text-center">
          <span className="inline-block bg-gray-100 text-gray-500 px-3 py-1 rounded text-xs font-medium uppercase tracking-wider mb-6 animate-fade-up">
            Resource
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-none mb-6 text-gray-900 animate-fade-up-delay-1">
            <strong className="font-bold">Certifications</strong><br />
            <em className="italic text-gray-600">Achieved</em> by VS
          </h1>
          <p className="text-xl text-gray-600 font-normal leading-relaxed animate-fade-up-delay-2">
            Product &amp; company certifications
          </p>
        </div>
        
        <div className="relative md:order-2 order-1 animate-fade-up-delay-3 h-full min-h-[500px] md:min-h-screen overflow-hidden">
          <Image
            src="https://media-vs.org/ChZB3ZI93rx43Shck9eoIpD7NLM1CT3O6UyiYLnO5M4/rs:fit:2500:2500:0/g:no/bG9jYWw6Ly8vcDEvcG5nL0NlcnRpZmljYXRlc19nbG9iYWwtaGVyb18xLTEucG5n.jpg"
            alt="VS Certifications - Character with trophy sitting on yellow ergonomic chair"
            fill
            className="object-cover object-center hover:scale-105 transition-transform duration-500"
            priority
          />
        </div>
      </section>

      {/* Tested & Recommended Section */}
      <section className="bg-white min-h-screen flex items-center justify-center px-4 py-16 sm:px-6 md:px-8 lg:px-10">
        <div className="max-w-6xl w-full text-center">
          <div className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-800 mb-8 sm:mb-10 md:mb-12 lg:mb-16 leading-tight tracking-tight font-serif">
              <span className="block sm:inline font-bold">Tested</span>
              <span className="font-light mx-2 sm:mx-3 text-gray-500">&</span>
              <span className="block sm:inline italic font-normal text-gray-600">Recommended</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-600 font-light max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto tracking-wide font-serif px-2 sm:px-4">
              Both our products and our company have earned multiple certifications, reflecting our commitment to safety, sustainability, and quality. We take responsibility for protecting and supporting people, nature, and the environment through meaningful initiatives and lasting dedication.
            </p>
          </div>
        </div>
      </section>

      {/* Company-Related Certifications Section */}
      <CompanyCertificationsSection />

      <Footer />
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        :global(.animate-fade-up) {
          animation: fadeInUp 0.6s ease forwards;
        }
        
        :global(.animate-fade-up-delay-1) {
          animation: fadeInUp 0.6s ease forwards;
          animation-delay: 0.1s;
        }
        
        :global(.animate-fade-up-delay-2) {
          animation: fadeInUp 0.6s ease forwards;
          animation-delay: 0.2s;
        }
        
        :global(.animate-fade-up-delay-3) {
          animation: fadeInUp 0.8s ease forwards;
          animation-delay: 0.3s;
        }
      `}</style>
    </>
  );
} 