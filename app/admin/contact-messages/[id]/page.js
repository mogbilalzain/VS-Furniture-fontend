'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authStorage } from '../../../../lib/localStorage-utils';
import { ENV_CONFIG } from '../../../../environment';

export default function ContactMessageDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Contact Message Details page - Not authenticated admin, redirecting...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Contact Message Details page - User is authenticated admin');
      if (params.id) {
        loadMessage();
      }
    }
  }, [router, params.id]);

  const loadMessage = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if user is authenticated admin using authStorage
      if (!authStorage.isAuthenticatedAdmin()) {
        throw new Error('Authentication required. Please login again.');
      }

      // Get token using authStorage
      const token = authStorage.getToken();
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/${params.id}`, {
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
          setMessage(data.data);
          setAdminNotes(data.data.admin_notes || '');
          
          // Mark as read if it's unread
          if (data.data.status === 'unread') {
            updateMessageStatus('read');
          }
        } else {
          throw new Error(data.message || 'Failed to load message');
        }
      } else {
        throw new Error('Failed to fetch message');
      }
    } catch (err) {
      console.error('Error loading message:', err);
      setError('Failed to load message');
      
      // Fallback data for testing
      setMessage({
        id: params.id,
        name: 'John Smith',
        email: 'john@example.com',
        contact_number: '+971501234567',
        subject: 'Office Furniture Inquiry',
        message: 'I am interested in your ergonomic chairs and would like to know more about pricing and availability. We are setting up a new office in Dubai Marina and need about 25 chairs. Could you please provide a detailed quote including delivery charges?',
        questions: 'Do you offer bulk discounts for orders over 20 pieces? Also, what is your warranty policy?',
        status: 'read',
        admin_notes: '',
        created_at: '2024-01-15T10:30:00Z'
      });
      setAdminNotes('');
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (newStatus) => {
    try {
      // Get token using authStorage
      const token = authStorage.getToken();
      if (!token) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/${params.id}/status`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setMessage(prev => ({ ...prev, status: newStatus }));
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update message status');
    }
  };

  const saveAdminNotes = async () => {
    try {
      setSavingNotes(true);
      
      // For now, we'll just update the local state
      // In a real implementation, you'd send this to the backend
      setMessage(prev => ({ ...prev, admin_notes: adminNotes }));
      
      setTimeout(() => {
        setSavingNotes(false);
        alert('Notes saved successfully!');
      }, 1000);
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes');
      setSavingNotes(false);
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      // Get token using authStorage
      const token = authStorage.getToken();
      if (!token) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }

      const downloadUrl = `${ENV_CONFIG.API_BASE_URL}/contact/${message.id}/files/${file.id}/download`;
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.original_name;
      link.target = '_blank';
      
      // Add authorization header by opening the URL in a new window
      // For better UX, we'll use fetch to get the file and create blob URL
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const deleteMessage = async () => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      // Get token using authStorage
      const token = authStorage.getToken();
      if (!token) {
        alert('Authentication required. Please login again.');
        router.replace('/admin/login');
        return;
      }

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/admin/contact-messages');
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
      unread: { bg: '#fee2e2', color: '#991b1b', text: 'Unread' },
      read: { bg: '#dbeafe', color: '#1e40af', text: 'Read' },
      replied: { bg: '#dcfce7', color: '#166534', text: 'Replied' }
    };
    return badges[status] || { bg: '#f3f4f6', color: '#1f2937', text: 'Unknown' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
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
        <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading message...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ {error || 'Message not found'}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={loadMessage}
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
          <Link
            href="/admin/contact-messages"
            style={{
              padding: '0.5rem 1rem',
              background: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(message.status);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Link
            href="/admin/contact-messages"
            style={{
              color: '#3b82f6',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ← Back to Messages
          </Link>
        </div>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Contact Message Details
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Message from {message.name} • {formatDate(message.created_at)}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          {/* Message Details Card */}
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: '0 0 0.5rem 0' }}>
                  {message.subject}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backgroundColor: statusBadge.bg,
                    color: statusBadge.color
                  }}>
                    {statusBadge.text}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    ID: #{message.id}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Message Content
              </h3>
              <div style={{ 
                background: '#f9fafb', 
                padding: '1rem', 
                borderRadius: '6px', 
                border: '1px solid #e5e7eb' 
              }}>
                <p style={{ color: '#374151', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {message.message}
                </p>
              </div>
            </div>

            {message.questions && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  Additional Questions
                </h3>
                <div style={{ 
                  background: '#fef3c7', 
                  padding: '1rem', 
                  borderRadius: '6px', 
                  border: '1px solid #fbbf24' 
                }}>
                  <p style={{ color: '#92400e', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {message.questions}
                  </p>
                </div>
              </div>
            )}

            {/* Attached Files */}
            {message.files && message.files.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  Attached Files ({message.files.length})
                </h3>
                <div style={{ 
                  background: '#f0f9ff', 
                  padding: '1rem', 
                  borderRadius: '6px', 
                  border: '1px solid #e0f2fe' 
                }}>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {message.files.map((file) => (
                      <div 
                        key={file.id}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          background: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {/* File Icon */}
                          <div style={{ 
                            width: '2.5rem', 
                            height: '2.5rem', 
                            background: file.mime_type?.startsWith('image/') ? '#dcfce7' : '#fef3c7',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {file.mime_type?.startsWith('image/') ? (
                              <svg style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                            ) : (
                              <svg style={{ width: '1.25rem', height: '1.25rem', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                              </svg>
                            )}
                          </div>

                          {/* File Info */}
                          <div>
                            <div style={{ fontWeight: '500', color: '#111827', fontSize: '0.875rem' }}>
                              {file.original_name}
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                              {file.human_file_size || `${Math.round(file.file_size / 1024)} KB`} • {file.file_extension?.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownloadFile(file)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#2563eb'}
                          onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                        >
                          <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {/* <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Admin Notes
              </h3>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this message..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={saveAdminNotes}
                  disabled={savingNotes}
                  style={{
                    padding: '0.5rem 1rem',
                    background: savingNotes ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: savingNotes ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div> */}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Contact Info Card */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            marginBottom: '1.5rem' 
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Contact Information
            </h3>
            <div style={{ space: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Name</label>
                <p style={{ color: '#111827', margin: '0.25rem 0 0 0' }}>{message.name}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Email</label>
                <p style={{ color: '#111827', margin: '0.25rem 0 0 0' }}>
                  <a href={`mailto:${message.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    {message.email}
                  </a>
                </p>
              </div>
              {message.contact_number && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Phone</label>
                  <p style={{ color: '#111827', margin: '0.25rem 0 0 0' }}>
                    <a href={`tel:${message.contact_number}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                      {message.contact_number}
                    </a>
                  </p>
                </div>
              )}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Received</label>
                <p style={{ color: '#111827', margin: '0.25rem 0 0 0' }}>{formatDate(message.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Status Actions */}
              {message.status === 'unread' && (
                <button
                  onClick={() => updateMessageStatus('read')}
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
                  Mark as Read
                </button>
              )}
              {message.status === 'read' && (
                <button
                  onClick={() => updateMessageStatus('replied')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Mark as Replied
                </button>
              )}
              {message.status === 'replied' && (
                <button
                  onClick={() => updateMessageStatus('read')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Mark as Read
                </button>
              )}

              {/* Email Action */}
              <a
                href={`mailto:${message.email}?subject=Re: ${message.subject}&body=Dear ${message.name},%0D%0A%0D%0AThank you for your inquiry.%0D%0A%0D%0ABest regards,%0D%0AVS Furniture Team`}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f59e0b',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}
              >
                Reply via Email
              </a>

              {/* Delete Action */}
              <button
                onClick={deleteMessage}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
