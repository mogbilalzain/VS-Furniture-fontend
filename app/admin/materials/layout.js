'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MaterialsLayout({ children }) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Categories',
      href: '/admin/materials/categories',
      icon: 'fas fa-th-large',
      description: 'Metal Colors, Veneers, Laminates'
    },
    {
      name: 'Groups', 
      href: '/admin/materials/groups',
      icon: 'fas fa-layer-group',
      description: 'Group M1, F1, L1, etc.'
    },
    {
      name: 'Materials',
      href: '/admin/materials',
      icon: 'fas fa-palette',
      description: 'Individual materials with colors/images'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Materials Sub-Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Materials Tabs">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href || 
                  (tab.href === '/admin/materials' && pathname === '/admin/materials');
                
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <i className={`${tab.icon} mr-2`}></i>
                    <div>
                      <div>{tab.name}</div>
                      <div className="text-xs text-gray-400">{tab.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}