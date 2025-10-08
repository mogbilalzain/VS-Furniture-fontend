'use client';

import React, { useState, useEffect } from 'react';
import { config } from '../lib/config';

const RealSpacesSection = () => {
  const [reelsData, setReelsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRealSpacesContent();
  }, []);

  const fetchRealSpacesContent = async () => {
    try {
      setLoading(true);
      const apiUrl = config.api.baseURL;
      const fullUrl = `${apiUrl}/homepage-content?section=real_spaces`;
      
      console.log('🔄 Fetching real spaces content from:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ API returned non-JSON response');
        console.warn('Content-Type:', contentType);
        
        // Try to read the response as text to see what we got
        const textResponse = await response.text();
        console.warn('Response body (first 200 chars):', textResponse.substring(0, 200));
        
        throw new Error('API returned HTML instead of JSON');
      }
      
      const data = await response.json();
      console.log('✅ Successfully parsed JSON:', data);
      
      if (data.success) {
        setReelsData(data.data);
        console.log('✅ Real spaces data loaded:', data.data.length, 'items');
      } else {
        throw new Error('API response indicated failure');
      }
    } catch (err) {
      console.error('❌ Error fetching real spaces content:', err);
      setError(err.message);
      
      console.log('🔄 Using fallback data...');
      // Fallback to default data
      setReelsData([
        { 
          id: 1, 
          video_id: 'dQw4w9WgXcQ',
          title: 'Modern Learning Spaces',
          description: 'Innovative furniture for educational environments'
        },
        { 
          id: 2, 
          video_id: '9bZkp7q19f0',
          title: 'Flexible Classroom Solutions',
          description: 'Adaptable furniture for dynamic learning'
        },
        { 
          id: 3, 
          video_id: 'ScMzIvxBSi4',
          title: 'Ergonomic Designs',
          description: 'Comfortable and healthy learning environments'
        },
        { 
          id: 4, 
          video_id: 'kJQP7kiw5Fk',
          title: 'Sustainable Furniture',
          description: 'Eco-friendly solutions for schools'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="real-spaces py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-black mb-4">REAL SPACES, REAL STORIES</h2>
          <p className="text-base leading-6 text-medium-gray mb-10 max-w-3xl">
            Discover our latest innovations in flexible furniture design and see how we&apos;re shaping 
            the future of learning and work environments.
          </p>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="real-spaces py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold text-black mb-4">REAL SPACES, REAL STORIES</h2>
        <p className="text-base leading-6 text-medium-gray mb-10 max-w-3xl">
          Discover our latest innovations in flexible furniture design and see how we&apos;re shaping 
          the future of learning and work environments.
        </p>
        <div className="real-spaces__scroll-container flex gap-6 pb-4 overflow-x-auto scrollbar-hide">
          {reelsData.map((reel) => (
            <div 
              key={reel.id}
              className="real-spaces__card flex-shrink-0 w-64 md:w-80 border border-gray-200 rounded-lg shadow-sm bg-black overflow-hidden relative"
            >
              {/* Top overlay with controls */}
              <div className="absolute top-3 left-3 flex items-center space-x-2 z-10">
                <button className="text-white bg-gray-800 bg-opacity-75 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="text-white text-sm font-semibold">Videos</span>
              </div>
              <div className="absolute top-3 right-3 text-white z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>

              {/* Video Container */}
              <div className="relative w-full h-full pb-[177.77%]">
                {reel.video_id ? (
                  <iframe
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    src={`https://www.youtube.com/embed/${reel.video_id}?controls=1&modestbranding=1&rel=0&showinfo=0`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={reel.title}
                    loading="lazy"
                  />
                ) : reel.video_url ? (
                  <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    controls
                    preload="metadata"
                  >
                    <source src={reel.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No video available</span>
                  </div>
                )}
              </div>

              {/* Bottom overlay */}
              <div className="absolute bottom-3 left-3 text-white z-10">
                <div className="text-sm font-medium">{reel.title}</div>
                <div className="text-xs opacity-75">VS Furniture Middle East</div>
              </div>
              <div className="absolute bottom-3 right-3 text-white z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RealSpacesSection; 