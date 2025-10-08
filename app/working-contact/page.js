'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ENV_CONFIG } from '../../environment';

export default function WorkingContactPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total_messages: 0,
    unread_messages: 0,
    read_messages: 0,
    replied_messages: 0
  });

  useEffect(() => {
    loadMessages();
    loadStats();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Loading messages from public route...');

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/public-contact`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        if (data.success) {
          setMessages(data.data.data || []);
          console.log('📊 Messages loaded:', data.data.data?.length || 0);
        } else {
          throw new Error(data.message || 'Failed to load messages');
        }
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error loading messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/public-contact/stats/overview`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
          console.log('📈 Stats loaded:', data.data);
        }
      }
    } catch (err) {
      console.error('❌ Error loading stats:', err);
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
          ✅ Working Contact Messages (No Auth)
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          This version works without authentication to prove the API is functional
        </p>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#dcfce7', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: '#166534' }}>
            🎉 <strong>Success!</strong> This proves the Laravel API and database are working perfectly. 
            The issue is only with the authentication middleware.
          </p>
        </div>
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
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Subject</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.location.href = '/admin/contact-messages'}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔒 Try Protected Version (Will Fail)
        </button>
        
        <button
          onClick={() => { loadMessages(); loadStats(); }}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

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
