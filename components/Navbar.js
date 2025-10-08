'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

const Navbar = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/our-story', label: 'Our Story' },
    { href: '/products', label: 'Products' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-[#3d5c4d]">VS Furniture</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? 'text-[#3d5c4d] border-b-2 border-[#3d5c4d]'
                    : 'text-gray-600 hover:text-[#3d5c4d]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname.startsWith('/admin')
                    ? 'text-[#3d5c4d] border-b-2 border-[#3d5c4d]'
                    : 'text-gray-600 hover:text-[#3d5c4d]'
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#3d5c4d] hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive(link.href)
                      ? 'text-[#3d5c4d] bg-gray-100'
                      : 'text-gray-600 hover:text-[#3d5c4d] hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && isAdmin && (
                <Link
                  href="/admin"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    pathname.startsWith('/admin')
                      ? 'text-[#3d5c4d] bg-gray-100'
                      : 'text-gray-600 hover:text-[#3d5c4d] hover:bg-gray-50'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;