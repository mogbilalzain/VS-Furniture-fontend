'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { authStorage } from '../lib/localStorage-utils';
import { ENV_CONFIG } from '../environment';

/**
 * NotificationsBell Component for Admin Header
 * Shows contact messages count with badge and dropdown
 */
const NotificationsBell = ({ className = '' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      // Check if user is authenticated admin using authStorage
      if (!authStorage.isAuthenticatedAdmin()) {
        console.warn('⚠️ User not authenticated admin for unread count');
        return;
      }

      // Get token using authStorage
      const token = authStorage.getToken();
      if (!token) {
        console.warn('⚠️ No token found for unread count');
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/unread-count`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.data.count);
        }
      } else if (response.status === 401) {
        console.warn('⚠️ Unauthorized access to unread count - user may need to re-login');
        setUnreadCount(0);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⚠️ Unread count request timed out');
      } else {
        console.error('Error fetching unread count:', error);
      }
      // Don't set fallback data in production - just keep current count
      if (process.env.NODE_ENV === 'development') {
        setUnreadCount(0);
      }
    }
  };

  // Fetch recent messages for dropdown
  const fetchRecentMessages = async () => {
    if (!isDropdownOpen) return;
    
    setLoading(true);
    try {
      // Check if user is authenticated admin using authStorage
      if (!authStorage.isAuthenticatedAdmin()) {
        console.warn('⚠️ User not authenticated admin for recent messages');
        setLoading(false);
        return;
      }

      // Get token using authStorage
      const token = authStorage.getToken();
      if (!token) {
        console.warn('⚠️ No token found for recent messages');
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/recent`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentMessages(data.data);
        }
      } else if (response.status === 401) {
        console.warn('⚠️ Unauthorized access to recent messages - user may need to re-login');
        setRecentMessages([]);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⚠️ Recent messages request timed out');
      } else {
        console.error('Error fetching recent messages:', error);
      }
      // Don't set fallback data in production
      if (process.env.NODE_ENV === 'development') {
        setRecentMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    // Only fetch if user is authenticated admin
    if (authStorage.isAuthenticatedAdmin()) {
      fetchUnreadCount();
    }
    setInitialized(true);
    
    // Set up polling for unread count every 60 seconds (reduced frequency)
    const interval = setInterval(() => {
      if (authStorage.isAuthenticatedAdmin()) {
        fetchUnreadCount();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent messages when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      fetchRecentMessages();
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('[data-dropdown="notifications"]')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownClose = () => {
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 100);
  };

  if (!initialized) {
    return (
      <div className={`relative ${className}`}>
        <button className="text-gray-700 p-2 rounded-lg">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256">
            <path d="M220.07,176.94C214.41,167.2,206,139.73,206,104a78,78,0,1,0-156,0c0,35.74-8.42,63.2-14.08,72.94A14,14,0,0,0,48,198H90.48a38,38,0,0,0,75,0H208a14,14,0,0,0,12.06-21.06ZM128,218a26,26,0,0,1-25.29-20h50.58A26,26,0,0,1,128,218Zm81.71-33a1.9,1.9,0,0,1-1.7,1H48a1.9,1.9,0,0,1-1.7-1,2,2,0,0,1,0-2C53.87,170,62,139.69,62,104a66,66,0,1,1,132,0c0,35.68,8.14,65.95,15.71,79A2,2,0,0,1,209.71,185Z" />
          </svg>
        </button>
      </div>
    );
  }

  // Don't render if user is not authenticated admin
  if (!authStorage.isAuthenticatedAdmin()) {
    return null;
  }

  return (
    <div className={`relative ${className}`} data-dropdown="notifications">
      <button
        onClick={handleToggleDropdown}
        className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 relative transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        {/* Bell Icon */}
        <svg 
          className="w-6 h-6" 
          fill="currentColor" 
          viewBox="0 0 256 256"
        >
          <path d="M220.07,176.94C214.41,167.2,206,139.73,206,104a78,78,0,1,0-156,0c0,35.74-8.42,63.2-14.08,72.94A14,14,0,0,0,48,198H90.48a38,38,0,0,0,75,0H208a14,14,0,0,0,12.06-21.06ZM128,218a26,26,0,0,1-25.29-20h50.58A26,26,0,0,1,128,218Zm81.71-33a1.9,1.9,0,0,1-1.7,1H48a1.9,1.9,0,0,1-1.7-1,2,2,0,0,1,0-2C53.87,170,62,139.69,62,104a66,66,0,1,1,132,0c0,35.68,8.14,65.95,15.71,79A2,2,0,0,1,209.71,185Z" />
        </svg>
        
        {/* Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Contact Messages
              </h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          {/* Messages List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading...</p>
              </div>
            ) : recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <Link
                  key={message.id}
                  href={`/admin/contact-messages/${message.id}`}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                  onClick={handleDropdownClose}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {message.name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {message.preview}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {message.time_ago}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                </svg>
                <p className="text-sm text-gray-500 mt-2">No new messages</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100">
            <Link
              href="/admin/contact-messages"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={handleDropdownClose}
            >
              View All Messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
