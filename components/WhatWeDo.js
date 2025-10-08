import Link from 'next/link';
import Image from 'next/image';

const WhatWeDo = () => {
  return (
    <section className="what-we-do py-16 md:py-24 bg-white" id="what-we-do">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-normal text-black mb-6">What We do</h2>
        <p className="text-base text-medium-gray max-w-3xl mx-auto mb-12">
          We partner with schools and institutions to create inspiring learning environments. 
          From educational space consulting and interior planning to the supply of ergonomic, 
          future-ready furniture — we deliver complete solutions that enhance teaching, learning and well-being.
        </p>
        <div className="what-we-do__cards grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="what-we-do__card">
            <Image 
              src="/FlipTable_global-hero_3_2.webp" 
              alt="Brightly colored chairs in a library setting" 
              width={400}
              height={300}
              className="w-full rounded-lg mb-4 object-cover h-48 md:h-60"
            />
            <Link 
              href="#" 
              className="text-sm font-medium text-black flex items-center justify-center hover:underline"
            >
              DISCOVER HOW WE HELP
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
          <div className="what-we-do__card">
            <Image 
              src="/SPACE_global-hero_3_2.webp" 
              alt="Young woman sitting on a green chair" 
              width={400}
              height={300}
              className="w-full rounded-lg mb-4 object-cover h-48 md:h-60"
            />
            <Link 
              href="#" 
              className="text-sm font-medium text-black flex items-center justify-center hover:underline"
            >
              DISCOVER OUR PRODUCTS
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
          <div className="what-we-do__card">
            <Image 
              src="/VSIMC_Stakki_global_collection-hero_3x2.webp" 
              alt="Modern classroom with green chairs" 
              width={400}
              height={300}
              className="w-full rounded-lg mb-4 object-cover h-48 md:h-60"
            />
            <Link 
              href="#" 
              className="text-sm font-medium text-black flex items-center justify-center hover:underline"
            >
              GET IN TOUCH
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo; 