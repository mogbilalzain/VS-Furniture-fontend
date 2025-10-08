import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import WhatWeDo from '../components/WhatWeDo';
import QuoteSection from '../components/QuoteSection';
import TrustedLogos from '../components/TrustedLogos';
import ProjectsSection from '../components/ProjectsSection';
import RealSpacesSection from '../components/RealSpacesSection';

export default function Home() {
  return (
    <div className="bg-white">
      <Header />
      <HeroSection />
      <main>
        <WhatWeDo />
        <QuoteSection />
        <TrustedLogos />
        <ProjectsSection />
        <RealSpacesSection />
      </main>
      <Footer />
    </div>
  );
} 