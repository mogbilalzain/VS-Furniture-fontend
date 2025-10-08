'use client';

import React, { useState } from 'react';
import Link from 'next/link';

/**
 * Quick Actions Component for Admin Dashboard
 */
const QuickActions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('products');

  const quickAddActions = [
    {
      title: 'Add Product',
      description: 'Create a new product',
      icon: '📦',
      href: '/admin/products?action=add',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Add Category',
      description: 'Create a new category',
      icon: '📂',
      href: '/admin/categories?action=add',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Add Solution',
      description: 'Create a new solution',
      icon: '💡',
      href: '/admin/solutions?action=add',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Add Certification',
      description: 'Create a new certification',
      icon: '🏆',
      href: '/admin/certifications?action=add',
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
  ];

  const quickReports = [
    {
      title: 'Export Products',
      description: 'Download products list',
      icon: '📊',
      action: 'export-products',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      title: 'Export Messages',
      description: 'Download contact messages',
      icon: '📧',
      action: 'export-messages',
      color: 'bg-pink-500 hover:bg-pink-600',
    },
    {
      title: 'System Report',
      description: 'Generate system report',
      icon: '📈',
      action: 'system-report',
      color: 'bg-teal-500 hover:bg-teal-600',
    },
  ];

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
      // This would implement actual export functionality
      console.log(`Generating report: ${action}`);
      
      // Placeholder for actual implementation
      alert(`${action} feature will be implemented soon!`);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔍</span>
          Quick Search
        </h3>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="products">Products</option>
              <option value="messages">Messages</option>
              <option value="categories">Categories</option>
              <option value="solutions">Solutions</option>
            </select>
            
            <div className="flex-1 flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${searchType}...`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Quick Add Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">➕</span>
          Quick Add
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAddActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-90 mt-1">{action.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📋</span>
          Quick Reports
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickReports.map((report, index) => (
            <button
              key={index}
              onClick={() => handleQuickReport(report.action)}
              className={`${report.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md text-left`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-xl">{report.icon}</div>
                <div>
                  <div className="font-medium text-sm">{report.title}</div>
                  <div className="text-xs opacity-90 mt-1">{report.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* System Shortcuts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          System Shortcuts
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/products"
            className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">📦</span>
            <span className="text-xs font-medium">Products</span>
          </Link>
          
          <Link
            href="/admin/categories"
            className="flex flex-col items-center p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">📂</span>
            <span className="text-xs font-medium">Categories</span>
          </Link>
          
          <Link
            href="/admin/contact-messages"
            className="flex flex-col items-center p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">📧</span>
            <span className="text-xs font-medium">Messages</span>
          </Link>
          
          <Link
            href="/admin/solutions"
            className="flex flex-col items-center p-3 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">💡</span>
            <span className="text-xs font-medium">Solutions</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
