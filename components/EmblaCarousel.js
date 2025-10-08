'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

const EmblaCarousel = ({ images, onImageClick }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
      containScroll: 'trimSnaps',
      slidesToScroll: 1,
      startIndex: 0,
      duration: 25,
      dragThreshold: 10,
    },
    [Autoplay({ 
      delay: 5000, 
      stopOnInteraction: false, 
      stopOnMouseEnter: true,
      stopOnLastSnap: false,
      rootNode: (emblaRoot) => emblaRoot.parentElement,
    })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!emblaApi) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [emblaApi, scrollPrev, scrollNext]);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600 text-lg">No images available for this solution.</p>
      </div>
    );
  }

  return (
    <div className="embla">
      {/* Main Carousel */}
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {images.map((image, index) => {
            const imageSrc = image.full_url || image.image_path || image.image_url || 'http://localhost:8000/images/placeholder-product.jpg';
            
            return (
              <div key={image.id || index} className="embla__slide">
                <div 
                  className="embla__slide__inner"
                  onClick={() => onImageClick && onImageClick(image, index)}
                >
                  <Image
                    src={imageSrc}
                    alt={image.alt_text || `Gallery image ${index + 1}`}
                    width={800}
                    height={500}
                    className="embla__slide__img"
                    onError={(e) => {
                      e.target.src = 'http://localhost:8000/images/placeholder-product.jpg';
                    }}
                  />
                  {/* Overlay */}
                  <div className="embla__slide__overlay">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 3 && (
        <>
          <button
            className={`embla__button embla__button--prev ${!canScrollPrev && images.length > 1 ? 'embla__button--disabled' : ''}`}
            onClick={scrollPrev}
            disabled={!canScrollPrev && images.length <= 1}
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className={`embla__button embla__button--next ${!canScrollNext && images.length > 1 ? 'embla__button--disabled' : ''}`}
            onClick={scrollNext}
            disabled={!canScrollNext && images.length <= 1}
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {images.length > 3 && (
        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`embla__dot ${index === selectedIndex ? 'embla__dot--selected' : ''}`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="embla__counter">
          <span className="embla__counter__current">{selectedIndex + 1}</span>
          <span className="embla__counter__separator"> / </span>
          <span className="embla__counter__total">{images.length}</span>
        </div>
      )}

      <style jsx>{`
        .embla {
          position: relative;
          // background: #f8fafc;
          // background: #f8fafc;
          border-radius: 12px;
          overflow: hidden;
          // box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1rem;
        }

        .embla__viewport {
          overflow: hidden;
          width: 100%;
        }

        .embla__container {
          display: flex;
          user-select: none;
          -webkit-touch-callout: none;
          -khtml-user-select: none;
          -webkit-tap-highlight-color: transparent;
          backface-visibility: hidden;
          touch-action: pan-y pinch-zoom;
        }

        .embla__slide {
          position: relative;
          min-width: 0;
          flex: 0 0 calc(33.333% - 0.75rem);
          margin-right: 1rem;
        }

        .embla__slide:last-child {
          margin-right: 0;
        }

        .embla__slide__inner {
          position: relative;
          overflow: hidden;
          height: 400px;
          border-radius: 8px;
          cursor: pointer;
          group: hover;
        }

        .embla__slide__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
          backface-visibility: hidden;
        }

        .embla__slide__inner:hover .embla__slide__img {
          transform: scale(1.05);
        }

        .embla__slide__overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          backdrop-filter: blur(0px);
        }

        .embla__slide__inner:hover .embla__slide__overlay {
          background: rgba(0, 0, 0, 0.3);
          opacity: 1;
        }

        .embla__button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .embla__button:hover {
          background: white;
        }

        .embla__button--prev:hover {
          transform: translateY(-50%) scale(1.1);
        }

        .embla__button--next:hover {
          transform: translateY(-50%) scale(1.1);
        }

        .embla__button--prev {
          left: -24px;
          top: 50%;
          transform: translateY(-50%);
        }

        .embla__button--next {
          right: -24px;
          top: 50%;
          transform: translateY(-50%);
        }

        .embla__button svg {
          color: #374151;
          transition: color 0.3s ease;
        }

        .embla__button--disabled {
          opacity: 0.3;
          cursor: not-allowed;
          pointer-events: none;
        }

        .embla__button--disabled svg {
          color: #9ca3af;
        }

        .embla__dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.95);
        }

        .embla__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid #d1d5db;
          background: transparent;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
        }

        .embla__dot::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          border-radius: 50%;
          background:rgb(246, 187, 59);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .embla__dot:hover {
          border-color: #9ca3af;
          transform: scale(1.2);
        }

        .embla__dot:hover::before {
          width: 6px;
          height: 6px;
        }

        .embla__dot--selected {
          border-color: rgb(246, 187, 59);
          transform: scale(1.3);
        }

        .embla__dot--selected::before {
          width: 8px;
          height: 8px;
        }

        .embla__counter {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          z-index: 10;
        }

        .embla__counter__separator {
          margin: 0 4px;
          opacity: 0.7;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .embla__slide {
            flex: 0 0 calc(50% - 0.5rem);
            margin-right: 0.75rem;
          }
        }

        @media (max-width: 768px) {
          .embla__slide {
            flex: 0 0 calc(50% - 0.5rem);
            margin-right: 0.75rem;
          }

          .embla__slide__inner {
            height: 300px;
          }

          .embla__button {
            width: 40px;
            height: 40px;
          }

          .embla__button--prev {
            left: 12px;
          }

          .embla__button--next {
            right: 12px;
          }

          .embla__counter {
            top: 12px;
            right: 12px;
            padding: 6px 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .embla__slide {
            flex: 0 0 100%;
            margin-right: 0;
          }

          .embla__slide__inner {
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmblaCarousel;
