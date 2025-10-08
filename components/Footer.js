import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="footer bg-vs-dark-gray py-16 md:py-24 text-white">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="footer__column">
          <h3 className="footer__heading mb-4 font-medium">FOLLOW OUR JOURNEY</h3>
          <div className="footer__social flex space-x-4">
            <Link 
              href="#" 
              aria-label="Instagram" 
              className="footer__social-icon w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <i className="fab fa-instagram text-sm"></i>
            </Link>
            <Link 
              href="#" 
              aria-label="YouTube" 
              className="footer__social-icon w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <i className="fab fa-youtube text-sm"></i>
            </Link>
            <Link 
              href="#" 
              aria-label="Facebook" 
              className="footer__social-icon w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <i className="fab fa-facebook-f text-sm"></i>
            </Link>
            <Link 
              href="#" 
              aria-label="LinkedIn" 
              className="footer__social-icon w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <i className="fab fa-linkedin-in text-sm"></i>
            </Link>
          </div>
        </div>
        <div className="footer__column">
          <h3 className="footer__heading mb-4 font-medium">CONTACT US</h3>
          <div className="text-sm space-y-1">
            <p>Address:</p>
            <p>UNIT: Sharjah, Saifone</p>
            <p>Plot: J-08, Sharjah, Sultan Industrial Area</p>
            <p>Phone: +971 6 557 4000</p>
          </div>
        </div>
        <div className="footer__column hidden lg:block"></div>
        <div className="footer__column hidden lg:block"></div>
      </div>
      <div className="container mx-auto px-4 mt-12 text-center md:text-left">
        <p className="footer__copyright text-sm text-gray-400">© Copyright 2023 V/S, All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer; 