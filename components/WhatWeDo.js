'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { config } from '../lib/config';

const fallbackData = {
  title: 'What We do',
  description: 'We partner with schools and institutions to create inspiring learning environments. From educational space consulting and interior planning to the supply of ergonomic, future-ready furniture — we deliver complete solutions that enhance teaching, learning and well-being.',
  cards: [
    {
      title: 'DISCOVER HOW WE HELP',
      image: '/FlipTable_global-hero_3_2.webp',
      link: '#',
    },
    {
      title: 'DISCOVER OUR PRODUCTS',
      image: '/SPACE_global-hero_3_2.webp',
      link: '#',
    },
    {
      title: 'GET IN TOUCH',
      image: '/VSIMC_Stakki_global_collection-hero_3x2.webp',
      link: '#',
    },
  ],
};

const WhatWeDo = () => {
  const [sectionData, setSectionData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const apiUrl = config.api.baseURL;
      const response = await fetch(`${apiUrl}/homepage-content?section=what_we_do`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        const record = data.data[0];
        const cards = record.metadata?.cards || fallbackData.cards;

        setSectionData({
          title: record.title || fallbackData.title,
          description: record.description || fallbackData.description,
          cards: cards.map((card, idx) => ({
            title: card.title || fallbackData.cards[idx]?.title || '',
            description: card.description || '',
            image: card.image || fallbackData.cards[idx]?.image || '/FlipTable_global-hero_3_2.webp',
            link: card.link || '#',
          })),
        });
      }
    } catch (err) {
      console.error('Error fetching what_we_do content:', err);
    } finally {
      setLoading(false);
    }
  };

  const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );

  return (
    <section className="what-we-do py-16 md:py-24 bg-white" id="what-we-do">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-normal text-black mb-6">{sectionData.title}</h2>
        <p className="text-base text-medium-gray max-w-3xl mx-auto mb-12">
          {sectionData.description}
        </p>
        <div className={`what-we-do__cards grid grid-cols-1 md:grid-cols-${Math.min(sectionData.cards.length, 3)} gap-8`}>
          {sectionData.cards.map((card, index) => (
            <div key={index} className="what-we-do__card">
              <img
                src={card.image}
                alt={card.title}
                className="w-full rounded-lg mb-4 object-cover h-48 md:h-60"
              />
              <Link
                href={card.link || '#'}
                className="text-sm font-medium text-black flex items-center justify-center hover:underline"
              >
                {card.title}
                <ArrowIcon />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
