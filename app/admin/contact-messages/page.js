'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authStorage } from '../../../lib/localStorage-utils';
import { ENV_CONFIG } from '../../../environment';
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  PageHeader,
  EmptyState,
  StatCard,
} from '../../../components/admin/ui';

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
    replied_messages: 0,
  });

  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      router.replace('/admin/login');
    } else {
      loadMessages();
      loadStats();
    }
  }, [router, currentPage, selectedStatus, searchTerm]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');

      if (!authStorage.isAuthenticatedAdmin()) {
        throw new Error('No authentication token found. Please login again.');
      }

      const token = authStorage.getToken();
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact?${params}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Authentication required. Please login as admin.');
        router.replace('/admin/login');
        return;
      }

      setError('Failed to load messages. Using fallback data for testing.');

      setMessages([
        {
          id: 1,
          name: 'John Smith',
          email: 'john@example.com',
          contact_number: '+971501234567',
          subject: 'Office Furniture Inquiry',
          message:
            'I am interested in your ergonomic chairs and would like to know more about pricing and availability.',
          questions: 'Do you offer bulk discounts?',
          status: 'unread',
          created_at: '2024-01-15T10:30:00Z',
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
          created_at: '2024-01-14T15:45:00Z',
        },
        {
          id: 3,
          name: 'Mike Davis',
          email: 'mike@example.com',
          contact_number: '+971509876543',
          subject: 'Quotation Request',
          message:
            'Please send me a detailed quote for 20 desks and 20 chairs for our new office.',
          questions: 'Can you provide installation service?',
          status: 'replied',
          created_at: '2024-01-13T09:15:00Z',
        },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      if (!authStorage.isAuthenticatedAdmin()) return;
      const token = authStorage.getToken();
      if (!token) return;

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/stats/overview`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
      setStats({
        total_messages: 25,
        unread_messages: 5,
        read_messages: 15,
        replied_messages: 5,
      });
    }
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      if (!authStorage.isAuthenticatedAdmin()) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }
      const token = authStorage.getToken();
      if (!token) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/${messageId}/status`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
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
      if (!authStorage.isAuthenticatedAdmin()) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }
      const token = authStorage.getToken();
      if (!token) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/${messageId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'replied', label: 'Replied' },
  ];

  const getStatusTone = (status) => {
    switch (status) {
      case 'unread':
        return 'error';
      case 'read':
        return 'info';
      case 'replied':
        return 'active';
      default:
        return 'pending';
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contact Messages"
        description="Manage and respond to customer inquiries."
        actions={
          <AdminButton
            variant="primary"
            icon="refresh"
            size="lg"
            onClick={() => {
              loadMessages();
              loadStats();
            }}
          >
            Refresh
          </AdminButton>
        }
      />

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard
          icon="mail"
          label="Total Messages"
          value={stats.total_messages?.toString() || '0'}
          change="All time"
          changeType="neutral"
        />
        <StatCard
          icon="mark_email_unread"
          label="Unread"
          value={stats.unread_messages?.toString() || '0'}
          change="Needs reply"
          changeType="negative"
        />
        <StatCard
          icon="drafts"
          label="Read"
          value={stats.read_messages?.toString() || '0'}
          change="Viewed"
          changeType="neutral"
        />
        <StatCard
          icon="reply"
          label="Replied"
          value={stats.replied_messages?.toString() || '0'}
          change="Closed"
          changeType="positive"
        />
      </section>

      {/* Filters */}
      <AdminCard padding="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <AdminInput
              label="Search messages"
              icon="search"
              placeholder="Search by name, email, or subject…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <AdminSelect
            label="Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statuses}
          />
        </div>
      </AdminCard>

      {/* Messages table */}
      {loading ? (
        <AdminCard className="text-center" padding="p-10">
          <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary-container animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading messages…</p>
        </AdminCard>
      ) : error && messages.length === 0 ? (
        <EmptyState
          icon="error"
          title="Could not load messages"
          description={error}
          action={
            <AdminButton
              variant="primary"
              icon="refresh"
              onClick={() => {
                loadMessages();
                loadStats();
              }}
            >
              Try Again
            </AdminButton>
          }
        />
      ) : messages.length === 0 ? (
        <EmptyState
          icon="mail"
          title="No messages yet"
          description="Customer inquiries from your contact form will appear here."
        />
      ) : (
        <AdminCard padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Sender</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Subject</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 hidden md:table-cell">Phone</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 hidden lg:table-cell">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-surface-container flex items-center justify-center font-bold text-on-surface-variant text-[12px] flex-shrink-0">
                          {message.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-on-surface font-bold text-[14px] truncate">{message.name}</p>
                          <p className="text-on-surface-variant/60 text-[12px] truncate">{message.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[14px] text-on-surface truncate max-w-xs">
                        {message.subject}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-[13px] text-on-surface-variant font-mono">
                        {message.contact_number || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge tone={getStatusTone(message.status)} dot>
                        {message.status}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-[13px] text-on-surface-variant/70">{formatDate(message.created_at)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/contact-messages/${message.id}`}
                          title="View"
                          className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Link>
                        {message.status === 'unread' && (
                          <button
                            onClick={() => updateMessageStatus(message.id, 'read')}
                            title="Mark as read"
                            className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteMessage(message.id)}
                          title="Delete"
                          className="w-9 h-9 rounded-lg hover:bg-error-container text-error flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-surface-container">
              <p className="text-[13px] text-on-surface-variant/70 font-medium">
                Page <span className="text-on-surface font-bold">{currentPage}</span> of{' '}
                <span className="text-on-surface font-bold">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-outline-variant/60 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-outline-variant/60 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </AdminCard>
      )}
    </div>
  );
}
