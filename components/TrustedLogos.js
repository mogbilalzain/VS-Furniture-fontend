import Image from 'next/image';

const TrustedLogos = () => {
  const logos = [
    { src: '/compony/american-school-dubai-uae-removebg-preview.png', alt: 'American School Dubai', className: 'imaResize' },
    { src: '/compony/2.png', alt: 'Trusted institution logo 2', className: '' },
    { src: '/compony/3.svg', alt: 'Trusted institution logo 3', className: '' },
    { src: '/compony/moe-logo-ar.svg', alt: 'Ministry of Education', className: '' },
    { src: '/compony/5.png', alt: 'Trusted institution logo 5', className: '' },
    { src: '/compony/6.svg', alt: 'Trusted institution logo 6', className: '' },
    { src: '/compony/7.svg', alt: 'Trusted institution logo 7', className: '' },
    { src: '/compony/8.svg', alt: 'Trusted institution logo 8', className: '' },
  ];

  return (
    <section className="trusted py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4 text-center" style={{ padding: '50px' }}>
        <h1 className="text-lg font-semibold tracking-wider text-black uppercase mb-8">
          Trusted by leading institutions
        </h1>
      </div>
      <div className="trusted-logos-container" id="trusted-logos">
        <div className="trusted-logos-track">
          {/* First set of logos */}
          {logos.map((logo, index) => (
            <Image
              key={`first-${index}`}
              src={logo.src}
              alt={logo.alt}
              width={logo.className === 'imaResize' ? 150 : 80}
              height={logo.className === 'imaResize' ? 150 : 60}
              className={`${logo.className} trusted-logo`}
            />
          ))}
          
          {/* Duplicate set for seamless loop */}
          {logos.map((logo, index) => (
            <Image
              key={`second-${index}`}
              src={logo.src}
              alt={logo.alt}
              width={logo.className === 'imaResize' ? 150 : 80}
              height={logo.className === 'imaResize' ? 150 : 60}
              className={`${logo.className} trusted-logo`}
            />
          ))}
          
          {/* Third set to ensure seamless loop */}
          {logos.map((logo, index) => (
            <Image
              key={`third-${index}`}
              src={logo.src}
              alt={logo.alt}
              width={logo.className === 'imaResize' ? 150 : 80}
              height={logo.className === 'imaResize' ? 150 : 60}
              className={`${logo.className} trusted-logo`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedLogos; 