'use client';

import React from 'react';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const OurStoryPage = () => {

  // Timeline data
  const timelineEvents = [
    {
      year: '2004',
      location: 'Sharjah, UAE',
      title: 'VS Middle East Factory Established',
      description: 'Under visionary leadership, the VS Middle East factory was built in the UAE. It became a regional hub of innovation, precision manufacturing, and unmatched production standards.'
    },
    {
      year: '2006',
      location: 'Sharjah SAIF Zone, UAE',
      title: 'Official Launch of VS Furniture Middle East HQ',
      description: 'Regional operations formally established to serve the GCC. Sharjah SAIF Zone becomes the headquarters for VS Germany in the Middle East, supporting projects across the UAE, Qatar, Oman, Kuwait, and beyond'
    },
    {
      year: '2012–2013',
      location: 'Riyadh, Saudi Arabia',
      title: 'Landmark Project: King Saud University',
      description: 'A monumental milestone — VS Middle East secured and delivered a 15 million AED project for King Saud University.',
      details: [
        'Supplied: 45,000+ furniture pieces',
        'Impact: Cemented VS Middle East\'s reputation for delivering large-scale, high-quality educational solutions.'
      ]
    },
    {
      year: 'Innovation Milestone',
      location: '',
      title: 'The Compass Lecture Chair is Born',
      description: 'In the VS Middle East factory, the original concept of the Compass Lecture Chair was created — with 400 chairs produced locally. The design later evolved in Germany and became one of VS Germany\'s iconic global products.'
    },
    {
      year: 'Innovation Milestone',
      location: '',
      title: 'Panto Move with Writing Tablet',
      description: 'Another product innovation from the region — the enhanced Panto Move Chair with an integrated writing tablet — conceptualized and prototyped in the Middle East, now manufactured by VS Germany for global markets.'
    },
    {
      year: 'Coming Soon',
      location: 'Saudi Arabia',
      title: 'New VS Presence in KSA',
      description: 'With growing demand and a legacy of past success in the Kingdom, VS Furniture Middle East is preparing to establish a dedicated local presence in Saudi Arabia.'
    }
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="hero bg-white h-screen flex items-center justify-center">
          <div className="w-full h-full">
            <Image 
              src="/hero.jpg" 
              alt="VS America's journey and commitment to educational furniture" 
              width={1920}
              height={1080}
              className="w-full h-full object-cover object-center"
              priority
            />
          </div>
        </section>

        {/* Header Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-6">
                  Our Story
                </h1>
                <p className="text-base text-gray-600 leading-relaxed mb-8">
                  For over 120 years, VS America has been at the forefront of educational furniture design, 
                  creating innovative solutions that transform learning environments. Our journey is rooted in 
                  the belief that the physical space plays a crucial role in fostering engagement, collaboration, 
                  and academic success.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="h-1 w-20 bg-[#FFD700]"></div>
                  <span className="text-gray-500 italic">Since 1898</span>
                </div>
              </div>
              
              {/* Right Image */}
              <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                <Image
                  src="/images/solutions/covers/VSIMC_homepage_overview.webp"
                  alt="Modern classroom with VS furniture showcasing our design philosophy"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium">Innovative Design</p>
                  <p className="text-xs opacity-80">Transforming Learning Spaces</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Introduction */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              At VS Furniture Middle East, our story is built on a foundation of innovation, design excellence, and a deep commitment to creating inspiring spaces for learning, collaboration, and creativity.
            </p>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              We are the regional arm of VS Vereinigte Spezialmöbelfabriken, a globally renowned German manufacturer with over 125 years of experience in educational and ergonomic furniture design. As a trusted partner in the Middle East, we bring the quality, craftsmanship, and pedagogical insight of the VS brand directly to institutions across the region.
            </p>
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Global Vision, Regionally Grounded</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              VS is present in Germany, the United States, the UAE, and Australia — with Saudi Arabia coming soon. Every location shares one mission: to create environments that inspire learning and growth.
            </p>
          </div>

          {/* World Map with VS Locations */}
          <div className="relative h-[400px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg mb-12 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 800 400" fill="none">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* VS Locations */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {/* Germany */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800">Germany</h3>
                  <p className="text-sm text-gray-600">Headquarters</p>
                </div>
                
                {/* UAE */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800">UAE</h3>
                  <p className="text-sm text-gray-600">Middle East HQ</p>
                </div>
                
                {/* USA */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800">USA</h3>
                  <p className="text-sm text-gray-600">Americas</p>
                </div>
                
                {/* Saudi Arabia */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800">Saudi Arabia</h3>
                  <p className="text-sm text-orange-600">Coming Soon</p>
                </div>
              </div>
            </div>
            
            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor:'#FFD700', stopOpacity:0.3}} />
                  <stop offset="100%" style={{stopColor:'#FFD700', stopOpacity:0.1}} />
                </linearGradient>
              </defs>
              <path d="M 200 200 Q 400 150 600 200" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
              </path>
            </svg>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            VS Furniture Middle East – Timeline
          </h2>

          <div className="max-w-4xl mx-auto">
            {timelineEvents.map((event, index) => (
              <div 
                key={index}
                className="relative pl-8 pb-12 border-l-2 border-[#FFD700] last:border-0"
              >
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-[#FFD700]" />
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-[#FFD700] font-bold">{event.year}</span>
                    {event.location && (
                      <span className="text-gray-600">– {event.location}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-700 mb-2">{event.description}</p>
                  {event.details && (
                    <ul className="list-disc list-inside text-gray-700 ml-4">
                      {event.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="quote-section quote-section-enhanced text-white py-16 md:py-24 text-center px-4 min-h-[60vh] flex items-center justify-center relative bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        {/* Icon at the top */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ top: "-3rem" }}>
          <div className="w-24 h-24 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
            </svg>
          </div>
        </div>
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#FFD700] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-500 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto max-w-4xl quote-content">
          <p className="text-3xl md:text-4xl italic font-normal leading-relaxed quote-enhanced-text">
            <em>"At the heart of everything we do is the belief that furniture should move with people, not the other way around."</em>
            <span className="quote-hyphen"></span>
            <br />
            <span className="block mt-4 font-bold">
              Our systems are designed to encourage movement, engagement, and well-being, rooted in decades of pedagogical and ergonomic research and built with the future in mind.
            </span>
          </p>
        </div>
      </section>

      {/* Regional Impact */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              Our journey in the Middle East began in 2006, when we established our regional headquarters in the Sharjah Airport International Free Zone (SAIF Zone) in the United Arab Emirates. As the UAE emerged as a hub for educational innovation and development, it became the ideal launching point for VS\'s regional operations.
            </p>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              Since then, VS Furniture Middle East has successfully delivered projects across the UAE, Saudi Arabia, Kuwait, Bahrain, and Oman. From international schools and government initiatives to private universities and corporate learning spaces, our solutions are helping to redefine what modern educational and collaborative environments can be.
            </p>
            <p className="text-lg md:text-xl text-gray-700">
              More than just a supplier, VS Furniture Middle East is a long-term partner, committed to shaping the learning and working environments where the region's next generation will thrive.
            </p>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
};

export default OurStoryPage;