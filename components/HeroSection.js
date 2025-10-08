'use client';

const HeroSection = () => {
  return (
    <section className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="video-container min-h-screen w-full relative">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          poster="https://via.placeholder.com/1920x1080/f3f4f6/374151?text=Video+Placeholder"
          className="w-full h-full object-cover absolute inset-0"
        >
          <source src="https://media-vs.org/file/p1/mp4/VS2025_revised3.mp4" type="video/mp4" />
        </video>
        <div className="content-overlay absolute inset-0 flex items-center justify-center">
      
        </div>
      </div>
    </section>
  );
};

export default HeroSection;