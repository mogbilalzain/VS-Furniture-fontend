'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AdminCard,
  AdminButton,
  AdminInput,
  AdminSelect,
} from './ui';

const QUICK_ADD_ACTIONS = [
  {
    title: 'Add Product',
    description: 'Create a new product',
    icon: 'inventory_2',
    href: '/admin/products?action=add',
  },
  {
    title: 'Add Category',
    description: 'Create a new category',
    icon: 'category',
    href: '/admin/categories?action=add',
  },
  {
    title: 'Add Solution',
    description: 'Create a new solution',
    icon: 'lightbulb',
    href: '/admin/solutions?action=add',
  },
  {
    title: 'Add Certification',
    description: 'Create a new certification',
    icon: 'workspace_premium',
    href: '/admin/certifications?action=add',
  },
];

const QUICK_REPORTS = [
  {
    title: 'Export Products',
    description: 'Download products list',
    icon: 'inventory_2',
    action: 'export-products',
    tone: 'bg-secondary-container/60 text-on-secondary-container',
  },
  {
    title: 'Export Messages',
    description: 'Download contact messages',
    icon: 'mail',
    action: 'export-messages',
    tone: 'bg-tertiary-container/60 text-on-tertiary-container',
  },
  {
    title: 'System Report',
    description: 'Generate system report',
    icon: 'monitoring',
    action: 'system-report',
    tone: 'bg-primary-container/30 text-on-primary-fixed',
  },
];

const SYSTEM_SHORTCUTS = [
  { href: '/admin/products', icon: 'inventory_2', label: 'Products' },
  { href: '/admin/categories', icon: 'category', label: 'Categories' },
  { href: '/admin/contact-messages', icon: 'mail', label: 'Messages' },
  { href: '/admin/solutions', icon: 'lightbulb', label: 'Solutions' },
];

const SEARCH_TYPES = [
  { value: 'products', label: 'Products' },
  { value: 'messages', label: 'Messages' },
  { value: 'categories', label: 'Categories' },
  { value: 'solutions', label: 'Solutions' },
];

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="material-symbols-outlined text-primary p-2.5 bg-primary-container/20 rounded-xl text-[22px]">
        {icon}
      </span>
      <div>
        <h3 className="text-headline-md font-bold text-on-surface tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[12px] text-on-surface-variant/70 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

const QuickActions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('products');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const searchUrls = {
      products: `/admin/products?search=${encodeURIComponent(searchTerm)}`,
      messages: `/admin/contact-messages?search=${encodeURIComponent(searchTerm)}`,
      categories: `/admin/categories?search=${encodeURIComponent(searchTerm)}`,
      solutions: `/admin/solutions?search=${encodeURIComponent(searchTerm)}`,
    };

    window.open(searchUrls[searchType], '_blank');
  };

  const handleQuickReport = async (action) => {
    try {
      console.log(`Generating report: ${action}`);
      alert(`${action} feature will be implemented soon!`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  return (
    <section className="space-y-gutter">
      {/* Quick Search */}
      <AdminCard>
        <SectionHeader
          icon="search"
          title="Quick Search"
          subtitle="Jump straight to any module"
        />
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3 items-end">
          <AdminSelect
            label="Type"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            options={SEARCH_TYPES}
          />
          <AdminInput
            label="Keyword"
            icon="search"
            placeholder={`Search ${searchType}…`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AdminButton type="submit" variant="primary" size="lg" icon="arrow_forward">
            Search
          </AdminButton>
        </form>
      </AdminCard>

      {/* Quick Add Actions */}
      <AdminCard>
        <SectionHeader
          icon="add_circle"
          title="Quick Add"
          subtitle="Create new entities in one click"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ADD_ACTIONS.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative flex flex-col gap-3 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-on-surface/30 hover:-translate-y-0.5 transition-all duration-200 admin-shadow-soft"
            >
              <span className="material-symbols-outlined text-primary p-2.5 bg-primary-container/20 rounded-xl text-[22px] w-fit">
                {action.icon}
              </span>
              <div>
                <p className="text-on-surface font-bold text-[14px] tracking-tight">
                  {action.title}
                </p>
                <p className="text-on-surface-variant/70 text-[12px] mt-0.5">
                  {action.description}
                </p>
              </div>
              <span className="material-symbols-outlined absolute right-4 top-4 text-on-surface-variant/40 text-[18px] group-hover:text-on-surface transition-colors">
                arrow_outward
              </span>
            </Link>
          ))}
        </div>
      </AdminCard>

      {/* Quick Reports */}
      <AdminCard>
        <SectionHeader
          icon="description"
          title="Quick Reports"
          subtitle="Export data and generate summaries"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_REPORTS.map((report) => (
            <button
              key={report.title}
              type="button"
              onClick={() => handleQuickReport(report.action)}
              className="group flex items-start gap-3 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-on-surface/30 hover:-translate-y-0.5 transition-all duration-200 admin-shadow-soft text-left"
            >
              <span className={`material-symbols-outlined p-2.5 rounded-xl text-[22px] ${report.tone}`}>
                {report.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-on-surface font-bold text-[14px] tracking-tight">
                  {report.title}
                </p>
                <p className="text-on-surface-variant/70 text-[12px] mt-0.5">
                  {report.description}
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px] group-hover:text-on-surface transition-colors">
                download
              </span>
            </button>
          ))}
        </div>
      </AdminCard>

      {/* System Shortcuts */}
      <AdminCard>
        <SectionHeader
          icon="bolt"
          title="System Shortcuts"
          subtitle="Jump to the most-used sections"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SYSTEM_SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[26px] group-hover:text-primary transition-colors">
                {shortcut.icon}
              </span>
              <span className="text-[12px] font-bold tracking-wider uppercase text-on-surface-variant group-hover:text-on-surface transition-colors">
                {shortcut.label}
              </span>
            </Link>
          ))}
        </div>
      </AdminCard>
    </section>
  );
};

export default QuickActions;
