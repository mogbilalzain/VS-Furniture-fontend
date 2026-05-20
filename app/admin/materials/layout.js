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
      icon: 'category',
      description: 'Metal Colors, Veneers, Laminates',
    },
    {
      name: 'Groups',
      href: '/admin/materials/groups',
      icon: 'layers',
      description: 'Group M1, F1, L1, etc.',
    },
    {
      name: 'Materials',
      href: '/admin/materials',
      icon: 'palette',
      description: 'Individual materials with colors/images',
    },
  ];

  return (
    <div>
      <div className="mb-6 border-b border-surface-container">
        <nav className="-mb-px flex flex-wrap gap-2 sm:gap-4" aria-label="Materials Tabs">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href === '/admin/materials' && pathname === '/admin/materials');

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`group flex items-center gap-3 py-3 px-3 border-b-2 transition-colors -mb-px ${
                  isActive
                    ? 'border-on-surface text-on-surface'
                    : 'border-transparent text-on-surface-variant/70 hover:text-on-surface hover:border-outline-variant/60'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                <div>
                  <div className="text-[14px] font-bold">{tab.name}</div>
                  <div className="text-[11px] text-on-surface-variant/60">{tab.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
