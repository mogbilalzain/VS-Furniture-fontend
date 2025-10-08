'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStorage } from '../../../lib/localStorage-utils'

const OrdersPage = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    // Check for authentication using new system
    if (!authStorage.isAuthenticatedAdmin()) {
      console.log('❌ Orders page - Not authenticated admin, redirecting...');
      router.replace('/admin/login');
    } else {
      console.log('✅ Orders page - User is authenticated admin');
    }
  }, [router])

  const orders = [
    {
      id: 'ORD-001',
      customer: 'John Smith',
      products: ['Ergonomic Chair', 'Shift+ Table'],
      total: 2500,
      status: 'pending',
      date: '2023-11-15'
    },
    {
      id: 'ORD-002',
      customer: 'Sarah Johnson',
      products: ['Mobile Storage Unit'],
      total: 1200,
      status: 'completed',
      date: '2023-11-14'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Davis',
      products: ['Executive Desk', 'Ergonomic Chair'],
      total: 3800,
      status: 'processing',
      date: '2023-11-13'
    },
    {
      id: 'ORD-004',
      customer: 'Lisa Wilson',
      products: ['Storage Unit'],
      total: 800,
      status: 'cancelled',
      date: '2023-11-12'
    }
  ]

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const viewOrder = (id) => {
    alert(`View order ${id}`)
  }

  const updateStatus = (id, status) => {
    alert(`Update order ${id} status to ${status}`)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
      case 'processing': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }
      case 'completed': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
      case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
      default: return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#111827',
            margin: 0
          }}>Orders Management</h1>
          <p style={{
            color: '#6b7280',
            margin: '0.25rem 0 0 0'
          }}>Manage customer orders and track status</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Search Orders
            </label>
            <input
              type="text"
              placeholder="Search by customer or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.875rem',
                width: '250px',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none'
                e.target.style.borderColor = '#FFD700'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.875rem',
                width: '150px',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none'
                e.target.style.borderColor = '#FFD700'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
              }}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>Orders</h2>
          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {filteredOrders.length} orders found
            </span>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                background: '#f9fafb',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '0.875rem'
                }}>Order ID</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '0.875rem'
                }}>Customer</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '0.875rem'
                }}>Products</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '0.875rem'
                }}>Total</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '0.875rem'
                }}>Status</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '0.875rem'
                }}>Date</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '0.875rem'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const statusStyle = getStatusColor(order.status)
                return (
                  <tr key={order.id} style={{
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <td style={{
                      padding: '1rem',
                      fontWeight: 500,
                      color: '#111827'
                    }}>
                      {order.id}
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: '#111827'
                    }}>
                      {order.customer}
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: '#6b7280'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}>
                        {order.products.map((product, index) => (
                          <span key={index} style={{
                            fontSize: '0.875rem'
                          }}>
                            {product}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontWeight: 600,
                      color: '#10b981'
                    }}>
                      ${order.total.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: '#6b7280'
                    }}>
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <button 
                          onClick={() => viewOrder(order.id)}
                          style={{
                            background: '#3d5c4d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#2c2c2c'
                            e.target.style.transform = 'translateY(-1px)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#3d5c4d'
                            e.target.style.transform = 'translateY(0)'
                          }}
                          title="View Order"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OrdersPage 