'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { config } from '../lib/config';
import FavoritesCounter from './FavoritesCounter';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [solutions, setSolutions] = useState([]);

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  // Fetch solutions for dropdown
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const apiUrl = config.api.baseURL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/solutions`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSolutions(data.data.slice(0, 6)); // Show only first 6 solutions
          }
        }
      } catch (err) {
        console.error('Error fetching solutions for dropdown:', err);
        // Fallback data
        setSolutions([
          { id: 1, title: 'Modern Office Workspace' },
          { id: 2, title: 'Interactive Learning Environment' },
          { id: 3, title: 'Executive Conference Room' }
        ]);
      }
    };

    fetchSolutions();
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownClose = () => {
    // Add small delay to allow link clicks to register
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown container
      const dropdownContainer = event.target.closest('[data-dropdown="solutions"]');
      if (isDropdownOpen && !dropdownContainer) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <>
      <header className="header py-4 bg-white shadow-sm sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Mobile menu toggle */}
          <div className="flex items-center justify-between w-full md:hidden">
            <div className="flex items-center space-x-2">
              {/* Favorites Counter */}
              <FavoritesCounter showDropdown={false} />
              {/* Search Icon */}
              <button 
                className="icon-hover text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2" 
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
            {/* Hamburger */}
            <button 
              onClick={handleOpenSidebar}
              className="text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2" 
              aria-label="Toggle mobile menu" 
              aria-expanded={isSidebarOpen} 
              aria-controls="mobile-sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          {/* Left Nav (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 relative z-20" >
            {/* Solutions Dropdown */}
            <div className="relative" data-dropdown="solutions">
            <button 
  onClick={handleDropdownToggle}
  className="text-gray-900 font-medium font-quasimoda-bold flex items-center gap-2 transition-colors relative z-30 cursor-pointer hover:text-gray-700"
>
  Solutions
  <svg 
    className={`w-3 h-3 transition-transform duration-200 text-gray-600 ${isDropdownOpen ? 'rotate-180' : ''}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
</button>
              {/* <button 
                onClick={handleDropdownToggle}
                className="nav-link text-gray-900 font-medium font-quasimoda-bold flex items-center gap-2 transition-colors relative z-30 cursor-pointer hover:text-gray-700"
              >
                Solutions
                <svg 
                  className={`w-3 h-3 transition-transform duration-200 text-gray-600 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button> */}
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* View All Solutions Link */}
                  <Link 
                    href="/solutions" 
                    className="block px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-blue-50  border-b border-gray-100 transition-colors"
                    onClick={handleDropdownClose}
                  >
                    <div className="flex items-center justify-between">
                      <span>View All Solutions</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                  
                  {/* Solutions List */}
                  {solutions.length > 0 ? (
                    solutions.map((solution) => (
                      <Link 
                        key={solution.id}
                        href={`/solutions/${solution.id}`} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors font-medium"
                        onClick={handleDropdownClose}
                      >
                        {solution.title}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No solutions available
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Link href="/products" className="nav-link text-gray-900 font-medium font-quasimoda-bold relative z-30 cursor-pointer" >
              Products
            </Link>
            <Link href="/services" className="nav-link text-gray-900 font-medium font-quasimoda-bold relative z-30 cursor-pointer" >
              Services
            </Link>
            <Link href="/certifications" className="nav-link text-gray-900 font-medium font-quasimoda-bold relative z-30 cursor-pointer" >
              Certifications
            </Link>
          </nav>

          {/* Logo (centered on mobile, normal on desktop) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:left-auto flex-1 flex justify-end z-10 md:z-auto">
            <Link href="/">
              <Image 
                src="/vs-logo-2.svg" 
                alt="VS Logo" 
                width={40}
                height={40}
                className="w-10 h-10"
                priority
              />
            </Link>
          </div>

          {/* Right Nav (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-end relative z-20">

            <Link href="/our-story" className="nav-link text-gray-700 font-medium">
              Our Story
            </Link>
            <Link href="/contact" className="nav-link text-gray-700 font-medium">
              Contact
            </Link>
            <Link href="/career" className="nav-link text-gray-700 font-medium">
              <b></b>Career
            </Link>
            
            {/* Desktop Icons */}
            <div className="flex items-center gap-4 ml-4 ">
              <FavoritesCounter showDropdown={true}  style={{ color: '#000000 !important' }} /> 
              <button 
                className="icon-hover text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2" 
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" ></path>
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Sidebar Overlay and Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={handleCloseSidebar}
        />
      )}
      
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden flex flex-col pt-8 px-6 space-y-2 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button 
          onClick={handleCloseSidebar}
          className="self-end mb-4 text-gray-700 hover:text-yellow-400 focus:outline-none"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Solutions with submenu in mobile */}
        <div>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <span>Solutions</span>
            <svg 
              className={`w-3 h-3 transition-transform duration-200 text-gray-500 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Mobile Submenu */}
          {isDropdownOpen && (
            <div className="ml-4 mt-2 space-y-1">
              <Link 
                href="/solutions" 
                className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={handleLinkClick}
              >
                View All Solutions
              </Link>
              {solutions.map((solution) => (
                <Link 
                  key={solution.id}
                  href={`/solutions/${solution.id}`} 
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={handleLinkClick}
                >
                  {solution.title}
                </Link>
                
              ))}
            </div>
          )}
        </div>
        <Link 
          href="/products" 
          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={handleLinkClick}
        >
          Products
        </Link>
        <Link 
          href="/services" 
          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={handleLinkClick}
        >
          Services
        </Link>
        <Link 
          href="/certifications" 
          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={handleLinkClick}
        >
          Certifications
        </Link>
        <Link 
          href="#projects" 
          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={handleLinkClick}
        >
          Our Story
        </Link>
        <Link 
          href="/contact" 
          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={handleLinkClick}
        >
          Contact
        </Link>
        <Link 
          href="/career" 
          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={handleLinkClick}
        >
          Career
        </Link>
      </aside>
    </>
  );
};

export default Header; 