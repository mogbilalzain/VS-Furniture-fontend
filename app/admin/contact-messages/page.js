'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authStorage } from '../../../lib/localStorage-utils';
import { ENV_CONFIG } from '../../../environment';

export default function ContactMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total_messages: 0,
    unread_messages: 0,
    read_messages: 0,
    replied_messages: 0
  });

  useEffect(() => {
    // Check authentication
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Contact Messages page - Not authenticated admin, redirecting...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Contact Messages page - User is authenticated admin');
      loadMessages();
      loadStats();
    }
  }, [router, currentPage, selectedStatus, searchTerm]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if user is authenticated admin using authStorage
      if (!authStorage.isAuthenticatedAdmin()) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Get token using authStorage
      const token = authStorage.getToken();
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchTerm && { search: searchTerm })
      });

      console.log('🔍 Making API request with token:', token.substring(0, 20) + '...');
      console.log('🔍 API URL:', `${ENV_CONFIG.API_BASE_URL}/contact?${params}`);

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.success) {
          setMessages(data.data.data || []);
          setTotalPages(data.data.last_page || 1);
        } else {
          throw new Error(data.message || 'Failed to load messages');
        }
      } else {
        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error('Authentication required. Please login as admin.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Please check server configuration.');
        } else {
          throw new Error(data.message || `Server error: ${response.status}`);
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      
      // Check if it's an authentication error
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Authentication required. Please login as admin.');
        router.replace('/admin/login');
        return;
      }
      
      setError('Failed to load messages. Using fallback data for testing.');
      
      // Fallback data for testing
      setMessages([
        {
          id: 1,
          name: 'John Smith',
          email: 'john@example.com',
          contact_number: '+971501234567',
          subject: 'Office Furniture Inquiry',
          message: 'I am interested in your ergonomic chairs and would like to know more about pricing and availability.',
          questions: 'Do you offer bulk discounts?',
          status: 'unread',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          contact_number: '+971507654321',
          subject: 'Delivery Question',
          message: 'When can you deliver to Dubai Marina? I need 5 office desks.',
          questions: 'What are the delivery charges?',
          status: 'read',
          created_at: '2024-01-14T15:45:00Z'
        },
        {
          id: 3,
          name: 'Mike Davis',
          email: 'mike@example.com',
          contact_number: '+971509876543',
          subject: 'Quotation Request',
          message: 'Please send me a detailed quote for 20 desks and 20 chairs for our new office.',
          questions: 'Can you provide installation service?',
          status: 'replied',
          created_at: '2024-01-13T09:15:00Z'
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Check if user is authenticated admin using authStorage
      if (!authStorage.isAuthenticatedAdmin()) {
        console.warn('⚠️ User not authenticated admin for stats request');
        return;
      }

      // Get token using authStorage
      const token = authStorage.getToken();
      if (!token) {
        console.warn('⚠️ No token found for stats request');
        return;
      }

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/stats/overview`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      // Fallback stats
      setStats({
        total_messages: 25,
        unread_messages: 5,
        read_messages: 15,
        replied_messages: 5
      });
    }
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      // Check if user is authenticated admin using authStorage
      if (!authStorage.isAuthenticatedAdmin()) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }

      // Get token using authStorage
      const token = authStorage.getToken();
      if (!token) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/${messageId}/status`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh messages and stats
        loadMessages();
        loadStats();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update message status');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      // Check if user is authenticated admin using authStorage
      if (!authStorage.isAuthenticatedAdmin()) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }

      // Get token using authStorage
      const token = authStorage.getToken();
      if (!token) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh messages and stats
        loadMessages();
        loadStats();
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      unread: 'bg-red-100 text-red-800',
      read: 'bg-blue-100 text-blue-800',
      replied: 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'replied', label: 'Replied' }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Contact Messages
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage and respond to customer inquiries
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
            {stats.total_messages}
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>Total Messages</p>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', margin: '0 0 0.5rem 0' }}>
            {stats.unread_messages}
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>Unread</p>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', margin: '0 0 0.5rem 0' }}>
            {stats.read_messages}
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>Read</p>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: '0 0 0.5rem 0' }}>
            {stats.replied_messages}
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>Replied</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          alignItems: 'center' 
        }}>
          {/* Search */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                background: 'white'
              }}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => { loadMessages(); loadStats(); }}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Messages Table */}
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden' 
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-block', 
              width: '2rem', 
              height: '2rem', 
              border: '2px solid #e5e7eb', 
              borderTop: '2px solid #3b82f6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading messages...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ {error}</p>
            <button
              onClick={() => { loadMessages(); loadStats(); }}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>No messages found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Phone</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Subject</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message, index) => (
                  <tr key={message.id} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{message.name}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{message.email}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{message.contact_number || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ color: '#111827', fontSize: '0.875rem' }}>
                        {message.subject.length > 30 ? message.subject.substring(0, 30) + '...' : message.subject}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }} className={getStatusBadge(message.status)}>
                        {message.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        {formatDate(message.created_at)}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          href={`/admin/contact-messages/${message.id}`}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#3b82f6',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          View
                        </Link>
                        {message.status === 'unread' && (
                          <button
                            onClick={() => updateMessageStatus(message.id, 'read')}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteMessage(message.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginTop: '1.5rem' 
        }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === 1 ? '#f3f4f6' : '#3b82f6',
              color: currentPage === 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <span style={{ color: '#6b7280' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === totalPages ? '#f3f4f6' : '#3b82f6',
              color: currentPage === totalPages ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .bg-red-100 { background-color: #fee2e2; }
        .text-red-800 { color: #991b1b; }
        .bg-blue-100 { background-color: #dbeafe; }
        .text-blue-800 { color: #1e40af; }
        .bg-green-100 { background-color: #dcfce7; }
        .text-green-800 { color: #166534; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .text-gray-800 { color: #1f2937; }
      `}</style>
    </div>
  );
}
